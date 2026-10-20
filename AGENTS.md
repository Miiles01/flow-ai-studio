# Architecture rules

- Studio project uploads retain a sanitized source ZIP in a private bucket and extract only static preview files; compiled client projects require a built entry point because server builds are not available.
- Studio previews use sandboxed srcDoc with an asset-only public function; never grant scripts the application's same origin, to isolate administrator-supplied HTML.
- Administrative Studio writes and uploads require server verification of the existing signed admin session; public asset reads require a published template.
- Studio template details use a URL query flag for immersive viewing and scale a fixed desktop viewport in the initial preview, so browser history restores the detail page and small screens still show the desktop composition.
- Remote MCP tools use the official SDK and OAuth with a required OAuth client claim; the initial catalog is read-only because user-site hosting is not connected. Never imply catalog access creates or publishes a user website.
- OAuth consent is routed outside onboarding guards, and all authentication return paths use one same-origin validator to preserve authorization requests without enabling external redirects.
- Studio catalogue identity uses a stable template_number independent of title; preserve UUIDs and slugs for compatibility, and reserve database-generated numbers from 1000 for administrator uploads to avoid collisions with the repository catalogue.