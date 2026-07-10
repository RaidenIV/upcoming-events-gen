"use strict";

const previewShell = document.querySelector(".viewport-frame-shell");
const initialFrame = document.getElementById("pagePreview");

if (!previewShell || !initialFrame) {
  throw new Error("The live preview viewport could not be initialized.");
}

function prepareFrame(frame) {
  frame.classList.add("live-preview-frame");
  frame.setAttribute("aria-hidden", "true");
  frame.tabIndex = -1;
  return frame;
}

let activeFrame = prepareFrame(initialFrame);
activeFrame.classList.add("is-active");
activeFrame.setAttribute("aria-hidden", "false");
activeFrame.removeAttribute("tabindex");

let standbyFrame = prepareFrame(initialFrame.cloneNode(false));
standbyFrame.removeAttribute("id");
previewShell.appendChild(standbyFrame);

let latestRequest = 0;
let lastRenderedCode = "";
let previewTitle = initialFrame.title || "Generated page preview";

function applyPreviewTitle(frame) {
  frame.title = previewTitle;
}

applyPreviewTitle(activeFrame);
applyPreviewTitle(standbyFrame);

export function setPreviewTitle(title) {
  previewTitle = String(title || "Generated page preview");
  applyPreviewTitle(activeFrame);
  applyPreviewTitle(standbyFrame);
}

export function renderPreview(code, { force = false } = {}) {
  const nextCode = String(code || "");
  if (!force && nextCode === lastRenderedCode) return;

  const requestId = ++latestRequest;
  const targetFrame = standbyFrame;

  const revealLoadedFrame = () => {
    if (requestId !== latestRequest || targetFrame !== standbyFrame) return;

    window.requestAnimationFrame(() => {
      if (requestId !== latestRequest || targetFrame !== standbyFrame) return;

      targetFrame.classList.add("is-active");
      targetFrame.setAttribute("aria-hidden", "false");
      targetFrame.removeAttribute("tabindex");

      activeFrame.classList.remove("is-active");
      activeFrame.setAttribute("aria-hidden", "true");
      activeFrame.tabIndex = -1;

      const previousFrame = activeFrame;
      activeFrame = targetFrame;
      standbyFrame = previousFrame;
      lastRenderedCode = nextCode;
    });
  };

  targetFrame.onload = revealLoadedFrame;
  applyPreviewTitle(targetFrame);
  targetFrame.srcdoc = nextCode;

  // External fonts, images, or embeds should not keep a completed inline page hidden.
  window.setTimeout(revealLoadedFrame, 500);
}
