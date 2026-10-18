# 05 — Implementation Plan & Task Backlog

## 1. Phased Implementation Plan

### Phase 1: Project Scaffolding & Dual-Database Prisma 7 Setup (`scaffold-and-db`)
1. Initialize Next.js 16 + React 19 + TypeScript + Tailwind CSS v4 project structure in `/home/azadmin/Supademo`.
2. Author `prisma/schema.prisma` (SQLite local dev) and `prisma/schema.postgres.prisma` (PostgreSQL production) plus `prisma.config.ts` and `src/lib/prisma.ts` dual-adapter client.
3. Create deterministic database seed (`prisma/seed.ts`) populating realistic Supademos (multi-step guided tour, HTML/Sandbox demo, Lead-Gen Chapter demo), Videos, AI Demo Agent, Showcase, In-App Demo Hub, Route Hub, Tags, Folders, Analytics events, Lead captures, and 13 Settings configurations.

### Phase 2: Fail-Closed Invite-Only Admission, RBAC, Revocation & Audit Logging (`implement-auth-admission`)
1. Implement `src/lib/account-admission/` (`errors.ts`, `policy.ts`, `tokens.ts`, `passwords.ts`, `bootstrap.ts`, `invitations.ts`, `registration.ts`, `credentials.ts`, `social.ts`, `session.ts`, `audit.ts`, `index.ts`).
2. Implement CLI-only bootstrap administrator script `scripts/bootstrap-admin.ts` (`npm run bootstrap:admin`) with zero HTTP bootstrap endpoints.
3. Implement NextAuth configuration (`src/lib/auth.ts`, `/api/auth/[...nextauth]/route.ts`) with active database session re-validation (`status === 'ACTIVE'` and live RBAC `role`) and OAuth invitation enforcement.
4. Build `/login`, `/signup` (fail-closed invite-only barrier + token input), `/invite/[token]` & `/join/[token]` (invitation redemption + invalid/revoked/expired/used states), `/welcome` (5-stage onboarding wizard), `/admin/invitations`, and `/settings/members` + `/settings/security` audit log viewers.

### Phase 3: Supademo Marketing Site & Core Workspace Surfaces (`implement-supademo-features`)
1. Implement public marketing pages (`/`, `/pricing`, `/features`, `/features/[slug]`, `/ai/[slug]`, `/showcase`, `/integrations`, `/enterprise`, `/solutions`, `/product-demo`).
2. Implement authenticated Workspace Shell (responsive collapsible sidebar, `Create Supademo` modal, persistent right-hand `#command-dock` AI Command assistant, trial banner, and mobile drawer).
3. Implement `/home` dashboard, `/command` AI Command studio, and `/demos` library (`Supademos` & `Screenshots` tabs, `Shared with Team` / `Personal` / `Archived`, folders, tags, filters, Grid/List view).
4. Implement `/demo/[id]/edit` Interactive Demo Editor with all 7 top toolbar tools (`Hotspot`, `Blur & Annotate`, `Voiceover`, `Animation`, `Chapter`, `Personalize`, `Enhance with AI`), bottom canvas controls (`Backgrounds`, `Resize & Crop`, `Comments`, `Hide browser bar`, `Toggle dark mode`, `Zoom`), `Share` modal, and `Version History`.
5. Implement `/demo/[id]` public & embeddable interactive demo player with dynamic variable interpolation (`{{name}}`, `{{company}}`), chapter lead-capture forms, password protection, voiceover synthesis/playback, autoplay, sandbox mode, and live telemetry.
6. Implement `/videos`, `/agents` & `/agent/[id]/edit` (14 sub-tabs + live agent preview), `/showcases` & `/showcase/[id]/edit` & `/showcase/[id]`, `/hubs` & `/hub/[id]` (`Appearance`, `Content`, `Install` + live floating widget), `/routes` & `/route/new` & `/route/[id]/edit` & `/route/[id]/share` (visual node canvas + buyer routing player), `/analytics`, `/upgrade`, and all 13 `/settings/[section]` pages.

### Phase 4: Build, Database Provisioning & Playwright E2E Verification (`verify-and-test`)
1. Run `npm run db:setup` and verify `npm run bootstrap:admin` CLI workflow.
2. Run `npm run build` to verify zero TypeScript or Next.js build errors.
3. Execute comprehensive Playwright E2E test suite (`tests/e2e/supademo.spec.ts`) across desktop (`1440×900`) and mobile (`390×844`) viewports testing marketing pages, fail-closed invite-only admission, single-use invitation lifecycle, revocation, RBAC roles, audit logs, demo editor, public player, AI tools, showcases, demo hubs, route hubs, analytics, and settings.

---

## 2. Prioritized Task Backlog

| ID | Epic | Task Title | Priority | Est. | Status |
|---|---|---|---|---|---|
| `SD-01` | Exploration | Playwright reverse-engineering of `supademo.com` & `app.supademo.com` (151 screenshots, 21 API captures) | P0 | 5 pts | Done |
| `SD-02` | Documentation | Author ADR, PRD, Technical Spec, Architecture/Data Model, Backlog, Acceptance & Parity docs | P0 | 3 pts | In Progress |
| `SD-03` | Database | Configure Prisma 7 dual-adapter schema (`SQLite` + `PostgreSQL`), migrations & rich workspace seed | P0 | 5 pts | Pending |
| `SD-04` | Security / Auth | Implement `src/lib/account-admission/*`, SHA-256 tokens, RBAC, revocation, `AuditLog`, and `bootstrap:admin` CLI | P0 | 8 pts | Pending |
| `SD-05` | Marketing | Build `supademo.com` marketing pages (`/`, `/pricing`, `/features/*`, `/ai/*`, `/showcase`, `/integrations`, `/enterprise`) | P1 | 5 pts | Pending |
| `SD-06` | Core App | Build Workspace Shell, `/welcome` 5-stage wizard, `/home`, `/command`, `#command-dock`, and `/demos` library | P0 | 8 pts | Pending |
| `SD-07` | Demo Editor | Build `/demo/[id]/edit` (7 top tools, annotations, voiceover, AI enhance, versions, share) & `/demo/[id]` player | P0 | 13 pts | Pending |
| `SD-08` | GTM & AI Suite | Build `/videos`, `/agents` (14-tab builder), `/showcases` (editor + player), `/hubs` (3-tab widget), `/routes` (node canvas) | P0 | 13 pts | Pending |
| `SD-09` | Analytics & Settings | Build `/analytics` (demos + showcases, CSV export), `/upgrade`, and all 13 `/settings/[section]` pages | P0 | 8 pts | Pending |
| `SD-10` | QA & Deployment | Add Dockerfile, `docker-compose.yml`, and Playwright E2E test suite verifying all user journeys | P0 | 5 pts | Pending |
