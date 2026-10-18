import 'dotenv/config';
import { prisma } from '../src/lib/prisma';
import { hashPassword } from '../src/lib/account-admission/passwords';
import { generateInvitationToken } from '../src/lib/account-admission/tokens';

async function main() {
  console.log('Seeding Supademo workspace, interactive demos, AI agents, showcases, hubs, routes & analytics...');

  const adminPasswordHash = await hashPassword('ChangeMeStrongPassword123!');

  let admin = await prisma.user.findUnique({
    where: { email: 'powlowskijoshuah@gmail.com' },
  });

  if (!admin) {
    admin = await prisma.user.create({
      data: {
        id: 'cmvdp0in002du0m0jhvgppgal',
        email: 'powlowskijoshuah@gmail.com',
        name: 'Joshuah Powlowski',
        passwordHash: adminPasswordHash,
        role: 'ADMIN',
        status: 'ACTIVE',
        jobTitle: 'VP of Product Enablement',
        onboardingCompleted: true,
        onboardingStage: 'completed',
      },
    });
  }

  let creatorUser = await prisma.user.findUnique({
    where: { email: 'sarah.chen@mycompany.io' },
  });
  if (!creatorUser) {
    creatorUser = await prisma.user.create({
      data: {
        email: 'sarah.chen@mycompany.io',
        name: 'Sarah Chen',
        passwordHash: adminPasswordHash,
        role: 'CREATOR',
        status: 'ACTIVE',
        jobTitle: 'Senior Solutions Engineer',
        onboardingCompleted: true,
      },
    });
  }

  let viewerUser = await prisma.user.findUnique({
    where: { email: 'marcus.vance@mycompany.io' },
  });
  if (!viewerUser) {
    viewerUser = await prisma.user.create({
      data: {
        email: 'marcus.vance@mycompany.io',
        name: 'Marcus Vance',
        passwordHash: adminPasswordHash,
        role: 'VIEWER',
        status: 'ACTIVE',
        jobTitle: 'Account Executive',
        onboardingCompleted: true,
      },
    });
  }

  const workspaceId = 'cmvdp7fhn032iz20jmc2ygn7z';
  const workspace = await prisma.workspace.upsert({
    where: { slug: 'my-company' },
    create: {
      id: workspaceId,
      name: 'My Company',
      slug: 'my-company',
      plan: 'GROWTH_TRIAL',
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      dataRegion: 'USWest2',
      aiCreditsRemaining: 1500,
      inviteShareToken: 'I5rirEXZv6jBxnH5KSBorH8jqXm_DuWZ',
      brandSettingsJson: JSON.stringify({
        logoText: 'My Company',
        primaryColor: '#4F46E5',
        accentColor: '#7C3AED',
        ctaText: 'Book a Demo',
        ctaUrl: 'https://supademo.com/enterprise',
        showWatermark: false,
        customFont: 'Inter',
      }),
      playerSettingsJson: JSON.stringify({
        showNavbar: true,
        showNavigationButtons: true,
        showProgressBar: true,
        defaultHotspotAnimation: 'PING',
        defaultBrowserChrome: 'LIGHT',
        allowFullscreen: true,
        enableKeyboardNavigation: true,
      }),
      customDomainJson: JSON.stringify({
        domain: 'demos.mycompany.io',
        cnameTarget: 'cname.supademo.com',
        verified: true,
        sslActive: true,
      }),
      generalSettingsJson: JSON.stringify({
        workspaceName: 'My Company',
        defaultVisibility: 'PUBLIC',
        weeklyDigestEmail: true,
        viewNotificationEmail: true,
        leadCaptureSlackAlert: true,
      }),
      securitySettingsJson: JSON.stringify({
        admissionMode: 'invite_only',
        aiHotspotGeneration: true,
        gdprAnonymizeIp: true,
        enforceSso: false,
        domainRestriction: 'mycompany.io',
      }),
      versioningSettingsJson: JSON.stringify({
        enableDraftPublishWorkflow: true,
        autoSnapshotOnShare: true,
        retentionLimit: 25,
      }),
      integrationsJson: JSON.stringify([
        { id: 'hubspot', name: 'HubSpot', category: 'CRM', connected: true, description: 'Sync demo views, completion events, and captured leads directly to HubSpot contacts & deals.' },
        { id: 'salesforce', name: 'Salesforce', category: 'CRM', connected: true, description: 'Push buyer engagement signals and Route Hub qualification answers to Salesforce.' },
        { id: 'slack', name: 'Slack', category: 'Notifications', connected: true, description: 'Receive instant Slack alerts when target accounts view a Supademo or Showcase.' },
        { id: 'ga4', name: 'Google Analytics', category: 'Analytics', connected: false, description: 'Send step-level interactive demo events into Google Analytics 4.' },
        { id: 'zapier', name: 'Zapier', category: 'Automation', connected: false, description: 'Trigger 6,000+ apps whenever a viewer completes a demo or submits a lead form.' },
        { id: 'gtm', name: 'Google Tag Manager', category: 'Analytics', connected: false, description: 'Manage custom tracking pixels inside standalone Supademos and Showcases.' },
        { id: 'marketo', name: 'Marketo', category: 'Marketing', connected: false, description: 'Enrich Marketo lead scores with interactive product tour telemetry.' },
        { id: 'seismic', name: 'Seismic', category: 'Enablement', connected: false, description: 'Embed governed interactive demos directly inside Seismic playbooks.' },
        { id: 'webhook', name: 'Webhook', category: 'Developer', connected: true, description: 'POST real-time JSON payloads on demo view, step progression, and form submission.' },
      ]),
      pronunciationsJson: JSON.stringify([
        { id: 'p1', word: 'Supademo', phonetic: 'Soo-pah-deh-moh', language: 'en-US' },
        { id: 'p2', word: 'SOC 2', phonetic: 'Sock Two', language: 'en-US' },
        { id: 'p3', word: 'OAuth', phonetic: 'Oh-Auth', language: 'en-US' },
      ]),
      apiKeysJson: JSON.stringify([
        { id: 'key_prod_1', name: 'Production MCP & REST Key', prefix: 'sd_live_98f4...e21a', createdAt: '2026-07-10', lastUsed: '2 hours ago' },
      ]),
      checklistJson: JSON.stringify({
        exploreSample: true,
        recordDemo: true,
        customizeDemo: true,
        shareDemo: false,
      }),
    },
    update: {},
  });

  for (const member of [
    { userId: admin.id, role: 'ADMIN' },
    { userId: creatorUser.id, role: 'CREATOR' },
    { userId: viewerUser.id, role: 'VIEWER' },
  ]) {
    await prisma.workspaceMember.upsert({
      where: {
        workspaceId_userId: {
          workspaceId: workspace.id,
          userId: member.userId,
        },
      },
      create: {
        workspaceId: workspace.id,
        userId: member.userId,
        role: member.role,
      },
      update: { role: member.role },
    });
  }

  // Tags matching app.supademo.com/settings/tags
  const existingTags = await prisma.tag.count({ where: { workspaceId: workspace.id } });
  if (existingTags === 0) {
    await prisma.tag.createMany({
      data: [
        { workspaceId: workspace.id, name: 'Getting Started', color: '#4F46E5', usageCount: 4 },
        { workspaceId: workspace.id, name: 'New Hire', color: '#10B981', usageCount: 2 },
        { workspaceId: workspace.id, name: 'Onboarding', color: '#F59E0B', usageCount: 5 },
        { workspaceId: workspace.id, name: 'Enterprise GTM', color: '#EC4899', usageCount: 3 },
      ],
    });
  }

  // Folders
  let folderOnboarding = await prisma.folder.findFirst({
    where: { workspaceId: workspace.id, name: 'Customer Onboarding' },
  });
  if (!folderOnboarding) {
    folderOnboarding = await prisma.folder.create({
      data: {
        workspaceId: workspace.id,
        name: 'Customer Onboarding',
        scope: 'TEAM',
        color: '#4F46E5',
      },
    });
    await prisma.folder.create({
      data: {
        workspaceId: workspace.id,
        name: 'Sales Presales Playbooks',
        scope: 'TEAM',
        color: '#7C3AED',
      },
    });
  }

  // Flagship Demo matching /demo/cmvdpmcll02wb090j10dbikms/edit
  const flagshipDemoId = 'cmvdpmcll02wb090j10dbikms';
  const existingDemo = await prisma.demo.findUnique({ where: { id: flagshipDemoId } });
  if (!existingDemo) {
    await prisma.demo.create({
      data: {
        id: flagshipDemoId,
        workspaceId: workspace.id,
        folderId: folderOnboarding.id,
        creatorId: admin.id,
        title: 'Supademo Platform Interactive Tour',
        description: 'End-to-end interactive walkthrough of Supademo AI Editor, Voiceover, Personalization, and Route Hub.',
        type: 'UPLOAD',
        scope: 'TEAM',
        visibility: 'PUBLIC',
        status: 'PUBLISHED',
        backgroundStyle: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4F46E5 100%)',
        aspectRatio: '16:9',
        hideBrowserBar: false,
        darkMode: false,
        autoplay: false,
        voiceoverEnabled: true,
        defaultVoiceId: 'Tyler',
        variablesJson: JSON.stringify([
          { key: 'name', label: 'Prospect Name', fallback: 'Alex' },
          { key: 'company', label: 'Company Name', fallback: 'Acme Corp' },
          { key: 'role', label: 'Job Role', fallback: 'Product Leader' },
        ]),
        tagsJson: JSON.stringify(['Getting Started', 'Onboarding']),
        viewsCount: 1284,
        engagedViewsCount: 1012,
        completionRate: 84,
        steps: {
          create: [
            {
              orderIndex: 0,
              stepType: 'CHAPTER',
              title: 'Welcome to Supademo, {{name}}!',
              subtitle: 'See how {{company}} can launch interactive product demos in minutes, not days.',
              mediaUrl: '/screenshots/06_home_dashboard_desktop.png',
              hotspotJson: JSON.stringify({
                text: 'Start Interactive Tour',
                style: 'CALLOUT',
                x: 50,
                y: 68,
                bgColor: '#4F46E5',
                textColor: '#FFFFFF',
                backdrop: 'DARK',
                borderRadius: 'ROUND',
                animation: 'PING',
                visibility: 'ALWAYS',
                width: 'MD',
                position: 'BOTTOM',
                showNext: true,
                showBack: false,
                actionType: 'NEXT',
                actionTarget: '',
              }),
              chapterJson: JSON.stringify({
                isChapter: true,
                chapterType: 'DEFAULT',
                title: 'Welcome to Supademo, {{name}}!',
                subtitle: 'See how {{company}} can launch interactive product demos in minutes, not days.',
                buttonText: 'Start Interactive Tour',
                secondaryButtonText: 'Book Enterprise Demo',
                secondaryButtonUrl: 'https://supademo.com/enterprise',
                align: 'CENTER',
                theme: 'DARK',
                blurOpacity: 75,
                formFields: [
                  { name: 'email', label: 'Work Email', required: true },
                  { name: 'company', label: 'Company', required: false },
                ],
              }),
              voiceoverJson: JSON.stringify({
                script: 'Welcome to Supademo! In this interactive tour, you will see how modern teams create AI-powered interactive demos in minutes.',
                voiceId: 'Tyler',
                syncMode: 'AUTO',
              }),
              animationJson: JSON.stringify({ zoomLevel: 1.0, panX: 50, panY: 50, autoplayDuration: 5 }),
            },
            {
              orderIndex: 1,
              stepType: 'IMAGE',
              title: 'Click the Hotspot Editor to customize interactive callouts',
              subtitle: 'Choose Pointer, Callout, or Area styles with custom colors, backdrops, and branching actions.',
              mediaUrl: '/screenshots/43_editor_hotspot_panel_desktop.png',
              hotspotJson: JSON.stringify({
                text: 'Click here to customize Hotspot style, backdrop, and branching navigation for {{company}}',
                style: 'POINTER',
                x: 28,
                y: 34,
                bgColor: '#4F46E5',
                textColor: '#FFFFFF',
                backdrop: 'LIGHT',
                borderRadius: 'ROUND',
                animation: 'PING',
                visibility: 'ALWAYS',
                width: 'MD',
                position: 'RIGHT',
                showNext: true,
                showBack: true,
                actionType: 'NEXT',
                actionTarget: '',
              }),
              annotationsJson: JSON.stringify([
                { id: 'ann_1', type: 'BLUR', x: 74, y: 12, width: 18, height: 8, color: '#94A3B8', label: 'Redacted PII' },
                { id: 'ann_2', type: 'RECT', x: 18, y: 24, width: 28, height: 32, color: '#4F46E5', label: 'Hotspot Inspector' },
              ]),
              voiceoverJson: JSON.stringify({
                script: 'Use the Hotspot panel to switch between Pointer, Callout, and Area hotspots, adjust backdrop dimming, or add conditional branching.',
                voiceId: 'Tyler',
                syncMode: 'AUTO',
              }),
              animationJson: JSON.stringify({ zoomLevel: 1.18, panX: 28, panY: 34, autoplayDuration: 5 }),
            },
            {
              orderIndex: 2,
              stepType: 'IMAGE',
              title: 'Generate realistic AI Voiceovers & Translations in 1 click',
              subtitle: 'Select from 12 lifelike ElevenLabs & Inworld voices or clone your own voice.',
              mediaUrl: '/screenshots/54_editor_voiceover_exact.png',
              hotspotJson: JSON.stringify({
                text: 'Pick an AI Voice (Tyler, Kelsey, Lauren, Brian) and click Sync All across steps',
                style: 'CALLOUT',
                x: 46,
                y: 42,
                bgColor: '#7C3AED',
                textColor: '#FFFFFF',
                backdrop: 'DARK',
                borderRadius: 'PILL',
                animation: 'PULSE',
                visibility: 'ALWAYS',
                width: 'LG',
                position: 'BOTTOM',
                showNext: true,
                showBack: true,
                actionType: 'NEXT',
                actionTarget: '',
              }),
              voiceoverJson: JSON.stringify({
                script: 'Add lifelike AI voiceovers in over thirty languages using ElevenLabs and Inworld neural voices, synced automatically to every step.',
                voiceId: 'Tyler',
                syncMode: 'AUTO',
              }),
              animationJson: JSON.stringify({ zoomLevel: 1.12, panX: 46, panY: 42, autoplayDuration: 5 }),
            },
            {
              orderIndex: 3,
              stepType: 'HTML',
              title: 'Interactive HTML & Sandbox Environment',
              subtitle: 'Let buyers freely click live DOM elements in an isolated interactive sandbox.',
              mediaUrl: '/screenshots/50_editor_share_modal_desktop.png',
              htmlContent: `<div style="font-family: Inter, sans-serif; padding: 28px; background: #0F172A; color: #F8FAFC; border-radius: 16px;">
  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
    <strong style="font-size:18px;">Acme Cloud Sandbox — Live DOM Capture</strong>
    <span style="background:#4F46E5; padding:4px 12px; border-radius:999px; font-size:12px;">Interactive HTML Mode</span>
  </div>
  <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:16px;">
    <div style="background:#1E293B; padding:16px; border-radius:12px; border:1px solid #334155;">
      <div style="color:#94A3B8; font-size:12px;">Active Pipelines</div>
      <div style="font-size:24px; font-weight:700; margin-top:4px;">42</div>
    </div>
    <div style="background:#1E293B; padding:16px; border-radius:12px; border:1px solid #4F46E5;">
      <div style="color:#94A3B8; font-size:12px;">Conversion Lift</div>
      <div style="font-size:24px; font-weight:700; color:#34D399; margin-top:4px;">+64.8%</div>
    </div>
    <div style="background:#1E293B; padding:16px; border-radius:12px; border:1px solid #334155;">
      <div style="color:#94A3B8; font-size:12px;">Avg Completion</div>
      <div style="font-size:24px; font-weight:700; margin-top:4px;">84%</div>
    </div>
  </div>
</div>`,
              hotspotJson: JSON.stringify({
                text: 'Share via personalized trackable link, embed code, or export to MP4 / GIF / SOP PDF!',
                style: 'POINTER',
                x: 62,
                y: 48,
                bgColor: '#10B981',
                textColor: '#FFFFFF',
                backdrop: 'OFF',
                borderRadius: 'ROUND',
                animation: 'PING',
                visibility: 'ALWAYS',
                width: 'MD',
                position: 'TOP',
                showNext: true,
                showBack: true,
                actionType: 'NEXT',
                actionTarget: '',
              }),
              voiceoverJson: JSON.stringify({
                script: 'Finally, share your demo with personalized dynamic variables, embed it anywhere, or export it as an MP4 video or SOP document.',
                voiceId: 'Tyler',
                syncMode: 'AUTO',
              }),
              animationJson: JSON.stringify({ zoomLevel: 1.0, panX: 50, panY: 50, autoplayDuration: 5 }),
            },
            {
              orderIndex: 4,
              stepType: 'CHAPTER',
              title: 'Ready to accelerate {{company}}\'s pipeline?',
              subtitle: 'Enter your work email below to unlock your personalized Sandbox & Showcase.',
              mediaUrl: '/screenshots/19_analytics_desktop.png',
              chapterJson: JSON.stringify({
                isChapter: true,
                chapterType: 'FORM',
                title: 'Ready to accelerate {{company}}\'s pipeline?',
                subtitle: 'Enter your work email below to unlock your personalized Sandbox & Showcase.',
                buttonText: 'Unlock Full Product Sandbox',
                align: 'CENTER',
                theme: 'DARK',
                blurOpacity: 80,
              }),
              hotspotJson: JSON.stringify({
                text: 'Complete Tour',
                style: 'CALLOUT',
                x: 50,
                y: 65,
                bgColor: '#4F46E5',
                textColor: '#FFFFFF',
                backdrop: 'DARK',
                borderRadius: 'ROUND',
                animation: 'NONE',
                visibility: 'ALWAYS',
                width: 'MD',
                position: 'BOTTOM',
                showNext: false,
                showBack: true,
                actionType: 'URL',
                actionTarget: 'https://supademo.com',
              }),
              voiceoverJson: JSON.stringify({
                script: 'Thank you for exploring Supademo! Submit your work email to receive the full interactive kit.',
                voiceId: 'Tyler',
                syncMode: 'AUTO',
              }),
              animationJson: JSON.stringify({ zoomLevel: 1.0, panX: 50, panY: 50, autoplayDuration: 5 }),
            },
          ],
        },
        versions: {
          create: [
            {
              versionNumber: 1,
              label: 'v1.0 — Initial Recorded Upload',
              status: 'PUBLISHED',
              authorName: 'Joshuah Powlowski',
            },
            {
              versionNumber: 2,
              label: 'v2.0 — Added AI Voiceover & Dynamic Variables',
              status: 'PUBLISHED',
              authorName: 'Joshuah Powlowski',
            },
          ],
        },
        comments: {
          create: [
            {
              stepIndex: 1,
              authorName: 'Sarah Chen',
              authorEmail: 'sarah.chen@mycompany.io',
              body: 'Love the {{company}} personalization variable on Step 2! Ready for the enterprise launch.',
              resolved: false,
            },
          ],
        },
      },
    });

    // Second Demo: Sandbox Demo
    await prisma.demo.create({
      data: {
        id: 'cmvdpsandbox002',
        workspaceId: workspace.id,
        folderId: folderOnboarding.id,
        creatorId: creatorUser.id,
        title: 'AI Command & MCP Automation Sandbox',
        description: 'Interactive sandbox demonstrating natural-language demo creation and audit workflows.',
        type: 'SANDBOX',
        scope: 'TEAM',
        visibility: 'PUBLIC',
        status: 'PUBLISHED',
        tagsJson: JSON.stringify(['Enterprise GTM', 'Onboarding']),
        viewsCount: 642,
        engagedViewsCount: 518,
        completionRate: 81,
        steps: {
          create: [
            {
              orderIndex: 0,
              stepType: 'IMAGE',
              title: 'Open the AI Command Dock from any workspace view',
              subtitle: 'Ask AI Command to build, translate, or audit demos in seconds.',
              mediaUrl: '/screenshots/12_command_ai_desktop.png',
              hotspotJson: JSON.stringify({
                text: 'Type a natural language prompt or pick "Build a demo from uploads"',
                style: 'POINTER',
                x: 52,
                y: 54,
                bgColor: '#4F46E5',
                textColor: '#FFFFFF',
                backdrop: 'LIGHT',
                borderRadius: 'ROUND',
                animation: 'PING',
                visibility: 'ALWAYS',
                width: 'MD',
                position: 'TOP',
                showNext: true,
                showBack: false,
                actionType: 'NEXT',
                actionTarget: '',
              }),
            },
            {
              orderIndex: 1,
              stepType: 'IMAGE',
              title: 'Run AI Audit & Instant Multi-Language Translation',
              subtitle: 'Automatically optimize step copy and translate into 30+ languages.',
              mediaUrl: '/screenshots/57_editor_enhance_ai_exact.png',
              hotspotJson: JSON.stringify({
                text: 'Click "Enhance with AI" to run AI Audit, AI Text, AI Voice, or AI Translate',
                style: 'CALLOUT',
                x: 48,
                y: 44,
                bgColor: '#7C3AED',
                textColor: '#FFFFFF',
                backdrop: 'DARK',
                borderRadius: 'ROUND',
                animation: 'PULSE',
                visibility: 'ALWAYS',
                width: 'MD',
                position: 'BOTTOM',
                showNext: false,
                showBack: true,
                actionType: 'NEXT',
                actionTarget: '',
              }),
            },
          ],
        },
      },
    });
  }

  // Video Recording matching /videos
  const existingVideos = await prisma.videoRecording.count({ where: { workspaceId: workspace.id } });
  if (existingVideos === 0) {
    await prisma.videoRecording.createMany({
      data: [
        {
          id: 'vid_onboarding_01',
          workspaceId: workspace.id,
          folderId: folderOnboarding.id,
          title: 'Q3 Product Release Walkthrough (Screen + Cam)',
          description: 'Full 1080p screen recording ready to convert into an interactive step-by-step Supademo.',
          durationSec: 114,
          scope: 'TEAM',
          thumbnailUrl: '/screenshots/40_demo_editor_main_desktop.png',
          videoUrl: '',
          viewsCount: 219,
          convertedDemoId: flagshipDemoId,
        },
        {
          id: 'vid_presales_02',
          workspaceId: workspace.id,
          folderId: folderOnboarding.id,
          title: 'Enterprise SSO & Audit Log Setup Recording',
          description: 'Walkthrough of SAML SSO and invite-only admission controls.',
          durationSec: 82,
          scope: 'TEAM',
          thumbnailUrl: '/screenshots/27_settings_security_desktop.png',
          videoUrl: '',
          viewsCount: 94,
        },
      ],
    });
  }

  // AI Demo Agent matching /agent/cmvdqb9cw02f30m0jn2h09vg0/edit
  const agentId = 'cmvdqb9cw02f30m0jn2h09vg0';
  await prisma.aiAgent.upsert({
    where: { slug: 'supademo-solutions-agent' },
    create: {
      id: agentId,
      workspaceId: workspace.id,
      name: 'Supademo AI Solutions Engineer',
      slug: 'supademo-solutions-agent',
      status: 'LIVE',
      creditsUsed: 45,
      readinessScore: 94,
      identityJson: JSON.stringify({
        agentName: 'Aria — AI Solutions Engineer',
        roleTitle: '24/7 Interactive Product Specialist',
        voiceId: 'Kelsey',
        language: 'English (US)',
        welcomeMessage: 'Hi there! Tell me what you want to achieve and I will walk you through the exact interactive demo.',
        personaPrompt: 'Consultative, concise B2B SaaS Solutions Engineer who recommends and narrates interactive product demos.',
      }),
      interfaceJson: JSON.stringify({
        primaryColor: '#4F46E5',
        theme: 'DARK',
        position: 'BOTTOM_RIGHT',
        launcherLabel: 'Ask AI & Watch Demo',
        showAvatar: true,
      }),
      guardrailsJson: JSON.stringify({
        strictKnowledgeBaseOnly: true,
        blockCompetitorComparisons: true,
        requireWorkEmailBeforeDemo: false,
        fallbackEscalationUrl: 'https://supademo.com/enterprise',
        restrictedTopics: ['Unreleased roadmap pricing', 'Legal SLA modifications'],
      }),
      quickLinksJson: JSON.stringify([
        { id: 'ql1', label: 'Book a 1:1 Architecture Review', url: 'https://supademo.com/enterprise' },
        { id: 'ql2', label: 'Explore Interactive Tour', url: `/demo/${flagshipDemoId}` },
        { id: 'ql3', label: 'View Security & SOC 2 Docs', url: '/enterprise' },
      ]),
      securityJson: JSON.stringify({
        allowedDomains: ['mycompany.io', 'supademo.com', 'localhost'],
        rateLimitPerIpHour: 60,
        captureLeadEmail: true,
        gdprConsentBanner: true,
      }),
      knowledgeBaseJson: JSON.stringify({
        demoIds: [flagshipDemoId, 'cmvdpsandbox002'],
        videoIds: ['vid_onboarding_01'],
        documents: [
          { id: 'doc1', title: 'Enterprise Security & SOC 2 Type II Whitepaper.pdf', pages: 18, status: 'INDEXED' },
          { id: 'doc2', title: 'Supademo Implementation Playbook.pdf', pages: 12, status: 'INDEXED' },
        ],
        websites: [
          { id: 'web1', url: 'https://supademo.com/features', pagesCrawled: 14, lastSynced: 'Today' },
          { id: 'web2', url: 'https://supademo.com/pricing', pagesCrawled: 3, lastSynced: 'Today' },
        ],
        textSnippets: [
          { id: 'txt1', title: 'Pricing & Seat Policy FAQ', content: 'Viewers are always free. Scale is $38/creator/mo, Business is $199/mo, and Growth is $350/mo with unlimited sandbox & AI features.' },
        ],
      }),
      monitorJson: JSON.stringify({
        totalSessions: 148,
        qualifiedLeads: 62,
        avgDurationSec: 134,
        demoLaunchRate: '79%',
        sessions: [
          { id: 's1', visitor: 'vp-eng@stripe-demo.io', company: 'Stripe Demo', intent: 'Enterprise Sandbox & SSO', demosWatched: 2, duration: '3m 12s', time: '14 mins ago' },
          { id: 's2', visitor: 'enablement@figma-demo.io', company: 'Figma Demo', intent: 'AI Voiceover & Translation', demosWatched: 3, duration: '4m 05s', time: '2 hours ago' },
        ],
        triggers: [
          { id: 'tr1', name: 'High-Intent Enterprise Alert', condition: 'Visitor asks about SSO, SOC 2, or >25 seats', channel: 'Slack #gtm-alerts + HubSpot', active: true },
        ],
        knowledgeGaps: [
          { id: 'kg1', question: 'Do you support self-hosted on-prem air-gapped deployments?', occurrences: 4, status: 'OPEN' },
        ],
      }),
    },
    update: {},
  });

  // Showcase matching /showcase/cmvdq8jjh033xz20jka70wi4b/edit
  const showcaseId = 'cmvdq8jjh033xz20jka70wi4b';
  await prisma.showcase.upsert({
    where: { id: showcaseId },
    create: {
      id: showcaseId,
      workspaceId: workspace.id,
      title: 'Enterprise Product Enablement Kit',
      description: 'Curated multi-step collection of interactive demos, onboarding videos, and security documentation.',
      theme: 'SIDEBAR',
      status: 'PUBLISHED',
      ctaText: 'Start 14-Day Growth Trial',
      ctaUrl: '/upgrade',
      viewsCount: 845,
      sectionsJson: JSON.stringify([
        {
          id: 'sec_1',
          title: '1. Core Platform Walkthroughs',
          items: [
            { id: 'item_1', type: 'DEMO', refId: flagshipDemoId, title: 'Supademo Platform Interactive Tour', duration: '5 steps' },
            { id: 'item_2', type: 'DEMO', refId: 'cmvdpsandbox002', title: 'AI Command & MCP Automation Sandbox', duration: '2 steps' },
          ],
        },
        {
          id: 'sec_2',
          title: '2. Deep-Dive Recordings & Resources',
          items: [
            { id: 'item_3', type: 'VIDEO', refId: 'vid_onboarding_01', title: 'Q3 Product Release Walkthrough', duration: '1:54' },
            { id: 'item_4', type: 'PDF', refId: 'doc_soc2', title: 'Enterprise Security & Architecture Guide (PDF)', url: '/enterprise', duration: '18 pages' },
            { id: 'item_5', type: 'LINK', refId: 'lnk_roi', title: 'Interactive ROI & Pricing Breakdown', url: '/pricing', duration: 'External Link' },
          ],
        },
      ]),
    },
    update: {},
  });

  // In-App Demo Hub matching /hub/cmvdqcyr100zf090iff8812gy
  const hubId = 'cmvdqcyr100zf090iff8812gy';
  await prisma.demoHub.upsert({
    where: { id: hubId },
    create: {
      id: hubId,
      workspaceId: workspace.id,
      name: 'In-App Onboarding & Help Hub',
      status: 'PUBLISHED',
      viewsCount: 530,
      appearanceJson: JSON.stringify({
        headerTitle: 'How can we help you today?',
        headerSubtitle: 'Explore interactive step-by-step product guides right inside the app.',
        searchPlaceholder: 'Search interactive guides, voiceovers, or features...',
        alignment: 'LEFT',
        headerBgType: 'GRADIENT',
        headerBgValue: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
        contentTheme: 'LIGHT',
        launcherText: 'Interactive Guides',
        launcherPosition: 'BOTTOM_RIGHT',
        footerLinks: [
          { label: 'Documentation', url: 'https://supademo.com/features' },
          { label: 'Contact Support', url: 'https://supademo.com/enterprise' },
          { label: 'Book Onboarding Call', url: '/upgrade' },
        ],
      }),
      contentJson: JSON.stringify({
        categories: [
          {
            id: 'cat_getting_started',
            title: 'Getting Started in 5 Minutes',
            demoIds: [flagshipDemoId],
          },
          {
            id: 'cat_ai_automation',
            title: 'AI Command, Voiceover & Agents',
            demoIds: ['cmvdpsandbox002'],
          },
        ],
      }),
      installJson: JSON.stringify({
        triggerMode: 'FLOATING_BADGE',
        cssSelector: '#supademo-hub-trigger',
        allowedDomains: ['app.mycompany.io', 'localhost:3100'],
        scriptSnippet: `<script async src="https://app.supademo.com/hub-widget.js" data-hub-id="${hubId}"></script>`,
      }),
    },
    update: {},
  });

  // Route Hub matching /route/cmvdqdta100zk090i1gwa89sb/edit
  const routeId = 'cmvdqdta100zk090i1gwa89sb';
  await prisma.routeHub.upsert({
    where: { id: routeId },
    create: {
      id: routeId,
      workspaceId: workspace.id,
      name: 'Enterprise Buyer Qualification & Demo Router',
      entryMode: 'BOTH',
      status: 'PUBLISHED',
      submissionsCount: 184,
      styleJson: JSON.stringify({
        theme: 'DARK',
        accentColor: '#4F46E5',
        headline: 'See a tailored Supademo experience for your team',
        subheadline: 'Answer 2 quick questions so we can route you to the most relevant interactive tour.',
      }),
      nodesJson: JSON.stringify([
        {
          id: 'node_form',
          type: 'FORM',
          title: 'Lead & Intent Qualification Form',
          fields: [
            { id: 'f_email', label: 'Work Email', type: 'email', required: true },
            { id: 'f_company', label: 'Company Name', type: 'text', required: true },
            {
              id: 'f_team',
              label: 'Which team are you on?',
              type: 'select',
              options: ['Sales & Presales', 'Product & Customer Success', 'Marketing & Growth'],
            },
            {
              id: 'f_size',
              label: 'Company Size',
              type: 'select',
              options: ['1-50 employees', '51-500 employees', '500+ Enterprise'],
            },
          ],
        },
        {
          id: 'node_integrations',
          type: 'INTEGRATIONS',
          title: 'CRM & Slack Enrichment',
          providers: ['HubSpot', 'Salesforce', 'Slack #inbound-demos'],
        },
        {
          id: 'node_route_enterprise',
          type: 'ROUTE',
          title: 'Route A: Enterprise & Sales Enablement',
          condition: 'Team = Sales & Presales OR Size = 500+ Enterprise',
          destinationType: 'SHOWCASE',
          destinationId: showcaseId,
          destinationLabel: 'Enterprise Product Enablement Kit',
        },
        {
          id: 'node_route_selfserve',
          type: 'ROUTE',
          title: 'Route B: Product & Self-Serve Onboarding',
          condition: 'All other responses (Default fallback)',
          destinationType: 'DEMO',
          destinationId: flagshipDemoId,
          destinationLabel: 'Supademo Platform Interactive Tour',
        },
      ]),
      edgesJson: JSON.stringify([
        { from: 'node_form', to: 'node_integrations' },
        { from: 'node_integrations', to: 'node_route_enterprise' },
        { from: 'node_integrations', to: 'node_route_selfserve' },
      ]),
    },
    update: {},
  });

  // Analytics Events & Lead Captures
  const eventCount = await prisma.analyticsEvent.count({ where: { workspaceId: workspace.id } });
  if (eventCount === 0) {
    await prisma.analyticsEvent.createMany({
      data: [
        { workspaceId: workspace.id, targetType: 'DEMO', targetId: flagshipDemoId, targetTitle: 'Supademo Platform Interactive Tour', eventType: 'ENGAGED_VIEW', viewerEmail: 'alex.rivera@stripe.com', accountName: 'Stripe', os: 'macOS', browser: 'Chrome', country: 'United States', durationSec: 142 },
        { workspaceId: workspace.id, targetType: 'DEMO', targetId: flagshipDemoId, targetTitle: 'Supademo Platform Interactive Tour', eventType: 'COMPLETION', viewerEmail: 'elena.rostova@notion.so', accountName: 'Notion', os: 'macOS', browser: 'Safari', country: 'United Kingdom', durationSec: 168 },
        { workspaceId: workspace.id, targetType: 'DEMO', targetId: 'cmvdpsandbox002', targetTitle: 'AI Command & MCP Automation Sandbox', eventType: 'ENGAGED_VIEW', viewerEmail: 'david.kim@datadoghq.com', accountName: 'Datadog', os: 'Windows', browser: 'Edge', country: 'Canada', durationSec: 95 },
        { workspaceId: workspace.id, targetType: 'SHOWCASE', targetId: showcaseId, targetTitle: 'Enterprise Product Enablement Kit', eventType: 'VIEW', viewerEmail: 'priya.patel@linear.app', accountName: 'Linear', os: 'macOS', browser: 'Chrome', country: 'Germany', durationSec: 210 },
      ],
    });

    await prisma.leadCapture.createMany({
      data: [
        { workspaceId: workspace.id, sourceType: 'DEMO', sourceId: flagshipDemoId, sourceTitle: 'Supademo Platform Interactive Tour', email: 'alex.rivera@stripe.com', name: 'Alex Rivera', company: 'Stripe', role: 'Head of Presales', intent: 'Interactive Sandbox Demos', routedTo: 'Enterprise Product Enablement Kit' },
        { workspaceId: workspace.id, sourceType: 'ROUTE_HUB', sourceId: routeId, sourceTitle: 'Enterprise Buyer Qualification & Demo Router', email: 'elena.rostova@notion.so', name: 'Elena Rostova', company: 'Notion', role: 'VP Product Marketing', intent: 'Website Embeds & AI Translation', routedTo: 'Supademo Platform Interactive Tour' },
      ],
    });
  }

  // Seed sample Pending Invitation and AuditLog entries if none exist
  const inviteCount = await prisma.invitation.count();
  if (inviteCount === 0) {
    const { tokenHash } = generateInvitationToken();
    await prisma.invitation.create({
      data: {
        tokenHash,
        invitedEmail: 'taylor.wright@mycompany.io',
        role: 'CREATOR',
        status: 'PENDING',
        workspaceId: workspace.id,
        expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
        createdByUserId: admin.id,
      },
    });
  }

  const auditCount = await prisma.auditLog.count();
  if (auditCount === 0) {
    await prisma.auditLog.createMany({
      data: [
        {
          workspaceId: workspace.id,
          actorUserId: admin.id,
          actorEmail: admin.email,
          action: 'BOOTSTRAP_ADMIN_CREATED',
          targetType: 'User',
          targetId: admin.id,
          metadataJson: JSON.stringify({ role: 'ADMIN', via: 'cli' }),
          ipAddress: '127.0.0.1',
        },
        {
          workspaceId: workspace.id,
          actorUserId: admin.id,
          actorEmail: admin.email,
          action: 'INVITE_CREATED',
          targetType: 'Invitation',
          metadataJson: JSON.stringify({ invitedEmail: 'taylor.wright@mycompany.io', role: 'CREATOR' }),
          ipAddress: '127.0.0.1',
        },
      ],
    });
  }

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
