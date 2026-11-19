# HRMS Next.js Security Upgrade Report

**Repository:** `atharve16/HRMS`  
**Branch:** `security/nextjs-advisory-upgrade`  
**Worktree:** `C:\Users\HP\Downloads\Hhk\attendance\nextjs-security-upgrade`  
**Date:** 2026-11-18

## Summary

The HRMS frontend was upgraded from Next.js **16.4.3** to **16.4.6** on the dedicated security branch. `eslint-config-next` was upgraded to the matching **16.4.6** release. The lockfile was updated with the corresponding Next.js framework, `@next/*`, and platform SWC package entries.

No HRMS features, UI, authentication, API rewrites, attendance, leave, payroll, React, Tailwind, Axios, or unrelated dependencies were changed by this security upgrade.

The branch already contained unrelated HRMS feature edits when this work began. Those changes were preserved and not modified. They are listed separately below so they are not confused with this upgrade.

## Vulnerability/advisory addressed

The original Next.js 16.4.3 production build stopped with Next.js `SecurityFatalError` and reported that the installed version was affected by a known security vulnerability, recommending a security upgrade.

The official Next.js 16.4.5 release notes identify the November 2026 security-fix release family, including these moderate advisories:

- Cross-tenant sensitive information disclosure when `use cache` is called through `unstable_cache` — `GHSA-mfr8-8qww-v76h`.
- Cache leakage across root parameter values in nested `use cache` functions — `GHSA-vc7v-qv4w-wrv8`.
- Cache poisoning of shared fallback shells in Cache Components — `GHSA-vvgp-ww4w-46vf`.
- Cross-user cache disclosure and poisoning with binary arguments — `GHSA-rhh4-g77r-r9qj`.
- Cross-client response injection/disclosure in self-hosted Next.js applications forwarding fetched responses — `GHSA-pc58-hwjq-p385`.
- SVG rejection bypass in Next.js image optimization — `GHSA-7qx7-33qx-rqx2`.
- HttpOnly cookie exposure through internal response headers on Next.js Edge runtime routes — `GHSA-f3mh-rxg3-f5g2`.

The selected 16.4.6 patch release is newer than the 16.4.5 security backport and is the version required by the existing security-upgrade state. The application does not use Server Actions, API route handlers, or `use server`; however, the framework-level warning must still be remediated rather than relying on application feature reachability assumptions.

References:

- [Next.js v16.4.5 security release notes](https://github.com/vercel/next.js/releases/tag/v16.4.5)
- [Next.js security advisories](https://github.com/vercel/next.js/security/advisories?state=published)
- [Next.js support policy](https://nextjs.org/support-policy)

## Versions

| Package | Before | After | Result |
|---|---:|---:|---|
| `next` | `16.4.3` | `16.4.6` | Patched framework version selected |
| `eslint-config-next` | `16.4.3` | `16.4.6` | Matching ESLint integration |
| React | `19.3.0` | `19.3.0` | Unchanged |
| React DOM | `19.3.0` | `19.3.0` | Unchanged |
| Tailwind CSS | Existing `^4` range | Existing `^4` range | Unchanged |
| Axios | Existing `^1.21.0` | Existing `^1.21.0` | Unchanged |

Installed verification after `npm ci`:

```text
next@16.4.6
eslint-config-next@16.4.6
```

## Files changed by this security upgrade

- `package.json`
  - `next`: `16.4.3` → `16.4.6`
  - `eslint-config-next`: `16.4.3` → `16.4.6`
- `package-lock.json`
  - Updated the root dependency pins.
  - Updated `next`, `@next/env`, `@next/eslint-plugin-next`, `eslint-config-next`, and the platform-specific `@next/swc-*` packages from 16.4.3 to 16.4.6.
  - No unrelated package family was upgraded.
- `SECURITY_UPGRADE_REPORT.md`
  - This report.

No source files were changed to fix upgrade issues. The Next.js 16.4.6 build passed without feature/UI/authentication/API changes.

## Dependency diff review

The package diff was intentionally limited:

```text
package.json      2 changed lines
package-lock.json 48 additions / 48 removals
```

The lockfile changes are restricted to the Next.js package family and matching `eslint-config-next` integration. React, Tailwind, Axios, TanStack Query, Radix, TypeScript, Vitest, and other unrelated packages were not intentionally upgraded.

`npm audit --json` after installation reported:

```text
info: 0
low: 0
moderate: 0
high: 0
critical: 0
total: 0
```

## Verification results

All commands were run from the isolated security worktree.

| Check | Result | Details |
|---|---|---|
| `npm ci` | Pass | Completed successfully using the committed lockfile; 641 packages installed |
| `npm run typecheck` | Pass | `tsc --noEmit` exited 0 after the successful Next build regenerated `.next` type artifacts |
| `npm run lint` | Pass | ESLint exited 0 |
| `npm run test -- --reporter=dot` | Pass | 87 test files and 414 tests passed |
| `npm run build` | Pass | Next.js 16.4.6 compiled, typechecked, generated all 52 routes, and exited 0 |
| `npm audit --json` | Pass | No reported vulnerabilities in the installed dependency tree |

### Environment notes

- The first sandboxed `npm ci` stalled while downloading packages and was interrupted. It partially removed `node_modules`, which caused temporary false failures (`eslint` and `vitest` not found) and caused one build attempt to resolve a global Next 15.0.3 binary. The successful escalated `npm ci` restored the branch-local toolchain before verification.
- The first sandboxed Vitest attempt failed with Windows `esbuild` `spawn EPERM`. The suite passed when rerun with child-process permission.
- The final checks above were run only after the correct local Next.js 16.4.6, ESLint, and Vitest binaries were restored.

## Pre-existing unrelated branch changes

The dedicated branch/worktree was not clean at the start. These changes were already present and were not modified by this task:

- `.gitignore`
- Attendance correction dialog/screen/widget changes
- Geolocation hook and tests
- Attendance error handling and tests
- Leave allocation/application dialog changes and tests
- API error handling/tests

Those files are outside the security upgrade scope and should be reviewed or committed separately from the dependency-only security change.

## Remaining warnings and limitations

1. The branch has not been merged into `main`, as required.
2. No Capacitor or Android files were added.
3. The security upgrade does not replace a full production security review; it updates the vulnerable framework release and verifies the application build/tests.
4. The selected 16.4.6 release may include framework behavior changes from the security backport. The automated suite passes, but normal staging smoke tests should still cover authentication, API rewrites, and dynamic routes before deployment.
5. The repository contains a `cacheComponents` configuration. The listed cache-related advisories are addressed by the patched framework release, but any future use of `use cache`/`unstable_cache` should follow Next.js security guidance.
6. The npm install emitted existing deprecation warnings for `glob` and ESLint 9.39.5. They were not upgraded because unrelated dependency changes were explicitly out of scope.

## Final status

The isolated Next.js security upgrade is complete on `security/nextjs-advisory-upgrade`:

- Next.js: **16.4.3 → 16.4.6**.
- `eslint-config-next`: **16.4.3 → 16.4.6**.
- Lockfile updated with only the matching Next.js package family.
- Typecheck, ESLint, Vitest, production build, and npm audit passed after the correct dependencies were restored.
- `main` was not modified or merged.
- Capacitor implementation was not started.
