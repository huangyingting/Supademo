# 02 — Product Requirements Document (PRD)

## 1. Product Vision & Scope

Build a full-featured, production-grade interactive product demo and AI enablement platform modeled on **Supademo** (`https://supademo.com` and `https://app.supademo.com`), enhanced with enterprise-grade **fail-closed invite-only account admission**, **single-use/expiring SHA-256 invitation codes**, **RBAC roles**, **account/invite revocation**, **comprehensive audit logging**, and **CLI-only bootstrap administrator provisioning**.

---

## 2. Target Personas & RBAC Roles

| Role | Code | Capabilities |
|---|---|---|
| **Workspace Admin** | `ADMIN` | Full access to all workspace demos, videos, AI agents, showcases, hubs, routes, analytics, 13 settings sections, member management, invitation creation/revocation, user suspension, and audit logs. |
| **Creator** | `CREATOR` | Can create, edit, personalize, AI-enhance, version, and share Supademos, Videos, Showcases, Demo Hubs, Route Hubs, and AI Demo Agents. Cannot issue/revoke workspace invitations or modify billing/security settings. |
| **Billing Admin** | `BILLING_ADMIN` | Can view workspace content and manage `/settings/billing` and `/upgrade` plans, seats, and invoices. |
| **Viewer** | `VIEWER` | Read-only access to workspace demos, showcases, videos, and analytics; can view and comment on demos but cannot mutate workspace settings or issue invites. |

---

## 3. Functional Requirements

### FR-1: Public Marketing Site (`supademo.com` Parity)
- **FR-1.1 Home (`/`)**: Interactive product tour hero, social proof metrics (`200,000+ professionals`, `3,000+ companies`), feature tabs (`Interactive Demos`, `AI Demo Editor`, `HTML & Sandbox Demos`, `AI Demo Agents`, `Showcases & Hubs`, `Route Hub`, `Analytics`), customer testimonials, and CTA links.
- **FR-1.2 Pricing (`/pricing`)**: Monthly/Annual billing toggle, 5 plan tiers (`Free $0`, `Scale $38/creator/mo`, `Business $199/mo`, `Growth $350/mo`, `Enterprise Custom`), AI Voiceover/Agent add-on comparison table, and interactive FAQ.
- **FR-1.3 Feature & AI Pages**: Dedicated routes or views for `/features`, `/features/demo-recorder`, `/features/demo-editor`, `/features/screen-recorder`, `/features/personalization`, `/features/sandbox-demos`, `/features/route-hub`, `/features/demo-hub`, `/ai/command`, `/ai/demo-agents`, `/showcase`, `/integrations`, `/enterprise`, `/solutions`, and `/product-demo`.

### FR-2: Fail-Closed Invite-Only Authentication, Onboarding & Admission Control
- **FR-2.1 CLI-Only Bootstrap Admin**: `npm run bootstrap:admin` provisions the initial `ADMIN` user and default workspace when the database has `0` users. No HTTP bootstrap endpoint exists.
- **FR-2.2 Fail-Closed Public Signup (`/signup`, `/register`)**: When `AUTH_ADMISSION_MODE=invite_only` (default), public self-registration without a valid invitation token is blocked with a clear, user-friendly explanation and option to enter an invitation token.
- **FR-2.3 Invitation Token Acceptance (`/invite/[token]` & `/join/[token]`)**:
  - Validates the raw token by computing its SHA-256 hash and checking `status = 'PENDING'`, `revokedAt = null`, `usedAt = null`, and `expiresAt > now()`.
  - Displays the workspace name, inviter, assigned role (`Admin`, `Creator`, `Billing Admin`, `Viewer`), and expiration timestamp, locking the email field to `invitedEmail`.
  - Atomically consumes the invitation upon registration, creates the `User` and `WorkspaceMember`, and records an `INVITE_ACCEPTED` audit log entry.
  - Renders clear edge/error states for invalid, expired, revoked, or already-used tokens (matching `app.supademo.com/join/invalid_token_edge_case`).
- **FR-2.4 5-Stage Welcome Onboarding (`/welcome`)**: Supports the 5-stage onboarding flow (`?stage=role` → `?stage=useCase` → `?stage=source` → `?stage=getStarted` → `?stage=getStartedCreate`) with 14-day Growth trial activation.

### FR-3: Workspace Home & AI Command (`/home`, `/command`, `#command-dock`)
- **FR-3.1 Home Dashboard (`/home`)**: 4-step interactive onboarding checklist (`Explore sample Supademo`, `Record a Supademo`, `Customize & edit`, `Share with viewers`), Recommended Playbooks (`Customer Success`, `Sales & GTM`, `Marketing`), Recent Demos, and quick creation triggers.
- **FR-3.2 AI Command (`/command` & persistent `#command-dock`)**: Natural-language workspace assistant capable of generating new multi-step demos from prompts/uploads, auditing hotspot copy, translating demos, and summarizing workspace analytics, plus MCP server integration instructions.

### FR-4: Supademos Library & Interactive Demo Editor (`/demos`, `/demo/[id]/edit`, `/demo/[id]`)
- **FR-4.1 Supademos Library (`/demos`)**:
  - Tabs: `Supademos` and `Screenshots`.
  - Scopes: `Shared with Team`, `Personal`, `Archived`.
  - Folders & Tags (`Getting Started`, `New Hire`, `Onboarding`, custom color tags), search, multi-facet filters (`Created by`, `Tags`, `Visibility`, `Type`), Grid/List view toggle, and `Create Supademo` modal (`Record from extension`, `Upload content`, `HTML Demo`, `Sandbox Demo`, `AI Command`).
- **FR-4.2 Interactive Demo Editor (`/demo/[id]/edit`)**:
  - **Left Step Rail**: Reorderable slides, `Add Chapter`, `Add Step` (upload screenshot/video/HTML), step duplication, and deletion.
  - **Top Toolbar (7 Core Tools)**:
    1. `Hotspot`: Style (`Pointer`, `Callout`, `Area`), Background & Text color pickers, Backdrop (`Off`, `Light`, `Dark`), Border Radius (`Sharp`, `Soft`, `Round`, `Pill`), Animation (`Ping`, `Pulse`, `None`), Visibility (`Always`, `On Hover`), Width (`Small`, `Medium`, `Large`), Position selector, and Navigation Buttons (`Next`/`Back` with branching targets: `Next step`, `Previous step`, `Go to Slide`, `External URL`).
    2. `Blur & Annotate`: `Add Blur` (redact sensitive areas), `Add Text or Shapes` (callout labels, arrows, rectangles), and `Crop Slide` (aspect ratio & zoom/rotate).
    3. `Voiceover`: `AI voice` (12 realistic voices including `Tyler`, `Ethan`, `Brian`, `Kelsey`, `Lauren`, `Jason`, `Arthur`, `Dennis`, `Bianca`, `Avery`, `Ishaan`, `Saanvi` + custom Voice Clone) vs `Record my voice`, `Sync all`, and per-step voiceover script editor.
    4. `Animation`: `Zoom and Pan` intensity/target and `Autoplay` step timer.
    5. `Chapter`: Chapter type (`Default`, `Form` lead capture, `Embed`, `Password`), Layout (`Left`, `Center`, `Right`), Theme (`Dark`, `Light`, `Custom`), Opacity & Blur, Logo, Cover Image, and primary/secondary CTA buttons.
    6. `Personalize`: `Add Dynamic Variables` (`{{name}}`, `{{company}}`, `{{role}}` with fallback values), `Custom Branding`, `Generate Text with AI`, and `Translate with AI`.
    7. `Enhance with AI`: 5-tab modal (`AI Audit`, `AI Text`, `AI Voice`, `AI Translate`, `AI Command`).
  - **Bottom Canvas Toolbar**: `Backgrounds` (`Colors & Gradients`, `Workspace`, `Custom`), `Resize & Crop`, `Comments` thread drawer, `Hide browser bar`, `Toggle dark mode`, and `Zoom` controls.
  - **Top Right Actions**: `Preview`, `Share` modal (`Links` with trackable dynamic variables, `Embeds` iframe/HTML, `Download` MP4/GIF/SOP PDF, `Presenter mode`, `Branding`, `Settings`), and `Utility Menu` (`Version History`, `Analytics`, `Settings`, `Manage tags`, `Duplicate`, `Archive`).
- **FR-4.3 Standalone & Embeddable Demo Player (`/demo/[id]`)**:
  - Supports interactive Hotspot click progression, keyboard arrows, Chapter cover & Lead Capture Form submission, Password gate, Dynamic Variable interpolation (`?name=Acme&company=Acme+Corp`), Voiceover playback, Autoplay, Sandbox free-exploration mode, and real-time analytics event tracking.

### FR-5: Videos (`/videos`), AI Demo Agents (`/agents`), Showcases (`/showcases`), Demo Hubs (`/hubs`), and Route Hubs (`/routes`)
- **FR-5.1 Videos (`/videos`)**: Manage screen recordings, preview playback, organize into folders, and convert any video into a step-by-step interactive Supademo.
- **FR-5.2 AI Demo Agents (`/agents`, `/agent/[id]/edit`)**: Create and configure AI discovery/qualification agents with `1,500 credits`, `Agent Readiness` score, and all 14 builder sub-tabs (**AGENT**: `Identity`, `Interface`, `Guardrails`, `Quick Links`, `Security`; **KNOWLEDGE BASE**: `Demos`, `Videos`, `Documents`, `Websites`, `Text`; **MONITOR**: `Insights`, `Sessions`, `Triggers`, `Knowledge gaps`) plus live interactive agent preview widget.
- **FR-5.3 Showcases (`/showcases`, `/showcase/[id]/edit`, `/showcase/[id]`)**: Bundle multiple demos, videos, PDFs, and external links into multi-section curated collections with `Top Bar` or `Sidebar` themes and public shareable URLs.
- **FR-5.4 In-App Demo Hubs (`/hubs`, `/hub/[id]`)**: Configure searchable in-app help centers with `Appearance` (Title/Logo, Search placeholder, Solid/Gradient header, Light/Dark theme, Footer links), `Content` (featured demos & categories), and `Install` (embed snippet & launcher trigger), plus live floating widget preview.
- **FR-5.5 Route Hubs (`/routes`, `/route/new`, `/route/[id]/edit`, `/route/[id]/share`)**: Build qualification & routing flows (`Collect leads`, `Qualify intent`, `Collect leads + qualify intent`) using the visual node editor (`FORM` → `INTEGRATIONS` → `ROUTE` condition branches → `SHOWCASE` destinations) and interactive buyer routing player.

### FR-6: Analytics (`/analytics`) & 13 Settings Sections (`/settings/*`)
- **FR-6.1 Analytics (`/analytics`)**: Toggle between `Supademo Analytics` and `Showcase Analytics`, filter by date range (`7d`, `30d`, `90d`, `All`), view `Supademo Views` (`Total Views` vs `Engaged Views`), `Recent Viewers` & `Recent Accounts` (captured leads), `Most Viewed` demos, `Device & Location` (`OS`, `Browser`, `Country`), and export CSV.
- **FR-6.2 All 13 Settings Routes (`/settings/*`)**:
  1. `/settings/brand` — Brand logo, primary color, watermark, CTA defaults
  2. `/settings/demo-player` — Navbar, hotspot navigation buttons, browser chrome defaults
  3. `/settings/custom-domain` — CNAME custom domain configuration & verification status
  4. `/settings/general` — Workspace name, default visibility, notification toggles
  5. `/settings/members` — Active team members, RBAC role management, single-use/expiring invitation generator, invitation revocation, and audit log viewer
  6. `/settings/billing` — Plan management (`Free`, `Scale`, `Business`, `Growth`, `Enterprise`), trial banner, seat usage
  7. `/settings/api` — Workspace API keys & MCP configuration
  8. `/settings/security` — Admission policy (`invite_only`), AI Hotspot toggle, GDPR anonymous tracking, SSO, and security audit trail
  9. `/settings/demo-versioning` — Draft vs published version workflow toggle
  10. `/settings/integrations` — 9 native integrations (`HubSpot`, `Salesforce`, `Slack`, `Google Analytics`, `Zapier`, `Google Tag Manager`, `Marketo`, `Seismic`, `Webhook`)
  11. `/settings/profile` — Personal profile name, avatar, password update
  12. `/settings/tags` — Workspace tag management (`Getting Started`, `New Hire`, `Onboarding`, custom tags)
  13. `/settings/pronunciation-library` — Custom phonetic pronunciations for AI Voiceover
