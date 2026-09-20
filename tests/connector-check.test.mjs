import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

test("live connector-check is read-only by default", async () => {
  const methods = [];
  const server = createServer((request, response) => {
    methods.push(request.method);
    const body = request.url === "/openapi.json" ? JSON.stringify({ paths: { "/health": {}, "/openapi.json": {}, "/api/example": {} } }) : "ok";
    response.writeHead(200, { "content-type": request.url === "/openapi.json" ? "application/json" : "text/plain" });
    response.end(body);
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    const { stdout } = await execFileAsync(process.execPath, ["scripts/connector-check.mjs"], { env: { ...process.env, CHECK_BASE_URL: `http://127.0.0.1:${server.address().port}` } });
    assert.match(stdout, /INFO \/api\/example mutation check/);
    assert.equal(methods.includes("POST"), false);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
