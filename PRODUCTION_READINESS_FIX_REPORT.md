# HRMS Production Readiness Fix Report

Branch: `fix/android-native-compatibility`  
Application: HRMS (`com.peopleflow.hrms`)  
Production URL: `https://hrms-three-delta.vercel.app`

No commit or merge was created. `main` was not modified.

## Root causes identified

- Startup refresh had no explicit UI deadline. A refresh request could leave the
  provider in a restoring state until the network client eventually settled.
- Refresh responses established the in-memory session inside the request
  function. A response that completed after logout or a newer login could
  therefore restore an obsolete session.
- Refresh coordination cached a recent response without checking that its
  access token was still the active token.
- OTP request failures had no deliberate recovery path for the case where the
  backend sent the email but the browser lost the response.
- The existing mobile navigation was a hamburger sheet. It competed with the
  Android header/safe-area layout and did not provide the requested compact
  bottom navigation.
- The branch also contained unresolved merge-conflict markers in the mobile
  shell and authentication files, leaving competing implementations in the
  tracked source.
- The UI still used the old CSS `Blocks` mark and old generated icon assets in
  several web and Android locations.

## Session restoration and authentication

Before the change, `AuthProvider` called the coordinated refresh directly and
waited for it without a 15-second restoration deadline. After the change:

- Restoration starts immediately through the existing HTTP-only refresh-cookie
  endpoint and is bounded by `SESSION_RESTORATION_TIMEOUT_MS` (15 seconds).
- The refresh HTTP request itself also has a 15-second Axios timeout.
- Timeout, network errors, and 5xx responses preserve the refresh cookie and
  current in-memory session. The login screen remains available with its retry
  action after the deadline.
- Only an actual refresh 401 clears the in-memory access-token session. The
  existing server-side cookie security policy is unchanged.
- Session-store revisions invalidate in-flight refresh responses when logout,
  a newer login, or a timed-out restoration supersedes them. Late responses
  cannot revive a logged-out session or overwrite a newer login.
- The coordinator still shares concurrent refresh calls, supports the existing
  proactive refresh timer and Android app-resume refresh, and preserves
  reactive Axios interceptor refresh behavior.
- The guest guard continues to route authenticated ADMIN users to
  `/admin/dashboard` and EMPLOYEE users to `/employee/dashboard`, including
  when `/login` is opened directly.
- Access and refresh tokens are not written to `localStorage` or
  `sessionStorage`. The access token remains in the in-memory session store.

The backend source is not present in this frontend repository. Existing
authentication integration documentation records the unchanged policy as a
15-minute access token and a 30-day refresh token (`2,592,000` seconds), with
the refresh cookie using `Max-Age=2592000`, `HttpOnly`, `Secure`,
`SameSite=None`, and the existing auth path. The shared Axios client continues
to use `withCredentials: true`; no cookie lifetime or JWT rule was extended.
The final live-cookie and force-quit persistence checks still require a real
Android device/WebView.

## OTP flow improvements

- OTP request and verification mutations now use a bounded 15-second request
  timeout.
- Existing disabled/pending states are reinforced with mutation guards so
  double taps cannot submit duplicate OTP mutations.
- Existing centralized error mapping continues to distinguish timeout,
  network, 429, 4xx, and 5xx responses.
- When an OTP request fails after the backend may have delivered the email, the
  login form keeps the submitted email and offers `I already received the
  code`, linking safely to `/verify-otp?email=...` without automatically
  resending the mutation.
- Successful request, verification, resend cooldown, expiration, invalid-code
  handling, and role-aware dashboard redirects remain unchanged.

## Responsive navigation

- Desktop audit found 15 ADMIN leaf destinations: dashboard, employees,
  departments, attendance, three attendance reports, shifts, office locations,
  work assignments, leaves, holidays, payroll, bonuses, and settings. It found
  7 EMPLOYEE destinations: dashboard, attendance, leaves, holidays, salary,
  notifications, and profile. No destination present in the desktop sidebar
  configuration was intentionally omitted; the prior branch state was invalid
  because the mobile files contained unresolved competing implementations.
- The desktop sidebar remains available from the existing `lg` breakpoint and
  retains role-specific sections, expandable groups, icons, labels, and routes.
- The mobile hamburger sheet is no longer rendered by the dashboard header.
- Mobile widths use a fixed, horizontally scrollable icon-only bottom bar.
  Each item has an accessible label, tooltip/title, active-route state, and the
  same destination as the existing navigation configuration.
- Expandable parents are flattened to child destinations and duplicate hrefs
  are removed recursively; all 15 ADMIN destinations and all 7 EMPLOYEE
  destinations from the desktop configuration remain accessible. The admin
  attendance destination appears once while its report routes remain
  available.
- Active highlighting selects the most-specific matching route, so a report
  route does not highlight both itself and its attendance parent.
- Dashboard content receives bottom padding, and the bar uses
  `env(safe-area-inset-bottom)` so Android navigation controls do not cover it.
- Existing top safe-area handling remains in `globals.css`; no arbitrary device
  margin was introduced.

## Branding and generated assets

Source of truth: `public/icons/logo.png` (2816×1536, transparent, aspect ratio
preserved).

- Added `assets/logo.png` for Capacitor asset generation.
- Replaced web PWA/icon PNGs with generated logo-derived variants:
  `hrms-192.png`, `hrms-512.png`, `hrms-192-maskable.png`,
  `hrms-512-maskable.png`, and `hrms-apple-touch-icon.png`.
- Added `public/icons/hrms-brand.png` as a compressed aspect-preserving web
  brand image used by the login and dashboard brand components.
- Rebuilt `src/app/favicon.ico` as a valid six-resolution PNG-backed ICO:
  16, 32, 48, 64, 128, and 256 pixels.
- Updated Next metadata, the generated manifest references, login branding,
  dashboard/sidebar branding, and visible HRMS naming.
- Regenerated Android legacy launcher icons, adaptive foreground/background
  resources, and light/dark splash resources from the supplied logo.
- Removed the obsolete unused SVG logo sources after confirming they had no
  application references.

Android identity remains `HRMS` / `com.peopleflow.hrms`.

## Files changed

Application and tests:

- `PRODUCTION_READINESS_FIX_REPORT.md`
- `.github/workflows/android-debug-apk.yml`
- `assets/logo.png` (new); `assets/logo.svg` (removed)
- `src/app/favicon.ico`, `src/app/globals.css`, `src/app/layout.tsx`,
  `src/app/manifest.ts`
- `src/components/layouts/dashboard-brand.tsx`
- `src/components/layouts/dashboard-header.tsx`
- `src/components/layouts/dashboard-shell.tsx`
- `src/components/layouts/dashboard-sidebar.tsx`
- removed `src/components/layouts/mobile-navigation.tsx`
- `src/components/layouts/mobile-bottom-navigation.tsx` (updated)
- `src/components/layouts/mobile-bottom-navigation.test.ts` (updated)
- `src/components/layouts/navigation-model.ts` (new shared flattening/active-route model)
- `src/features/auth/components/auth-shell.tsx`
- `src/features/auth/components/login-form.tsx`
- `src/features/auth/components/otp-form.tsx`
- `src/features/auth/lib/auth-routes.ts`
- `src/features/auth/lib/auth-routes.test.ts`
- `src/features/auth/services/auth-service.ts`
- `src/features/auth/services/auth-service.test.ts`
- `src/features/auth/services/refresh-session.ts`
- `src/features/auth/services/session-store.ts`
- `src/features/auth/services/session.test.ts`
- `src/providers/auth-provider.tsx`
- `public/icons/hrms-brand.png` (new)
- `public/icons/hrms-192.png`, `hrms-512.png`, their maskable variants,
  `hrms-apple-touch-icon.png`
- removed unused `public/icons/hrms-icon.svg` and
  `public/icons/hrms-icon-maskable.svg`

Android generated resources:

- `android/app/src/main/res/mipmap-*/ic_launcher*.png`
- `android/app/src/main/res/drawable*/splash.png`
- `android/app/src/main/res/drawable-night*/splash.png`

Capacitor configuration, package ID, native location permissions, and existing
safe-area/status-bar runtime work were preserved.

## Verification

| Check | Result |
|---|---|
| `npm ci` | PASS; clean install completed. npm printed deprecation warnings during install. |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run test` | PASS — 88 files, 433 tests |
| `npm run build` | PASS — Next.js 16.4.6 production build |
| `npx cap sync android` | PASS — six Capacitor Android plugins synchronized |
| `npx cap doctor` | PASS — Android looking great; Capacitor 8.6.2 installed |
| `npm audit` | PASS — 0 vulnerabilities after clean install |
| favicon structure check | PASS — six valid PNG-backed ICO entries |
| Android manifest inspection | PASS — fine/coarse permissions and package identity present |
| local `assembleDebug` | BLOCKED — local SDK has API 33/34 only; project requires compile/target API 36 |
| GitHub Actions APK build | Workflow updated, not executed from this local session |

The workflow now installs `platforms;android-36` and `build-tools;36.0.0`,
matching `android/variables.gradle` (`compileSdkVersion = 36`,
`targetSdkVersion = 36`), then runs `assembleDebug` and uploads
`android/app/build/outputs/apk/debug/app-debug.apk` as `hrms-debug-apk`.

## Remaining manual testing

- Run the GitHub Actions `Android debug APK` workflow and download the
  `hrms-debug-apk` artifact.
- Install on Android 14 and Android 15/16 test devices; verify light/dark
  system bars, status/navigation safe areas, bottom navigation, launcher icon,
  adaptive icon, splash screen, and back navigation.
- Test foreground location permission flows: first request, deny, permanently
  deny/settings route, location disabled, timeout, unavailable GPS, and a
  successful precise-coordinate check-in. Confirm server geofence validation
  remains authoritative.
- Test OTP success, network loss, timeout, 429, 4xx/invalid code, 5xx, email
  delivered with a lost response, expiration, resend cooldown, and successful
  role redirect.
- Test session restoration on cold start, force-quit/reopen, app resume, an
  expired access token with a valid refresh cookie, invalid refresh cookie,
  transient 5xx/network failure, retry, and logout during an in-flight refresh.
- Verify the refresh cookie remains HTTP-only, Secure, SameSite and 30-day
  scoped after installation and app termination using the deployed backend.

Known limitation: this workspace cannot provide a final device-level cookie,
WebView persistence, GPS, visual safe-area, or CI-artifact result. No Stage 2
background geofencing, continuous tracking, automatic attendance, backend API,
database schema, or authentication security rule was introduced.
