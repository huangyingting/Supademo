# 01 — Architecture Decision Records (ADR)

## ADR-001: Next.js 16 App Router Full-Stack Architecture

- **Status**: Accepted
- **Context**: `supademo.com` and `app.supademo.com` serve both SEO-rich marketing pages (`/`, `/pricing`, `/features/*`, `/ai/*`, `/showcase`, `/integrations`, `/enterprise`), public low-latency embeddable players (`/demo/[id]`, `/showcase/[id]`, `/hub/[id]/embed`, `/route/[id]/share`), and a stateful multi-surface workspace (`/home`, `/command`, `/demos`, `/demo/[id]/edit`, `/videos`, `/agents`, `/showcases`, `/hubs`, `/routes`, `/analytics`, `/settings/*`).
- **Decision**: Build a unified Next.js 16 App Router application using React 19, TypeScript, and Tailwind CSS v4. Group routes logically into marketing pages, public players/embeds, auth/invite flows (`/login`, `/signup`, `/invite/[token]`, `/join/[token]`), and authenticated workspace surfaces.
- **Consequences**: Zero-CORS API co-location under `/api/*`, server-side session enforcement, fast SSR for public demo/showcase/route players, and rich client interactivity in the Demo Editor, Route Hub Node Canvas, and AI Command Dock.

---

## ADR-002: Dual-Database Prisma 7 Architecture (SQLite Local Dev + PostgreSQL Production)

- **Status**: Accepted
- **Context**: The application must run out-of-the-box in local development and CI with SQLite while supporting PostgreSQL in production deployments without code divergence.
- **Decision**: Use Prisma 7 (`@prisma/client` v7.10+) with driver adapters (`@prisma/adapter-better-sqlite3` for `file:` SQLite URLs and `@prisma/adapter-pg` for `postgresql://` / `postgres://` URLs). Maintain `prisma/schema.prisma` (SQLite provider) alongside `prisma/schema.postgres.prisma` (PostgreSQL provider) and automatic runtime adapter selection in `src/lib/prisma.ts`.
- **Consequences**: Identical Prisma Client TypeScript queries across SQLite and PostgreSQL, deterministic local testing via `npm run db:setup`, and production readiness with Docker/PostgreSQL.

---

## ADR-003: Fail-Closed Invite-Only Account Admission & CLI-Only Bootstrap Admin

- **Status**: Accepted
- **Context**: Enterprise deployments require strict account admission control where no uninvited visitor can create an account via public signup or uninvited OAuth, and initial administrator provisioning cannot be exposed on any public HTTP endpoint.
- **Decision**:
  1. Default `AUTH_ADMISSION_MODE="invite_only"` (fail-closed).
  2. Store only the SHA-256 hex digest (`tokenHash`) of single-use invitation tokens in the `Invitation` table; never persist raw tokens.
  3. Bind each invitation to a normalized `invitedEmail`, assigned `role` (`ADMIN`, `CREATOR`, `BILLING_ADMIN`, `VIEWER`), and `expiresAt` timestamp.
  4. Consume invitations atomically inside a serializable database transaction (`updateMany` guarded by `status = 'PENDING'`, `usedAt = null`, `revokedAt = null`, `expiresAt > now`).
  5. Provision the initial admin exclusively via `npm run bootstrap:admin` (`scripts/bootstrap-admin.ts`), refusing execution if any user already exists.
- **Consequences**: Complete elimination of unauthorized account creation, cryptographic protection against database token leakage, and tamper-evident admission lifecycle.

---

## ADR-004: Role-Based Access Control (RBAC), Session Revocation & Tamper-Evident Audit Logging

- **Status**: Accepted
- **Context**: Supademo workspaces require granular roles (`ADMIN`, `CREATOR`, `BILLING_ADMIN`, `VIEWER` — matching `app.supademo.com/settings/members`) and immediate session invalidation when an account is suspended/disabled or a role is changed, plus a full audit trail of security-sensitive operations.
- **Decision**:
  1. Re-validate `user.status === 'ACTIVE'` and current `user.role` against the database on active session resolution so disabled/revoked users lose access immediately without waiting for JWT expiry.
  2. Persist structured `AuditLog` records for every admission, authentication, invitation (`INVITE_CREATED`, `INVITE_ACCEPTED`, `INVITE_REVOKED`, `INVITE_REJECTED`), role change (`MEMBER_ROLE_UPDATED`, `USER_STATUS_CHANGED`), bootstrap (`BOOTSTRAP_ADMIN_CREATED`), and workspace governance event.
- **Consequences**: Immediate enforcement of account revocation and full compliance visibility in `/settings/security`, `/settings/members`, and `/admin/invitations`.

---

## ADR-005: Interactive Multi-Step Demo Editor & Non-Destructive Canvas Overlay Engine

- **Status**: Accepted
- **Context**: Supademo's flagship `/demo/[id]/edit` experience allows creators to combine Chapter Slides (`Default`, `Form`, `Embed`, `Password`), Screenshot/Video slides, HTML Sandbox slides, customizable Hotspots (`Pointer`, `Callout`, `Area`, branching actions), Blur/Annotation layers, AI Voiceovers, Zoom & Pan animations, Dynamic Variables (`{{name}}`, `{{company}}`), and Version History.
- **Decision**: Represent each demo's slides in the `DemoStep` relational model with structured JSON columns for `hotspotConfig`, `annotations`, `voiceoverConfig`, `animationConfig`, and `chapterConfig`, plus immutable snapshots in `DemoVersion`. Render overlays non-destructively using percentage-based coordinates (`0–100%`) so hotspots and blur masks scale accurately across desktop (`1440×900`) and mobile (`390×844`) viewports.
- **Consequences**: Full responsiveness, instant preview/player parity, branching step navigation, and one-click version restore.

---

## ADR-006: AI Command Dock, AI Demo Agents, Demo Hubs & Route Hubs

- **Status**: Accepted
- **Context**: Beyond individual demos, `app.supademo.com` provides four high-leverage orchestration surfaces:
  1. **AI Command (`/command` & `#command-dock`)**: Conversational copilot that creates, audits, translates, and summarizes demos.
  2. **AI Demo Agents (`/agents` & `/agent/[id]/edit`)**: 14-tab autonomous discovery & qualification agent trained on workspace demos, videos, documents, websites, and text snippets.
  3. **In-App Demo Hubs (`/hubs` & `/hub/[id]`)**: Embeddable searchable help widget (`Appearance`, `Content`, `Install`).
  4. **Route Hubs (`/routes` & `/route/[id]/edit`)**: Conditional lead-capture & intent-qualification graph routing prospects to tailored Showcases.
- **Decision**: Implement dedicated first-class database models (`AiAgent`, `Showcase`, `DemoHub`, `RouteHub`, `LeadCapture`, `AnalyticsEvent`) and interactive builders/players for all four orchestration surfaces.
- **Consequences**: 100% functional parity with `app.supademo.com`'s modern AI and GTM suite.
