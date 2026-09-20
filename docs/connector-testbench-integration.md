# Connector Testbench integration

The integration is deliberately loose:

`Launch Kit → Connector Testbench → Connector Testbench evidence → optional future Agent Evidence Recorder ingestion`

The Launch Kit owns build, deployment, metadata, and static readiness checks. Connector Testbench owns bounded live OpenAPI contract probes and evidence generation. Agent Evidence Recorder is not imported or modified, and no ingestion is implemented here.

`npm run connector-test` pins installation to `connector-testbench@v0.1.0` from the public Git tag unless `CONNECTOR_TESTBENCH_BIN` is supplied. It requires explicit `CONNECTOR_BASE_URL` and `CONNECTOR_OPENAPI_URL` values and writes runtime output to `artifacts/connector-testbench/<run-id>/` by default. Both runtime locations are ignored by Git.

External targets must use HTTPS. Connector Testbench remains authoritative for SAFE_READ_ONLY behavior.

