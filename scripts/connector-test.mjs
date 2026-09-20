import { access, mkdir } from "node:fs/promises";
import { constants } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const baseUrl = process.env.CONNECTOR_BASE_URL;
const openapiUrl = process.env.CONNECTOR_OPENAPI_URL;
const version = process.env.CONNECTOR_TESTBENCH_VERSION || "v0.1.0";
const evidenceDir = resolve(process.env.CONNECTOR_EVIDENCE_DIR || join("artifacts", "connector-testbench", new Date().toISOString().replace(/[:.]/g, "-")));
const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const cacheRoot = resolve(root, ".connector-testbench", version);
const venvPython = process.platform === "win32" ? join(cacheRoot, "Scripts", "python.exe") : join(cacheRoot, "bin", "python");
const defaultBinary = process.platform === "win32" ? join(cacheRoot, "Scripts", "connector-testbench.exe") : join(cacheRoot, "bin", "connector-testbench");

const fail = (message) => { console.error(`connector-test: ${message}`); process.exit(2); };
if (!baseUrl || !openapiUrl) fail("set CONNECTOR_BASE_URL and CONNECTOR_OPENAPI_URL");
for (const [name, value] of [["CONNECTOR_BASE_URL", baseUrl], ["CONNECTOR_OPENAPI_URL", openapiUrl]]) {
  try { const url = new URL(value); if (url.protocol !== "https:") fail(`${name} must use HTTPS for external targets`); } catch { fail(`${name} must be a valid URL`); }
}

const run = (command, args) => {
  const result = spawnSync(command, args, { cwd: root, stdio: "inherit", shell: false });
  if (result.error) fail(`${command} failed to start: ${result.error.message}`);
  if (result.status !== 0) process.exit(result.status || 1);
};

let binary = process.env.CONNECTOR_TESTBENCH_BIN || defaultBinary;
if (!process.env.CONNECTOR_TESTBENCH_BIN) try { await access(binary, constants.X_OK); } catch {
  console.log(`connector-test: installing Connector Testbench ${version} from its immutable Git tag`);
  run(process.env.CONNECTOR_TESTBENCH_PYTHON || "python3", ["-m", "venv", cacheRoot]);
  await mkdir(cacheRoot, { recursive: true });
  run(venvPython, ["-m", "pip", "install", "--disable-pip-version-check", `connector-testbench @ git+https://github.com/camirian/connector-testbench.git@${version}`]);
  binary = defaultBinary;
}

await mkdir(evidenceDir, { recursive: true });
console.log(`connector-test: target ${baseUrl}`);
console.log(`connector-test: OpenAPI ${openapiUrl}`);
console.log(`connector-test: evidence ${evidenceDir}`);
run(binary, ["run", "--openapi", openapiUrl, "--base-url", baseUrl, "--output", evidenceDir]);
