

## Problem
When the sidebar collapses to icon mode, the "miiles" logo text disappears because it's not conditioned on the collapsed state — but the logo should always be visible.

## Solution
Show the full "miiles" text when expanded, and show a compact version (e.g., just "m") when collapsed, so the brand is always present.

### Changes
**`src/components/DashboardLayout.tsx`** — Update the logo section to be collapse-aware:
```tsx
<div className="px-5 pt-6 pb-2">
  <h2 className="text-xl font-normal tracking-tight">
    {collapsed ? "m" : "miiles"}
  </h2>
</div>
```

The `collapsed` variable is already available in the `SidebarBody` component via `useSidebar()`.

