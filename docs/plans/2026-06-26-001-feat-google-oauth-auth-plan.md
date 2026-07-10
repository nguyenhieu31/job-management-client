---
title: feat: Google OAuth Login and Registration
status: active
created: 2026-06-26
type: feat
depth: standard
---

# feat: Google OAuth Login and Registration

**Target repo (backend):** `jobmanagement/` — Spring Boot 3.5.6, Java 17
**Target repo (frontend):** `job-management-app/` — Next.js 16, Redux Toolkit

---

## Problem Frame

The application currently supports only email/password authentication. Users cannot sign in or register using their Google account. This limits onboarding options for customer self-registration and forces all users to manage yet another password. Google OAuth is **customer-only** — employees (all non-CUSTOMER roles) must not be able to authenticate via Google. Employee email addresses used in a Google OAuth attempt must be rejected, not linked.

---

## Scope Boundaries

### In scope
- Google OAuth login (existing customers sign in with Google)
- Google OAuth registration (new customers create account with Google)
- Server-side OAuth code exchange (client secret never exposed to browser)
- Account linking: if a Google-authenticated email matches an existing email/password **customer** account, link the Google sub to that account
- Employee email collision rejection: if a Google-authenticated email matches an existing **employee** account (any non-CUSTOMER role), reject with error
- New Google-authenticated users get CUSTOMER role
- Frontend pages: login Google button, registration page (Google-only), callback handler
- Environment configuration for Google client ID and secret

### Deferred to Follow-Up Work
- Account unlinking / disconnecting Google from an existing account
- Multiple OAuth providers (GitHub, Facebook)
- Profile picture display in dashboard sidebar
- Google refresh token persistence (for offline access)

---

## Key Technical Decisions

1. **Custom OAuth implementation (no `spring-boot-starter-oauth2-client`).** The existing JWT filter uses Redis-session lookup (not JWT validation). Adding Spring Security OAuth2 Client would add `OAuth2LoginAuthenticationFilter` which conflicts with the custom filter chain. A custom controller + service gives full control over the redirect and session-creation flow.

2. **Server-side redirect chain.** Frontend → Backend (`GET /authenticate/google/url`) → Google → Backend (`POST /authenticate/google/callback`) → Frontend (`/auth/google-callback`). This keeps the client secret on the backend only.

3. **`sub` as stable user identifier, not email.** Google's `sub` claim is permanent; email can change. The `Account` entity gets a `googleSub` column. User lookup by `googleSub` first, fallback to email linking.

4. **Single redirect URI pointed at the frontend.** Google's OAuth redirect URI is `http://localhost:3000/auth/google-callback` (dev) / `https://clientportal24h.com/auth/google-callback` (prod). The backend never needs its own redirect URI registered with Google — the frontend callback page posts the auth code to the backend.

---

## Implementation Units

### U1. Backend — Entity, Enum, and Config Changes

**Goal:** Add `googleSub` and `pictureUrl` fields to Account, make `password` nullable for Google-only accounts, add CUSTOMER role, add Google OAuth configuration properties.

**Dependencies:** None

**Files:**
- `jobmanagement/src/main/java/org/com/jobmanagement/entity/Account.java` (modify)
- `jobmanagement/src/main/java/org/com/jobmanagement/enums/RoleType.java` (modify)
- `jobmanagement/src/main/java/org/com/jobmanagement/repository/AccountRepository.java` (modify)
- `jobmanagement/src/main/resources/application.properties` (modify)
- `jobmanagement/.env` (modify — add GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI)

**Approach:**
- Add `googleSub` (String, unique, nullable) and `pictureUrl` (String, nullable) columns to `Account.java`.
- Change `password` from `nullable = false` to nullable — Google-only CUSTOMER accounts have no password.
- Add `CUSTOMER("CUSTOMER")` to `RoleType.java` enum. CUSTOMER role id=7 in DB seed.
- Add `findByGoogleSub(String googleSub)` query method to `AccountRepository.java`.
- Add `google.client-id`, `google.client-secret`, `google.redirect-uri` to `application.properties`, each reading from environment variables.

**Patterns to follow:**
- Existing `Account.java` field definitions (same annotation style, column naming)
- Existing `RoleType.java` enum entries
- Existing `application.properties` `property=${ENV_VAR}` format

**Test scenarios:**
1. Account can be persisted with `googleSub` set and queried via `findByGoogleSub`.
2. Account with null `googleSub` does not break existing email/password login flow.
3. `RoleType.CUSTOMER` exists and `roleRepository.findByName("CUSTOMER")` returns a non-null role (requires DB seed or migration).

**Verification:** Build compiles; new fields appear in the `Account` table schema after `ddl-auto=update`.

---

### U2. Backend — Google OAuth Service

**Goal:** Implement the core Google OAuth logic: generate auth URL (with state for CSRF), exchange authorization code for tokens, verify ID token, find or create account, issue JWT + Redis session + cookies.

**Dependencies:** U1

**Files:**
- `jobmanagement/src/main/java/org/com/jobmanagement/services/GoogleAuthService.java` (create)
- `jobmanagement/src/main/java/org/com/jobmanagement/services/impl/GoogleAuthServiceImpl.java` (create)
- `jobmanagement/src/main/java/org/com/jobmanagement/dto/response/GoogleAuthResponse.java` (create)

**Approach:**
- `generateAuthUrl(mode)`: Generate 32-byte random state, store in Redis with 5-min TTL (key: `google:state:{state}`, value: `login` or `register`). Return Google's OAuth URL with `client_id`, `redirect_uri`, `response_type=code`, `scope=openid email profile`, `state`.
- `handleCallback(code, state, response)`: Verify state from Redis (delete after read). Exchange code for tokens via `POST https://oauth2.googleapis.com/token`. Verify ID token using `GoogleIdTokenVerifier` (from `google-api-client` 2.7.0, already in pom.xml). Extract `sub`, `email`, `name`, `picture`. 
  1. Look up account by `googleSub`. If found (existing Google user), proceed to session creation.
  2. If not found, look up by email. If found **and the account's role is not CUSTOMER** (i.e., ADMIN, MANAGER, EMPLOYEE, QA, SPECIAL) → throw `ApiException(ErrorCode.BAD_REQUEST, "Email already registered as an internal user. Google login is for customers only.")`.
  3. If found by email with CUSTOMER role → link `googleSub` to that account.
  4. If no account found → create new with CUSTOMER role (use `email` as username, `password = null`, `googleSub` set, `isActive=true`).
- Call existing `AuthUtil.saveDataInCache()` and `CookieUtil.generatorTokenCookie()` to create JWT session. Return `LoginResponse`.
- `GoogleAuthResponse`: DTO for the callback response matching what the frontend expects.

**Patterns to follow:**
- Existing `AuthenticateServicesImpl` for the JWT/session/cookie creation flow
- Existing `AuthUtil.getLoginResponse()` and `AuthUtil.saveDataInCache()`
- Existing exception handling with `ApiException` and `ErrorCode`

**Test scenarios:**
1. `generateAuthUrl("login")` returns a valid Google OAuth URL containing `client_id`, `redirect_uri`, `state`, and `response_type=code`.
2. `generateAuthUrl("register")` stores the state with value `register` in Redis.
3. `handleCallback` with invalid state throws `ApiException` (BAD_REQUEST).
4. `handleCallback` with expired/missing state throws `ApiException`.
5. `handleCallback` with valid code for a new Google user creates a new Account with CUSTOMER role, `googleSub` set, and returns `LoginResponse`.
6. `handleCallback` with valid code for a Google user whose email matches an existing email/password **customer** account links the `googleSub` to that account (does not create a duplicate).
7. `handleCallback` for an existing Google user (same `googleSub`) does not create a duplicate account.
8. `handleCallback` with valid code where the email matches an existing **employee** account (ADMIN, MANAGER, EMPLOYEE, QA, SPECIAL) throws `ApiException`.
9. `handleCallback` sets `accessToken` and `userId` cookies on the response.
10. `handleCallback` stores the access token in Redis (session is usable by `CustomFilterJwt`).

**Verification:** Unit test coverage for service methods. Manual test: hit `/authenticate/google/url`, open the URL in a browser, complete Google auth, verify callback creates JWT session and redirects.

---

### U3. Backend — Google Auth Controller and Security Config

**Goal:** Expose the Google OAuth endpoints and allow public access.

**Dependencies:** U2

**Files:**
- `jobmanagement/src/main/java/org/com/jobmanagement/controller/auth/GoogleAuthController.java` (create)
- `jobmanagement/src/main/java/org/com/jobmanagement/config/CustomSecurityConfig.java` (modify)

**Approach:**
- `GoogleAuthController` with two endpoints:
  - `GET /authenticate/google/url?mode=login|register` — calls `GoogleAuthService.generateAuthUrl(mode)`, returns `{ url, state }`.
  - `POST /authenticate/google/callback` — accepts `{ code, state }` body, calls `GoogleAuthService.handleCallback(code, state, response)`, returns `LoginResponse`.
- `CustomSecurityConfig.java`: Add `.requestMatchers("/authenticate/google/**").permitAll()` to the public paths. This is already covered by the existing `.requestMatchers("/authenticate/**").permitAll()` but add the explicit path for clarity.

**Patterns to follow:**
- Existing `AuthenticateController.java` for `@RestController` pattern, `CreateApiResponse`, logging, and exception handling.
- Existing `CustomSecurityConfig.java` `requestMatchers` ordering.

**Test scenarios:**
1. `GET /authenticate/google/url` returns 200 with `{ url, state }` JSON body.
2. `POST /authenticate/google/callback` with missing `code` returns 400.
3. `POST /authenticate/google/callback` with valid `{ code, state }` returns 200 with `LoginResponse` and sets cookies.
4. Unauthenticated request to `/authenticate/google/url` returns 200 (not 401/403).
5. Unauthenticated request to `/authenticate/google/callback` returns 200 (not 401/403).

**Verification:** Start backend, call `GET /authenticate/google/url` without auth token, verify 200 response.

---

### U4. Frontend — Update API Service and Redux

**Goal:** Wire the existing frontend stubs to the real backend endpoints.

**Dependencies:** U3 (backend endpoints must exist)

**Files:**
- `src/services/AuthenticateApi.tsx` (modify)
- `src/store/slice/authentication/Authentication.tsx` (modify)
- `src/types/authentication.tsx` (modify — already has `GoogleAuthResponse`)

**Approach:**
- Add `GetGoogleAuthUrl(mode)` service: `GET /authenticate/google/url?mode=login|register`.
- Add `RedirectToGoogle(mode)` function: calls `GetGoogleAuthUrl`, stores `state` in `sessionStorage`, then `window.location.href = url`.
- Update existing `GoogleAuthCallbackService(code, state)`: change from `POST /authenticate/google/callback` (already done in previous work) to accept both `code` and `state`.
- Update `GoogleAuthAction` in the Redux slice: accept `{ code, state }` payload, call `GoogleAuthCallbackService`.
- Remove the old `GoogleAuthRedirectUrl()` helper that pointed at the non-existent `/oauth2/authorization/google` endpoint — replace with `RedirectToGoogle(mode)`.

**Patterns to follow:**
- Existing service functions in `AuthenticateApi.tsx` (axios pattern, error handling)
- Existing Redux thunks in `Authentication.tsx` (createAsyncThunk, extraReducers)

**Test scenarios:**
1. `GetGoogleAuthUrl("login")` calls the correct backend endpoint and returns URL + state.
2. `GoogleAuthCallbackService("code123", "state456")` calls `POST /authenticate/google/callback` with correct body.
3. `GoogleAuthAction.fulfilled` dispatches and updates Redux state (`isLoginned=true`, `fullName`, `email`, `roleName`).
4. `GoogleAuthAction.rejected` dispatches and Redux error state is set.

**Verification:** `npm run build` succeeds with no type errors. Redux devtools show the Google auth state transitions.

---

### U5. Frontend — Update Login, Register, and Callback Pages

**Goal:** The three auth pages use the real Google OAuth flow instead of stubs.

**Dependencies:** U4

**Files:**
- `src/app/auth/login/page.tsx` (modify)
- `src/app/auth/register/page.tsx` (modify)
- `src/app/auth/google-callback/page.tsx` (modify)

**Approach:**
- **Login page:** `handleGoogleLogin` calls `RedirectToGoogle("login")`. The Google button already exists from previous work — ensure it uses the new `RedirectToGoogle` function.
- **Register page:** `handleGoogleRegister` calls `RedirectToGoogle("register")`. The page already exists from previous work — ensure the button uses the new function.
- **Callback page:** The existing page dispatches `CheckSessionLoginAction()` on mount. Change it to:
  1. Read `code` and `state` from URL search params.
  2. If `error` param exists, show error screen.
  3. Otherwise, dispatch `GoogleAuthAction({ code, state })`.
  4. On fulfilled, redirect to `/dashboard/order-service`.
  5. On rejected, show error screen with retry links.
  The Suspense boundary for `useSearchParams()` is already in place.

**Patterns to follow:**
- Existing login page for button styling and layout
- Existing callback page for the loading/success/error UI states

**Test scenarios (integration — manual):**
1. Click "Sign in with Google" on login page → browser redirects to Google.
2. Complete Google auth → browser lands on `/auth/google-callback?code=xxx&state=yyy`.
3. Callback page dispatches GoogleAuthAction → on success, redirects to `/dashboard/order-service`.
4. Click "Sign up with Google" on register page → same flow but account created as CUSTOMER.
5. Google sign-in with an email that already has a password account → account linked (sub saved), user can now use either method.
6. Google callback with error param (`?error=access_denied`) → shows error screen with "Back to login" and "Create a new account" buttons.
7. Google callback without `code` param → shows error screen.

**Verification:** Full end-to-end manual flow test. Frontend build succeeds.

---

## System-Wide Impact

- **Database**: New `googleSub` (unique varchar) and `pictureUrl` (varchar) columns on the `Account` table. No migration script needed — Hibernate `ddl-auto=update` handles it.
- **Redis**: New `google:state:{state}` keys with 5-minute TTL for CSRF protection during OAuth flow.
- **Environment**: Two new required env vars: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`.
- **Security**: The `/authenticate/google/**` paths are public (no auth required). The `GoogleIdTokenVerifier` validates the ID token signature, audience, issuer, and expiration.
- **CORS**: No changes needed — existing config already allows the frontend origin.

---

## Risks and Mitigations

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Redirect URI mismatch in Google Cloud Console | Medium | Doc the exact URI format; test locally first |
| Google ID token verification fails due to clock skew | Low | `GoogleIdTokenVerifier` handles this by default with a few seconds grace |
| State parameter CSRF bypass | Low | 32-byte random state, single-use, 5-min Redis TTL |
| Race condition on account creation for concurrent Google sign-ups | Low | Single-instance Spring Boot app; JPA handles with unique constraint on `googleSub` and `email` |
| Google user with email matching an existing account that they don't own | Low | Acceptable — they'd need access to the email to authenticate with Google; this is the same risk as password reset by email |
| Employee email used in Google OAuth flow | Low | Explicit check in `handleCallback`: if email matches a non-CUSTOMER account, reject with clear error message |

---

## Dependencies / Prerequisites

1. Google Cloud Console project with OAuth 2.0 Client ID configured (Web Application type)
2. Authorized redirect URI set to `http://localhost:3000/auth/google-callback` (dev) / `https://clientportal24h.com/auth/google-callback` (prod)
3. `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` added to backend `.env` and deployment environment
4. `GOOGLE_REDIRECT_URI` added to backend `.env` matching the Google Cloud Console setting

---

## Deferred Implementation Notes

- If the backend has a `CUSTOMER` role seed in the DB but the `RoleType` enum doesn't include it yet, the DBA needs to insert `(name='CUSTOMER')` into the `Role` table or the app needs to seed it on startup.
- The exact field length for `pictureUrl` (500 characters) should be confirmed against actual Google picture URL lengths — Google's profile pictures are typically shorter, but 500 provides headroom.
- The `google:state:` Redis keys are not automatically cleaned up on expiry — Redis handles TTL eviction natively, so no cleanup is needed.
