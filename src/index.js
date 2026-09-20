import { LIMITS, hasJsonContentType, isUnsafeExternalUrl, jsonError, jsonResponse, requireHttps } from "./security.js";

const OPENAPI = {
  openapi: "3.0.3",
  info: { title: "Example Text Echo Connector", version: "0.1.0", description: "A harmless example API for the Agent Connector Launch Kit." },
  paths: {
    "/": { get: { operationId: "home", responses: { 200: { description: "Product landing page" } } } },
    "/health": { get: { operationId: "health", responses: { 200: { description: "Service health" } } } },
    "/openapi.json": { get: { operationId: "openapi", responses: { 200: { description: "OpenAPI document" } } } },
    "/api/example": { post: { operationId: "echoText", requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/EchoRequest" } } } }, responses: { 200: { description: "Echo result", content: { "application/json": { schema: { $ref: "#/components/schemas/EchoResponse" } } } }, 400: { description: "Structured validation error" } } } },
    "/support": { get: { operationId: "support", responses: { 200: { description: "Support page" } } } },
    "/privacy": { get: { operationId: "privacy", responses: { 200: { description: "Privacy template" } } } },
    "/terms": { get: { operationId: "terms", responses: { 200: { description: "Terms template" } } } }
  },
  components: { schemas: {
    EchoRequest: { type: "object", required: ["text"], properties: { text: { type: "string", minLength: 1, maxLength: 4000 } } },
    EchoResponse: { type: "object", required: ["text", "characters"], properties: { text: { type: "string" }, characters: { type: "integer" } } },
    Error: { type: "object", required: ["error"], properties: { error: { type: "object", required: ["code", "message"] } } }
  } }
};

const PAGE = (title, body) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>body{font:16px system-ui;max-width:760px;margin:4rem auto;padding:0 1rem;line-height:1.6;color:#17324d}a{color:#146c94}code{background:#eef3f6;padding:.15rem .3rem}</style></head><body>${body}</body></html>`;
const pages = {
  "/": PAGE("Example Text Echo Connector", "<h1>Example Text Echo Connector</h1><p>A tiny, low-consequence API example for the Agent Connector Launch Kit.</p><p><a href=\"/openapi.json\">OpenAPI</a> · <a href=\"/support\">Support</a> · <a href=\"/privacy\">Privacy</a> · <a href=\"/terms\">Terms</a></p>"),
  "/support": PAGE("Support", "<h1>Support</h1><p>Replace this page with your support contact and response expectations before deployment.</p><p>Template contact: YOUR_SUPPORT_EMAIL@example.invalid</p>"),
  "/privacy": PAGE("Privacy policy template", "<h1>Privacy policy template</h1><p>This starter endpoint does not store request data. Replace this template with a policy reviewed for your actual service, data flows, and jurisdiction.</p>"),
  "/terms": PAGE("Terms template", "<h1>Terms of service template</h1><p>This starter endpoint is provided as an example. Replace this template with terms appropriate to your service before launch.</p>"),
};

async function example(request) {
  if (!hasJsonContentType(request)) return jsonError("unsupported_media_type", "Use Content-Type: application/json.", 415);
  const rawBody = await request.arrayBuffer();
  if (rawBody.byteLength > LIMITS.maxRequestBytes) return jsonError("request_too_large", "The request exceeds the configured size limit.", 413);
  let payload;
  try { payload = JSON.parse(new TextDecoder().decode(rawBody)); } catch { return jsonError("invalid_json", "Request body must be valid JSON."); }
  if (!payload || typeof payload.text !== "string" || payload.text.trim().length === 0) return jsonError("invalid_text", "The text field must be a non-empty string.");
  if (payload.text.length > 4000) return jsonError("text_too_long", "The text field must be 4,000 characters or fewer.");
  return jsonResponse({ text: payload.text, characters: [...payload.text].length });
}

export default { async fetch(request) {
  const url = new URL(request.url);
  if (!requireHttps(request) && url.hostname !== "localhost" && url.hostname !== "127.0.0.1") return jsonError("https_required", "HTTPS is required.", 400);
  if (request.method === "GET" && url.pathname === "/health") return jsonResponse({ status: "ok", service: "agent-connector-launch-kit", version: "0.1.0" });
  if (request.method === "GET" && url.pathname === "/openapi.json") return jsonResponse(OPENAPI);
  if (request.method === "POST" && url.pathname === "/api/example") return example(request);
  if (request.method === "GET" && pages[url.pathname]) return new Response(pages[url.pathname], { headers: { "content-type": "text/html; charset=utf-8" } });
  return jsonError("not_found", "The requested route does not exist.", 404);
} };

export { OPENAPI, isUnsafeExternalUrl };
