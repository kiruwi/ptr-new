import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const releaseRoot = resolve(projectRoot, "release");
const bundleName = "patamurestaurants-cpanel";
const bundleRoot = resolve(releaseRoot, bundleName);
const zipArchive = resolve(releaseRoot, `${bundleName}.zip`);
const tarArchive = resolve(releaseRoot, `${bundleName}.tar.gz`);
const legacyArtifacts = [
  resolve(releaseRoot, "patamurestaurant-cpanel"),
  resolve(releaseRoot, "patamurestaurant-cpanel.zip"),
  resolve(releaseRoot, "patamurestaurant-cpanel.tar.gz"),
];

function run(cmd, args, options = {}) {
  const result = spawnSync(cmd, args, {
    cwd: projectRoot,
    stdio: "inherit",
    env: process.env,
    ...options,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function archiveBundle() {
  const zipResult = spawnSync("zip", ["-rq", zipArchive, "."], {
    cwd: bundleRoot,
    stdio: "inherit",
    env: process.env,
  });

  if (!zipResult.error && zipResult.status === 0) {
    return "zip";
  }

  const pythonZipResult = spawnSync(
    "python3",
    [
      "-c",
      [
        "import shutil",
        `shutil.make_archive(${JSON.stringify(resolve(releaseRoot, bundleName))}, 'zip', ${JSON.stringify(releaseRoot)}, ${JSON.stringify(bundleName)})`,
      ].join("; "),
    ],
    {
      cwd: projectRoot,
      stdio: "inherit",
      env: process.env,
    }
  );

  if (!pythonZipResult.error && pythonZipResult.status === 0) {
    return "zip";
  }

  const tarResult = spawnSync("tar", ["-czf", tarArchive, "-C", releaseRoot, bundleName], {
    cwd: projectRoot,
    stdio: "inherit",
    env: process.env,
  });

  if (!tarResult.error && tarResult.status === 0) {
    return "tar";
  }

  return "dir";
}

run(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "build"]);

if (!existsSync(resolve(projectRoot, ".output/server/index.mjs"))) {
  throw new Error("Build completed without .output/server/index.mjs");
}

rmSync(bundleRoot, { recursive: true, force: true });
rmSync(zipArchive, { force: true });
rmSync(tarArchive, { force: true });
legacyArtifacts.forEach((artifactPath) => rmSync(artifactPath, { recursive: true, force: true }));
mkdirSync(releaseRoot, { recursive: true });

cpSync(resolve(projectRoot, ".output"), resolve(bundleRoot, ".output"), {
  recursive: true,
  dereference: true,
});
cpSync(resolve(projectRoot, "app.js"), resolve(bundleRoot, "app.js"));
cpSync(resolve(projectRoot, ".env.example"), resolve(bundleRoot, ".env.example"));
cpSync(resolve(projectRoot, "CPANEL.md"), resolve(bundleRoot, "CPANEL.md"));

const cpanelEnv = [
  "NODE_ENV=production",
  "NUXT_PUBLIC_SITE_URL=https://patamurestaurants.com",
  "NUXT_PUBLIC_GA_ID=G-3FHWVHDTZC",
  "NUXT_ALLOWED_ORIGINS=https://patamurestaurants.com",
  "AUTH_SESSION_SECRET=replace-with-a-32-plus-character-random-secret",
  "ADMIN_USER_IDS=",
  "SECURITY_STRICT_BROWSER_HEADERS=false",
].join("\n");

writeFileSync(resolve(bundleRoot, ".env.production.example"), `${cpanelEnv}\n`);

const rootPackage = JSON.parse(readFileSync(resolve(projectRoot, "package.json"), "utf8"));
const bundlePackage = {
  name: bundleName,
  version: rootPackage.version,
  private: true,
  scripts: {
    start: "node app.js",
  },
  engines: rootPackage.engines,
};

writeFileSync(resolve(bundleRoot, "package.json"), `${JSON.stringify(bundlePackage, null, 2)}\n`);

const artifact = archiveBundle();

if (artifact === "zip") {
  console.log(`Created ${zipArchive}`);
} else if (artifact === "tar") {
  console.log(`Created ${tarArchive}`);
} else {
  console.log(`Created ${bundleRoot}`);
}
