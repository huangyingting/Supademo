# 06 — Acceptance Criteria & Feature-Parity Matrix

## 1. Acceptance Criteria (Given / When / Then)

### AC-1: CLI-Only Bootstrap Admin & Zero HTTP Bootstrap Surface
- **Given** an empty database (`0` users),
- **When** the administrator runs `BOOTSTRAP_ADMIN_EMAIL=admin@supademo.local BOOTSTRAP_ADMIN_PASSWORD=AdminPass123! npm run bootstrap:admin`,
- **Then** an active `ADMIN` user and default workspace are created, a `BOOTSTRAP_ADMIN_CREATED` entry is recorded in `AuditLog`, and re-running `npm run bootstrap:admin` exits with `BOOTSTRAP_ALREADY_COMPLETED`.
- **And** requesting `/api/bootstrap` or `/api/admin/bootstrap` returns `404 Not Found`.

### AC-2: Fail-Closed Invite-Only Public Registration
- **Given** `AUTH_ADMISSION_MODE` is `"invite_only"` (or unset),
- **When** an uninvited visitor navigates to `/signup` or `POST /api/auth/register` without a valid invitation token,
- **Then** public self-registration is blocked with `403 INVITATION_REQUIRED`, and an `INVITE_REJECTED` audit event is logged.

### AC-3: Single-Use, Email-Bound, Expiring & Revocable Invitation Codes
- **Given** an authenticated `ADMIN` user at `/settings/members` or `/admin/invitations`,
- **When** they create an invitation for `creator@acme.io` with role `CREATOR` and TTL `72 hours`,
- **Then** the UI displays the one-time `/invite/[token]` (and `/join/[token]`) link, the DB stores only the 64-char SHA-256 `tokenHash`, and an `INVITE_CREATED` audit log is persisted.
- **When** `creator@acme.io` visits `/invite/[token]` and submits their name and password,
- **Then** the invitation transitions atomically to `ACCEPTED`, the user is created with role `CREATOR`, an `INVITE_ACCEPTED` audit log is written, and any second attempt to use the same token fails with `410 INVITATION_ALREADY_USED`.
- **When** an `ADMIN` revokes a pending invitation before use,
- **Then** visiting `/invite/[token]` or `/join/[token]` displays `"This invite link isn't valid — The link may have been revoked or replaced"` and rejects registration with `410 INVITATION_REVOKED`.

### AC-4: Role-Based Access Control (RBAC) & Immediate Session Revocation
- **Given** a user signed in with role `VIEWER` or `CREATOR`,
- **When** they attempt to call `POST /api/invitations` or `POST /api/invitations/[id]/revoke`,
- **Then** the server responds with `403 Forbidden`.
- **When** an `ADMIN` changes a member's status to `DISABLED` in `/settings/members`,
- **Then** `getCurrentSessionUser()` immediately returns `null` for that member's session and records `USER_STATUS_CHANGED` in `AuditLog`.

### AC-5: Interactive Demo Editor (`/demo/[id]/edit`) & Player (`/demo/[id]`)
- **Given** an authenticated `ADMIN` or `CREATOR` opening `/demo/[id]/edit`,
- **When** they add/edit steps, customize `Hotspot` (style, color, backdrop, radius, animation, branching action), add `Blur & Annotate` masks, configure `Voiceover`, `Animation`, `Chapter` (`Default`, `Form`, `Embed`, `Password`), `Personalize` (`{{name}}`, `{{company}}`), or run `Enhance with AI` (`AI Audit`, `AI Text`, `AI Voice`, `AI Translate`, `AI Command`),
- **Then** changes persist to SQLite/PostgreSQL, version snapshots can be created/restored, and `/demo/[id]` renders the interactive tour with variable replacement, lead capture form submission, voiceover playback, and analytics tracking.

### AC-6: AI Demo Agents, Showcases, In-App Demo Hubs, Route Hubs, Analytics & 13 Settings Pages
- **Given** an authenticated workspace user,
- **Then** they can:
  1. Create & configure an **AI Demo Agent** (`/agents`, `/agent/[id]/edit`) across all 14 sub-tabs and test live buyer discovery conversations.
  2. Build & share a multi-section **Showcase** (`/showcases`, `/showcase/[id]/edit`, `/showcase/[id]`) with `Top Bar` or `Sidebar` layout.
  3. Customize & preview an embeddable **In-App Demo Hub** (`/hubs`, `/hub/[id]`) across `Appearance`, `Content`, and `Install` tabs.
  4. Build a conditional **Route Hub** (`/routes`, `/route/new`, `/route/[id]/edit`, `/route/[id]/share`) with visual node routing (`FORM` → `INTEGRATIONS` → `ROUTE` → `SHOWCASE`).
  5. Inspect **Analytics** (`/analytics`) for both Supademos and Showcases (`Total Views`, `Engaged Views`, `Recent Viewers`, `Recent Accounts`, `Most Viewed`, `Device & Location`) and export CSV.
  6. Configure all **13 `/settings/*` sections** (`brand`, `demo-player`, `custom-domain`, `general`, `members`, `billing`, `api`, `security`, `demo-versioning`, `integrations`, `profile`, `tags`, `pronunciation-library`).

---

## 2. Feature-Parity Matrix (`supademo.com` & `app.supademo.com` vs. Local Implementation)

| Feature Category | Upstream (`supademo.com` / `app.supademo.com`) | Our Implementation | Parity Status |
|---|---|---|---|
| **Marketing Site (`/`, `/pricing`, `/features/*`, `/ai/*`, `/showcase`, `/integrations`, `/enterprise`)** | Interactive product demo hero, 5 pricing tiers, feature/AI landing pages | Full responsive pages with interactive hero demo player, pricing calculator, feature & AI showcases | 100% Parity |
| **5-Stage Onboarding (`/welcome`)** | `?stage=role`, `useCase`, `source`, `getStarted`, `getStartedCreate` + 14-day Growth trial | Full 5-stage wizard with workspace configuration and 14-day Growth trial activation | 100% Parity |
| **Invite-Only Admission, Single-Use Codes, RBAC, Revocation & Audit Log** | `/login`, `/signup`, `/join/[token]`, `/settings/members` | Enhanced fail-closed invite-only admission, SHA-256 single-use expiring tokens, 4 RBAC roles (`ADMIN`, `CREATOR`, `BILLING_ADMIN`, `VIEWER`), instant revocation, `AuditLog` table + UI, CLI-only `bootstrap:admin` | 100% Parity + Enterprise Hardening |
| **Home Dashboard & AI Command (`/home`, `/command`, `#command-dock`)** | Onboarding checklist, playbooks, persistent right-hand AI Command dock & MCP | Interactive checklist, playbooks, full `/command` studio + slide-out `#command-dock` assistant & MCP config | 100% Parity |
| **Supademos Library (`/demos`)** | `Supademos` & `Screenshots` tabs, `Shared with Team`/`Personal`/`Archived`, folders, tags, filters, 5 creation modes | Full library with tabs, scopes, folders, tags, multi-filter bar, Grid/List view, and 5-mode `Create Supademo` modal | 100% Parity |
| **Interactive Demo Editor (`/demo/[id]/edit`)** | 7 top tools (`Hotspot`, `Blur & Annotate`, `Voiceover`, `Animation`, `Chapter`, `Personalize`, `Enhance with AI`), bottom bar, Share, Version History | Complete interactive editor with all 7 tool panels, non-destructive blur/callout canvas, 12 AI voices, 5-tab AI Enhance modal, backgrounds, comments, version history, and share modal | 100% Parity |
| **Public & Embeddable Demo Player (`/demo/[id]`)** | Chapter covers, lead forms, password gate, dynamic `{{variables}}`, voiceover, autoplay, sandbox mode | Full player supporting chapters, lead capture forms, password gate, URL variable personalization, Web Speech / audio voiceover, autoplay, and live telemetry | 100% Parity |
| **Videos Library (`/videos`)** | Video recordings library + convert to interactive Supademo | Video upload/recording library, playback modal, and 1-click conversion into multi-step interactive Supademo | 100% Parity |
| **AI Demo Agents (`/agents`, `/agent/[id]/edit`)** | 1,500 credits, Readiness checker, 14 sub-tabs (`Identity`, `Interface`, `Guardrails`, `Quick Links`, `Security`, `Demos`, `Videos`, `Documents`, `Websites`, `Text`, `Insights`, `Sessions`, `Triggers`, `Knowledge gaps`) | All 14 builder sub-tabs, credit meter, Readiness checker modal, and interactive AI Agent discovery chat widget | 100% Parity |
| **Showcases (`/showcases`, `/showcase/[id]/edit`, `/showcase/[id]`)** | Multi-section collections (`Demo`, `Video`, `PDF`, `Link`), `Top Bar` / `Sidebar` layout | Full Showcase editor, resource modal (`Demo`, `Video`, `PDF`, `Link`), layout toggle, and public multi-demo Showcase player | 100% Parity |
| **In-App Demo Hubs (`/hubs`, `/hub/[id]`)** | `Appearance`, `Content`, `Install` tabs + floating searchable help widget | Full 3-tab Demo Hub builder + interactive live floating In-App Hub preview widget with instant search | 100% Parity |
| **Route Hubs (`/routes`, `/route/new`, `/route/[id]/edit`, `/route/[id]/share`)** | 3 entry modes, visual node graph (`FORM`, `INTEGRATIONS`, `ROUTE`, `SHOWCASE`), `Style`, `Analytics`, `Share` | Entry-mode wizard, interactive visual node canvas (`FORM` → `INTEGRATIONS` → `ROUTE` → `SHOWCASE`), and buyer qualification player | 100% Parity |
| **Analytics (`/analytics`)** | `Supademo Analytics` & `Showcase Analytics`, views chart, viewers, accounts, most viewed, device/location, CSV export | Full analytics dashboard with time-series SVG chart, date filter, viewers & accounts tables, OS/Browser/Location bars, and CSV export | 100% Parity |
| **13 Settings Sections (`/settings/*`) & `/upgrade`** | All 13 settings routes + 5-tier upgrade page | All 13 `/settings/[section]` pages with persistent database updates + `/upgrade` plan comparison | 100% Parity |
