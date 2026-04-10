
## Plan: Fix portfolio video input size & make onboarding mobile-friendly

### Problems identified
1. **VideoLinkPopover input** is too small (`text-xs h-8`) — hard to use on mobile
2. **Portfolio grid** uses `grid-cols-3` always — cramped on small screens
3. **Medios de contacto** uses `flex-row` on desktop but the overall layout isn't optimized for mobile padding/spacing
4. **General mobile issues**: the container uses `p-6` which eats space on small screens, and `max-w-2xl` doesn't adapt

### Changes (single file: `src/pages/Onboarding.tsx`)

1. **VideoLinkPopover** — increase input size from `text-xs h-8` to `text-sm h-10`, increase padding, make buttons bigger
2. **Portfolio grid** — change from `grid-cols-3` to `grid-cols-2 sm:grid-cols-3` so videos are larger on mobile
3. **Main container padding** — reduce from `p-6` to `p-4 sm:p-6`
4. **Welcome step image** — add responsive sizing (`max-w-[280px] sm:max-w-sm`)
5. **Bio card** — ensure textarea and card have comfortable mobile padding
6. **Medios de contacto** — already uses `flex-col md:flex-row`, verify input rows don't clip on small screens
7. **Top arrows** — slightly reduce padding on mobile (`px-4 sm:px-6`)
