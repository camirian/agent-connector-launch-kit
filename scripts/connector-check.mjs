import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const metadata = JSON.parse(await readFile(resolve(root, "connector.json"), "utf8"));
const results = [];
const check = (name, pass, detail = "") => results.push({ name, status: pass ? "PASS" : "FAIL", detail });
const warn = (name, detail) => results.push({ name, status: "WARN", detail });
const info = (name, detail) => results.push({ name, status: "INFO", detail });

for (const key of ["name", "developer", "product_url", "description", "example_prompts", "api_base_url", "openapi_url", "documentation_url", "support_url", "privacy_url", "terms_url", "payments", "authentication", "version"]) check(`metadata.${key}`, metadata[key] !== undefined && metadata[key] !== "", "required Launch Kit field");
for (const key of ["product_url", "api_base_url", "openapi_url", "documentation_url", "support_url", "privacy_url", "terms_url"]) {
  try { const url = new URL(metadata[key]); check(`metadata.${key} is HTTPS`, url.protocol === "https:", metadata[key]); if (url.hostname.endsWith(".example") || url.hostname.includes("your-domain")) info(`metadata.${key} is a template`, "replace the explicit YOUR_* placeholder before deployment"); } catch { check(`metadata.${key} is a URL`, false, metadata[key]); }
}
const icon = await readFile(resolve(root, "assets/icon.svg"), "utf8");
check("icon exists and is 512x512 SVG", icon.includes("<svg") && icon.includes('width="512"') && icon.includes('height="512"') && icon.includes("viewBox=\"0 0 512 512\""), "assets/icon.svg");
const openapi = await import(pathToFileURL(resolve(root, "src/index.js"))).then((m) => m.OPENAPI);
check("OpenAPI parses", Boolean(openapi?.openapi && openapi?.paths), "src/index.js");
const actualRoutes = Object.entries(openapi.paths || {}).flatMap(([path, methods]) => Object.keys(methods).map((method) => `${method.toUpperCase()} ${path}`)).sort();
check("metadata routes match OpenAPI", JSON.stringify(metadata.routes?.slice().sort()) === JSON.stringify(actualRoutes), `${actualRoutes.length} documented routes`);
const base = process.env.CHECK_BASE_URL;
if (base) {
  const origin = base.replace(/\/$/, "");
  check("deployed URL uses HTTPS", origin.startsWith("https://"), origin);
  for (const path of ["/health", "/openapi.json", "/", "/support", "/privacy", "/terms"]) { try { const response = await fetch(origin + path); check(`${path} responds`, response.ok, String(response.status)); } catch (error) { check(`${path} responds`, false, error.message); } }
  try { const response = await fetch(origin + "/api/example", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: "connector check" }) }); const body = await response.json(); check("/api/example accepts a valid request", response.ok && body.characters === 15, String(response.status)); } catch (error) { check("/api/example accepts a valid request", false, error.message); }
  try { const response = await fetch(origin + "/openapi.json"); const spec = await response.json(); check("deployed OpenAPI has documented routes", ["/health", "/openapi.json", "/api/example"].every((path) => spec.paths?.[path]), "required routes"); } catch (error) { check("deployed OpenAPI has documented routes", false, error.message); }
} else info("deployed checks", "set CHECK_BASE_URL=https://YOUR_WORKER.workers.dev to check a live instance");

for (const item of results) console.log(`${item.status.padEnd(4)} ${item.name}${item.detail ? ` — ${item.detail}` : ""}`);
const failures = results.filter((item) => item.status === "FAIL");
console.log(`\n${failures.length ? "FAIL" : "PASS"}: ${results.length} checks, ${failures.length} failures, ${results.filter((item) => item.status === "WARN").length} warnings`);
process.exitCode = failures.length ? 1 : 0;
