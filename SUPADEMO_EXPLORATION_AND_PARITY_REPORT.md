# Supademo Platform Reverse-Engineering, Exploration Coverage & Feature Parity Report

## 1. Executive Summary

Using automated Playwright browser sessions (`1440×900` desktop and `390×844` mobile viewports), authenticated session cookies from `.cred` (`__Secure-next-auth.session-token` for `powlowskijoshuah@gmail.com`), and temp-email (`mail.tm`) signup probes, we systematically explored `https://supademo.com` (public marketing site) and `https://app.supademo.com` (authenticated SaaS workspace, onboarding wizard, editors, players, AI tools, analytics, and settings).

- **Total Screenshots Captured**: `151` PNG artifacts in `/screenshots/` (desktop + mobile responsive pairs and interactive modal/sub-tab states).
- **Total DOM & Network API Captures**: `21` structured JSON captures in `/exploration/`.
- **Workspace Provisioned & Explored**: `My Company` (`workspaceId: cmvdp7fhn032iz20jmc2ygn7z`, 14-day Growth trial activated).

---

## 2. Exploration Coverage Matrix

| Surface / Area | Target URLs Explored | Viewports | Screenshots | Key Workflows & States Captured |
|---|---|---|---|---|
| **Marketing Site (`supademo.com`)** | `/`, `/pricing`, `/showcase`, `/integrations`, `/enterprise`, `/features`, `/product-demo`, `/features/demo-recorder`, `/features/demo-editor`, `/features/screen-recorder`, `/features/personalization`, `/features/sandbox-demos`, `/features/route-hub`, `/features/demo-hub`, `/ai/command`, `/ai/demo-agents`, `/solutions` | `1440×900`, `390×844` | `091_*` – `109_*` | Interactive hero tours, 4-tier pricing (`Free`, `Scale $38`, `Business $199`, `Growth $350`, `Enterprise`), AI Command & Agentic Demo marketing showcases |
| **Auth, Signup, Invite Join & Edge States** | `app.supademo.com/login`, `/signup`, `/register` (404), `/join/[token]`, `/join/invalid_token_edge_case` | `1440×900`, `390×844` | `100_*` – `103_*`, `110_*` – `113_*` | Temp-email (`mail.tm`) 6-digit OTP challenge, invalid OTP error state (`"That code didn't go through..."`), valid invite join card (`"Join My Company — You'll join as a Creator"`), revoked/invalid invite link error state (`"This invite link isn't valid"`), `/register` 404 page |
| **5-Stage Onboarding Wizard** | `/welcome?stage=role`, `?stage=useCase`, `?stage=source`, `?stage=getStarted`, `?stage=getStartedCreate` | `1440×900` | `01_*` – `05_*` | Workspace creation (`POST /api/workspace`), 14-day Growth trial activation (`POST /api/stripe/trial`), role/use-case/attribution telemetry |
| **Workspace Home & AI Command** | `/home`, `/command`, `#command-dock` | `1440×900`, `390×844` | `06_*`, `07_*`, `11_*`, `12_*` | 4-step Get Started checklist, Recommended Playbooks, persistent AI Command dock (`New Chat`, prompt suggestions, MCP server badge) |
| **Supademos Library & Creation Modal** | `/demos` (`Supademos` & `Screenshots` tabs; `Shared with Team`, `Personal`, `Archived` scopes) | `1440×900`, `390×844` | `08_*`, `13_*` | `Create Supademo` modal (`Record from extension`, `Upload content`, `HTML Demo`, `Sandbox Demo`, `AI Command`), folders, tags (`Getting Started`, `New Hire`, `Onboarding`), filters, Grid/List toggle |
| **Supademo Interactive Editor** | `/demo/cmvdpmcll02wb090j10dbikms/edit` | `1440×900`, `390×844` | `40_*` – `61_*` | Multi-step slide rail (`Chapter` + image/video/HTML slides), `Hotspot` inspector (Pointer/Callout/Area, Ping/Pulse, Backdrop, Branching Actions), `Blur & Annotate` (Blur, Text/Shapes, Crop), `Voiceover` (12 ElevenLabs/Inworld voices + custom voice clone + per-step script), `Animation` (Zoom & Pan, Autoplay), `Chapter` (`Default`, `Form`, `Embed`, `Password`), `Personalize` (`{{name}}`, `{{company}}`), `Enhance with AI` (`AI Audit`, `AI Text`, `AI Voice`, `AI Translate`, `AI Command`), `Backgrounds`, `Share` modal, `Utility` menu |
| **Public / Standalone Demo Player** | `/demo/cmvdpmcll02wb090j10dbikms` | `1440×900`, `390×844` | `51_*` | Interactive chapter cover, step progression, animated hotspot callout, browser chrome bar, fullscreen, autoplay, voiceover toggle |
| **Videos Library** | `/videos` | `1440×900`, `390×844` | `14_*` | Screen recordings library, folder hierarchy, convert video to interactive Supademo |
| **AI Demo Agents & 14-Tab Builder** | `/agents`, `/agent/cmvdqb9cw02f30m0jn2h09vg0/edit` | `1440×900`, `390×844` | `15_*`, `63_*`, `64_*`, `71_*` – `80_*` | Credit balance (`1,500 credits left`), `Agent Readiness` modal, **AGENT** (`Identity`, `Interface`, `Guardrails`, `Quick Links`, `Security`), **KNOWLEDGE BASE** (`Demos`, `Videos`, `Documents`, `Websites`, `Text`), **MONITOR** (`Insights`, `Sessions`, `Triggers`, `Knowledge gaps`) |
| **Showcases Library, Editor & Player** | `/showcases`, `/showcase/cmvdq8jjh033xz20jka70wi4b/edit`, `/showcase/cmvdq8jjh033xz20jka70wi4b` | `1440×900`, `390×844` | `16_*`, `62_*`, `81_*`, `82_*` | Multi-section layout (`Top Bar` vs `Sidebar` theme), resource picker (`Demo`, `Video`, `PDF`, `Link`), CTA buttons, public multi-demo showcase player |
| **In-App Demo Hubs** | `/hubs`, `/hub/cmvdqcyr100zf090iff8812gy` | `1440×900`, `390×844` | `17_*`, `65_*`, `83_*`, `84_*` | `Appearance` (Title/Logo, Search placeholder, Solid/Gradient header, Light/Dark theme, Footer links), `Content` (featured demos & collections), `Install` (embeddable JS widget & trigger mode) |
| **Route Hubs (Lead & Intent Routing)** | `/routes`, `/route/new`, `/route/cmvdqdta100zk090i1gwa89sb/edit` | `1440×900`, `390×844` | `18_*`, `66_*`, `67_*`, `85_*`, `86_*` | Entry mode selector (`Collect leads`, `Qualify intent`, `Collect leads + qualify intent`), visual graph canvas (`FORM`, `INTEGRATIONS`, conditional `ROUTE` branches, `SHOWCASE` destinations), `Style`, `Analytics`, `Share` |
| **Workspace & Showcase Analytics** | `/analytics` | `1440×900`, `390×844` | `19_*` | `Supademo Analytics` vs `Showcase Analytics`, date range selector, `Supademo Views` chart (`Total Views` vs `Engaged Views`), `Recent Viewers`, `Recent Accounts`, `Most Viewed`, `Device & Location` (`OS`, `Browser`, `Location`), CSV export |
| **13 Settings Sections & Upgrade** | `/upgrade`, `/settings/brand`, `/settings/demo-player`, `/settings/custom-domain`, `/settings/general`, `/settings/members`, `/settings/billing`, `/settings/api`, `/settings/security`, `/settings/demo-versioning`, `/settings/integrations`, `/settings/profile`, `/settings/tags`, `/settings/pronunciation-library` | `1440×900`, `390×844` | `09_*`, `10_*`, `20_*` – `36_*` | Custom branding & watermarks, player navbar/navigation defaults, CNAME custom domain, member invitations & RBAC (`Admin`, `Creator`, `Billing Admin`, `Viewer`), API keys & MCP endpoints, GDPR/AI security toggles, 9 native integrations, pronunciation dictionary |

---

## 3. Reverse-Engineered API Contracts (`app.supademo.com/api/*`)

During Playwright exploration, we intercepted and logged the following REST API endpoints and JSON payloads:

### 3.1 Authentication & Onboarding
- `GET /api/auth/session` — Returns NextAuth session with `user: { id, name, email, newuser, workspaceId, firstDemo, role, plan, dataRegion, ownsWhiteLabel }`.
- `POST /api/workspace` — Creates workspace during `/welcome?stage=role`:
  - Request: `{ name: "My Company", jobRole: "Software Engineering", teamSize: "1-5", category: "B2B SaaS" }`
  - Response: `{ workspaceId: "cmvdp7fhn032iz20jmc2ygn7z", inviteToken: "I5rirEXZv6jBxnH5KSBorH8jqXm_DuWZ", dataRegion: "USWest2" }`
- `POST /api/stripe/trial` — Activates 14-day Growth trial during onboarding.
- `PUT /api/user/new` — Marks `newuser: false` upon completing `/welcome`.

### 3.2 Demos, Steps, Chapters, Hotspots & Editor
- `GET /api/v2/demos?scope=TEAM|PERSONAL|ARCHIVED&page=1` — Paginated demo listing with folders, tags, creator, step count, view metrics.
- `POST /api/demos/upload` — Creates a new interactive demo from uploaded screenshots/videos with initial chapter cover and step slides (`DemoStep` records).
- `PUT /api/demos/[id]` — Updates demo title, description, visibility, folder, background, browser bar toggle, dark mode, password, trackable link settings.
- `PUT /api/steps/[id]` — Updates step slide properties:
  - `hotspot`: `{ text, style: "POINTER"|"CALLOUT"|"AREA", position, bgColor, textColor, backdrop: "OFF"|"LIGHT"|"DARK", borderRadius: "SHARP"|"SOFT"|"ROUND"|"PILL", animation: "PING"|"PULSE"|"NONE", visibility: "ALWAYS"|"HOVER", width: "SM"|"MD"|"LG", showNext: boolean, showBack: boolean, actionType: "NEXT"|"PREV"|"SLIDE"|"URL", actionTarget: string }`
  - `annotations`: `Array<{ id, type: "BLUR"|"TEXT"|"ARROW"|"RECT", x, y, width, height, color, label }>`
  - `voiceover`: `{ text, voiceId, audioUrl, syncMode }`
  - `animation`: `{ zoomLevel, panX, panY, autoplayDuration }`
  - `chapter`: `{ isChapter, chapterType: "DEFAULT"|"FORM"|"EMBED"|"PASSWORD", title, subtitle, buttonText, align, theme, blurOpacity, formFields }`
- `GET /api/demos/[id]/versions` & `POST /api/demos/[id]/versions` — Demo version snapshots (`Draft` vs `Published`, restore version).

### 3.3 AI Command, Voiceover, Translation & Agents
- `POST /api/ai/command` — Natural language workspace assistant (`Build a demo from uploads`, `Audit hotspots`, `Translate demo`, `Recap weekly analytics`).
- `POST /api/ai/enhance` — Executes `AI Audit`, `AI Text` (tone: Professional/Friendly/Concise/Action-oriented), `AI Voice` synthesis, and `AI Translate` (30+ languages).
- `GET /api/agents` & `POST /api/agents` & `PUT /api/agents/[id]` — CRUD for AI Demo Agents (`Identity`, `Interface`, `Guardrails`, `Quick Links`, `Security`, `Knowledge Base` links, `Monitor` sessions/insights/triggers/gaps).

### 3.4 Showcases, Demo Hubs & Route Hubs
- `GET /api/showcases`, `POST /api/showcases`, `PUT /api/showcases/[id]` — Multi-section collections containing `Demo`, `Video`, `PDF`, and `Link` items, layout (`TOP_BAR` | `SIDEBAR`), custom CTA button.
- `GET /api/hubs`, `POST /api/hubs`, `PUT /api/hubs/[id]` — Embeddable In-App Demo Hub widget (`Appearance`, `Content` collections, `Install` script & trigger mode).
- `GET /api/routes`, `POST /api/routes`, `PUT /api/routes/[id]` — Route Hub lead qualification & conditional routing graph (`entryMode`, `nodes`, `edges`, `questions`, `showcaseTargets`).

### 3.5 Analytics, Settings & Governance
- `GET /api/analytics/overview?type=DEMO|SHOWCASE&days=30` — Time-series views (`total_views`, `engaged_views`), completion rate, drop-off by step, `Recent Viewers`, `Recent Accounts`, `Most Viewed`, and `Device & Location` breakdown.
- `GET /api/workspace/settings` & `PUT /api/workspace/settings` — Updates Branding, Demo Player defaults, Custom Domain, General, Security, Demo Versioning, Integrations, Tags, and Pronunciation Library.

---

## 4. Edge & Error States Documented

1. **Invalid / Unknown Auth Route (`/register`)**: Returns styled 404 (`"Oops! Page Not Found — We can't seem to find the page you're looking for."` with `Back to Home` button).
2. **Invalid Signup Verification Code (`/signup`)**: Entering an invalid 6-digit OTP displays inline error banner `"That code didn't go through. Try the latest email or send a new one."` (`screenshots/113_auth_signup_invalid_code_error.png`).
3. **Invalid / Revoked Workspace Invite Link (`/join/invalid_token_edge_case`)**: Displays error card `"This invite link isn't valid — The link may have been revoked or replaced. Ask a workspace admin for a new one."` (`screenshots/103_auth_join_invalid_desktop.png`).
4. **Invite-Only Fail-Closed Registration (Reference + Enhanced Specification)**:
   - Public self-signup without a valid, unrevoked, unexpired single-use invitation token is rejected (`403 INVITATION_REQUIRED`).
   - Attempted registration with an email not matching `invitation.invitedEmail` (normalized lowercase) fails (`403 EMAIL_MISMATCH`).
   - Reusing a consumed invitation token fails (`410 INVITATION_ALREADY_USED`).
   - Using a revoked or expired invitation token fails (`410 INVITATION_REVOKED` / `410 INVITATION_EXPIRED`).
   - Bootstrap admin creation is strictly CLI-only (`npm run bootstrap:admin`) with zero HTTP bootstrap endpoints.
