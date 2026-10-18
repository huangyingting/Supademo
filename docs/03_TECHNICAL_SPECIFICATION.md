# 03 — Technical Specification

## 1. Technology Stack

- **Framework**: Next.js `^16.4.2` (App Router, Server & Client Components, Route Handlers)
- **UI Runtime**: React `^19.0.0`, Tailwind CSS v4, `lucide-react` icons
- **Authentication**: `next-auth` `^4.24.15` (Credentials + OAuth adapters with server-side session re-validation and fail-closed invite-only admission policy)
- **ORM & Database**: Prisma `^7.10.1` (`@prisma/client`, `@prisma/adapter-better-sqlite3` for local dev/test SQLite, `@prisma/adapter-pg` for production PostgreSQL)
- **Password Hashing**: Node.js `crypto.scrypt` with 16-byte random salt and constant-time `crypto.timingSafeEqual` verification
- **Invitation Token Cryptography**: 32-byte CSPRNG `base64url` token (`crypto.randomBytes(32)`); only `SHA-256` hex digest (`tokenHash`) is persisted in DB
- **End-to-End Verification**: Playwright (`@playwright/test`) verifying desktop (`1440×900`) and mobile (`390×844`) layouts and workflows

---

## 2. Route Specification

### 2.1 Public Marketing Routes (`supademo.com` Parity)
- `GET /` — Marketing Home with interactive demo hero player, feature pillars, customer stories, and ROI calculator
- `GET /pricing` — Pricing tiers (`Free`, `Scale $38`, `Business $199`, `Growth $350`, `Enterprise`), monthly/annual toggle, feature matrix
- `GET /features` & `GET /features/[slug]` — Feature pages (`demo-recorder`, `demo-editor`, `screen-recorder`, `personalization`, `sandbox-demos`, `route-hub`, `demo-hub`, `analytics`, `guided-demos`)
- `GET /ai/[slug]` — AI product pages (`command`, `demo-agents`)
- `GET /showcase` — Public gallery of customer & template showcases
- `GET /integrations` — Showcase of 9 native CRM/analytics/enablement integrations
- `GET /enterprise` — Enterprise security, SOC 2, SSO, regional residency, and governance overview
- `GET /solutions` & `GET /product-demo` — Solutions by role/use-case and interactive product tour

### 2.2 Authentication, Admission & Onboarding Routes
- `GET /login` — Email/password + OAuth sign-in with workspace session redirect
- `GET /signup` — Fail-closed invite-only notice (with direct token entry box) when `invite_only` is active
- `GET /invite/[token]` & `GET /join/[token]` — Invitation redemption page displaying workspace, inviter, role, expiry, and locked email registration form (plus revoked/expired/used/invalid error states)
- `GET /welcome` — 5-stage onboarding wizard (`?stage=role`, `useCase`, `source`, `getStarted`, `getStartedCreate`)
- `GET /admin/invitations` — Dedicated enterprise invitation & audit log administration console

### 2.3 Authenticated Workspace Routes (`app.supademo.com` Parity)
- `GET /home` — Workspace home dashboard, 4-step checklist, playbooks, recent Supademos, AI Command Dock
- `GET /command` — Full-page AI Command conversational studio & MCP setup
- `GET /demos` — Supademos & Screenshots library (`Shared with Team`, `Personal`, `Archived`, folders, tags, filters, creation modal)
- `GET /demo/[id]/edit` — Full Interactive Demo Editor (Left Step Rail, 7 Top Tools: `Hotspot`, `Blur & Annotate`, `Voiceover`, `Animation`, `Chapter`, `Personalize`, `Enhance with AI`, Bottom Canvas Bar, Share modal, Version History)
- `GET /demo/[id]` — Public & embeddable interactive demo player (supports `?embed=1`, `?name=...&company=...`, password gate, lead capture form, voiceover, autoplay, sandbox mode)
- `GET /videos` — Screen & video recordings library with 1-click "Convert to Interactive Supademo"
- `GET /agents` & `GET /agent/[id]/edit` — AI Demo Agents library & 14-tab Agent Builder + live interactive AI Agent test widget
- `GET /showcases`, `GET /showcase/[id]/edit`, `GET /showcase/[id]` — Showcases library, multi-section editor (`Top Bar` / `Sidebar`), and public multi-demo showcase player
- `GET /hubs` & `GET /hub/[id]` — In-App Demo Hubs library and 3-tab editor (`Appearance`, `Content`, `Install`) + live interactive widget launcher
- `GET /routes`, `GET /route/new`, `GET /route/[id]/edit`, `GET /route/[id]/share` — Route Hubs library, entry-mode wizard, visual node canvas (`FORM`, `INTEGRATIONS`, `ROUTE`, `SHOWCASE`), and public qualification router
- `GET /analytics` — `Supademo Analytics` & `Showcase Analytics` dashboard, time-series charts, viewers/accounts table, device/location breakdown, CSV export
- `GET /upgrade` — Plan upgrade & Growth trial selector
- `GET /settings` & `GET /settings/[section]` — All 13 settings pages (`brand`, `demo-player`, `custom-domain`, `general`, `members`, `billing`, `api`, `security`, `demo-versioning`, `integrations`, `profile`, `tags`, `pronunciation-library`)

---

## 3. REST API Specification (`/api/*`)

### 3.1 Auth, Invitations, Members & Audit Logs
- `POST /api/auth/[...nextauth]` — NextAuth handler (Credentials + OAuth callbacks enforcing `authorizeInvitedOAuthSignIn`)
- `GET /api/invitations` / `POST /api/invitations` — List & issue single-use SHA-256 hashed invitations (`ADMIN` only; writes `INVITE_CREATED` audit log)
- `GET /api/invitations/verify?token=...` — Verify raw invitation token status (`VALID`, `INVALID`, `EXPIRED`, `REVOKED`, `ALREADY_USED`)
- `POST /api/invitations/[id]/revoke` — Revoke pending invitation (`ADMIN` only; writes `INVITE_REVOKED` audit log)
- `POST /api/auth/register` — Redeem invitation token and register account inside a serializable transaction (`writes INVITE_ACCEPTED` or `INVITE_REJECTED` audit log)
- `GET /api/members` / `PATCH /api/members/[id]` — List workspace members, update RBAC role (`ADMIN`, `CREATOR`, `BILLING_ADMIN`, `VIEWER`), or suspend/reactivate user (`ACTIVE` / `DISABLED`), recording `MEMBER_ROLE_UPDATED` / `USER_STATUS_CHANGED` audit logs
- `GET /api/audit-logs` — Query tamper-evident `AuditLog` entries filtered by action, actor, or target

### 3.2 Demos, Steps, Versions, AI & Analytics
- `GET /api/demos` / `POST /api/demos` — List demos (filtered by `scope`, `folderId`, `tag`, `search`, `type`) and create new demos (`EXTENSION`, `UPLOAD`, `HTML`, `SANDBOX`, `AI_COMMAND`)
- `GET /api/demos/[id]` / `PATCH /api/demos/[id]` / `DELETE /api/demos/[id]` — Read, update, duplicate, archive, or delete demo and its ordered `DemoStep` slides
- `POST /api/demos/[id]/steps` / `PATCH /api/demos/[id]/steps/[stepId]` / `DELETE /api/demos/[id]/steps/[stepId]` — Manage step slides, hotspots, annotations, voiceovers, zoom/pan, and chapter gates
- `GET /api/demos/[id]/versions` / `POST /api/demos/[id]/versions` — Create and restore published `DemoVersion` snapshots
- `POST /api/demos/[id]/ai` — Run `AI Audit`, `AI Text` rewrite, `AI Voice` synthesis, `AI Translate`, or `AI Command` mutations on a demo
- `POST /api/ai/command` — Conversational AI Command endpoint that can inspect workspace metrics, create a new multi-step demo, or audit existing demos
- `GET /api/videos` / `POST /api/videos` / `POST /api/videos/[id]/convert` — Manage video recordings and convert videos into multi-step interactive Supademos
- `GET /api/agents` / `POST /api/agents` / `PATCH /api/agents/[id]` / `POST /api/agents/[id]/chat` — Manage 14-tab AI Demo Agents and run interactive buyer discovery chat sessions
- `GET /api/showcases` / `POST /api/showcases` / `PATCH /api/showcases/[id]` — Manage multi-section Showcases
- `GET /api/hubs` / `POST /api/hubs` / `PATCH /api/hubs/[id]` — Manage embeddable In-App Demo Hubs
- `GET /api/routes` / `POST /api/routes` / `PATCH /api/routes/[id]` / `POST /api/routes/[id]/submit` — Manage Route Hubs and evaluate lead/intent routing rules
- `GET /api/analytics` / `POST /api/analytics/events` — Record viewer telemetry (`VIEW`, `STEP_VIEW`, `COMPLETION`, `LEAD_CAPTURE`, `CTA_CLICK`) and compute workspace/showcase analytics
- `GET /api/settings` / `PATCH /api/settings` — Read and update all 13 workspace settings categories
