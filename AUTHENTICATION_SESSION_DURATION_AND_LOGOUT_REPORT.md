# Authentication Session Duration and Automatic Logout Investigation & Fix Report

## 1. Executive Summary

This investigation analyzed the premature automatic logout and short session persistence issue in the HRMS application. Following the initial resolution of the page-reload persistence bug via same-origin Next.js rewrites and HTTP-only cookies, users were able to log in and survive initial page reloads. However, after approximately 15 minutes of activity or idle session time, users were automatically and prematurely redirected to `/login`.

### Key Root Cause Findings:
1. **Actual Configured Session Policy (Scenario B)**: 
   The backend database token TTL and HTTP-only cookie lifetimes were **not** configured too short; both were correctly configured for **30 days** (`2,592,000,000 ms`). The short-lived JWT access token was configured for **15 minutes** (`900,000 ms`).
2. **Absence of Proactive Token Refresh**:
   The frontend stored the access token expiration timestamp (`expiresAt`), but completely ignored it. There was no background timer to renew the access token prior to expiration.
3. **The 15-Minute Expiration Trigger**:
   At the exact 15-minute mark, the short-lived access token expired on the backend. When background polling (such as `useNotifications` unread-count refetching every 60 seconds) or user navigation occurred, the backend returned HTTP `401 Unauthorized`.
4. **Token Rotation Race Conditions & Family Invalidation**:
   When multiple requests failed with 401 simultaneously or in close succession around the 15-minute mark, `auth-interceptor.ts` attempted to refresh the session.
   - While `createRefreshCoordinator` de-duplicated in-flight calls on the single coordinator instance, sibling requests in flight with the previous access token received 401s after the refresh completed.
   - `auth-interceptor.ts` lacked a check to verify whether `sessionStore.getAccessToken()` had already been updated, immediately dispatching duplicate `/auth/refresh` requests.
   - Crucially, the backend `RefreshTokenService.java` had **zero leeway (0-second grace period)** for refresh token rotation. When a duplicate or slightly delayed request presented a recently rotated token, the backend detected `revokedAt != null` and immediately treated it as a **malicious reuse attack**. The backend executed `revokeFamily()`, invalidated the entire user session family in MongoDB, and responded with `401 REFRESH_TOKEN_REUSED`.
   - `refresh-session.ts` received the 401, called `sessionStore.clear()`, and `RoleGuard` immediately redirected the user to `/login`.

### Fix Overview:
- **Backend Grace Period / Leeway**: Added a 30-second leeway (`refreshGracePeriod`) to `RefreshTokenService.java` following RFC 6819 Section 5.2.2.3 and industry standards (Auth0 / Okta). Re-issuing tokens within the grace period prevents benign network race conditions and concurrent tab refreshes from destroying valid sessions.
- **Frontend Proactive Refresh Timer**: Integrated a proactive background timer in `AuthProvider.tsx` that silently refreshes the session ~1 minute before the 15-minute access token expires, ensuring active users never encounter 401 errors.
- **Concurrent Request Deduplication**: Updated `auth-interceptor.ts` to detect whether `sessionStore` already holds a renewed access token, retrying immediately without dispatching duplicate refresh calls.
- **Refresh Coordinator Cooldown**: Added a 5-second cooldown in `createRefreshCoordinator` in `refresh-session.ts` to prevent duplicate network hits during rapid event bursts.

---

## 2. Verified Actual vs. Intended Expirations

| Entity | Intended Policy | Actual Implemented Policy | Compatibility Status |
| :--- | :--- | :--- | :--- |
| **JWT Access Token** | 15 minutes | `900,000 ms` (15 min) in `application.yml` (`app.auth.jwt.access-expiry`) | **100% Compatible** |
| **Backend Refresh Token (DB)** | 30 days | `2,592,000,000 ms` (30 days) in `application.yml` (`app.auth.jwt.refresh-expiry`) | **100% Compatible** |
| **MongoDB TTL Index** | 30 days | `@Indexed(expireAfter = "0s") Instant expiresAt` set to `now + 30 days` | **100% Compatible** |
| **HTTP-Only Refresh Cookie** | 30 days | `maxAge(properties.jwt().refreshExpiry())` = 30 days (`Max-Age=2592000`) | **100% Compatible** |
| **Cookie Attributes** | `HttpOnly; Secure; SameSite=None; Path=/api/v1/auth` | Fully aligned in `RefreshCookieService.java` | **100% Compatible** |

**Conclusion**: The system was **not** suffering from Scenario A (misconfigured short durations). It was suffering from **Scenario B (Premature automatic logout despite valid 30-day session)** caused by the 15-minute reactive refresh boundary and zero-grace-period token rotation race conditions.

---

## 3. The Exact Trigger Causing Premature Logout

1. **User signs in**: Email OTP is verified via `POST /api/v1/auth/verify-otp`.
   - Access token issued (valid for 15 minutes).
   - Refresh token `R1` issued and set in HTTP-only cookie (`Max-Age=2592000`).
   - Frontend `sessionStore` records `expiresAt = Date.now() + 900_000`.
2. **First 14 Minutes**: Application operates smoothly. In the background, `useUnreadCount()` polls `GET /api/v1/notifications/unread-count` every 60 seconds with `Authorization: Bearer <token>`.
3. **At the 15th Minute**: Access token expires on the backend (`JwtDecoder` rejects it with `JwtValidationException`).
4. **Trigger Sequence**:
   - The notification poll or user interaction hits `/api/v1/...` and receives `401 Unauthorized`.
   - The reactive Axios interceptor invokes `refreshSession()`.
   - `POST /api/v1/auth/refresh` is dispatched through the Next.js proxy.
   - The backend rotates `R1` to `R2`, setting `R1.revokedAt = now` and `R1.replacedByTokenId = R2.id`.
   - If another parallel query was in flight or another browser tab triggered a refresh within milliseconds:
     The second request sent `R1`.
     `RefreshTokenService.rotate("R1")` checked `current.getRevokedAt() != null`.
     Because there was **no grace period**, the backend treated `R1` as an illegal reuse attempt.
   - The backend immediately invoked `revokeFamily(current.getTokenFamilyId(), now)`, revoking all refresh tokens in that user family in MongoDB, and threw `ApiException(ErrorCode.REFRESH_TOKEN_REUSED, 401)`.
   - The frontend caught the 401 error in `refresh-session.ts`, called `sessionStore.clear()`, transitioned status to `"unauthenticated"`, and `RoleGuard` redirected the user to `/login`.

---

## 4. Token Rotation Behavior and Race Condition Analysis

### Previous Implementation Flaw:
```java
// BEFORE in RefreshTokenService.java
RefreshToken current = repository.findByTokenHash(hashService.hash(rawToken))
        .orElseThrow(this::invalidToken);
if (current.getRevokedAt() != null) {
    revokeFamily(current.getTokenFamilyId(), now); // INSTANT REVOCATION EVEN IF REVOKED 1ms AGO!
    throw new ApiException(ErrorCode.REFRESH_TOKEN_REUSED, HttpStatus.UNAUTHORIZED,
            "Refresh token reuse was detected; the session has been revoked");
}
```
If two requests arrived close together:
1. Thread A rotated `R1` -> `R2`, setting `R1.revokedAt = now`.
2. Thread B (from another query, tab, or network retry) presented `R1` 50 milliseconds later.
3. Thread B saw `revokedAt != null`, called `revokeFamily()`, and revoked `R2` as well!
4. Both Thread A and Thread B's sessions were permanently killed.

### Fixed Implementation:
```java
// AFTER in RefreshTokenService.java
if (current.getRevokedAt() != null) {
    Duration gracePeriod = properties.jwt().refreshGracePeriod();
    if (gracePeriod != null && !now.isAfter(current.getRevokedAt().plus(gracePeriod))) {
        // Benign concurrency or retry within 30s grace window: issue replacement in same family
        IssuedRefreshToken replacement = create(current.getUserId(), current.getTokenFamilyId());
        return new RotatedRefreshToken(current.getUserId(), replacement);
    }
    revokeFamily(current.getTokenFamilyId(), now);
    throw new ApiException(ErrorCode.REFRESH_TOKEN_REUSED, HttpStatus.UNAUTHORIZED,
            "Refresh token reuse was detected; the session has been revoked");
}
```
Legitimate concurrent requests within a 30-second window receive an active token without revoking the family. Genuine reuse attempts (after the 30-second leeway) still immediately trigger complete family invalidation.

---

## 5. Frontend Interceptor and Lifecycle Analysis

### Before:
- **No Proactive Refresh**: Frontend sat completely idle until the 15-minute access token died.
- **Blind Refresh on 401**: When multiple parallel requests received 401, sibling requests arriving after the refresh coordinator completed did not check if the token had already been renewed, triggering unnecessary extra refresh calls.

### After:
1. **Proactive Silent Refresh in `AuthProvider`**:
   A scheduled timer runs at `timeUntilExpiry - 60_000` (14 minutes into the 15-minute token lifespan). It calls `refreshSession()` quietly in the background. The access token is always renewed before any API call fails with 401.
2. **Stale Token Check in `auth-interceptor.ts`**:
   Before initiating a refresh upon receiving a 401, the interceptor compares the token used in the request header against `sessionStore.getAccessToken()`. If the store token is already newer, the request simply updates its header and retries immediately without hitting `/auth/refresh`.
3. **Coordinator Cooldown in `refresh-session.ts`**:
   `createRefreshCoordinator` caches the freshly refreshed session for 5 seconds, returning it synchronously for any duplicate calls within that window.

---

## 6. Cookie Transport Analysis Through Next.js Rewrite

- **Browser Origin**: `https://hrms-three-delta.vercel.app`
- **Internal API**: `https://hrms-n1xj.onrender.com`
- **Rewrite Rule**: `source: "/api/v1/:path*"` -> `destination: "${backendUrl}/api/v1/:path*"`
- **Cookie Scope**:
  - Name: `hrms_refresh_token`
  - Path: `/api/v1/auth`
  - Flags: `HttpOnly; Secure; SameSite=None`
  - Domain: Host origin (proxied under Vercel domain)
- **Transport Flow**:
  1. Requests to `/api/v1/auth/refresh` include the `Cookie: hrms_refresh_token=...` header automatically because the request path matches `/api/v1/auth`.
  2. Next.js server proxies the incoming request with the `Cookie` header intact to Render.
  3. Render rotates the token and attaches `Set-Cookie: hrms_refresh_token=<new>; Path=/api/v1/auth; Max-Age=2592000; HttpOnly; Secure; SameSite=None`.
  4. Next.js rewrite passes `Set-Cookie` through to the browser.
  5. The browser updates the cookie in its storage jar under `hrms-three-delta.vercel.app`.

---

## 7. Concrete Code Fixes Applied

### 1. `server/src/main/java/com/hrms/config/AuthProperties.java`
- Added `@DefaultValue("30s") Duration refreshGracePeriod` to the `AuthProperties.Jwt` record.
- Preserved single canonical constructor for Spring Boot configuration property binding.

### 2. `server/src/main/resources/application.yml`
- Added `refresh-grace-period: ${JWT_REFRESH_GRACE_PERIOD:30000}ms` under `app.auth.jwt`.

### 3. `server/src/main/java/com/hrms/auth/service/RefreshTokenService.java`
- Added grace period evaluation in `rotate()`: if `current.getRevokedAt() != null` is within `refreshGracePeriod` (30s), issues a replacement token in the family instead of revoking.
- Handled concurrent race in optimistic locking to verify whether a conflict was within the grace period before revoking the family.

### 4. `server/src/test/java/com/hrms/auth/service/RefreshTokenServiceTest.java`
- Added `allowsRotationWithinGracePeriodWithoutRevokingFamily()` test case.
- Updated `detectsRevokedTokenReuseAndRevokesTheFamily()` test case to verify reuse outside the grace window (60s).

### 5. `server/src/test/java/com/hrms/auth/AuthTestProperties.java` & `JwtServiceTest.java`
- Aligned test builders with the updated `AuthProperties.Jwt` signature.

### 6. `client/src/features/auth/services/refresh-session.ts`
- Added a 5-second deduplication cooldown window to `createRefreshCoordinator`.

### 7. `client/src/services/interceptors/auth-interceptor.ts`
- Added check for `currentToken && sentToken && currentToken !== sentToken` before calling `refreshSession()`, enabling instant retries for stale requests.

### 8. `client/src/providers/auth-provider.tsx`
- Added proactive background refresh `useEffect` with automatic scheduling 60 seconds prior to access token expiration.

### 9. `client/src/services/interceptors/auth-interceptor.test.ts` & `session.test.ts`
- Added unit tests for stale token direct retry and refresh coordinator cooldown.

---

## 8. Test Cases Added and Updated

1. **Backend Unit & Integration Tests**:
   - `RefreshTokenServiceTest.allowsRotationWithinGracePeriodWithoutRevokingFamily()`: Verifies that presenting a token revoked 10s ago succeeds and does **not** call `updateMulti` (family revocation).
   - `RefreshTokenServiceTest.detectsRevokedTokenReuseAndRevokesTheFamily()`: Verifies that presenting a token revoked 60s ago is rejected with `ErrorCode.REFRESH_TOKEN_REUSED` and revokes the entire family.
   - `AuthenticationSecurityIntegrationTest`: Confirmed all 9 Spring Security integration tests pass.
2. **Frontend Vitest Tests**:
   - `auth-interceptor.test.ts > retries directly without calling refreshSession if the token was already refreshed`: Confirms that if a sibling request already updated `sessionStore`, subsequent 401s retry immediately with no extra network refresh.
   - `session.test.ts > reuses recently refreshed session within the cooldown window`: Confirms that rapid calls within 5 seconds return the active session without duplicating refresh requests.

---

## 9. Verification Evidence

### Frontend Verification:
- **TypeScript Typecheck**:
  ```powershell
  npm run typecheck
  # Exit code: 0 (No type errors)
  ```
- **Vitest Test Suite**:
  ```
  Test Files  79 passed (79)
       Tests  374 passed (374)
    Duration  20.47s
  ```
- **Next.js Production Build**:
  ```
  ✓ Compiled successfully in 15.8s
  ✓ Linting and checking validity of types ...
  ✓ Collecting page data ...
  ✓ Generating static pages (64/64) ...
  ✓ Finalizing page optimization ...
  Exit code: 0
  ```

### Backend Verification:
- **Maven Test Suite**:
  ```
  [INFO] Running com.hrms.auth.service.RefreshTokenServiceTest
  [INFO] Tests run: 4, Failures: 0, Errors: 0, Skipped: 0
  ...
  [INFO] Running com.hrms.auth.security.AuthenticationSecurityIntegrationTest
  [INFO] Tests run: 9, Failures: 0, Errors: 0, Skipped: 0
  ...
  [INFO] Results:
  [INFO] Tests run: 113, Failures: 0, Errors: 0, Skipped: 16
  [INFO] BUILD SUCCESS
  ```

---

## 10. Architectural Confirmation

- **Short-Lived Access Tokens (15 Minutes)**: Preserved. Kept strictly in memory. Never persisted in `localStorage` or `sessionStorage`.
- **Long-Lived Refresh Tokens (30 Days)**: Preserved in MongoDB with TTL indexing.
- **HTTP-Only Cookies**: Preserved. Refresh token stored securely with `HttpOnly; Secure; SameSite=None; Path=/api/v1/auth`.
- **Token Rotation & Invalidation**: Preserved. Genuine replay attacks after 30 seconds revoke the entire token family.

---

## 11. Security Considerations

1. **Replay Attack Protection**: The 30-second leeway strictly accommodates network latency, browser write queues, and concurrent tab synchronization. Any replay after 30 seconds destroys the entire family.
2. **XSS Protection**: Access tokens are kept in JavaScript memory only. Refresh tokens remain completely inaccessible to JavaScript via `HttpOnly`.
3. **CSRF Protection**: Refresh endpoint is restricted to `POST`, requires `SameSite=None` with `Secure`, and the Next.js rewrite ensures requests are handled as same-origin by the client.

---

## 12. Operational Recommendations

1. **Monitor Refresh Token Rotation Logs**:
   In production (`AuthController` and `RefreshTokenService`), log debug events when tokens are refreshed within grace period vs revoked for reuse.
2. **Render Cold Starts**:
   Because Render free/starter tiers may experience cold starts of 30-50 seconds, `httpClientConfig.timeout` is set to 15,000ms. If network timeouts occur, the frontend retains existing session state and falls back to reactive interceptors rather than clearing the store.
3. **Multi-Tab Sync (Future Enhancement)**:
   A `BroadcastChannel` can optionally be added between browser tabs to broadcast renewed access tokens instantly, although the current leeway and proactive refresh completely prevent cross-tab revocation.
