const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const statusEl = document.getElementById('status');
const titleInput = document.getElementById('demoTitle');
const serverInput = document.getElementById('serverUrl');

chrome.runtime.sendMessage({ type: 'GET_STATE' }, (res) => {
  if (res?.isRecording) {
    startBtn.style.display = 'none';
    stopBtn.style.display = 'block';
    statusEl.textContent = `Recording active (${res.stepCount} steps captured)...`;
  }
});

startBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage(
    { type: 'START_RECORDING', serverUrl: serverInput.value },
    () => {
      startBtn.style.display = 'none';
      stopBtn.style.display = 'block';
      statusEl.textContent = 'Recording clicks & screenshots...';
    }
  );
});

stopBtn.addEventListener('click', () => {
  statusEl.textContent = 'Uploading steps to Supademo...';
  chrome.runtime.sendMessage(
    { type: 'STOP_AND_UPLOAD', title: titleInput.value },
    (res) => {
      if (res?.ok && res.editorUrl) {
        chrome.tabs.create({ url: res.editorUrl });
      } else {
        statusEl.textContent = res?.error || 'Upload completed.';
      }
    }
  );
});
