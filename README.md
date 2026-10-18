# Supademo Full-Stack Platform (Next.js 16 + Auth.js/NextAuth + Prisma 7)

Full-stack interactive product demo, sandbox, AI Demo Agent, In-App Demo Hub, and Route Hub platform modeled on **Supademo (`https://supademo.com` & `https://app.supademo.com`)**, with **fail-closed invite-only registration**, single-use/expiring SHA-256 invitation codes, RBAC roles (`ADMIN`, `CREATOR`, `BILLING_ADMIN`, `VIEWER`), invitation revocation, member suspension, tamper-evident audit logging, and a CLI-only bootstrap admin script (`npm run bootstrap:admin`).

---

## Documentation Suite

1. [Exploration & Feature Parity Report](./SUPADEMO_EXPLORATION_AND_PARITY_REPORT.md)
2. [01 — Architecture Decision Records (ADRs)](./docs/01_ADR_ARCHITECTURE_DECISION_RECORDS.md)
3. [02 — Product Requirements Document (PRD)](./docs/02_PRD_PRODUCT_REQUIREMENTS_DOCUMENT.md)
4. [03 — Technical Specification & API Contracts](./docs/03_TECHNICAL_SPECIFICATION.md)
5. [04 — System Architecture & Relational Data Model](./docs/04_ARCHITECTURE_AND_DATA_MODEL.md)
6. [05 — Implementation Plan & Backlog](./docs/05_IMPLEMENTATION_PLAN_AND_BACKLOG.md)
7. [06 — Acceptance Criteria & Feature Parity Matrix](./docs/06_ACCEPTANCE_CRITERIA_AND_PARITY_MATRIX.md)
8. [NextAuth Invite-Only Admission Specification](./docs/NEXTAUTH_INVITE_ONLY_SPEC.md)

---

## Quick Start (Local Development with SQLite)

```bash
# 1. Install dependencies
npm install

# 2. Push Prisma schema to SQLite (./dev.db)
npm run db:push

# 3. Provision initial bootstrap ADMIN via CLI-only script (no public HTTP bootstrap endpoint)
BOOTSTRAP_ADMIN_EMAIL="powlowskijoshuah@gmail.com" \
BOOTSTRAP_ADMIN_PASSWORD="your-bootstrap-password" \
BOOTSTRAP_ADMIN_NAME="Joshuah Powlowski" \
npm run bootstrap:admin

# 4. Seed realistic demos, AI Demo Agents, Showcases, In-App Hubs, Route Hubs & Analytics
npm run db:seed

# 5. Start Next.js server
npm run dev
```

## Production Build & E2E Verification

```bash
npm run build
npm run test:e2e
```
