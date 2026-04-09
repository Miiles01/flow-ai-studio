

## Onboarding System for Miiles

### What We're Building
A multi-step onboarding flow that appears after registration (and for existing users who haven't completed it). Steps:

1. **Bienvenida** — Greeting screen with the user's name
2. **Sobre ti** — Text area for bio/description of what they do
3. **Redes sociales** — Instagram, TikTok, YouTube, Twitter handles
4. **Tus videos** — 3 video link inputs with live preview (embed). "Saltar" button for non-creators
5. **Contacto** — Phone number input

A progress indicator at the top shows which step the user is on. Clean, minimal design following the Miiles design system.

### Database Changes
Add columns to the `profiles` table via migration:
- `tiktok_handle` (text, nullable)
- `youtube_handle` (text, nullable)
- `twitter_handle` (text, nullable)
- `phone` (text, nullable)
- `video_url_1` (text, nullable)
- `video_url_2` (text, nullable)
- `video_url_3` (text, nullable)
- `onboarding_completed` (boolean, default false)

### Files to Create/Edit

**New: `src/pages/Onboarding.tsx`**
- Multi-step form component with 5 steps
- Step progress bar at top (thin line, Miiles style)
- Framer Motion transitions between steps
- Video preview: parse YouTube/TikTok/Instagram URLs and render embed iframes
- "Saltar" (skip) button on the video step
- Saves all data to `profiles` table on completion, sets `onboarding_completed = true`

**Edit: `src/App.tsx`**
- Add `/onboarding` route as a protected route (no sidebar layout)
- Redirect users to `/onboarding` if `onboarding_completed` is false

**Edit: `src/pages/Register.tsx`**
- After successful registration, navigate to `/onboarding` instead of `/login`

### Design
- Full-screen, centered layout (no sidebar)
- Miiles logo at top
- Large heading per step, light subtitle
- Inputs: white bg, no border, shadow-sm (per design system)
- Black primary button, Poppins 300/400 only
- Smooth step transitions with framer-motion

