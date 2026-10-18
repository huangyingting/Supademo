// Supademo MV3 Service Worker — captures visible tab screenshots on click events
let isRecording = false;
let capturedSteps = [];
let serverUrl = 'http://localhost:3250';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_STATE') {
    sendResponse({ isRecording, stepCount: capturedSteps.length, serverUrl });
    return true;
  }

  if (message.type === 'START_RECORDING') {
    isRecording = true;
    capturedSteps = [];
    if (message.serverUrl) serverUrl = message.serverUrl;
    sendResponse({ ok: true, isRecording });
    return true;
  }

  if (message.type === 'CLICK_CAPTURED' && isRecording) {
    chrome.tabs.captureVisibleTab(
      sender.tab?.windowId,
      { format: 'png' },
      (dataUrl) => {
        capturedSteps.push({
          ...message.payload,
          dataUrl: dataUrl || null,
          capturedAt: new Date().toISOString(),
        });
        sendResponse({ ok: true, stepCount: capturedSteps.length });
      }
    );
    return true;
  }

  if (message.type === 'STOP_AND_UPLOAD') {
    isRecording = false;
    uploadRecordingToSupademo(message.title || 'Recorded Browser Flow')
      .then((result) => sendResponse({ ok: true, ...result }))
      .catch((err) => sendResponse({ ok: false, error: String(err) }));
    return true;
  }
});

async function uploadRecordingToSupademo(title) {
  const uploadedSteps = [];
  for (let i = 0; i < capturedSteps.length; i++) {
    const step = capturedSteps[i];
    let mediaUrl = '/screenshots/40_demo_editor_main_desktop.png';
    if (step.dataUrl) {
      const upRes = await fetch(`${serverUrl}/api/uploads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataUrl: step.dataUrl,
          filename: `step-${i + 1}.png`,
        }),
      });
      if (upRes.ok) {
        const upData = await upRes.json();
        mediaUrl = upData.url;
      }
    }
    uploadedSteps.push({
      stepType: 'IMAGE',
      title: step.title || `Click ${step.tagName || 'Element'}`,
      subtitle: step.pageUrl || '',
      mediaUrl,
      hotspot: {
        x: step.xPercent,
        y: step.yPercent,
        text: step.calloutText,
        style: 'CALLOUT',
      },
    });
  }

  const createRes = await fetch(`${serverUrl}/api/demos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title,
      type: 'SCREENSHOT',
      description: `Captured via Supademo Chrome Extension (${uploadedSteps.length} steps)`,
      steps: uploadedSteps,
    }),
  });
  const data = await createRes.json();
  capturedSteps = [];
  return {
    demoId: data.demo?.id,
    editorUrl: `${serverUrl}/demo/${data.demo?.id}/edit`,
  };
}
