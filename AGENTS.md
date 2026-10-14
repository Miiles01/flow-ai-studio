# Architecture rules

- Studio project uploads retain a sanitized source ZIP in a private bucket and extract only static preview files; compiled client projects require a built entry point because server builds are not available.
- Studio previews use sandboxed srcDoc with an asset-only public function; never grant scripts the application's same origin, to isolate administrator-supplied HTML.
- Administrative Studio writes and uploads require server verification of the existing signed admin session; public asset reads require a published template.