# Agent Instructions

## Cloudflare guidance

- For substantive Worker or Wrangler changes, use relevant installed Cloudflare and Workers Best Practices skills plus current official Cloudflare documentation and the project's installed types. If those skills are unavailable in another checkout or harness, consult the official Cloudflare docs directly. Keep guidance scoped to Cloudflare work; run existing project tests and connector checks for behavior changes.
- Keep credentials server-side and out of source, client code, tests, and logs. Do not deploy or change Cloudflare account settings as part of local verification.
