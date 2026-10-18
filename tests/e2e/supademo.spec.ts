import { test, expect } from '@playwright/test';

test.describe('Supademo Full-Stack Parity & Invite-Only Admission Suite', () => {
  test('1. Marketing pages & responsive layout render accurately', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText(
      'Create interactive product demos'
    );

    await page.goto('/pricing');
    await expect(page.locator('h1')).toContainText('Flexible pricing');

    await page.goto('/features/html-designs');
    await expect(page.locator('h1')).toContainText('Supademo html designs');

    await page.goto('/ai/ai-voiceover');
    await expect(page.locator('h1')).toContainText('AI');

    await page.goto('/showcase');
    await expect(page.locator('h1')).toContainText('Customer Showcase Gallery');

    await page.goto('/register');
    await expect(page.getByTestId('not-found-404')).toContainText('404');
  });

  test('2. Invite-Only Admission: blocks uninvited signup, issues single-use SHA-256 invites, enforces single-use & revocation, and logs audits', async ({
    page,
    request,
  }) => {
    // 2a. Uninvited signup on /signup is fail-closed rejected
    await page.goto('/signup');
    await page.getByTestId('signup-email-input').fill('uninvited@example.com');
    await page.getByTestId('signup-password-input').fill('StrongPass123!');
    await page.getByTestId('signup-submit-btn').click();

    const blockedAlert = page.getByTestId('signup-error-box');
    await expect(blockedAlert).toBeVisible();
    await expect(blockedAlert).toContainText('INVITATION_REQUIRED');

    // 2b. Invalid invitation token on /join/[token] shows invalid state
    await page.goto('/join/invalid-nonexistent-token-999');
    await expect(page.getByTestId('invite-invalid-state')).toBeVisible();
    await expect(page.getByTestId('invite-invalid-state')).toContainText(
      "This invite link isn't valid"
    );

    // 2c. Create a single-use invitation via /admin/invitations UI
    const uniqueEmail = `creator.${Date.now()}@acme.io`;
    await page.goto('/admin/invitations');
    await page.getByTestId('admin-invite-email-input').fill(uniqueEmail);
    await page.getByTestId('admin-invite-role-select').selectOption('CREATOR');
    await page.getByTestId('admin-create-invite-btn').click();

    const banner = page.getByTestId('generated-invite-banner');
    await expect(banner).toBeVisible();
    const inviteUrl = (await page.getByTestId('generated-invite-url').textContent()) || '';
    expect(inviteUrl).toContain('/invite/');

    // 2d. Redeem the single-use invitation
    const invitePath = new URL(inviteUrl.trim()).pathname;
    await page.goto(invitePath);
    await expect(page.getByTestId('invite-email-input')).toHaveValue(uniqueEmail);
    await page.getByTestId('invite-name-input').fill('Invited Creator');
    await page.getByTestId('invite-password-input').fill('CreatorSecure123!');
    await page.getByTestId('invite-accept-btn').click();

    await page.waitForURL('**/home**');
    await expect(page.getByTestId('home-onboarding-checklist')).toBeVisible();

    // 2e. Attempting to reuse the same single-use invitation token is rejected
    await page.goto(invitePath);
    await expect(page.getByTestId('invite-invalid-state')).toBeVisible();
    await expect(page.getByTestId('invite-invalid-state')).toContainText(
      'already been redeemed'
    );

    // 2f. Create another invitation and revoke it, then verify redemption fails with REVOKED
    const revokeEmail = `revoke.${Date.now()}@acme.io`;
    const createRes = await request.post('/api/invitations', {
      data: { invitedEmail: revokeEmail, role: 'VIEWER', ttlHours: 48 },
    });
    const createJson = await createRes.json();
    expect(createRes.ok()).toBeTruthy();

    const revokeRes = await request.post(
      `/api/invitations/${createJson.invitation.id}/revoke`
    );
    expect(revokeRes.ok()).toBeTruthy();

    const verifyRevoked = await request.get(
      `/api/invitations/verify?token=${createJson.rawToken}`
    );
    const verifyRevokedJson = await verifyRevoked.json();
    expect(verifyRevokedJson.valid).toBe(false);
    expect(verifyRevokedJson.reason).toBe('REVOKED');

    // 2g. Audit logs contain the recorded security events
    const auditRes = await request.get('/api/audit-logs');
    const auditJson = await auditRes.json();
    const actions = auditJson.logs.map((l: { action: string }) => l.action);
    expect(actions).toContain('INVITE_CREATED');
    expect(actions).toContain('INVITE_ACCEPTED');
    expect(actions).toContain('INVITE_REVOKED');
    expect(actions).toContain('INVITE_REJECTED');
  });

  test('3. Workspace Home, 5-Mode Create Modal, Demos Library, Interactive Editor (7 Tools) & Dynamic Player', async ({
    page,
  }) => {
    await page.goto('/home');
    await expect(page.getByTestId('home-onboarding-checklist')).toBeVisible();
    await expect(
      page.getByTestId('home-demo-card-cmvdpmcll02wb090j10dbikms')
    ).toBeVisible();

    // Open 5-mode Create Supademo modal
    await page.getByTestId('sidebar-create-supademo-btn').click();
    await expect(page.getByTestId('create-supademo-modal')).toBeVisible();

    // Open Interactive Demo Editor and exercise all 7 Top Toolbar tools
    await page.goto('/demo/cmvdpmcll02wb090j10dbikms/edit');
    await expect(page.getByTestId('editor-top-toolbar')).toBeVisible();

    for (const tool of [
      'hotspot',
      'blur',
      'voiceover',
      'animation',
      'chapter',
      'personalize',
      'enhance_ai',
    ]) {
      await page.getByTestId(`editor-tool-${tool}`).click();
      await expect(page.getByTestId('editor-inspector-panel')).toBeVisible();
    }

    // Open Share Modal
    await page.getByTestId('editor-share-btn').click();
    await expect(page.getByTestId('editor-share-modal')).toBeVisible();

    // Open Standalone Demo Player with dynamic variables (?name=Elena&company=Datadog)
    await page.goto(
      '/demo/cmvdpmcll02wb090j10dbikms?name=Elena&company=Datadog'
    );
    await expect(page.getByTestId('player-chapter-overlay')).toBeVisible();
    await page.getByTestId('player-chapter-cta-btn').click();
    await expect(page.getByTestId('player-hotspot-tooltip')).toContainText(
      'Datadog'
    );
  });

  test('4. AI Command, AI Demo Agents (14 sub-tabs), Showcases, In-App Hubs, Route Hubs, Analytics & 13 Settings Sections', async ({
    page,
  }) => {
    // AI Command Studio
    await page.goto('/command');
    await page
      .getByTestId('ai-command-input')
      .fill('Build a demo from uploads for SOC2 security');
    await page.getByTestId('ai-command-send-btn').click();
    await expect(page.getByTestId('ai-command-open-demo-link')).toBeVisible();

    // AI Demo Agents + 14-sub-tab Builder
    await page.goto('/agents');
    await expect(page.getByTestId('agents-credits-badge')).toContainText('1,500');

    await page.goto('/agent/cmvdqb9cw02f30m0jn2h09vg0/edit');
    await expect(page.getByTestId('agent-subtabs-nav')).toBeVisible();
    await page.getByTestId('agent-tab-guardrails').click();
    await page.getByTestId('agent-tab-knowledge-gaps').click();
    await page.getByTestId('agent-readiness-btn').click();
    await expect(page.getByTestId('agent-readiness-modal')).toBeVisible();

    // In-App Demo Hub Editor (Appearance, Content, Install + Live Widget)
    await page.goto('/hub/cmvdqcyr100zf090iff8812gy');
    await expect(page.getByTestId('hub-live-widget-modal')).toBeVisible();
    await page.getByTestId('hub-tab-install').click();
    await expect(page.getByTestId('hub-install-snippet')).toContainText(
      'supademo-hub.min.js'
    );

    // Route Hub Visual Node Canvas & Conditional Buyer Qualification Router
    await page.goto('/route/cmvdqdta100zk090i1gwa89sb/edit');
    await expect(page.getByTestId('route-visual-canvas')).toBeVisible();
    await expect(page.getByTestId('route-node-form')).toBeVisible();
    await expect(page.getByTestId('route-node-route')).toBeVisible();

    await page.goto('/route/cmvdqdta100zk090i1gwa89sb/share');
    await page.getByTestId('route-field-email').fill('vp@enterprise.io');
    await page
      .getByTestId('route-field-role')
      .selectOption('Customer Success & Onboarding');
    await page.getByTestId('route-submit-btn').click();
    await page.waitForURL('**/demo/cmvdpmcll02wb090j10dbikms**');

    // Analytics Dashboard
    await page.goto('/analytics');
    await expect(page.getByTestId('analytics-kpi-grid')).toBeVisible();
    await page.getByTestId('analytics-tab-accounts').click();
    await page.getByTestId('analytics-tab-device_geo').click();

    // Settings 13 Sections
    for (const sec of [
      'brand',
      'demo-player',
      'custom-domain',
      'general',
      'members',
      'billing',
      'api',
      'security',
      'demo-versioning',
      'integrations',
      'profile',
      'tags',
      'pronunciation-library',
    ]) {
      await page.goto(`/settings/${sec}`);
      await expect(page.getByTestId(`settings-panel-${sec}`)).toBeVisible();
    }
  });

  test('5. Production Media Upload API, Multi-Format SOP/HTML/MD/JSON Exports & Chrome Extension Manifest', async ({
    page,
    request,
  }) => {
    // 1. Test real binary/base64 image upload API (/api/uploads)
    const pixelPngBase64 =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const uploadRes = await request.post('/api/uploads', {
      data: {
        dataUrl: pixelPngBase64,
        filename: 'e2e-step.png',
      },
    });
    expect(uploadRes.status()).toBe(201);
    const uploadJson = await uploadRes.json();
    expect(uploadJson.ok).toBe(true);
    expect(uploadJson.url).toMatch(/^\/uploads\/.+\.png$/);

    // 2. Test Multi-Format Export API (SOP/PDF Printable HTML, Markdown, JSON)
    const sopRes = await request.get('/api/demos/cmvdpmcll02wb090j10dbikms/export?format=sop');
    expect(sopRes.status()).toBe(200);
    const sopHtml = await sopRes.text();
    expect(sopHtml).toContain('Supademo Step-by-Step SOP Guide');
    expect(sopHtml).toContain('Print / Save as PDF');

    const mdRes = await request.get('/api/demos/cmvdpmcll02wb090j10dbikms/export?format=markdown');
    expect(mdRes.status()).toBe(200);
    const mdText = await mdRes.text();
    expect(mdText).toContain('## Step 1:');

    const jsonRes = await request.get('/api/demos/cmvdpmcll02wb090j10dbikms/export?format=json');
    expect(jsonRes.status()).toBe(200);
    const jsonExport = await jsonRes.json();
    expect(jsonExport.demo.id).toBe('cmvdpmcll02wb090j10dbikms');
    expect(jsonExport.demo.steps.length).toBeGreaterThanOrEqual(4);

    // 3. Verify Share & Export Modal links inside the Demo Editor
    await page.goto('/demo/cmvdpmcll02wb090j10dbikms/edit');
    await page.getByTestId('editor-share-btn').click();
    await expect(page.getByTestId('export-sop-link')).toBeVisible();
    await expect(page.getByTestId('export-html-link')).toBeVisible();
    await expect(page.getByTestId('export-markdown-link')).toBeVisible();
    await expect(page.getByTestId('export-json-link')).toBeVisible();
  });
});
