export const LIMITS = Object.freeze({
  maxRequestBytes: 16 * 1024,
  maxResponseBytes: 64 * 1024,
  timeoutMs: 8_000,
});

export function jsonError(code, message, status = 400, details) {
  const body = { error: { code, message } };
  if (details !== undefined) body.error.details = details;
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

export function jsonResponse(data, status = 200) {
  const body = JSON.stringify(data);
  if (new TextEncoder().encode(body).byteLength > LIMITS.maxResponseBytes) {
    return jsonError("response_too_large", "The response exceeds the configured size limit.", 500);
  }
  return new Response(body, {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

export function requireHttps(request) {
  const forwarded = request.headers.get("x-forwarded-proto");
  return new URL(request.url).protocol === "https:" || forwarded === "https";
}

export function hasJsonContentType(request) {
  return (request.headers.get("content-type") || "").toLowerCase().split(";", 1)[0] === "application/json";
}

export function isUnsafeExternalUrl(value) {
  let url;
  try { url = new URL(value); } catch { return true; }
  if (!/^https?:$/.test(url.protocol)) return true;
  const host = url.hostname.toLowerCase().replace(/\.$/, "");
  if (host === "localhost" || host === "metadata.google.internal" || host === "metadata" || host === "169.254.169.254") return true;
  const ipv6 = host.replace(/^\[|\]$/g, "");
  if (ipv6.includes(":")) {
    const firstHextet = Number.parseInt(ipv6.split(":")[0] || "0", 16);
    if (ipv6 === "::1" || ipv6 === "0:0:0:0:0:0:0:1" || ipv6 === "::" || ipv6.startsWith("::ffff:") || (firstHextet & 0xffc0) === 0xfe80 || (firstHextet & 0xfe00) === 0xfc00) return true;
    const mapped = ipv6.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped && isUnsafeIpv4(mapped[1])) return true;
  }
  const parts = host.split(".").map(Number);
  if (parts.length === 4 && parts.every(Number.isInteger) && parts.every((n) => n >= 0 && n <= 255)) {
    if (isUnsafeIpv4(host)) return true;
  }
  return false;
}

function isUnsafeIpv4(host) {
  const [a, b] = host.split(".").map(Number);
  return a === 0 || a === 10 || a === 127 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
}
