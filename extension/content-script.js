// Supademo Content Script — records click coordinates & DOM labels
window.addEventListener(
  'click',
  (event) => {
    const target = event.target;
    if (!target || !(target instanceof HTMLElement)) return;

    const xPercent = Math.round((event.clientX / window.innerWidth) * 100);
    const yPercent = Math.round((event.clientY / window.innerHeight) * 100);
    const label = (
      target.innerText ||
      target.getAttribute('aria-label') ||
      target.getAttribute('placeholder') ||
      target.tagName
    )
      .trim()
      .slice(0, 60);

    chrome.runtime.sendMessage({
      type: 'CLICK_CAPTURED',
      payload: {
        tagName: target.tagName,
        title: `Click "${label || target.tagName}"`,
        calloutText: `Click on "${label || target.tagName}" to continue.`,
        xPercent,
        yPercent,
        pageUrl: window.location.href,
      },
    });
  },
  true
);
