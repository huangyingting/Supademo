# 04 — System Architecture & Prisma Data Model

## 1. Layered System Architecture

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        Presentation Layer (Next.js 16)                     │
│  ┌────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐  │
│  │  Marketing Site    │ │  Public Players      │ │  Authenticated App   │  │
│  │  /, /pricing,      │ │  /demo/[id]          │ │  /home, /command,    │  │
│  │  /features/*,      │ │  /showcase/[id]      │ │  /demos, /videos,    │  │
│  │  /ai/*, /showcase  │ │  /route/[id]/share   │ │  /agents, /showcases,│  │
│  │  /enterprise       │ │  /invite/[token]     │ │  /hubs, /routes,     │  │
│  │                    │ │  /join/[token]       │ │  /analytics,         │  │
│  │                    │ │                      │ │  /settings/*         │  │
│  └─────────┬──────────┘ └──────────┬───────────┘ └──────────┬───────────┘  │
└────────────┼───────────────────────┼────────────────────────┼──────────────┘
             │                       │                        │
┌────────────▼───────────────────────▼────────────────────────▼──────────────┐
│                     Application & Domain Layer (/src/lib)                  │
│  ┌──────────────────────────┐  ┌────────────────────────────────────────┐  │
│  │ Account Admission Engine │  │ Supademo Domain Services               │  │
│  │ - policy.ts (fail-closed)│  │ - Demo & Step Canvas Engine            │  │
│  │ - tokens.ts (SHA-256)    │  │ - AI Command, Audit, Voice & Translate │  │
│  │ - invitations.ts         │  │ - AI Demo Agent RAG & Session Engine   │  │
│  │ - registration.ts (tx)   │  │ - Showcase, DemoHub & RouteHub Engine  │  │
│  │ - credentials.ts / social│  │ - Analytics & Lead Capture Telemetry   │  │
│  │ - audit.ts (AuditLog)    │  │ - 13-Section Workspace Governance      │  │
│  └─────────────┬────────────┘  └────────────────────┬───────────────────┘  │
└────────────────┼────────────────────────────────────┼──────────────────────┘
                 │                                    │
┌────────────────▼────────────────────────────────────▼──────────────────────┐
│                   Persistence Layer (Prisma 7 Dual Adapter)                │
│         SQLite (@prisma/adapter-better-sqlite3)  |  PostgreSQL (pg)        │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Entity-Relationship Model

### 2.1 Identity, Admission, RBAC & Audit Entities
- **`User`**:
  - `id` (CUID PK), `email` (unique, normalized lowercase), `name`, `passwordHash`, `role` (`ADMIN` | `CREATOR` | `BILLING_ADMIN` | `VIEWER`), `status` (`ACTIVE` | `DISABLED`), `avatarUrl`, `jobTitle`, `onboardingCompleted` (`Boolean`), `createdAt`, `updatedAt`.
- **`Invitation`**:
  - `id` (CUID PK), `tokenHash` (unique 64-char SHA-256 hex), `invitedEmail` (indexed), `role` (`ADMIN` | `CREATOR` | `BILLING_ADMIN` | `VIEWER`), `status` (`PENDING` | `ACCEPTED` | `REVOKED` | `EXPIRED`), `workspaceId`, `expiresAt`, `usedAt`, `revokedAt`, `createdByUserId`, `acceptedByUserId`, `createdAt`, `updatedAt`.
- **`AuditLog`**:
  - `id` (CUID PK), `workspaceId`, `actorUserId`, `actorEmail`, `action` (e.g. `BOOTSTRAP_ADMIN_CREATED`, `INVITE_CREATED`, `INVITE_ACCEPTED`, `INVITE_REVOKED`, `INVITE_REJECTED`, `USER_LOGIN`, `MEMBER_ROLE_UPDATED`, `USER_STATUS_CHANGED`, `SETTINGS_UPDATED`, `DEMO_PUBLISHED`), `targetType`, `targetId`, `metadataJson`, `ipAddress`, `createdAt`.
- **`Workspace`** & **`WorkspaceMember`**:
  - `Workspace`: `id`, `name`, `slug`, `plan` (`FREE` | `SCALE` | `BUSINESS` | `GROWTH` | `ENTERPRISE`), `trialEndsAt`, `dataRegion` (`USWest2` | `EUCentral1`), `aiCreditsRemaining` (`1500`), `brandSettingsJson`, `playerSettingsJson`, `customDomainJson`, `securitySettingsJson`, `versioningSettingsJson`, `integrationsJson`, `pronunciationsJson`.
  - `WorkspaceMember`: `id`, `workspaceId`, `userId`, `role` (`ADMIN` | `CREATOR` | `BILLING_ADMIN` | `VIEWER`).

### 2.2 Content, Interactive Demo & AI Entities
- **`Folder`** & **`Tag`**:
  - Organize demos across `TEAM`, `PERSONAL`, and `ARCHIVED` scopes (`Getting Started`, `New Hire`, `Onboarding`, custom tags).
- **`Demo`**:
  - `id`, `workspaceId`, `folderId`, `creatorId`, `title`, `description`, `type` (`EXTENSION` | `UPLOAD` | `HTML` | `SANDBOX` | `AI_COMMAND`), `scope` (`TEAM` | `PERSONAL` | `ARCHIVED`), `visibility` (`PUBLIC` | `WORKSPACE` | `PASSWORD`), `password`, `status` (`DRAFT` | `PUBLISHED`), `backgroundUrl`, `hideBrowserBar`, `darkMode`, `autoplay`, `voiceoverEnabled`, `variablesJson`, `tagsJson`, `viewsCount`, `engagedViewsCount`, `completionRate`, `createdAt`, `updatedAt`.
- **`DemoStep`**:
  - `id`, `demoId`, `orderIndex`, `stepType` (`CHAPTER` | `IMAGE` | `VIDEO` | `HTML`), `title`, `subtitle`, `mediaUrl`, `htmlContent`, `hotspotJson` (style, colors, backdrop, radius, animation, visibility, width, position, branching action), `annotationsJson` (blur masks, arrows, callouts, crop), `voiceoverJson` (script, voiceId, audioUrl), `animationJson` (zoom, pan, autoplayDelay), `chapterJson` (chapterType: `DEFAULT`|`FORM`|`EMBED`|`PASSWORD`, layout, theme, CTA buttons).
- **`DemoVersion`** & **`DemoComment`**:
  - `DemoVersion`: `id`, `demoId`, `versionNumber`, `label`, `stepsSnapshotJson`, `createdByUserId`, `createdAt`.
  - `DemoComment`: `id`, `demoId`, `stepId`, `authorName`, `authorEmail`, `body`, `resolved`, `createdAt`.
- **`VideoRecording`**:
  - `id`, `workspaceId`, `title`, `durationSec`, `scope`, `folderId`, `thumbnailUrl`, `videoUrl`, `viewsCount`, `convertedDemoId`, `createdAt`.
- **`AiAgent`**:
  - `id`, `workspaceId`, `name`, `slug`, `status` (`DRAFT` | `LIVE`), `creditsUsed`, `readinessScore`, `identityJson` (avatar, voice, persona, welcome message), `interfaceJson` (theme, launcher style), `guardrailsJson` (allowed topics, fallback rules), `quickLinksJson`, `securityJson` (domain whitelist, email gate), `knowledgeBaseJson` (linked demoIds, videoIds, documents, websites, textSnippets), `monitorJson` (sessions, insights, triggers, knowledgeGaps), `createdAt`, `updatedAt`.
- **`Showcase`**:
  - `id`, `workspaceId`, `title`, `description`, `theme` (`TOP_BAR` | `SIDEBAR`), `status` (`DRAFT` | `PUBLISHED`), `ctaText`, `ctaUrl`, `sectionsJson` (ordered sections containing `Demo`, `Video`, `PDF`, and `Link` items), `viewsCount`, `createdAt`, `updatedAt`.
- **`DemoHub`**:
  - `id`, `workspaceId`, `name`, `status` (`DRAFT` | `PUBLISHED`), `appearanceJson` (headerTitle, searchPlaceholder, alignment, headerBg, contentTheme, footerLinks), `contentJson` (featuredDemoIds, categories), `installJson` (triggerType, launcherPosition, allowedDomains), `createdAt`, `updatedAt`.
- **`RouteHub`**:
  - `id`, `workspaceId`, `name`, `entryMode` (`COLLECT_LEADS` | `QUALIFY_INTENT` | `BOTH`), `status` (`DRAFT` | `PUBLISHED`), `styleJson`, `nodesJson` (`FORM`, `INTEGRATIONS`, `ROUTE`, `SHOWCASE`), `edgesJson`, `submissionsCount`, `createdAt`, `updatedAt`.
- **`AnalyticsEvent`** & **`LeadCapture`**:
  - Track per-demo and per-showcase views, engaged views, step completions, viewer email/company, OS, browser, and country.
