import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const args = new Set(process.argv.slice(2));

if (args.has("--help")) {
  console.log(`Usage: npm run deploy:sftp -- [--dry-run] [--no-clean]\n\nRequired env vars:\n  DEPLOY_SFTP_HOST\n  DEPLOY_SFTP_USER\n\nOptional env vars:\n  DEPLOY_SFTP_PORT=22\n  DEPLOY_SFTP_REMOTE_ROOT=public_html\n  DEPLOY_SFTP_LOCAL_ROOT=.output/public\n  DEPLOY_SFTP_IDENTITY_FILE=/path/to/private_key\n  DEPLOY_SFTP_PASSWORD=...          # only used when sshpass is installed\n  DEPLOY_SFTP_STRICT_HOST_KEY_CHECKING=accept-new\n\nNotes:\n- SSH keys are the preferred auth path.\n- The script uploads the current static build and, when SSH shell access works, removes stale site files while preserving .well-known and .htaccess*.`);
  process.exit(0);
}

const dryRun = args.has("--dry-run");
const disableClean = args.has("--no-clean");

const host = requiredEnv("DEPLOY_SFTP_HOST");
const user = requiredEnv("DEPLOY_SFTP_USER");
const port = process.env.DEPLOY_SFTP_PORT || "22";
const remoteRoot = normalizeRemoteRoot(process.env.DEPLOY_SFTP_REMOTE_ROOT || "public_html");
const localRoot = resolve(projectRoot, process.env.DEPLOY_SFTP_LOCAL_ROOT || ".output/public");
const identityFile = process.env.DEPLOY_SFTP_IDENTITY_FILE;
const password = process.env.DEPLOY_SFTP_PASSWORD;
const strictHostKeyChecking = process.env.DEPLOY_SFTP_STRICT_HOST_KEY_CHECKING || "accept-new";

assertLocalRoot(localRoot);

const localTree = walkLocalTree(localRoot);
const uploadPlan = buildUploadPlan(localTree.files);
const tempRoot = mkdtempSync(join(process.env.TMPDIR || "/tmp", "deploy-sftp-"));

try {
  const uploadBatchPath = join(tempRoot, "upload.batch");
  writeFileSync(uploadBatchPath, buildUploadBatch(remoteRoot, localTree.directories, uploadPlan), "utf8");

  printSummary({
    host,
    port,
    user,
    remoteRoot,
    localRoot,
    fileCount: localTree.files.length,
    directoryCount: localTree.directories.length,
    cleanupEnabled: !disableClean,
    dryRun,
  });

  if (dryRun) {
    console.log("\nUpload batch preview:\n");
    console.log(readFileSync(uploadBatchPath, "utf8"));
  } else {
    runSftpBatch(uploadBatchPath, { host, user, port, identityFile, password, strictHostKeyChecking });
    console.log("Upload completed.");

    if (disableClean) {
      console.log("Cleanup skipped because --no-clean was set.");
    } else if (!commandExists("ssh")) {
      console.log("Cleanup skipped because ssh is not installed locally.");
    } else {
      const remoteTree = getRemoteTree({ host, user, port, remoteRoot, identityFile, password, strictHostKeyChecking });

      if (!remoteTree) {
        console.log("Cleanup skipped because remote shell access is unavailable or restricted.");
      } else {
        const cleanupPlan = buildCleanupPlan(localTree, remoteTree);

        if (cleanupPlan.files.length === 0 && cleanupPlan.directories.length === 0) {
          console.log("No stale remote files found.");
        } else {
          const cleanupBatchPath = join(tempRoot, "cleanup.batch");
          writeFileSync(cleanupBatchPath, buildCleanupBatch(remoteRoot, cleanupPlan), "utf8");
          runSftpBatch(cleanupBatchPath, { host, user, port, identityFile, password, strictHostKeyChecking });
          console.log(`Removed ${cleanupPlan.files.length} stale files and ${cleanupPlan.directories.length} stale directories.`);
        }
      }
    }
  }
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
  return value;
}

function normalizeRemoteRoot(value) {
  return value.replace(/^\/+|\/+$/g, "") || "public_html";
}

function assertLocalRoot(rootPath) {
  let stats;
  try {
    stats = statSync(rootPath);
  } catch {
    console.error(`Local deploy root does not exist: ${rootPath}`);
    console.error("Run `npm run generate` first or point DEPLOY_SFTP_LOCAL_ROOT at an existing static build.");
    process.exit(1);
  }

  if (!stats.isDirectory()) {
    console.error(`Local deploy root is not a directory: ${rootPath}`);
    process.exit(1);
  }
}

function walkLocalTree(rootPath) {
  const directories = [];
  const files = [];
  const queue = [""];

  while (queue.length > 0) {
    const relDir = queue.shift();
    const absoluteDir = relDir ? resolve(rootPath, relDir) : rootPath;
    const dirents = readdirSync(absoluteDir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));

    for (const dirent of dirents) {
      const relPath = relDir ? `${relDir}/${dirent.name}` : dirent.name;
      if (dirent.isDirectory()) {
        directories.push(relPath);
        queue.push(relPath);
      } else if (dirent.isFile()) {
        files.push(relPath);
      }
    }
  }

  directories.sort();
  files.sort();
  return { directories, files };
}

function buildUploadPlan(files) {
  const deferredOrder = ["menu/index.html", "index.html"];
  const deferred = new Set(deferredOrder);
  const early = [];

  for (const file of files) {
    if (!deferred.has(file)) {
      early.push(file);
    }
  }

  return [...early, ...deferredOrder.filter((file) => files.includes(file))];
}

function buildUploadBatch(remoteBase, directories, files) {
  const lines = [`cd ${remoteBase}`];

  for (const dir of directories) {
    lines.push(`-mkdir ${dir}`);
  }

  for (const file of files) {
    lines.push(`put ${toBatchPath(resolve(localRoot, file))} ${file}`);
  }

  return `${lines.join("\n")}\n`;
}

function buildCleanupBatch(remoteBase, cleanupPlan) {
  const lines = [`cd ${remoteBase}`];

  for (const file of cleanupPlan.files) {
    lines.push(`rm ${file}`);
  }

  for (const dir of cleanupPlan.directories) {
    lines.push(`rmdir ${dir}`);
  }

  return `${lines.join("\n")}\n`;
}

function getRemoteTree(connection) {
  const safeRoot = shellQuote(connection.remoteRoot);
  const remoteScript = [
    `cd ${safeRoot}`,
    "find . -mindepth 1 -type f -print | sed 's#^./##' | sort",
    "printf '\\n---DIRS---\\n'",
    "find . -mindepth 1 -type d -print | sed 's#^./##' | sort",
  ].join(" && ");

  const result = runWrappedCommand(buildSshCommand(connection, remoteScript), {
    allowFailure: true,
    captureOutput: true,
  });

  if (result.status !== 0) {
    return null;
  }

  const [fileBlock, dirBlock = ""] = result.stdout.split("\n---DIRS---\n");
  const files = fileBlock.split(/\r?\n/).filter(Boolean);
  const directories = dirBlock.split(/\r?\n/).filter(Boolean);
  return { files, directories };
}

function buildCleanupPlan(localTree, remoteTree) {
  const localFiles = new Set(localTree.files);
  const localDirectories = new Set(localTree.directories);
  const remoteFiles = remoteTree.files.filter((path) => !shouldPreserve(path) && !localFiles.has(path));
  const remoteDirectories = remoteTree.directories
    .filter((path) => !shouldPreserve(path) && !localDirectories.has(path))
    .sort((a, b) => b.length - a.length);

  return { files: remoteFiles, directories: remoteDirectories };
}

function shouldPreserve(path) {
  return path === ".well-known" || path.startsWith(".well-known/") || path === ".htaccess" || path.startsWith(".htaccess.");
}

function runSftpBatch(batchPath, connection) {
  runWrappedCommand(buildSftpCommand(connection, batchPath));
}

function buildSftpCommand(connection, batchPath) {
  const args = [
    "-b",
    batchPath,
    "-P",
    connection.port,
    "-o",
    `StrictHostKeyChecking=${connection.strictHostKeyChecking}`,
  ];

  if (connection.identityFile) {
    args.push("-i", connection.identityFile);
  }

  args.push(`${connection.user}@${connection.host}`);
  return wrapWithSshpassIfNeeded("sftp", args, connection.password);
}

function buildSshCommand(connection, remoteScript) {
  const args = [
    "-p",
    connection.port,
    "-o",
    `StrictHostKeyChecking=${connection.strictHostKeyChecking}`,
  ];

  if (connection.identityFile) {
    args.push("-i", connection.identityFile);
  }

  args.push(`${connection.user}@${connection.host}`, remoteScript);
  return wrapWithSshpassIfNeeded("ssh", args, connection.password);
}

function wrapWithSshpassIfNeeded(cmd, args, password) {
  if (!password) {
    return { cmd, args };
  }

  if (!commandExists("sshpass")) {
    console.error("DEPLOY_SFTP_PASSWORD was set but sshpass is not installed. Use SSH keys or install sshpass.");
    process.exit(1);
  }

  return {
    cmd: "sshpass",
    args: ["-p", password, cmd, ...args],
  };
}

function runWrappedCommand(command, options = {}) {
  const result = spawnSync(command.cmd, command.args, {
    cwd: projectRoot,
    env: process.env,
    stdio: options.captureOutput ? ["inherit", "pipe", "pipe"] : "inherit",
    encoding: options.captureOutput ? "utf8" : undefined,
  });

  if (result.error) {
    throw result.error;
  }

  if (!options.allowFailure && result.status !== 0) {
    process.exit(result.status ?? 1);
  }

  return result;
}

function commandExists(command) {
  const result = spawnSync(process.platform === "win32" ? "where" : "command", process.platform === "win32" ? [command] : ["-v", command], {
    shell: process.platform !== "win32",
    stdio: "ignore",
  });
  return result.status === 0;
}

function toBatchPath(path) {
  return path.replace(/\\/g, "/");
}

function shellQuote(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

function printSummary(summary) {
  console.log(`Deploying ${summary.fileCount} files from ${summary.localRoot}`);
  console.log(`Target: ${summary.user}@${summary.host}:${summary.port}/${summary.remoteRoot}`);
  console.log(`Cleanup: ${summary.cleanupEnabled ? "enabled" : "disabled"}`);
  if (summary.dryRun) {
    console.log("Mode: dry-run");
  }
}
