import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

const projectRoot = process.cwd();
const failures = [];
const ignoredDirectories = new Set([".git", ".nuxt", ".output", "dist", "node_modules", "release"]);

function walk(directory) {
  const entries = readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) {
        files.push(...walk(join(directory, entry.name)));
      }

      continue;
    }

    files.push(join(directory, entry.name));
  }

  return files;
}

function assert(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

const packageJson = JSON.parse(readFileSync(join(projectRoot, "package.json"), "utf8"));

for (const [sectionName, versions] of Object.entries({
  dependencies: packageJson.dependencies ?? {},
  devDependencies: packageJson.devDependencies ?? {},
})) {
  for (const [name, version] of Object.entries(versions)) {
    assert(/^\d/.test(version), `${sectionName}.${name} must be pinned to an exact version; found ${version}`);
  }
}

const npmrc = readFileSync(join(projectRoot, ".npmrc"), "utf8");
assert(npmrc.includes("save-exact=true"), ".npmrc must enforce save-exact=true.");

const nuxtConfig = readFileSync(join(projectRoot, "nuxt.config.ts"), "utf8");
assert(/devtools:\s*\{\s*enabled:\s*false\s*\}/m.test(nuxtConfig), "Nuxt devtools must stay disabled.");
const analyticsFallbackMatch = nuxtConfig.match(/googleAnalyticsId:\s*process\.env\.NUXT_PUBLIC_GA_ID\s*\|\|\s*([^\n,]+)/);
assert(
  !analyticsFallbackMatch || analyticsFallbackMatch[1].trim() === '""',
  "Do not ship a default analytics ID.",
);

const envExample = readFileSync(join(projectRoot, ".env.example"), "utf8");
assert(!/^NUXT_PUBLIC_.*(?:SECRET|TOKEN|PASSWORD|KEY)=/gim.test(envExample), "Secret-looking values must not use NUXT_PUBLIC_ env vars.");

for (const file of walk(join(projectRoot, "server"))) {
  const source = readFileSync(file, "utf8");
  const relPath = relative(projectRoot, file);

  if (!relPath.endsWith("server/utils/security/logging.ts")) {
    assert(!/console\.(?:log|warn|error)\(/.test(source), `Server logging must flow through the redaction logger: ${relPath}`);
  }

  if (!relPath.endsWith("server/utils/security/ssrf.ts")) {
    assert(!/(^|[^\w.])(?:\$fetch|fetch)\s*\(/m.test(source), `Server-side fetch must use the SSRF allowlist helper: ${relPath}`);
  }
}

for (const file of walk(join(projectRoot, "src"))) {
  const source = readFileSync(file, "utf8");
  const relPath = relative(projectRoot, file);

  if (!relPath.endsWith("src/components/SeoStructuredData.vue")) {
    assert(!/innerHTML\s*:/.test(source), `Unexpected innerHTML sink outside structured data component: ${relPath}`);
  }
}

if (failures.length > 0) {
  console.error("Security policy checks failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Security policy checks passed.");
