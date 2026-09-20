# Agent Connector Launch Kit

A minimal, reusable starter kit for exposing a small API-backed capability to AI-agent platforms through a clean HTTPS API/OpenAPI surface. It uses a Cloudflare Worker, standard Web APIs, and no runtime dependencies.

## What it provides

- Cloudflare Worker reference implementation.
- `GET /health` and `GET /openapi.json`.
- A structured JSON action endpoint.
- Connector metadata for organizing launch and submission details.
- Automated tests and a connector-readiness checker.
- Optional safe live contract testing through the pinned Connector Testbench release.
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

`connector-check` is a static/readiness check. Its live mode is read-only by default. It reports PASS, WARN, FAIL, or INFO. It does not determine approval by Meta or any other platform.

## End-to-end safe test workflow

The Launch Kit remains usable without Connector Testbench. When a deployed HTTPS target is available, the optional workflow is:

```sh
# A. Clone
git clone https://github.com/camirian/agent-connector-launch-kit.git
cd agent-connector-launch-kit

# B. Customize
# Edit src/index.js, connector.json, and the OpenAPI schemas.

# C. Local test
npm test

# D. Deploy
npm run deploy

# E. Static readiness check
CHECK_BASE_URL=https://YOUR-WORKER.workers.dev npm run connector-check

# F. Safe live contract test
CONNECTOR_BASE_URL=https://YOUR-WORKER.workers.dev \
CONNECTOR_OPENAPI_URL=https://YOUR-WORKER.workers.dev/openapi.json \
npm run connector-test

# G. Inspect evidence
find artifacts/connector-testbench -maxdepth 2 -type f | sort
```

`connector-check` validates Launch Kit metadata, routes, and safe public surfaces. `connector-test` runs Connector Testbench in `SAFE_READ_ONLY` mode: GET, HEAD, and OPTIONS may be probed; POST, PUT, PATCH, and DELETE are discovered and reported but not executed against external targets. The wrapper pins Connector Testbench to the immutable `v0.1.0` Git tag and stores its bootstrap environment under the ignored `.connector-testbench/` directory.

The flow is `BUILD → STATIC VALIDATION → SAFE LIVE TESTING → EVIDENCE`. Neither tool is platform certification or an approval predictor.

The shortest workflow is: clone → install → test → customize → deploy → validate. The kit has no runtime dependency installation beyond the deployment tool used by Wrangler.

## Live reference demo

The reference deployment is available at [agent-connector-launch-kit-demo.caaren-amirian-build.workers.dev](https://agent-connector-launch-kit-demo.caaren-amirian-build.workers.dev). It is a disposable example instance, not a production service. Check its [health endpoint](https://agent-connector-launch-kit-demo.caaren-amirian-build.workers.dev/health) or [OpenAPI document](https://agent-connector-launch-kit-demo.caaren-amirian-build.workers.dev/openapi.json).

## Repository map

| Path | Purpose |
| --- | --- |
| `src/index.js` | Worker routes and example business logic |
| `src/security.js` | Reusable request, response, HTTPS, content-type, and URL safety helpers |
| `connector.json` | Launch Kit metadata; not an official platform schema |
| `scripts/connector-check.mjs` | Static and optional deployed-instance checks |
| `scripts/connector-test.mjs` | Optional pinned Connector Testbench runner and evidence path |
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

The optional Connector Testbench path is intentionally separate from the Launch Kit implementation. It produces evidence that a future adapter could map into Agent Evidence Recorder; this repository does not perform that ingestion.

If your capability fetches arbitrary external URLs, use `isUnsafeExternalUrl()` before the first request and validate every redirect target. The example does not fetch URLs and therefore does not add unnecessary SSRF surface.

## Optional hands-on assistance

The kit is standalone. Developers who want hands-on submission/readiness assistance can separately ask about a **Muse Submission Fast Lane ($250)** or **Muse Connector Launch Sprint ($750)**. These are service concepts, not dependencies or guarantees.

## License

MIT. See [LICENSE](LICENSE).
