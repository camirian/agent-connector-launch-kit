import test from "node:test";
import assert from "node:assert/strict";
import worker, { OPENAPI, isUnsafeExternalUrl } from "../src/index.js";

const call = (path, options = {}) => worker.fetch(new Request(`https://example.test${path}`, options));

test("health and OpenAPI routes are available", async () => {
  assert.equal((await call("/health")).status, 200);
  const response = await call("/openapi.json");
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), OPENAPI);
});

test("example action returns structured success and errors", async () => {
  const ok = await call("/api/example", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: "hello 🌎" }) });
  assert.deepEqual(await ok.json(), { text: "hello 🌎", characters: 7 });
  const bad = await call("/api/example", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
  assert.equal(bad.status, 400);
  assert.deepEqual(Object.keys(await bad.json()), ["error"]);
});

test("security helper blocks local, private, metadata, and non-http targets", () => {
  for (const url of ["http://localhost/x", "http://127.0.0.1", "http://10.0.0.1", "http://192.168.1.4", "http://169.254.169.254", "http://metadata.google.internal", "http://[::1]", "http://[fc00::1]", "http://[fe80::1]", "http://[::ffff:127.0.0.1]", "file:///etc/passwd"]) assert.equal(isUnsafeExternalUrl(url), true, url);
  assert.equal(isUnsafeExternalUrl("https://public.example/path"), false);
});

test("request size is enforced even without Content-Length", async () => {
  const body = JSON.stringify({ text: "x".repeat(17_000) });
  const response = await call("/api/example", { method: "POST", headers: { "content-type": "application/json" }, body });
  assert.equal(response.status, 413);
});
