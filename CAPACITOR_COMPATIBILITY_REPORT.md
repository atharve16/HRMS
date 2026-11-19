# HRMS Android App — Capacitor Compatibility Report

**Stage:** 1 — Project inspection only  
**Inspection date:** 2026-11-18  
**Target web app:** https://hrms-three-delta.vercel.app  
**Repository:** `client`  

## Executive conclusion

**Assessment: compatible with a remote-site Capacitor WebView wrapper, subject to authentication and WebView testing.** The least-change Stage 1/Stage 2 path is to keep the deployed Next.js application as the runtime and have Capacitor load the HTTPS Vercel URL. The existing same-origin Next.js API rewrite continues to proxy `/api/v1/*` to the Spring backend, so the browser-side API and HTTP-only refresh-cookie design remain on the Vercel origin.

**A bundled static Capacitor web build is not possible without material configuration and authentication changes.** The current Next.js configuration contains a server-side rewrite. The app also contains route redirects and dynamic `[id]` routes without `generateStaticParams`. Next.js documents rewrites, redirects, cookies, and similar server features as unsupported by static export. Removing the rewrite would also make the existing cookie/authentication origin and CORS behavior a new design problem.

The remote wrapper is not offline-capable, and the APK would depend on the availability and behavior of Vercel, Render, the email/OTP provider, the Android System WebView, and the device network. Those are acceptable Stage 1 trade-offs if the app is treated as an authenticated online HRMS client.

## Evidence labels used in this report

- **Confirmed:** directly observed in this checkout, package metadata, generated build output, or existing repository documentation.
- **Test required:** a compatibility hypothesis that must be exercised in an Android WebView/CI build before release.
- **Recommended:** a proposed implementation or mitigation; it is not an existing behavior.

## 1. Current project architecture

### Framework and structure — Confirmed

- Next.js **16.4.3**, React **19.3.0**, React DOM **19.3.0**, TypeScript 5-range tooling.
- App Router structure under `src/app`, with route groups:
  - `src/app/(auth)` — login and OTP verification.
  - `src/app/(admin)` — administrator pages and layout.
  - `src/app/(employee)` — employee pages and layout.
- There are 55 files under `src/app`, including layouts, metadata, the manifest, and route files. The production build reported 52 application route entries, including `manifest.webmanifest`.
- The source tree contains 447 files and 132 files containing the `"use client"` directive. The app is therefore a normal Next.js App Router application with many client-side feature components, not a separate React/Vite SPA.
- Feature modules are organized under `src/features`: `auth`, `dashboard`, `employees`, `departments`, `attendance`, `holidays`, `leaves`, `notifications`, `payroll`, `office-locations`, `shifts`, and `work-assignments`.
- Shared UI/layout code is under `src/components`; providers are under `src/providers`; HTTP and error handling are under `src/services`.
- Styling uses Tailwind CSS 4, `@tailwindcss/turbopack`, Radix UI primitives, `lucide-react`, and project CSS tokens in `src/app/globals.css`.
- Data fetching uses TanStack Query 5 and Axios. Forms use React Hook Form, Zod, and `@hookform/resolvers`.

### Scripts — Confirmed

From `package.json`:

| Script | Purpose |
|---|---|
| `npm run dev` | Next development server |
| `npm run build` | Next production build |
| `npm run start` | Next production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | Strict TypeScript check |
| `npm run test` | Vitest suite |
| `npm run test:coverage` | Vitest with V8 coverage |

There is currently no Capacitor package, `capacitor.config.*`, `android/` project, Android Gradle workflow, or mobile-specific script.

### Next configuration — Confirmed

`next.config.ts` currently:

- enables `cacheComponents`;
- enables `partialPrefetching`;
- configures the Tailwind Turbopack CSS loader;
- reads server-side `INTERNAL_API_URL`, defaulting to `https://hrms-n1xj.onrender.com`;
- normalizes an accidental `/api/v1` suffix;
- defines the rewrite `/api/v1/:path*` → `${backendUrl}/api/v1/:path*`.

This rewrite is the production browser-to-backend boundary and is important to the current cookie strategy.

### Build baseline — Confirmed

- `npm run typecheck` passed with exit code 0.
- `npm run build` compiled successfully, completed TypeScript, collected page data, and generated all listed static/partial-prerendered routes.
- The build then exited with Next.js `SecurityFatalError`, which reported that the installed Next.js version is affected by a known security vulnerability and recommended a security upgrade. This is a release blocker to resolve before publishing an APK; no upgrade was performed during this inspection.
- `npm run test` could not start in this Windows sandbox because Vitest/esbuild attempted to spawn a child process and received `spawn EPERM`. This is an environment limitation, not a test assertion result. The suite should be rerun in GitHub Actions or a normal local Node environment.
- The supplied Vercel URL could not be independently HTTP-inspected from this environment: the web fetch was inaccessible and the local HTTPS request failed through the configured proxy. Live cookie headers, redirects, response headers, and deployed asset behavior therefore remain **test required**.

## 2. SSR, Server Components, API routes, and server dependencies

### Confirmed codebase facts

- App Router page/layout files without `"use client"` are Server Components by Next.js default. The root layout defines metadata, `next/font/google`, viewport values, and wraps the client providers.
- There are **no** `"use server"` directives in `src`.
- There are no `route.ts`/`route.tsx` API route handlers and no middleware file in `src`.
- There are no calls to `cookies()` or `headers()`, and no direct `NextRequest`/`NextResponse` usage in the frontend source.
- Four page-level redirects are present:
  - `/admin` → `/admin/dashboard`;
  - `/admin/leave-allocation` → `/admin/leaves`;
  - `/admin/attendance-corrections` → `/admin/attendance`;
  - `/employee` → `/employee/dashboard`.
- Dynamic route segments exist for attendance, employees, departments, leaves, office locations, payroll, shifts, and work assignments. No `generateStaticParams` implementation was found.
- The page components are mostly shells that render client feature components. Business data is loaded from the backend in the browser through Axios/TanStack Query.
- The existing build output shows static routes (`○`) and partial-prerendered dynamic routes (`◐`) under the current server build. This does **not** mean the app is exportable as a static Capacitor bundle.

### Compatibility interpretation

The runtime UI is largely client-driven and therefore suitable for a WebView. However, the production deployment still needs a Next.js runtime for the `/api/v1` rewrite and normal route serving. Server Components/metadata themselves are not the main blocker; the rewrite and auth origin are.

## 3. Authentication, OTP, JWT, refresh, and cookies

### Confirmed frontend behavior

Authentication flow:

1. `POST /auth/request-otp` requests an email OTP.
2. The app navigates to `/verify-otp?email=...`.
3. `POST /auth/verify-otp` verifies the six-digit OTP.
4. The response establishes an in-memory session containing `accessToken`, user, and an expiry timestamp.
5. Authenticated requests attach `Authorization: Bearer <access token>`.
6. Startup calls `POST /auth/refresh` to restore a session.
7. A proactive timer attempts refresh before the access token expires; the interceptor also reacts to eligible 401 responses.
8. `POST /auth/logout` is called when an access token is present, then the in-memory session and React Query cache are cleared.

The repository explicitly documents the intended backend model: the access token stays in memory, while a backend-managed HTTP-only `hrms_refresh_token` cookie is used for refresh. The existing frontend code confirms `withCredentials: true`, but the backend implementation and live cookie headers are not present in this checkout.

The existing authentication report documents a 15-minute access token, a 30-day refresh-token/cookie policy, `Secure`, `HttpOnly`, `SameSite=None`, and a cookie path under `/api/v1/auth`. Those backend values should be revalidated against the deployed backend before release because they are documented findings, not independently live-verified in this inspection.

### OTP-specific observations

- OTP entry uses `autocomplete="one-time-code"`, numeric input, six-character validation, and a resend cooldown.
- The OTP is delivered through the existing backend/email path; no SMS or native Android OTP plugin is used.
- **Test required:** Android WebView keyboard behavior, email-app return flow, focus restoration, and OTP autofill behavior.

### Capacitor authentication risk

The remote wrapper preserves the current origin if the WebView loads `https://hrms-three-delta.vercel.app` directly. Relative API calls remain `/api/v1`, and the Vercel rewrite remains responsible for forwarding cookies to the backend.

A bundled static build would normally load from a Capacitor local origin such as `capacitor://localhost` or an equivalent local WebView origin. In that model:

- the Next.js rewrite is absent;
- the API would need to be called directly using a public absolute API URL;
- backend CORS would need to allow the Capacitor origin and credentials;
- cookie domain/path/SameSite behavior would need redesign and device testing;
- third-party-cookie and cross-origin credential rules could prevent refresh-cookie persistence.

Therefore, **do not change the frontend API base URL or cookie architecture for Stage 1**. Keep the remote wrapper same-origin until a deliberate authentication migration is approved.

## 4. API and environment configuration

### Confirmed variables

`.env.local` contains:

- `NEXT_PUBLIC_API_URL=/api/v1`
- `NEXT_PUBLIC_OTP_RESEND_COOLDOWN_SECONDS=60`

`next.config.ts` reads:

- `INTERNAL_API_URL`, server-side only, with the Render backend URL as fallback.

The browser Axios client defaults to `/api/v1`, sets `withCredentials: true`, has a 30-second timeout, and sends JSON/`Accept` headers. Auth interceptors deliberately exclude OTP request, OTP verification, and refresh endpoints from access-token attachment.

### Production requirements

For the **remote Vercel wrapper**:

- keep `NEXT_PUBLIC_API_URL=/api/v1` or the existing production equivalent;
- keep `INTERNAL_API_URL` configured only in Vercel/server environment settings;
- do not put backend secrets, JWT secrets, Brevo credentials, or internal URLs into `NEXT_PUBLIC_*` variables or the APK;
- confirm the deployed Vercel alias is a stable production URL, not a preview deployment.

For a future **static bundle**:

- an absolute backend URL would be required;
- CORS and credentialed cookies would need a new tested configuration;
- the rewrite would need to be removed or replaced;
- this should be treated as an authentication/API architecture change, not a Capacitor-only change.

## 5. Storage and session persistence

### Confirmed

- The access token and session are held in a module-level in-memory `sessionStore`.
- The access token is not written to `localStorage` or `sessionStorage`.
- The only application `localStorage` usage found is the PWA install-dismissal key `hrms:pwa-install-dismissed`.
- No IndexedDB, service worker, Cache Storage, Web Push, or notification permission implementation was found.
- The refresh token is not read by JavaScript; refresh depends on the WebView/browser cookie jar.
- TanStack Query cache is in memory and is cleared on logout.

### Consequences in Android

- Force-closing the app or losing the WebView process clears the access token. On the next launch, the app must successfully send `/auth/refresh` with the persisted HTTP-only cookie.
- Clearing app data, cookie eviction, cookie policy differences, expired refresh tokens, or a changed cookie path causes a login prompt.
- The in-memory design is security-positive for access-token exposure but makes cookie persistence a release-critical test.
- Background timers are not guaranteed to run while Android suspends or kills the WebView. The app must rely on startup refresh and reactive refresh after resume.

## 6. Capacitor compatibility assessment

### Overall result

| Area | Result | Reason |
|---|---|---|
| Rendering existing UI | **Likely compatible; test required** | Client-heavy React UI, responsive CSS, no native-only rendering dependency found |
| Remote Vercel WebView | **Recommended for Stage 1** | Preserves Next runtime, rewrite, and same-origin cookie behavior |
| Static local web bundle | **Not compatible as-is** | Rewrite, redirects, dynamic routes, direct API/CORS/cookie changes |
| OTP login | **Likely compatible; test required** | Standard form and Axios flow; WebView keyboard/autofill need device testing |
| Refresh-cookie persistence | **High-risk; test required** | Depends on Android WebView cookie storage and the deployed cookie attributes |
| Native GPS/background attendance | **Out of scope** | Existing code has geolocation for attendance/admin location features, but Stage 1 must not add or automate it |
| Offline operation | **Not supported** | Remote UI and backend require network access |
| Android APK CI build | **Feasible** | Capacitor Android project plus Gradle/Android SDK can be built on GitHub-hosted Linux runners |

### Existing browser/WebView features to test

- Radix dialog, dropdown, sheet, and focus-trap behavior on touch devices.
- Numeric/email keyboard behavior and viewport resizing when the keyboard opens.
- `window.confirm`/`window.prompt` used by admin attendance-correction actions.
- `target="_blank"` map links to OpenStreetMap and Google Maps. These may require explicit external-browser handling in Capacitor.
- Android system back behavior. Next client navigation history should be tested against the default Capacitor back behavior.
- PWA install UI. The existing `beforeinstallprompt`/`appinstalled` flow is for browser PWA installation and will probably not be meaningful inside a native Capacitor wrapper. It should be hidden or made a no-op only after testing.
- Safe-area/status-bar layout on devices with display cutouts. The web app sets `viewportFit: "cover"`, but no Capacitor-specific safe-area CSS was found.
- Reopening the app after backgrounding, process death, network loss, Render cold start, and WebView restart.

## 7. Static Capacitor build feasibility

### Decision: not for Stage 1

The app can produce a normal Next.js production build, but a normal `next build` is not a self-contained static export. Capacitor’s local `webDir` expects a built directory with an `index.html`; this repository currently produces Next’s server-oriented `.next` output and has no configured export directory.

Adding `output: "export"` would not be a safe inspection-only change and would conflict with the current architecture because:

1. `next.config.ts` defines an external API rewrite.
2. The app has page-level redirects.
3. Dynamic route segments do not provide `generateStaticParams`.
4. The static bundle would lose the Vercel same-origin proxy.
5. Direct backend requests would require new CORS and cookie behavior.

Next.js documents rewrites, redirects, cookies, headers, server actions, and other server-dependent features as unsupported in static export. See [Next.js static exports](https://nextjs.org/docs/app/guides/static-exports) and [Next.js rewrite configuration](https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites).

### What would be required for a future static option

This is a separate recommended project, not a Stage 1 change:

- remove/replace the Next.js API rewrite;
- decide whether the backend supports the Capacitor origin with credentialed CORS;
- define a safe token/cookie strategy for the local WebView origin;
- make every dynamic route statically exportable or move the route handling fully client-side;
- replace static-export-incompatible redirects with client-side navigation or static-compatible route files;
- configure a real static output directory containing `index.html`;
- run a full Android auth/network regression suite.

## 8. Recommended integration approach

### Stage 1/2 recommendation: remote-site wrapper

Use Capacitor as a thin Android shell whose WebView loads the stable HTTPS Vercel deployment URL:

`https://hrms-three-delta.vercel.app`

This keeps the existing application and backend contract intact and avoids redesigning authentication. It also avoids the need to produce a Next static export.

The wrapper must be configured as a trusted, HTTPS-only application:

- allow only the intended production Vercel host for the app’s main content;
- do not enable cleartext HTTP;
- do not inject a JavaScript/native bridge for Stage 1;
- open external map links in the system browser or a controlled Capacitor browser surface;
- keep the Vercel URL stable and production-only;
- add a visible/diagnosable offline and server-unavailable path later if testing shows the current UI needs it.

This approach is a remote WebView wrapper, not an offline APK. A Vercel deployment can change the UI independently of the APK, so release/version traceability must be handled operationally.

## 9. Required dependencies and configuration changes

### Dependencies — Recommended, not yet installed

Install the Capacitor packages at the same pinned major/minor version:

- `@capacitor/core`
- `@capacitor/cli` as a development dependency
- `@capacitor/android`

Do not add location, background task, push notification, camera, filesystem, or browser plugins in Stage 1. The existing web app does not require them for the remote wrapper.

Optional later dependency:

- `@capacitor/app` for explicit Android back-button and app URL/deep-link handling. Add it only if the behavior test shows the default shell is insufficient.

Capacitor’s current documentation describes adding Capacitor to an existing web app with `@capacitor/core`, `@capacitor/cli`, and a platform package such as `@capacitor/android`; the Android platform supports API 24+ in the current documentation. See [Capacitor installation](https://capacitorjs.com/docs/getting-started) and [Capacitor Android](https://capacitorjs.com/docs/android).

### Expected new configuration — Recommended

Add a `capacitor.config.ts` with:

- a final app name such as `HRMS`;
- a final reverse-DNS application ID selected by the owner, for example `com.example.hrms` only as a placeholder;
- `server.url` set to the stable HTTPS Vercel URL for remote-wrapper mode;
- cleartext traffic disabled;
- navigation restricted to the owned production host, with external URLs handled deliberately;
- the minimal required `webDir`/placeholder configuration accepted by the selected Capacitor CLI version.

The exact app ID must be chosen before the Android project is generated because changing it later changes package identity and signing/update behavior.

### Expected Android configuration — Recommended

- Generate the Android project with `npx cap add android` in CI or a controlled development branch.
- Keep the generated Gradle wrapper and Android project in version control so GitHub Actions can reproduce builds.
- Use HTTPS only and retain Android’s normal `INTERNET` permission supplied by Capacitor.
- Do not add location permissions, background services, geofencing, or notification permissions in this stage.
- Add app icons/splash resources only by reusing the existing `public/icons` assets; do not redesign the web UI.

## 10. Authentication issues and mitigations

| Issue | Severity | Mitigation/test |
|---|---:|---|
| Refresh cookie not persisted by WebView | High | Test login, force-close, reopen, refresh at 14–16 minutes, logout, and app-data clear on at least two Android WebView versions |
| Local Capacitor origin breaks same-origin rewrite | High | Use remote Vercel URL for Stage 1; do not point Axios directly at Render yet |
| `SameSite`/credential behavior differs by WebView | High | Capture cookie attributes and verify `/auth/refresh` in a release-like APK; do not weaken HttpOnly/Secure settings without backend review |
| Access token disappears after process death | Medium/expected | Verify startup refresh and show a normal login state when the refresh cookie is unavailable |
| OTP keyboard/autofill inconsistency | Medium | Test email link/app switching, focus, numeric keyboard, and manual code entry |
| Refresh timer suspended in background | Medium/expected | Rely on startup/reactive refresh; test resume after token expiry |
| Remote deployment changes without APK update | Medium | Use a stable production alias and record the web deployment commit/version used for each APK release |
| Backend cold start or network timeout | Medium | Preserve existing 30-second timeout behavior and test user-facing retry states |

The Android WebView cookie store is managed separately from normal browser assumptions. Android documents `CookieManager` as the WebView cookie manager and exposes separate controls for normal and third-party cookies; this is why cookie persistence must be tested in the actual wrapper. See [Android CookieManager](https://developer.android.com/reference/android/webkit/CookieManager.html).

## 11. Android WebView limitations and risks

### Web/platform behavior

- WebView runs a Chromium-based engine but is not identical to Chrome. Device WebView version, OEM behavior, and OS version matter.
- Capacitor’s current Android documentation supports Android API 24+ and requires a sufficiently modern Chrome/System WebView. Test the lowest supported API and a current Android release.
- JavaScript is essential for this app; the Capacitor WebView must keep JavaScript enabled. Do not expose a native JavaScript bridge for untrusted pages.
- The app has no service worker/offline cache, so a network outage should be considered a hard dependency.
- Native back-button behavior, external links, keyboard resize, focus, and safe areas require device testing.

### Security risks

- Loading a remote URL gives the APK runtime content controlled by the Vercel deployment. Restrict the WebView to the trusted production origin and do not allow arbitrary navigation inside the app shell.
- Never load HTTP content or enable cleartext traffic.
- Do not inject broad JavaScript interfaces. Android’s WebView security guidance recommends loading only trusted HTTPS content and treating native bridges as sensitive.
- The remote wrapper does not make the backend safer; API authorization remains the Spring backend’s responsibility.
- A remote wrapper can be perceived as a website shortcut rather than a native application. If distribution through an app store is later considered, review that store’s current policies separately.

### Functional risks

- External map links using `target="_blank"` may need native handling.
- The PWA install button may appear incorrectly or never become available inside Capacitor.
- Admin `prompt`/`confirm` dialogs may have less polished behavior on some OEM WebViews.
- Deep links and notification links are not implemented natively. Do not add them in Stage 1 unless separately approved.

## 12. Exact implementation plan after report approval

No step below should be started until this report is reviewed and the app ID/remote-wrapper decision is approved.

### Phase A — Freeze and prepare

1. Confirm the final Android application ID, display name, stable Vercel production URL, and minimum Android API.
2. Resolve the Next.js security upgrade recommendation and rerun `npm run typecheck`, `npm run test`, `npm run build`, and `npm run lint` in CI.
3. Record the backend refresh-cookie attributes from a real production response, without logging token values.
4. Confirm the backend CORS policy is not needed for the remote same-origin wrapper and that the Vercel rewrite still forwards `Set-Cookie` correctly.

### Phase B — Add the minimal Capacitor shell

5. Add the three required Capacitor packages at matching versions.
6. Add `capacitor.config.ts` for the stable HTTPS remote URL, final app ID, HTTPS-only behavior, and restricted navigation.
7. Generate the Android project with `npx cap add android`.
8. Do not modify application screens, auth storage, API base configuration, attendance behavior, or location permissions.
9. Commit the generated Android project and Gradle wrapper.

### Phase C — Validate the WebView contract

10. Build and assemble a debug APK in GitHub Actions.
11. Install it on a physical Android device or CI emulator.
12. Test login: request OTP, return from email, enter OTP, role routing, reload, logout, and wrong-role routing.
13. Test refresh: leave the app open past the access-token boundary, background/resume it, force-close/reopen it, and verify the refresh cookie restores the session.
14. Test all primary admin/employee routes, client-side navigation, dialogs, forms, table scrolling, mobile navigation, and error/retry states.
15. Test external maps, Android back button, keyboard focus/resize, safe areas, PWA install control, and offline/server-failure behavior.
16. Verify the APK never sends API calls to an unintended host and never logs access/refresh tokens.

### Phase D — Release hardening

17. Add only the smallest fixes required by observed WebView failures.
18. Add a release signing keystore as a GitHub Actions secret or protected environment secret; never commit it.
19. Build a signed release APK/AAB, verify installation and upgrade from the previous signed build, and archive the checksum.
20. Record the web deployment commit/version, Capacitor version, Android build version, and backend version for each release.

### Explicitly out of scope for this stage

- Automatic attendance.
- GPS tracking, background location, geofencing, or location monitoring.
- Native Kotlin application screens.
- Offline attendance or offline data synchronization.
- Push notifications, native deep links, biometric auth, or native filesystem storage.

## 13. Recommended GitHub Actions APK build strategy

Use a public repository if appropriate for the project; GitHub documents standard hosted runners as free and unlimited for public repositories. Private repositories consume the plan’s included Actions minutes and may incur usage after the included quota.

### Workflow shape

1. Trigger on pull requests for validation and on a version tag/manual dispatch for release.
2. Run on `ubuntu-latest`.
3. Check out the repository.
4. Set up Node 22 or the Node version required by the resolved Next/Capacitor release.
5. Run `npm ci` using the committed lockfile.
6. Run frontend checks: lint, typecheck, tests, and build. For remote-wrapper mode, the web build is a validation step; it is not copied into the APK as the production runtime.
7. Set up the Java/Android toolchain available on the runner, or install only the required SDK platform/build tools with command-line tools.
8. Run `npx cap sync android`.
9. Run the generated Gradle wrapper task:
   - `./gradlew assembleDebug` for internal test APKs;
   - `./gradlew bundleRelease` or `assembleRelease` for signed releases.
10. Upload the APK/AAB as a GitHub Actions artifact. For tagged builds, optionally attach it to a GitHub Release.
11. Keep signing material in GitHub encrypted secrets/environments; use a separate unsigned/debug path for pull requests.

### No Android Studio constraint

Android Studio is not required on the user’s machine for this CI-only build plan, but the generated Android project still uses the Android SDK and Gradle. The lack of Android Studio means there is no local emulator/device workflow; device validation must use a physical device, a CI emulator, or another approved remote test environment. Capacitor’s current environment documentation lists Android Studio as its official Android setup, so the command-line CI path should be treated as a deliberate build-only setup and verified against the selected Capacitor version.

## 14. Free-tier cost considerations

| Item | Expected cost/constraint |
|---|---|
| Capacitor core/CLI/Android packages | Free/open-source; no Capacitor runtime fee |
| Android SDK, Gradle, Java | Free/open-source tooling; GitHub runner supplies or installs them |
| GitHub Actions | Public repositories: standard hosted runners are documented as free/unlimited. Private repositories: included minutes/storage depend on the GitHub plan and can be exhausted |
| GitHub artifacts/releases | Subject to GitHub storage/retention quotas; retain only needed APKs and checksums |
| Vercel | Existing deployment remains a runtime dependency; free-tier limits and commercial terms should be checked against usage |
| Render/backend | Existing backend remains a runtime dependency; free-tier sleep/cold-start/resource limits can affect OTP and first request latency |
| Email/OTP provider | Existing provider quotas/costs remain; Capacitor does not change them |
| APK distribution | GitHub Releases or direct internal sideloading avoids a new hosting service. App-store distribution may have separate developer/account fees and policy requirements, so it is not assumed free |
| Signing | No service fee is required for a local/GitHub secret-backed signing key; key custody and rotation are operational responsibilities |

The recommended remote wrapper keeps the current hosting costs rather than adding a new static host or mobile build service. It does not remove the cost/availability risks of the existing Vercel, Render, or email provider tiers.

## 15. Review checklist / go-no-go criteria

Proceed to implementation only when all of the following are accepted:

- [ ] Remote Vercel WebView wrapper is approved for Stage 1.
- [ ] Static export is explicitly deferred.
- [ ] Final Android package ID is chosen.
- [ ] Next.js security upgrade is planned and verified before release.
- [ ] Production refresh-cookie attributes are confirmed.
- [ ] APK distribution method is chosen outside paid app-store assumptions.
- [ ] A physical Android device or CI emulator is available for cookie/resume/back-button testing.
- [ ] No GPS/background location/automatic attendance work is included.

## Sources consulted

- [Next.js static export guide](https://nextjs.org/docs/app/guides/static-exports)
- [Next.js rewrites documentation](https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites)
- [Capacitor installation guide](https://capacitorjs.com/docs/getting-started)
- [Capacitor Android documentation](https://capacitorjs.com/docs/android)
- [Capacitor environment setup](https://capacitorjs.com/docs/getting-started/environment-setup)
- [Android WebView guide](https://developer.android.com/develop/ui/views/layout/webapps/webview)
- [Android CookieManager reference](https://developer.android.com/reference/android/webkit/CookieManager.html)
- [GitHub-hosted runners reference](https://docs.github.com/en/actions/reference/runners/github-hosted-runners)

## Inspection result

No application source, configuration, dependency, or generated Android files were changed during Stage 1 inspection. This report is the only requested deliverable created by this stage.
