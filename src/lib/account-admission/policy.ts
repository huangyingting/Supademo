export const ACCOUNT_ADMISSION_MODES = ['invite_only', 'public'] as const;
export type AccountAdmissionMode = (typeof ACCOUNT_ADMISSION_MODES)[number];

export const SUPADEMO_ROLES = ['ADMIN', 'CREATOR', 'BILLING_ADMIN', 'VIEWER'] as const;
export type SupademoRole = (typeof SUPADEMO_ROLES)[number];

export function normalizeAccountEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidAccountEmail(email: string): boolean {
  const normalized = normalizeAccountEmail(email);
  const separator = normalized.indexOf('@');
  return (
    normalized.length <= 320 &&
    separator > 0 &&
    separator === normalized.lastIndexOf('@') &&
    separator < normalized.length - 1 &&
    !/\s/.test(normalized)
  );
}

/**
 * Fail-closed admission policy:
 * Defaults to 'invite_only' unless explicitly set to 'public'.
 */
export function getAdmissionMode(): AccountAdmissionMode {
  const raw = (
    process.env.AUTH_ADMISSION_MODE ||
    process.env.ACCOUNT_ADMISSION_MODE ||
    ''
  )
    .trim()
    .toLowerCase();
  if (raw === 'public') return 'public';
  return 'invite_only';
}

export function isInviteOnlyMode(): boolean {
  return getAdmissionMode() === 'invite_only';
}

export function normalizeRole(role?: string | null): SupademoRole {
  const upper = (role || 'CREATOR').trim().toUpperCase().replace(/\s+/g, '_');
  if (upper === 'ADMIN') return 'ADMIN';
  if (upper === 'BILLING_ADMIN') return 'BILLING_ADMIN';
  if (upper === 'VIEWER') return 'VIEWER';
  return 'CREATOR';
}
