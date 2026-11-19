# HRMS Capacitor Stage 1 Implementation Report

## Scope

Stage 1 adds a Capacitor Android shell around the deployed Next.js application.
The Android app identity is:

- App name: `HRMS`
- Package ID: `com.peopleflow.hrms`
- Remote application URL: `https://hrms-three-delta.vercel.app`

The implementation does not export or migrate the Next.js application. The
Android WebView loads the production URL so the existing Next.js rewrites,
authentication flow, and HRMS features remain authoritative.

## Security branch verification

The worktree is on `security/nextjs-advisory-upgrade`. The security upgrade is
present and unchanged:

| Package | Verified version |
| --- | --- |
| `next` | `16.4.6` |
| `eslint-config-next` | `16.4.6` |

No backend API, database schema, role authorization, or existing authentication
behavior was changed.

## Capacitor implementation

`capacitor.config.ts` defines the production remote URL, HTTPS Android scheme,
disabled cleartext traffic, app identity, and the HRMS launch splash settings.
The checked-in `www/index.html` is only a Capacitor validation placeholder; it
is not used at runtime while `server.url` is configured.

Pinned packages:

- Runtime: `@capacitor/core@8.6.2`, `@capacitor/android@8.6.2`,
  `@capacitor/app@8.1.2`, `@capacitor/browser@8.0.5`,
  `@capacitor/splash-screen@8.0.2`.
- Tooling: `@capacitor/cli@8.6.2`, `@capacitor/assets@4.0.0`.

The Android project is generated under `android/` and uses package ID
`com.peopleflow.hrms`. The generated Java `MainActivity` is the standard
Capacitor `BridgeActivity`; no Kotlin application logic was added.

The existing HRMS icon was represented as `assets/logo.svg` and used to
generate Android adaptive/legacy launcher icons and light/dark splash resources
for all Android densities.

## Navigation and external links

`src/components/capacitor/capacitor-runtime.tsx` runs only on native platforms:

- Android back navigates browser history when possible and exits the app at the
  root screen.
- Cross-origin HTTP(S) anchor links open with the system browser through the
  Capacitor Browser plugin.
- Same-origin HRMS links stay inside the WebView.

This is an additive native compatibility layer and does not alter web behavior.

## Authentication, cookies, API proxying, and persistence verification

The existing behavior remains compatible with the remote WebView:

- Axios uses same-origin `/api/v1` and `withCredentials: true`.
- Next.js rewrites `/api/v1/:path*` to the configured Render backend.
- The refresh token remains backend-managed in the HTTP-only
  `hrms_refresh_token` cookie; it is not exposed to JavaScript.
- The access token remains in the existing in-memory `sessionStore`.
- Startup refresh continues to call `/auth/refresh`, and the existing
  coordinated refresh logic preserves the session for transient network/5xx
  errors and clears it only for an invalid/expired 401 refresh response.
- Existing unit tests cover cookie-enabled HTTP configuration, proxy URL
  normalization, coordinated refresh, logout, and simulated reload restoration.

No production credentialed smoke test was run because no HRMS account or
backend test credentials were supplied. The production URL and native config
were verified statically and through Capacitor sync.

## GitHub Actions APK workflow

`.github/workflows/android-debug-apk.yml`:

1. Installs Node.js 22 dependencies with `npm ci`.
2. Sets up Temurin Java 21 and the GitHub-hosted Android SDK.
3. Runs `npx cap sync android`.
4. Runs `./gradlew assembleDebug --no-daemon`.
5. Uploads `android/app/build/outputs/apk/debug/app-debug.apk` as the
   `hrms-debug-apk` artifact for 14 days.

The workflow is available on every branch push and via manual dispatch. No
Android Studio is required locally.

## Verification results

| Check | Result |
| --- | --- |
| `npm ci` | Pass |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass |
| `npm run test -- --reporter=dot` | Pass — 87 files, 414 tests |
| `npm run build` | Pass — Next.js 16.4.6, 52 routes |
| `npx cap sync android` | Pass — App, Browser, Splash Screen plugins detected |
| `npm run cap:validate` | Pass — Android looking great |
| `npm audit` | Pass — 0 reported vulnerabilities |
| Android debug APK | Configured in GitHub Actions; not run locally because Android SDK/ADB/Gradle are intentionally not installed |

Vitest was rerun with child-process permission because the restricted Windows
environment initially returned `esbuild spawn EPERM`; the suite itself passed.

## Changed files

Application/configuration files:

- `.gitignore`
- `package.json`
- `package-lock.json`
- `capacitor.config.ts`
- `src/app/layout.tsx`
- `src/components/capacitor/capacitor-runtime.tsx`
- `assets/logo.svg`
- `www/index.html`
- `.github/workflows/android-debug-apk.yml`
- `CAPACITOR_IMPLEMENTATION_REPORT.md`

Android project files:

- `android/build.gradle`
- `android/settings.gradle`
- `android/variables.gradle`
- `android/gradle.properties`
- `android/gradle/wrapper/gradle-wrapper.jar`
- `android/gradle/wrapper/gradle-wrapper.properties`
- `android/gradlew`
- `android/gradlew.bat`
- `android/app/build.gradle`
- `android/app/capacitor.build.gradle`
- `android/app/proguard-rules.pro`
- `android/app/src/main/AndroidManifest.xml`
- `android/app/src/main/java/com/peopleflow/hrms/MainActivity.java`
- `android/app/src/main/res/layout/activity_main.xml`
- `android/app/src/main/res/values/ic_launcher_background.xml`
- `android/app/src/main/res/values/strings.xml`
- `android/app/src/main/res/values/styles.xml`
- `android/app/src/main/res/drawable/ic_launcher_background.xml`
- `android/app/src/main/res/drawable-v24/ic_launcher_foreground.xml`
- `android/app/src/main/res/xml/file_paths.xml`
- Generated launcher icon resources under `android/app/src/main/res/mipmap-*`.
- Generated light/dark splash resources under `android/app/src/main/res/drawable*`.
- Standard generated Android unit/instrumentation test stubs under
  `android/app/src/test` and `android/app/src/androidTest`.

The two pre-existing untracked HRMS test files shown by Git status were
preserved and were not modified by this implementation. Nothing was merged
into `main`.
