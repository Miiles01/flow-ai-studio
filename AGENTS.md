# Architecture rules
- Admin user-flow geometry and locale keys live in one typed catalogue; visits use an allowlisted write-only RPC and aggregate reads require the existing server-verified admin token, so anonymous tracking never exposes customer events.

- Published page visits are stored as owner-scoped UTC daily totals; dashboard aggregation uses the shared 30-day series helper and must not turn failed reads into zero visits.

- Algorithmic architecture keeps stable graph IDs, geometry and media in its data module; all display copy uses locale keys resolved when rendering, so language changes preserve graph structure and expanded details.

- The home template carousel reads the same Studio catalogue hook as the library; keep the prompt component intact while hidden so it can be restored without losing its workflow.

- Studio project uploads retain a sanitized source ZIP in a private bucket and extract only static preview files; compiled client projects require a built entry point because server builds are not available.
- Studio previews use sandboxed srcDoc with an asset-only public function; never grant scripts the application's same origin, to isolate administrator-supplied HTML.
- Administrative Studio writes and uploads require server verification of the existing signed admin session; public asset reads require a published template.
- Studio template details use a URL query flag for immersive viewing and scale a fixed desktop viewport in the initial preview, so browser history restores the detail page and small screens still show the desktop composition.
- Remote MCP tools use the official SDK and OAuth with a required OAuth client claim and act only through the caller's token and RLS. User sites are stored in the database and served by a public function that only returns published files; the external public domain reaches it through a host-side proxy, so publishing does not depend on GitHub.
- OAuth consent is routed outside onboarding guards, and all authentication return paths use one same-origin validator to preserve authorization requests without enabling external redirects.
- Studio catalogue identity uses a stable template_number independent of title; preserve UUIDs and slugs for compatibility, and reserve database-generated numbers from 1000 for administrator uploads to avoid collisions with the repository catalogue.
- Public pages live under /:lang (languages listed in SUPPORTED_LANGS in src/i18n.ts); unprefixed public URLs redirect to the stored language. Language checks go through langOf/pickLang so adding a language never leaves es/en-only branches. Copy lives in src/locales/<lang>/<section>.json with identical keys (enforced by src/test/locales.test.ts), so no language silently misses text. Dashboard has no URL prefix; language comes from the in-app selector.
- Brand program applicant share tokens live only in the admin-only brand_program_tokens table, and avatars are shown through signed URLs; catalogue rows and storage reads must not expose tokens or other users' files.
- Free Pro trials live in the pro_trials table and are granted only by the claim_pro_trial database function with a valid code from the private pro_trial_codes table (once per account); is_pro counts active trials, and profiles.plan is changed only by trusted functions that set the miiles.plan_sync flag, so clients can never grant themselves Pro.
