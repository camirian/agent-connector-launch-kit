# Security boundary

The starter has no database, credentials, authentication, billing, or arbitrary outbound fetch. The example action is intentionally low consequence.

The shared helpers provide:

- HTTPS enforcement, with localhost allowed for development.
- A 16 KiB request limit and 64 KiB response limit.
- JSON content-type validation for the example action.
- Consistent JSON errors with `code` and `message`.
- A timeout constant for future outbound work.
- `isUnsafeExternalUrl()` checks for localhost, loopback, RFC1918, link-local, IPv4-mapped operational targets, and common cloud metadata hosts.

The URL helper is not a complete network policy. A production service that follows redirects must validate each redirect destination, resolve DNS safely in its execution environment, set a bounded timeout, and limit response bytes. Add authentication only when the capability requires it; document the scheme in OpenAPI and `connector.json`.

Do not put secrets in this repository. Use Wrangler secrets or an equivalent deployment secret store for real credentials.
