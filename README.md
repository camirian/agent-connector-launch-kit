# Agent Connector Launch Kit

A minimal, reusable starter kit for exposing a small API-backed capability to AI-agent platforms through a clean HTTPS API/OpenAPI surface. It uses a Cloudflare Worker, standard Web APIs, and no runtime dependencies.

## What it provides

- Cloudflare Worker reference implementation.
- `GET /health` and `GET /openapi.json`.
- A structured JSON action endpoint.
- Connector metadata for organizing launch and submission details.
- Automated tests and a connector-readiness checker.
- Security defaults and reusable URL-safety helpers.
- Privacy, terms, support, and icon templates.
- Deployment instructions.
- Meta Muse submission notes based on a real September 2026 submission experience.

## What it is not

- Not an official Meta project or Meta SDK.
- Not Meta certification and not a guarantee of connector approval.
- Not limited to Meta Muse.
- Not a SaaS dashboard, account system, billing system, or database.

The kit gives a developer:

- HTTPS-ready API with `GET /health`, `GET /openapi.json`, and `POST /api/example`.
- Structured JSON success and error responses.
- Product, support, privacy, terms, and connector metadata surfaces.
- An SVG icon template.
- Security helpers and an automated readiness check.
- Cloudflare deployment instructions and a platform-specific submission guide.

The example capability echoes text and returns its Unicode character count. Replace `example()` in `src/index.js` with a harmless capability of your own. Keep the route contract, validation, response limits, and documentation aligned with the replacement logic.

## Quick start

Requirements: Node.js 20+ and a Cloudflare account for deployment. Local tests and checks do not require an account.

```sh
git clone https://github.com/camirian/agent-connector-launch-kit.git
cd agent-connector-launch-kit
npm install
npm test
npm run connector-check
npx wrangler dev
CHECK_BASE_URL=http://localhost:8787 npm run connector-check
```

Customize the example business logic, OpenAPI schemas, and `connector.json`. Replace every `YOUR_*` metadata value and the example contact/policy text before deployment.

```sh
npx wrangler login
npm run deploy
CHECK_BASE_URL=https://YOUR-WORKER.workers.dev npm run connector-check
```

`connector-check` is a local launch-preparation aid. It reports PASS, WARN, or FAIL. It does not determine approval by Meta or any other platform.

The shortest workflow is: clone → install → test → customize → deploy → validate. The kit has no runtime dependency installation beyond the deployment tool used by Wrangler.

## Repository map

| Path | Purpose |
| --- | --- |
| `src/index.js` | Worker routes and example business logic |
| `src/security.js` | Reusable request, response, HTTPS, content-type, and URL safety helpers |
| `connector.json` | Launch Kit metadata; not an official platform schema |
| `scripts/connector-check.mjs` | Static and optional deployed-instance checks |
| `tests/` | Node built-in test suite |
| `docs/meta-muse-submission.md` | Experience-based, time-stamped Muse preparation notes |
| `docs/security.md` | Security boundary and extension guidance |
| `assets/icon.svg` | Replaceable 512×512 icon template |

## Replacing the example

1. Define the input and output schemas in `src/index.js` and `openapi`.
2. Keep validation failures in the `{ "error": { "code", "message" } }` shape.
3. Add focused tests for valid input, malformed input, limits, and the main failure modes.
4. Update `connector.json`, the landing page, and the submission notes.
5. Run tests, deploy a disposable instance, and run `connector-check` against it.

If your capability fetches arbitrary external URLs, use `isUnsafeExternalUrl()` before the first request and validate every redirect target. The example does not fetch URLs and therefore does not add unnecessary SSRF surface.

## Optional hands-on assistance

The kit is standalone. Developers who want hands-on submission/readiness assistance can separately ask about a **Muse Submission Fast Lane ($250)** or **Muse Connector Launch Sprint ($750)**. These are service concepts, not dependencies or guarantees.

## License

MIT. See [LICENSE](LICENSE).
