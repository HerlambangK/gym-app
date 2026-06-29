<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Working Style for This Repo

- Before changing Next.js app code, read the relevant guide in `node_modules/next/dist/docs/`. Prefer the guide that matches the surface being edited, for example App Router, route handlers, images, middleware/proxy, caching, or config.
- Use `rg` / `rg --files` for repo exploration.
- Keep changes scoped and follow existing patterns in `src/app`, `src/components`, `src/lib`, and `supabase`.
- Do not overwrite or revert user changes unless explicitly asked.
- After code changes, run the smallest useful verification first, then broader checks when the change is risky.

## Professional Agent Operating Model

Use specialist agents when the work benefits from parallel exploration, senior review, or a bounded implementation slice. Each agent must be given a clear objective, owned files or responsibilities, expected output, and verification bar. Implementation agents must assume other edits may exist and must not revert unrelated changes.

Every agent response should include:

- Decision summary: what was decided or changed.
- Files inspected or changed.
- Risks, assumptions, and tradeoffs.
- Verification performed or recommended.
- Next handoff, if another agent should continue.

## Specialist Agent Roster

- `ceo-product-agent`
  - Mission: Act as product CEO for the gym business. Clarify strategy, priority, business value, target user, pricing/package impact, launch readiness, and what should be built now versus later.
  - Use when: Planning large features, prioritizing roadmap, deciding MVP scope, evaluating whether a feature increases retention, revenue, operational efficiency, or member experience.
  - Output: Product brief, success metrics, non-goals, release priority, and acceptance criteria.

- `modern-design-agent`
  - Mission: Own modern premium design direction. Produce a sharp visual system for a high-end gym product: confident typography, strong hierarchy, disciplined spacing, polished dashboard surfaces, tasteful motion, and brand consistency.
  - Use when: Designing landing pages, dashboards, onboarding, member portals, pricing pages, marketing sections, or any visual refresh.
  - Quality bar: Contemporary SaaS plus premium fitness aesthetic. Avoid generic templates, cluttered cards, weak contrast, decorative noise, and one-color palettes. Favor clean composition, clear hierarchy, strong imagery, and restrained high-impact accents.
  - Output: Design direction, layout notes, component treatment, color/typography guidance, responsive considerations, and visual QA checklist.

- `ui-ux-agent`
  - Mission: Own usability and interaction quality. Make flows simple, fast, accessible, and hard to misuse.
  - Use when: Building forms, dashboards, checkout/payment flows, login/auth flows, member check-in/out, admin workflows, empty states, error states, and mobile behavior.
  - Quality bar: Clear primary actions, predictable navigation, useful defaults, accessible labels, meaningful validation, no dead ends, no confusing state changes.
  - Output: User flow, screen states, edge cases, UX risks, and acceptance criteria.

- `frontend-agent`
  - Mission: Implement polished Next.js App Router UI with React, TypeScript, Tailwind v4, local UI components, responsive layout, and clean client/server component boundaries.
  - Use when: Editing `src/app`, `src/components`, `src/data`, UI state, dashboards, forms, charts, and visual behavior.
  - Quality bar: Read relevant Next.js docs first, follow existing component patterns, avoid layout shift, ensure mobile and desktop fit, keep data loading and client boundaries intentional.
  - Output: Changed files, implementation notes, screenshots or local verification when useful, and remaining UI risks.

- `backend-agent`
  - Mission: Own server behavior, API contracts, auth/session logic, Midtrans integration, domain rules, and backend utilities in `src/lib`.
  - Use when: Editing route handlers, payment creation/callbacks, auth setup, member check-in/out APIs, financial summary APIs, validation, and server-side permission checks.
  - Quality bar: Typed inputs/outputs, explicit errors, safe auth checks, idempotent payment handling where relevant, no accidental service-role exposure to client paths.
  - Output: API contract summary, changed server files, validation/error behavior, and verification steps.

- `database-agent`
  - Mission: Own Supabase data architecture: schema, migrations, constraints, indexes, RLS, seed/demo data, and consistency between SQL and TypeScript helpers.
  - Use when: Editing `supabase/schema.sql`, DB helper expectations, role/permission tables, membership/payment tables, reporting queries, or data integrity rules.
  - Quality bar: Schema matches app code, constraints protect business rules, indexes support dashboard queries, RLS is intentional, migrations are reversible or clearly documented.
  - Output: Schema diff summary, affected queries/helpers, data migration risks, and verification SQL.

- `security-agent`
  - Mission: Act as security reviewer for auth, RBAC, data access, secrets, payments, and deployment posture.
  - Use when: Changing auth/session logic, RBAC, RLS, service-role usage, Midtrans callbacks, redirects, env vars, API routes, or anything exposing member/financial data.
  - Quality bar: Least privilege, server-side authorization, no secret leakage, safe redirects, verified callback signatures, clear separation of anon versus service-role clients, no sensitive data in logs.
  - Output: Findings ordered by severity, exploit scenario, affected files, fix recommendation, and residual risk.

- `explorer`
  - Mission: Perform read-only investigation quickly and precisely.
  - Use when: Mapping routes, tracing dependencies, finding mock data, comparing schema to helpers, locating RBAC enforcement, or answering focused repo questions.
  - Output: Concise map with file references, facts, risks, and recommended next agent.

- `worker`
  - Mission: Implement a narrow, explicitly owned slice.
  - Use when: The task has a disjoint write scope such as only `src/lib/db/*`, only `src/app/api/*`, only `supabase/schema.sql`, or only one route group.
  - Output: Changed files, behavior summary, verification, and handoff notes.

- `reviewer`
  - Mission: Provide professional code review. Lead with bugs, regressions, missing tests, and operational risk.
  - Use when: Asked to review, audit, validate, or check readiness.
  - Output: Findings first, ordered by severity, with file/line references; then open questions, test gaps, and a short summary.

## Agent Collaboration Playbooks

- Product feature: `ceo-product-agent` defines business goal and acceptance criteria, `ui-ux-agent` maps the flow, `modern-design-agent` sets visual direction, `frontend-agent` implements, `reviewer` checks quality.
- Owner dashboard: `ceo-product-agent` chooses KPIs, `database-agent` validates source data and query shape, `modern-design-agent` defines premium dashboard layout, `frontend-agent` builds, `security-agent` checks financial data access.
- Membership and payments: `ceo-product-agent` defines packages and success metrics, `database-agent` owns membership/payment tables, `backend-agent` owns Midtrans/API behavior, `frontend-agent` owns checkout UI, `security-agent` reviews callbacks and authorization.
- Auth and RBAC hardening: `explorer` maps current enforcement, `security-agent` identifies risks, `database-agent` reviews RLS and role tables, `backend-agent` fixes server checks, `reviewer` validates regressions.
- Mock-to-live migration: `explorer` finds mock data usage, `database-agent` confirms schema support, `backend-agent` creates/adjusts data access, `frontend-agent` replaces UI data wiring, `ui-ux-agent` reviews loading/empty/error states.

## Quality Gates

- Product: The user, business value, success metric, and non-goals are clear.
- Design: The interface feels modern, premium, responsive, and intentional; no generic filler UI.
- UX: Main workflows include loading, empty, success, error, and permission-denied states.
- Frontend: Components fit mobile and desktop, avoid unnecessary client components, and follow local UI conventions.
- Backend: APIs validate input, enforce authorization server-side, and return predictable errors.
- Database: Schema, helper code, RLS, indexes, and seed/demo expectations stay aligned.
- Security: Secrets stay server-only, service-role usage is justified, callbacks are verified, and sensitive data is not overexposed.
- Verification: Run targeted checks for small changes; run lint/build or broader checks for shared behavior, auth, payments, schema, or routing changes.

## Helpful Skills

Prefer these skills when the task matches them:

- `openai-docs`: Use for current OpenAI API, Codex, or model guidance.
- `github:github`: Use for GitHub repo, issue, and PR orientation.
- `github:gh-fix-ci`: Use when GitHub Actions or PR checks fail.
- `github:gh-address-comments`: Use to inspect and address PR review comments.
- `github:yeet`: Use when asked to commit, push, and open a draft PR.
- `vercel-deploy`: Use when asked to deploy this Next.js app to Vercel.
- `netlify-deploy`: Use when asked to deploy to Netlify.
- `cloudflare-deploy`: Use when asked to deploy to Cloudflare.
- `imagegen`: Use for bitmap assets, marketing images, mockups, textures, or generated visuals.
- `skill-creator` / `skill-installer`: Use when creating, updating, listing, or installing Codex skills.

## Repo Notes

- This app uses Next.js App Router with route groups for public, auth, owner, admin, and member areas.
- Supabase Auth/Postgres and custom RBAC are central to the app. Check schema, helper functions, and route protection together.
- Midtrans payment code should be treated carefully; verify callback signature behavior when changing payment flows.
- Some app surfaces may still use mock data from `src/data/gym.ts`; confirm whether a task expects demo data or live Supabase data.

## Work Log

### 2026-06-28 - Auth/RBAC Dashboard Redirect Repair

- Agents/skills used: `explorer`, `backend-agent`, `database-agent`, `security-agent`, and `frontend-agent` operating model from this file.
- Docs checked before code changes: Next.js local docs for Authentication, Proxy, Route Handlers, and Redirecting in `node_modules/next/dist/docs/01-app`.
- Problem addressed: users could login but fail to land on the proper owner/admin/member dashboard.
- Changes made:
  - Added centralized role/dashboard routing helper in `src/lib/auth-routing.ts`.
  - Updated `loginAction` to resolve role through the admin DB helper, reject missing roles with a clear message, and respect safe `next` paths only when the role is allowed.
  - Fixed Supabase auth callback cookie propagation in `src/app/auth/callback/route.ts` so `exchangeCodeForSession` persists session cookies on the redirect response.
  - Updated `src/proxy.ts` protected-route behavior to resolve roles through the server-side role helper, preserve intended `next` paths, detect missing roles, and redirect users to their proper dashboard instead of silently sending them home.
  - Removed stale `auth_user_id` insert from `src/lib/db/users.ts` because `supabase/schema.sql` uses `users.id = auth.users.id`.
  - Updated homepage login modal wiring and Dashboard links so role-based dashboard paths are used.
  - Changed `/login` to open the homepage login modal via `/?action=login`.
  - Updated `.env.example` with the env names actually required by the code.
- Verification:
  - `npm test -- --runTestsByPath src/__tests__/scenarios/login.scenario.test.ts --maxWorkers=1` passed.
  - `npx tsc --noEmit` passed.
  - `npm run build` passed with Node 20 after sandbox escalation for Turbopack.
  - ESLint passed on all files changed by this auth/RBAC repair.
- Known repo-wide follow-up:
  - Full `npm run lint` still fails because existing repo artifacts and unrelated files are linted, including `coverage/`, `test-results/`, `src/__tests__/scenarios/member.scenario.test.ts`, `src/app/member/dashboard/page.tsx`, `src/app/member/nutrition/page.tsx`, `src/components/member/check-in-panel.tsx`, and `src/hooks/use-mobile.ts`.

### 2026-06-28 - Default Member Role and Demo Login Seed

- Agents/skills used: `backend-agent`, `database-agent`, `security-agent`, and `frontend-agent` operating model from this file.
- Docs checked before code changes: Next.js local docs for Authentication and Route Handlers in `node_modules/next/dist/docs/01-app`.
- Problem addressed: newly registered or older auth users could login but show "role dashboard belum terpasang" instead of becoming `MEMBER` by default.
- Changes made:
  - Made `src/lib/db/users.ts` role/profile operations idempotent with `upsertUserProfile`, `ensureRole`, `ensureUserRole`, and `getUserRoleOrAssignDefault`.
  - Updated `registerAction` so every public registration always creates/updates the app profile and assigns `MEMBER`.
  - Updated `loginAction` so existing users without a role are repaired to `MEMBER` automatically.
  - Added temporary demo account definitions in `src/lib/demo-accounts.ts`.
  - Added protected/idempotent seed endpoint at `src/app/api/auth/seed-demo/route.ts`.
  - Added Owner/Admin/Member demo fill buttons and a Seed button inside the homepage login popup.
  - Updated `src/lib/supabase-server.ts` admin client with `ws` realtime transport for Node 20.
  - Seeded and verified demo accounts in the connected Supabase project:
    - `owner@gym.test` / `OwnerDemo123!`
    - `admin@gym.test` / `AdminDemo123!`
    - `member@gym.test` / `MemberDemo123!`
- Verification:
  - `npm test -- --runTestsByPath src/__tests__/scenarios/login.scenario.test.ts src/__tests__/scenarios/register.scenario.test.ts --maxWorkers=1` passed.
  - `npx tsc --noEmit` passed.
  - ESLint passed on changed auth/register/seed files.
  - `npm run build` passed with Node 20 after sandbox escalation for Turbopack.
  - Supabase password login was verified for the demo OWNER, ADMIN, and MEMBER accounts without printing tokens.

### 2026-06-29 - Landing/Auth/Dashboard UI/UX Optimization

- Agents/skills used: `explorer` for read-only repo audit, plus the `modern-design-agent`, `ui-ux-agent`, and `frontend-agent` operating model from this file.
- Docs checked before code changes: Next.js local docs for App Router layouts/pages, Server and Client Components, and CSS in `node_modules/next/dist/docs/01-app/01-getting-started`.
- Problem addressed: improve landing/auth/mobile/dashboard usability across owner, admin, and member flows after the RBAC/login repair.
- Changes made:
  - Added reusable `DashboardPageHeader` for clearer role-specific page hierarchy.
  - Added a working public mobile navigation sheet so the landing page mobile menu is no longer a dead button.
  - Improved login/register modal mobile behavior with bounded height, scroll, labels, ARIA affordances, and preserved demo account shortcuts.
  - Refined dashboard shell spacing, sticky header treatment, responsive content padding, and role status chip behavior.
  - Improved dashboard metric cards, data tables, and chart formatting for Indonesian copy, currency readability, responsive overflow, and cleaner visual hierarchy.
  - Improved owner/admin/member dashboard copy and layout, including member check-in recovery with GPS retry and clearer disabled states.
  - Hid the sidebar user footer on small dashboard layouts to avoid mobile overlap from the sidebar system.
- Verification:
  - Playwright screenshots checked for landing mobile, login mobile, owner dashboard desktop, member dashboard mobile, and role dashboard surfaces.
  - Verified `/?action=login` opens the login modal on mobile.
  - `npx tsc --noEmit` passed.
  - ESLint passed on all files changed by this UI/UX pass.
  - `npm test -- --runTestsByPath src/__tests__/scenarios/login.scenario.test.ts src/__tests__/scenarios/register.scenario.test.ts --maxWorkers=1` passed.
  - `npm run build` passed with Node 20 after sandbox escalation for Turbopack.

### 2026-06-29 - Functional Feature Buildout Phase 1

- Agents/skills used: `explorer` subagent for read-only feature mapping, plus `backend-agent`, `database-agent`, `frontend-agent`, `ui-ux-agent`, and `security-agent` operating model from this file.
- Docs checked before code changes: Next.js local docs for App Router layouts/pages, Server and Client Components, Forms/Server Actions, and Route Handlers in `node_modules/next/dist/docs/01-app`.
- Problem addressed: start making core premium gym features functional instead of placeholder-only: branch location, nutrition, workout program, premium feature management, profile settings, and subscription payment UX.
- Changes made:
  - Added Leaflet for owner/admin branch map input and member gym map display.
  - Added secure server actions for branch location, premium feature toggles, nutrition logging/targets, workout program saving, and member profile updates.
  - Added owner/admin branch settings UI with latitude, longitude, radius, contact fields, click-to-set map, and DB-backed branch persistence.
  - Updated member check-in/dashboard/manual check-in surfaces to use DB branch location instead of hardcoded coordinates and to show the gym map to members.
  - Added DB-backed nutrition target/log UI for food name, calories, macros, weight, target BMI, target calories, and recent history.
  - Added DB-backed workout program tree UI for program, day, exercise, type, sets, reps, and load notes.
  - Replaced premium feature mock cards with DB-backed owner/admin feature toggles and added admin route/sidebar access.
  - Rebuilt member profile settings with editable name/phone and member account summary.
  - Improved member billing so plans can be purchased from the portal through the existing Midtrans transaction API.
  - Updated `supabase/schema.sql` and added `supabase/feature-upgrade-2026-06-29.sql` for existing databases.
- Verification:
  - `npx tsc --noEmit` passed.
  - ESLint passed on all files changed by this feature phase.
  - `npm test -- --runTestsByPath src/__tests__/scenarios/login.scenario.test.ts src/__tests__/scenarios/register.scenario.test.ts --maxWorkers=1` passed.
  - `npm run build` passed with Node 20 after sandbox escalation for Turbopack.
- Operational note:
  - Existing Supabase projects must apply `supabase/feature-upgrade-2026-06-29.sql` before the new nutrition target and workout persistence pages can write to the new tables.

### 2026-06-29 - Branch Location Map Search Fix

- Problem addressed: Leaflet import caused a build/runtime error and the branch location map needed searchable location input with the saved pin using the selected coordinates.
- Changes made:
  - Changed Leaflet usage in branch map components to dynamic browser-only imports so server/build paths do not import `leaflet` directly.
  - Added OpenStreetMap/Nominatim search UI to the branch location form.
  - Selecting a search result now updates the map pin, latitude, longitude, and address field before saving.
  - Kept manual latitude/longitude editing and map click-to-pin behavior for precision adjustments.
- Verification:
  - `npx tsc --noEmit` passed.
  - ESLint passed on the branch location files and related actions/pages.
  - `npm run build` passed with Node 20 after sandbox escalation for Turbopack.

### 2026-06-29 - Branch Location Map Reliability and Precise Search

- Problem addressed: branch location map rendering looked broken, location search was too coarse, and save failures did not expose useful errors.
- Changes made:
  - Replaced static Leaflet element ids with DOM refs and added `invalidateSize` plus `ResizeObserver` so tiles render correctly inside responsive cards.
  - Normalized dynamic Leaflet imports to support runtime default exports.
  - Added `/api/geo/search` as a server-side Nominatim proxy with Indonesian language, namedetails, extratags, fallback query, and result dedupe.
  - Updated branch location search to use the internal API so place/building names are more likely to resolve than browser-side direct search.
  - Added server-action error handling and visible field validation details for failed location saves.
- Verification:
  - `npx tsc --noEmit` passed.
  - ESLint passed on branch location/API files.
  - `npm run build` passed with Node 20 after sandbox escalation for Turbopack.
