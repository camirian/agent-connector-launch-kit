# Meta Muse submission preparation

This is a preparation aid, not an official Meta schema and not a certification claim. Meta may change the submission form at any time. Verify the live form before submitting.

## OBSERVED IN OUR SEPTEMBER 2026 SUBMISSION

The live submission flow asked for the following overview information:

- connector name;
- company/developer;
- product website;
- example prompts;
- icon;
- payment category;
- contact;
- support;
- privacy;
- terms;
- additional information.

The technical section asked for:

- connection type;
- Raw API path;
- API URL;
- OpenAPI URL;
- documentation;
- access requirements;
- authentication.

The reference implementation was accepted by the submission flow in this observed state. That is evidence about one submission experience, not a promise about future review outcomes.

## GENERAL LAUNCH KIT RECOMMENDATION

Keep these values synchronized in `connector.json`, the deployed routes, and the OpenAPI document. Use HTTPS URLs. Make the support, privacy, and terms pages reachable without authentication. Provide prompts that map directly to documented behavior. Declare payment and authentication accurately. Keep the icon in a common square raster or vector format accepted by the live form.

The Launch Kit metadata file is only an organizational format. It is not an official Meta schema. The kit does not submit anything, store credentials, or depend on Meta.

Before submission, run:

```sh
npm test
CHECK_BASE_URL=https://YOUR-DEPLOYMENT.example npm run connector-check
```

Then review the current live form, its limits, and its required fields yourself.
