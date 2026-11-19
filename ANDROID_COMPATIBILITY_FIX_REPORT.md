# HRMS Android Compatibility Fix Report — Stage 1.1

**Branch:** `fix/android-native-compatibility`  
**App:** HRMS (`com.peopleflow.hrms`)  
**Remote URL:** `https://hrms-three-delta.vercel.app`

`main` was not modified or merged.

## 1. Android system UI and safe areas

The generated Android project targets SDK 36. Android 15/16 enforce
edge-to-edge, so the fix does not add device-specific top margins or attempt to
disable edge-to-edge. The implementation uses:

- `capacitor.config.ts` with the official Status Bar plugin configured for
  non-overlay behavior on older Android versions and `DEFAULT` icon styling.
- `src/components/capacitor/capacitor-runtime.tsx` using Capacitor `SystemBars`
  plus the Status Bar plugin to apply appearance-aware system-bar icon styles.
- `src/app/globals.css` safe-area padding using
  `env(safe-area-inset-*)` for normal content.
- Safe-area padding for the fixed mobile navigation sheet.
- `android/app/src/main/res/values/styles.xml` with HRMS system-bar colors and
  light/dark icon flags.
- `android/app/src/main/res/values-night/{colors,bools}.xml` for dark Android
  system-bar appearance.

The existing Next.js viewport already uses `viewport-fit: cover`, which allows
the WebView safe-area values to be populated. Normal content therefore begins
below the status bar and ends above navigation controls without arbitrary
pixel offsets. On Android 15/16, the system-bar background color is supplied by
the edge-to-edge WebView/content path; legacy `backgroundColor` and overlay
settings remain only for older Android versions where they are supported.

## 2. Foreground native location

Added official Capacitor plugins:

- `@capacitor/geolocation@8.2.5`
- `@capacitor/status-bar@8.0.4`
- `@capacitor/app-launcher@8.0.1`

`android/app/src/main/AndroidManifest.xml` now declares:

- `android.permission.ACCESS_COARSE_LOCATION`
- `android.permission.ACCESS_FINE_LOCATION`
- optional GPS hardware feature declaration
- Android Settings package visibility for the permission recovery route

`src/features/attendance/hooks/use-geolocation.ts` now selects the native
Capacitor Geolocation API when running in Android and keeps the existing
browser `navigator.geolocation` implementation for web:

1. Check the native `location` permission alias.
2. Request foreground `location` permission if it is not granted.
3. Require the granted `location` alias so approximate-only Android permission
   does not silently pass as precise GPS.
4. Call `getCurrentPosition` with high accuracy, a 15-second timeout, no cached
   position, and the plugin’s Android framework fallback enabled.
5. Normalize and validate latitude, longitude, and accuracy using the existing
   server-compatible `GpsRequest` contract.

No `watchPosition`, background permission, continuous tracking, automatic
attendance, or client-side geofence bypass was added. The existing check-in and
check-out mutations still submit the same GPS payloads to the same backend
endpoints, and the backend remains authoritative for geofence validation.

Native failures are mapped for permission denial, permanently blocked access,
disabled Location services, timeout, unavailable GPS, and malformed accuracy.
When Android settings are required, the UI exposes **Open Android settings**;
the official App Launcher opens the Android Settings application and the error
text directs the employee to HRMS → Permissions → Precise location. The
employee can then retry Check In.

Both employee check-in surfaces use the shared hook, so the behavior is
consistent on the dashboard and attendance page.

## 3. Authentication and cookie persistence

### Backend policy verification

The backend source is not present in this frontend/client checkout. The prior
repository authentication investigation retained in the parent Stage 1
commit documents and tests the backend policy as:

- access JWT: 15 minutes (`900,000 ms`)
- refresh token/database lifetime: 30 days (`2,592,000,000 ms`)
- refresh cookie: `Max-Age=2592000` (30 days)
- cookie attributes: `HttpOnly; Secure; SameSite=None; Path=/api/v1/auth`
- refresh-token rotation grace period: 30 seconds

No refresh lifetime, cookie attribute, authentication endpoint, JWT rule, or
database behavior was changed in this fix. Live production `Set-Cookie`
headers were not independently captured because no backend credentials or
authenticated production test session were supplied.

### Frontend/WebView behavior

The existing architecture already satisfies the required credential path:

- Axios uses same-origin `/api/v1` and `withCredentials: true`.
- The remote WebView origin is the production Vercel origin, preserving the
  existing same-origin Next.js API rewrite and first-party cookie scope.
- Access tokens remain in the in-memory `sessionStore`; no access token is
  written to `localStorage` or `sessionStorage`.
- `AuthProvider` restores the session on startup with `/auth/refresh`.
- The existing proactive timer refreshes before the 15-minute access-token
  expiry, and the interceptor refreshes eligible 401 responses.
- A new native `appStateChange` handler refreshes the session on Android app
  resume, covering timers suspended while the WebView is backgrounded.
- `MainActivity` explicitly keeps normal WebView cookie acceptance enabled and
  flushes the cookie manager on activity stop. Third-party cookies are not
  enabled, and no token storage was added.
- Explicit logout behavior remains unchanged: the backend logout request is
  attempted when an access token exists, then in-memory session/query state is
  cleared.

## 4. Exact files changed

Application and dependency files:

- `package.json`
- `package-lock.json`
- `capacitor.config.ts`
- `src/app/globals.css`
- `src/components/capacitor/capacitor-runtime.tsx`
- `src/components/ui/sheet.tsx`
- `src/providers/auth-provider.tsx`
- `src/features/attendance/hooks/use-geolocation.ts`
- `src/features/attendance/hooks/use-geolocation.test.ts`
- `src/features/attendance/components/employee-check-in-widget.tsx`
- `src/features/dashboard/components/employee/employee-attendance-hero.tsx`
- `ANDROID_COMPATIBILITY_FIX_REPORT.md`

Android files:

- `android/app/capacitor.build.gradle`
- `android/capacitor.settings.gradle`
- `android/app/src/main/AndroidManifest.xml`
- `android/app/src/main/java/com/peopleflow/hrms/MainActivity.java`
- `android/app/src/main/res/values/styles.xml`
- `android/app/src/main/res/values/colors.xml`
- `android/app/src/main/res/values/bools.xml`
- `android/app/src/main/res/values-night/colors.xml`
- `android/app/src/main/res/values-night/bools.xml`

The existing Android debug workflow did not require changes; it already runs
`npx cap sync android`, builds `assembleDebug`, and uploads the APK artifact.

## 5. Test results

| Check | Result |
| --- | --- |
| `npm ci` | Pass |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass |
| `npm run test -- --reporter=dot` | Pass — 87 files, 418 tests |
| `npm run build` | Pass — Next.js 16.4.6, 52 routes |
| `npx cap sync android` | Pass — 6 Android plugins detected |
| `npx cap doctor` | Pass — Android looking great |
| `npm audit` | Pass — 0 reported vulnerabilities |
| Manifest inspection | Pass — coarse/fine permissions present |
| Android debug APK | Workflow configured; not executed from this local environment |

The first sandboxed Vitest attempt returned Windows `esbuild spawn EPERM`; the
same suite passed with the required child-process permission.

## 6. Remaining manual/device tests

The following require a GitHub Actions run plus a physical Android device or
emulator:

- Install the debug APK and verify status-bar/header spacing on Android 14 and
  Android 15/16.
- Test light and dark Android system themes, including navigation-bar icon
  contrast and safe-area behavior.
- Fresh install: grant precise location and complete employee Check In.
- Approximate-only permission, first denial, repeated/permanent denial, and
  the Android Settings recovery route.
- Location services disabled, GPS unavailable, and timeout messaging.
- Confirm check-in remains rejected/accepted only by the backend geofence rules.
- Sign in, force-stop/reopen, wait across the 15-minute access-token boundary,
  resume the app, and verify refresh-cookie restoration without a login prompt.
- Verify explicit logout clears the session and cookie through the existing
  backend logout behavior.
- Capture production response headers without token values to confirm the live
  `Max-Age`, `Expires`, `Secure`, `HttpOnly`, `SameSite`, and cookie path.

Stage 2 background geofencing and automatic attendance remain explicitly out of
scope.
