# NextAuth + Invite-Only Account Admission Technical Specification

## 1. Overview & Security Invariants

This document specifies the **Invite-Only Account Admission, RBAC, Revocation & Audit Logging** subsystem for Supademo:

1. **Fail-Closed Admission Policy (`AUTH_ADMISSION_MODE`)**:
   - Defaults to `"invite_only"`. Any unknown, missing, or malformed value resolves to `"invite_only"`.
   - Public self-registration (`/signup`, `/register`, `POST /api/auth/register` without a valid invitation token) is blocked with `403 INVITATION_REQUIRED`.
2. **CLI-Only Bootstrap Administrator (`npm run bootstrap:admin`)**:
   - Initial administrator creation is performed exclusively via `scripts/bootstrap-admin.ts`.
   - Refuses to run (`BOOTSTRAP_ALREADY_COMPLETED`) if `prisma.user.count() > 0`.
   - Zero HTTP bootstrap endpoints exist anywhere in `/src/app/api`.
3. **Single-Use, Email-Bound, Expiring SHA-256 Invitation Tokens**:
   - Raw tokens use 32 cryptographically random bytes (`crypto.randomBytes(32).toString("base64url")`).
   - Only `tokenHash = SHA-256(rawToken)` is stored in `Invitation.tokenHash`.
   - Invitations are bound to `invitedEmail` (lowercase trimmed), `role` (`ADMIN`, `CREATOR`, `BILLING_ADMIN`, `VIEWER`), and `expiresAt`.
   - Redeeming an invitation executes inside a serializable transaction using a conditional `updateMany` (`status = 'PENDING'`, `usedAt = null`, `revokedAt = null`, `expiresAt > now`) so concurrent replay is impossible.
4. **Immediate Revocation & Active Session Re-Validation**:
   - `ADMIN` users can revoke pending invitations (`status = 'REVOKED'`) and suspend/disable member accounts (`status = 'DISABLED'`).
   - NextAuth `jwt` / `session` callbacks and `getCurrentSessionUser()` re-query the database to verify `user.status === 'ACTIVE'` and synchronize `user.role`.
5. **Tamper-Evident Audit Logging (`AuditLog`)**:
   - Every security-relevant event (`BOOTSTRAP_ADMIN_CREATED`, `INVITE_CREATED`, `INVITE_ACCEPTED`, `INVITE_REVOKED`, `INVITE_REJECTED`, `USER_LOGIN`, `MEMBER_ROLE_UPDATED`, `USER_STATUS_CHANGED`) is persisted in the `AuditLog` table and surfaced in `/settings/members`, `/settings/security`, and `/admin/invitations`.
