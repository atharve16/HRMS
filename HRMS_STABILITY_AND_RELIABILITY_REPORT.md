# HRMS Stability and Reliability Report

Date: 2026-11-14

## 1. Executive summary

The frontend and backend communication path was audited across authentication, employee, attendance, holiday, leave, payroll, department, office-location, and shift services.

The confirmed attendance HTTP 500 was fixed. The root cause was a malformed MongoDB date criterion: when `fromDate` and `toDate` were both supplied, the attendance repository added `workDate` twice. Spring Data MongoDB rejects duplicate field expressions, so a same-day request such as `fromDate=2026-11-14&toDate=2026-11-14` reached the global 500 handler.

The browser already used the same-origin `/api/v1` proxy for feature calls, but configuration was made explicit and defensive. OTP failures now preserve structured backend errors and distinguish connection failures, timeouts, rate limiting, validation, authorization, and upstream/server failures. Refresh calls use the shared Axios client, and public auth calls no longer receive stale access tokens.

The reported production holiday 500 could not be reproduced from the repository implementation or local authenticated integration tests because no production credentials or production database access were available. The exact request shape is covered by a repository regression test and the holiday parameter validation and empty-page behavior were hardened.

## 2. Confirmed issues and fixes

### Confirmed and fixed

1. Attendance same-day summary query failure.

   `AttendanceRepositoryImpl` built two separate `workDate` criteria. The second criterion could not be represented in MongoDB's single document query. The range is now built as one inclusive criterion containing `$gte` and `$lte`.

2. Attendance reversed date ranges were not validated.

   `AttendanceService` now returns `VALIDATION_ERROR` with HTTP 400 before querying MongoDB when `toDate` precedes `fromDate`.

3. Null session collections could break attendance response conversion.

   `AttendanceRecord` now exposes null sessions and correction history as empty lists to callers. Attendance summary metrics remain zero-safe and do not alter calculation rules.

4. API error classification was too coarse for OTP UX.

   Axios errors now preserve structured Spring error envelopes, status, code, details, and timeout state. Auth messaging distinguishes network failure, timeout, 429, 5xx/upstream failures, and backend validation/authentication messages.

5. Refresh used a second Axios instance.

   Refresh now uses the centralized `apiClient` through a lazy import that avoids the interceptor module cycle. There is no feature-specific browser Axios client.

6. Public auth requests could receive an old bearer token.

   The request interceptor now excludes `/auth/request-otp`, `/auth/verify-otp`, and `/auth/refresh` from access-token attachment. Protected requests retain the existing coordinated refresh behavior.

7. The API timeout was too short for a cold Render start plus Brevo-backed OTP delivery.

   The shared request timeout is now 30 seconds. OTP POST requests are not automatically retried. TanStack Query retains bounded retries for query operations only.

8. Production CORS configuration included development origins through the base profile.

   The production profile now overrides allowed origins with the explicit `FRONTEND_URL`. Local development origins remain available in the development/base configuration.

9. Request diagnostics lacked a consistent correlation and duration record.

   `RequestObservabilityFilter` adds or propagates `X-Request-ID`, logs method, path, response status, and duration, and places the ID in MDC. Unexpected exception logging includes method, path, and request ID. No OTP, password, token, cookie, secret, or personal data is logged.

### Not conclusively reproduced

- Render cold starts, Render proxy failures, Atlas connectivity, and Brevo latency cannot be confirmed from this workspace. They remain possible contributors to intermittent OTP availability and require Render runtime logs and Brevo transaction logs.
- The exact production holiday HTTP 500 was not reproduced. The repository query for `active=true&fromDate=2026-11-14&page=0&limit=5&sortDirection=asc` builds a valid inclusive date filter, active filter, ascending sort, and empty page. An authenticated production request still needs to be performed after deployment.
- No authenticated production ADMIN credentials were available, so live endpoint verification against `hrms-n1xj.onrender.com` was not performed.

## 3. Files inspected

### Frontend

The audit covered:

- `next.config.ts`
- `src/services/http-config.ts`
- `src/services/api-client.ts`
- `src/services/api-error.ts`
- `src/services/api-contract.ts`
- `src/services/interceptors/auth-interceptor.ts`
- `src/services/interceptors/response-interceptor.ts`
- `src/features/auth/services/auth-service.ts`
- `src/features/auth/services/refresh-session.ts`
- `src/features/auth/services/session-store.ts`
- `src/features/auth/components/login-form.tsx`
- `src/features/auth/components/otp-form.tsx`
- authentication error utilities and tests
- employee, attendance, holiday, leave, payroll, department, office-location, shift, dashboard, and work-assignment services and query hooks

### Backend

The audit covered:

- `AuthController`, `AuthenticationService`, `OtpService`, `OtpEmailService`, `BrevoEmailClient`
- `SecurityConfig`, `JwtAuthenticationFilter`, `SecurityErrorWriter`
- `GlobalExceptionHandler`, `ApiResponse`, `ApiError`
- `AdminAttendanceController`, `AttendanceService`, `AttendanceCalculationService`
- `AttendanceRecord`, `AttendanceSession`, summary/page DTOs
- `AttendanceRepository`, `AttendanceRepositoryImpl`, and custom search DTOs
- `AdminHolidayController`, `HolidayService`, holiday DTOs/models/repositories
- Mongo/time configuration and `Asia/Kolkata` company-date handling

## 4. Files modified

### Frontend

- `next.config.ts`
- `src/services/http-config.ts`
- `src/services/api-error.ts`
- `src/services/interceptors/auth-interceptor.ts`
- `src/features/auth/services/refresh-session.ts`
- `src/features/auth/lib/auth-error-message.ts`
- `src/features/auth/components/login-form.tsx`
- related authentication/interceptor tests

New tests:

- `src/services/api-error.test.ts`
- `src/services/http-config.test.ts`
- `src/services/proxy-config.test.ts`
- `src/features/auth/lib/auth-error-message.test.ts`

### Backend

- `src/main/java/com/hrms/attendance/repository/AttendanceRepositoryImpl.java`
- `src/main/java/com/hrms/attendance/service/AttendanceService.java`
- `src/main/java/com/hrms/attendance/model/AttendanceRecord.java`
- `src/main/java/com/hrms/holiday/service/HolidayService.java`
- `src/main/java/com/hrms/config/SecurityConfig.java`
- `src/main/java/com/hrms/common/exceptions/GlobalExceptionHandler.java`
- `src/main/java/com/hrms/common/observability/RequestObservabilityFilter.java`
- `src/main/resources/application-prod.yml`

New or extended tests:

- `AttendanceRepositoryTest`
- `AttendanceServiceTest`
- `CompanyHolidayRepositoryTest`
- `HolidayServiceTest`

## 5. Exact fixes implemented

### API communication architecture

The browser path is now:

```text
Browser Axios request: /api/v1/<resource>
        |
        v
Next.js rewrite: /api/v1/:path*
        |
        v
https://hrms-n1xj.onrender.com/api/v1/:path*
```

`NEXT_PUBLIC_API_URL` configures the browser client and falls back to `/api/v1`. `INTERNAL_API_URL` is used only by the Next.js rewrite. The rewrite strips a trailing slash and an accidental `/api/v1` suffix before appending the single API prefix.

All feature services use `apiClient`. No direct browser `fetch`, direct Render URL, or feature-specific Axios instance remains. Query parameters continue to be passed through Axios `params`, including holiday `year`, `fromDate`, `toDate`, `active`, `page`, `limit`, and `sortDirection`.

### OTP lifecycle

- Login form keeps the entered email in React Hook Form state after errors.
- Submit is disabled while the mutation is pending and has an explicit pending guard.
- Failed requests remain manually retryable.
- No automatic retry is applied to OTP request or verification POST mutations.
- Existing OTP expiry, HMAC hashing, attempt limits, rate limits, and Brevo integration remain unchanged.
- Backend `AUTH_DELIVERY_FAILED` remains a structured 503 response.

### Attendance

- Same-day and multi-day ranges use inclusive `workDate >= fromDate` and `workDate <= toDate` semantics.
- Empty collections return zero-valued `AttendanceSummaryResponse` metrics.
- Existing status and payroll calculation rules were not changed.
- `Asia/Kolkata` remains the configured company timezone through `CompanyTimeProvider`.
- ADMIN restriction remains on `AdminAttendanceController`; no authorization rule was weakened.

### Holidays

- Supported filters continue to flow from controller to service to repository.
- Page numbers must be non-negative and limits must be 1-100.
- `sortDirection` now accepts only `asc` or `desc`; invalid values return HTTP 400.
- Date bounds remain inclusive.
- Empty Mongo results map to an empty `HolidayPageResponse`, not an exception.
- Existing holiday CRUD, duplicate-active-date protection, notification, and audit behavior remain unchanged.

## 6. Production configuration requirements

Frontend Vercel environment:

```env
NEXT_PUBLIC_API_URL=/api/v1
INTERNAL_API_URL=https://hrms-n1xj.onrender.com
```

Backend Render environment must include the existing production requirements:

```env
SPRING_PROFILES_ACTIVE=prod
MONGODB_URI=<Atlas connection string>
MONGODB_DATABASE=hrms
FRONTEND_URL=https://hrms-three-delta.vercel.app
COOKIE_SECURE=true
COOKIE_SAME_SITE=None
JWT_SECRET=<secret>
OTP_HASH_SECRET=<different secret>
BREVO_API_KEY=<secret>
MAIL_FROM=<verified Brevo sender>
MAIL_FROM_NAME=HRMS
```

Atlas network access must allow the Render service. Production Mongo indexes must be present because automatic index creation is disabled in the production profile. Render health checks should use `/api/v1/system/health`.

Do not expose `INTERNAL_API_URL` to the browser as a `NEXT_PUBLIC_*` variable. Do not put secrets in the frontend environment or repository.

## 7. Regression coverage

Frontend coverage includes:

- structured envelope preservation;
- network and timeout classification;
- HTTP 400, 401, 403, 404, 409, 429, 500, 502, 503, and 504 status preservation;
- OTP user-facing error mapping;
- same-origin API base configuration;
- proxy prefix normalization;
- public-auth token exclusion;
- existing concurrent refresh coordination;
- holiday and attendance query serialization through existing service tests.

Backend coverage includes:

- same-day inclusive attendance range;
- empty attendance summary;
- null sessions and zero/default metrics;
- multiple attendance statuses and metric sums;
- reversed attendance date range;
- holiday active/from-date filtering;
- empty holiday page;
- pagination and sorting validation;
- existing ADMIN/EMPLOYEE security integration coverage.

## 8. Verification results

### Frontend

- `npm test`: passed, 83 test files, 393 tests.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run build`: passed with Next.js 16.4.3 and all application routes generated.

Vitest initially hit Windows sandbox `spawn EPERM` while starting esbuild. The suite was rerun with normal process permissions and passed.

### Backend

Executed with installed Temurin Java 21.0.13:

- `mvn test`: passed, 119 tests, 0 failures, 0 errors, 16 skipped.
- Targeted new/changed regression tests: 11 passed.
- `mvn -DskipTests compile`: passed.

The 16 skipped tests are Docker/Testcontainers Mongo integration tests. Docker is unavailable in this environment, so those tests were skipped by their existing `disabledWithoutDocker` configuration. The non-container security integration tests and all unit/repository mock tests passed.

## 9. Remaining deployment actions

1. Deploy the frontend and backend changes.
2. Confirm the Vercel variables exactly match the proxy configuration above.
3. Confirm Render uses the `prod` profile, the exact Vercel `FRONTEND_URL`, valid Atlas access, and valid Brevo sender/API credentials.
4. With an authenticated ADMIN account, verify:

   - `GET /api/v1/admin/attendance/summary?fromDate=2026-11-14&toDate=2026-11-14`
   - `GET /api/v1/admin/holidays?active=true&fromDate=2026-11-14&page=0&limit=5&sortDirection=asc`

5. During verification, correlate failures using the `X-Request-ID` response header and Render logs. For OTP failures, compare the API request duration/status with Brevo transactional logs.
6. If OTP still fails after deployment, inspect Render cold-start duration, Atlas connection acquisition, Brevo response latency/status, and platform gateway 502/503/504 logs. The code cannot conclusively determine those external runtime conditions from this workspace.

## 10. Final status

The confirmed attendance date-range 500 and the frontend error-classification/configuration defects are fixed and verified by tests and build checks. Holiday filtering and empty-page behavior are covered and hardened, but the original production holiday failure remains unconfirmed until an authenticated production request and Render log correlation are completed.
