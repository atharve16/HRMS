# Authentication Debug and Architecture Report

## 1. Executive Summary

This report documents the diagnosis, root causes, and architectural fix for the global authentication persistence bug in the HRMS application.

### Problem Statement
After successful passwordless OTP login, in-memory navigation across protected routes functioned normally because the access token was held in memory. However, reloading **any** page (`/dashboard`, `/employees`, `/attendance`, `/departments`, `/leave`, etc.) immediately resulted in an unexpected redirect to `/login`.

---

## 2. Root Cause Analysis

### Root Cause 1: Cross-Site Cookie Policy Mismatch (`SameSite=Lax` and `Secure=false`)
- **Architecture Context**: The frontend is deployed to Vercel (`https://hrms-three-delta.vercel.app` or runs locally on `http://localhost:3000`), while the backend is deployed to Render (`https://hrms-n1xj.onrender.com`). These origins belong to distinct registrable domains (`vercel.app` vs. `onrender.com`), creating a cross-site context.
- **Flawed Configuration**: Backend `application.yml` and `.env` configured the refresh token cookie with `same-site: Lax` and `secure: false`.
- **Failure Mechanism**: Under the W3C and IETF RFC 6265bis cookie specification, modern web browsers strictly withhold `SameSite=Lax` cookies from cross-site subresource (XHR / Fetch / Axios) requests. When the browser page reloaded:
  1. JavaScript memory reset, emptying `sessionStore`.
  2. `AuthProvider` mounted in `restoring = true` state and invoked `refreshSession()`.
  3. The browser dispatched `POST /api/v1/auth/refresh` with `withCredentials: true`.
  4. Because the request was cross-site, the browser stripped the `hrms_refresh_token` cookie from the HTTP request headers.
  5. Backend `AuthController.java` received `request.getCookies() == null`, failing token extraction.
  6. Backend returned `401 Unauthorized` with error code `INVALID_REFRESH_TOKEN`.
  7. Frontend `RoleGuard` transitioned from `status === "loading"` to `status === "unauthenticated"`, immediately triggering `router.replace("/login?redirect=...")`.

### Root Cause 2: CORS Preflight Rejection for Local Development & Missing Safelist Headers
- In `application.yml`, `app.cors.allowed-origins` only contained `- ${FRONTEND_URL:http://localhost:3000}`. When `FRONTEND_URL` was overridden with the production Vercel URL, `http://localhost:3000` was excluded. OPTIONS preflight checks from `localhost:3000` were rejected with `403 Forbidden` (`Invalid CORS request`).
- Furthermore, `SecurityConfig.java` allowed `Authorization`, `Content-Type`, and `X-Requested-With`, but omitted `Accept`, which is explicitly declared in `httpClientConfig`.

### Root Cause 3: Premature Session Destruction on Transient Network / 5xx Errors
- In `src/features/auth/services/refresh-session.ts`, the `catch` block unconditionally executed `sessionStore.clear()` on **any** error (such as network disconnection, server cold starts, 502/503 timeouts).
- This violated Requirement 8.14 ("Ensure temporary network failures are not automatically treated as proof that the refresh token is invalid"). A transient network error should preserve the user's valid session, permitting retry attempts.

### Root Cause 4: Next.js PPR Static Shell Dropped Segment Warnings
- `GuestGuard` in `src/app/(auth)/layout.tsx` returned `<AuthLoading />` during SSR whenever `status !== "unauthenticated"`. Because initial state during server rendering is `loading`, `children` was dropped from prerendered static output for `/login`.
- `src/app/(auth)/page.tsx` executed a server-side `redirect("/login")` during prerender, which interrupted instant navigation validation under Next.js 16 Partial Prerendering (PPR).

---

## 3. Complete Authentication Lifecycle Trace

### Stage A: OTP Login
1. **User Request**: User enters work email -> `POST /api/v1/auth/request-otp`.
2. **OTP Verification**: User enters 6-digit code -> `POST /api/v1/auth/verify-otp`.
3. **Backend Response**:
   - Generates short-lived JWT access token (15-minute expiry).
   - Generates secure refresh token and persists its hash in MongoDB (`RefreshToken`).
   - Issues HTTP-only cookie `hrms_refresh_token` with attributes: `HttpOnly; Secure; SameSite=None; Path=/api/v1/auth; Max-Age=2592000`.
   - Returns JSON body with `accessToken`, `user` profile, and expiry metadata.
4. **Frontend Session Establishment**:
   - `sessionStore.establish(response)` stores access token and user claims in memory.
   - `AuthProvider` notifies subscribers; `status` resolves to `authenticated`.
   - `RoleGuard` evaluates permissions and permits rendering of the target protected layout.

### Stage B: Normal Page Navigation
- During client-side transitions (e.g. `/dashboard` -> `/employees` -> `/attendance`):
  - JavaScript memory persists; `sessionStore.getAccessToken()` remains available.
  - Axios request interceptor attaches `Authorization: Bearer <accessToken>`.
  - React Query executes queries against protected backend endpoints without triggering session refresh.

### Stage C: Browser Reload (Fixed Flow)
1. User presses Reload on `/admin/dashboard` or any protected page.
2. In-memory JavaScript resets; `sessionStore.getSnapshot()` is initially `null`.
3. `AuthProvider` initializes with `restoring = true`, computing `status = "loading"`.
4. `RoleGuard` catches `status === "loading"` and renders the `<AuthLoading />` skeleton, preventing premature redirects to `/login`.
5. `AuthProvider`'s effect invokes `refreshSession()`.
6. `createRefreshCoordinator` ensures only a single in-flight `POST /api/v1/auth/refresh` request executes.
7. The browser transmits the `hrms_refresh_token` cookie across origins because it has `SameSite=None; Secure`.
8. Backend `AuthController` reads the cookie, validates token hash, verifies user is `ACTIVE`, revokes the old refresh token, generates a replacement token, and issues a new access token.
9. Backend sends `Set-Cookie` with the rotated refresh token and returns the new access token in the response body.
10. Frontend calls `sessionStore.establish(response.data.data)`.
11. `AuthProvider` updates `session`, sets `restoring = false`, transitioning `status` to `authenticated`.
12. `RoleGuard` verifies `session.user.role` matches `ADMIN` and renders the protected page without redirection.

### Stage D: Access Token Expiration & Interceptor Retries
- When the 15-minute access token expires, a protected API request receives `401 Unauthorized`.
- `auth-interceptor.ts` captures the 401 error:
  - Verifies the request carried a token (`_hadAccessToken === true`) and hasn't been retried (`!_authRetry`).
  - Calls `refreshSession()`.
  - Concurrent 401 requests collapse into the single in-flight refresh promise through `createRefreshCoordinator`.
  - Retries the original request with the new access token.
- If refresh returns `401 Unauthorized` (refresh token expired/revoked), `sessionStore.clear()` is called and the user is redirected to `/login`.
- If refresh encounters a transient network error (5xx or connection loss), `sessionStore` is not cleared, preserving state.

### Stage E: Logout
1. User clicks "Sign out" in dashboard header.
2. `logout()` triggers `POST /api/v1/auth/logout` with Bearer token and refresh cookie.
3. Backend revokes the refresh token family and returns `Set-Cookie` with `Max-Age=0`.
4. Frontend executes `sessionStore.clear()` and `queryClient.clear()`.
5. User is redirected cleanly to `/login`.

---

## 4. Files Inspected

### Frontend Files
- `src/providers/auth-provider.tsx`
- `src/features/auth/services/session-store.ts`
- `src/features/auth/services/refresh-session.ts`
- `src/features/auth/services/auth-service.ts`
- `src/features/auth/components/role-guard.tsx`
- `src/features/auth/components/guest-guard.tsx`
- `src/features/auth/components/login-form.tsx`
- `src/features/auth/components/otp-form.tsx`
- `src/features/auth/lib/auth-routes.ts`
- `src/services/http-config.ts`
- `src/services/api-client.ts`
- `src/services/interceptors/auth-interceptor.ts`
- `src/services/interceptors/response-interceptor.ts`
- `src/app/layout.tsx`
- `src/app/(admin)/admin/layout.tsx`
- `src/app/(employee)/employee/layout.tsx`
- `src/app/(auth)/layout.tsx`
- `src/app/(auth)/page.tsx`
- `src/app/(auth)/login/page.tsx`
- `next.config.ts`

### Backend Files
- `server/src/main/java/com/hrms/auth/controller/AuthController.java`
- `server/src/main/java/com/hrms/auth/service/AuthenticationService.java`
- `server/src/main/java/com/hrms/auth/service/RefreshTokenService.java`
- `server/src/main/java/com/hrms/auth/service/RefreshCookieService.java`
- `server/src/main/java/com/hrms/auth/security/JwtAuthenticationFilter.java`
- `server/src/main/java/com/hrms/auth/security/JwtService.java`
- `server/src/main/java/com/hrms/config/SecurityConfig.java`
- `server/src/main/java/com/hrms/config/AuthProperties.java`
- `server/src/main/java/com/hrms/config/ApplicationProperties.java`
- `server/src/main/resources/application.yml`
- `server/src/main/resources/application-dev.yml`
- `server/src/main/resources/application-prod.yml`
- `server/.env` and `server/.env.example`

---

## 5. Files Modified & Explanations

| File | Changes Made |
|---|---|
| `server/src/main/resources/application.yml` | Updated default cookie settings to `secure: true` and `same-site: None`. Expanded CORS allowed-origins to include `http://localhost:3000`, `http://127.0.0.1:3000`, and `https://hrms-three-delta.vercel.app`. |
| `server/src/main/resources/application-prod.yml` | Explicitly configured `same-site: ${COOKIE_SAME_SITE:None}` and `secure: ${COOKIE_SECURE:true}`. |
| `server/.env` & `server/.env.example` | Configured `COOKIE_SECURE=true` and `COOKIE_SAME_SITE=None`. |
| `server/src/main/java/com/hrms/config/SecurityConfig.java` | Enhanced CORS configuration to deduplicate origins and added `"Accept"` to `allowedHeaders`. |
| `server/src/main/java/com/hrms/auth/controller/AuthController.java` | Added structured diagnostic logging for `/refresh` invocation and token rotation outcomes (without logging raw secrets). |
| `client/src/features/auth/services/refresh-session.ts` | Guarded `sessionStore.clear()` so it only triggers on `401 Unauthorized` responses; transient network/server errors preserve existing session state. Added non-sensitive diagnostic logs. |
| `client/src/providers/auth-provider.tsx` | Initialized `restoring` based on whether an access token already exists in memory. Structured development logs for session restoration milestones. |
| `client/src/features/auth/components/guest-guard.tsx` | Rendered `children` during SSR/loading to enable Next.js PPR instant navigation static shell prerendering; redirects authenticated users to their role dashboard. |
| `client/src/features/auth/components/role-guard.tsx` | Added structured development logging for authorization decisions and redirects. |
| `client/src/app/(auth)/page.tsx` | Converted root route from server-side `redirect()` to client-rendered `<AuthLoading />` with programmatic routing, resolving the dropped segment PPR warning. |
| `client/src/services/interceptors/auth-interceptor.ts` | Hardened `isPublicAuthRequest` to safely ignore URL query parameters. |
| `client/next.config.ts` | Added `/api/v1/:path*` reverse proxy rewrite to provide same-origin proxying defense-in-depth against third-party cookie blocking. |
| `client/src/features/auth/services/session.test.ts` | Added automated tests for browser reload simulation, memory restore, and multi-page navigation session preservation. |
| `client/src/features/auth/services/refresh-session.test.ts` | Added automated tests verifying session store clearing on 401 vs. preservation on network/5xx errors. |

---

## 6. Verification and Test Results

### 1. Frontend Test Suite (Vitest)
```
 Test Files  76 passed (76)
      Tests  341 passed (341)
   Duration  28.40s
```
All 76 test suites and 341 tests passed with 100% success rate.

### 2. TypeScript Compilation Check
```
> client@0.1.0 typecheck
> tsc --noEmit
Exit code: 0 (No type errors)
```

### 3. Next.js Production Build
```
▲ Next.js 16.4.3 (Turbopack)
- Cache Components enabled
- Partial Prefetching enabled
✓ Compiled successfully in 31.7s
✓ Generating static pages using 3 workers (46/46) in 9.6s
Route (app): 46 routes prerendered (Static & Partial Prerender)
Dropped segment warnings: 0
Build Exit code: 0 (Clean production build)
```

### 4. Backend Unit and Security Integration Tests (Maven with Java 21)
```
[INFO] Running com.hrms.auth.security.JwtServiceTest
[INFO] Tests run: 2, Failures: 0, Errors: 0, Skipped: 0
[INFO] Running com.hrms.auth.service.AuthenticationServiceTest
[INFO] Tests run: 3, Failures: 0, Errors: 0, Skipped: 0
[INFO] Running com.hrms.auth.service.RefreshTokenServiceTest
[INFO] Tests run: 3, Failures: 0, Errors: 0, Skipped: 0
[INFO] Running com.hrms.auth.security.AuthenticationSecurityIntegrationTest
[INFO] Tests run: 9, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

---

## 7. Deployment Configuration Requirements

For production deployment on Render and Vercel:

1. **Backend Environment Variables on Render**:
   - `COOKIE_SECURE=true`
   - `COOKIE_SAME_SITE=None`
   - `FRONTEND_URL=https://hrms-three-delta.vercel.app`
   - Ensure Render serves over HTTPS so browsers accept `SameSite=None; Secure`.

2. **Frontend Environment Variables on Vercel**:
   - `NEXT_PUBLIC_API_URL=https://hrms-n1xj.onrender.com/api/v1` (or `/api/v1` when utilizing Next.js rewrites)
   - `INTERNAL_API_URL=https://hrms-n1xj.onrender.com`

