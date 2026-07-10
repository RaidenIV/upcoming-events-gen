"use strict";

import { activateUpcomingEvents } from "./upcoming-events.js";
import { activateEventCodeBlock } from "./event-code-block.js";
import { setPreviewTitle } from "./preview.js";

const appTitle = document.getElementById("appTitle");
const modeToggle = document.getElementById("modeToggle");
const upcomingMode = document.getElementById("upcomingMode");
const codeBlockMode = document.getElementById("codeBlockMode");
const navDropdown = document.getElementById("navDropdown");
const navToggle = document.getElementById("navToggle");

let activeMode = "upcoming";

function setMode(mode) {
  activeMode = mode === "code" ? "code" : "upcoming";
  const isCodeMode = activeMode === "code";
  document.body.classList.toggle("is-code-mode", isCodeMode);

  upcomingMode.hidden = isCodeMode;
  codeBlockMode.hidden = !isCodeMode;
  appTitle.textContent = isCodeMode ? "EVENT PAGE GENERATOR" : "UPCOMING EVENTS PAGE GENERATOR";
  document.title = appTitle.textContent;

  modeToggle.classList.toggle("is-code-mode", isCodeMode);
  modeToggle.setAttribute("aria-pressed", String(isCodeMode));
  modeToggle.setAttribute(
    "aria-label",
    isCodeMode ? "Switch to Upcoming Events Page Generator" : "Switch to Event Page Generator"
  );
  modeToggle.title = modeToggle.getAttribute("aria-label");
  setPreviewTitle(isCodeMode ? "Event code block page preview" : "Upcoming events page preview");

  if (isCodeMode) activateEventCodeBlock();
  else activateUpcomingEvents();
}

modeToggle.addEventListener("click", () => {
  setMode(activeMode === "upcoming" ? "code" : "upcoming");
});

navToggle.addEventListener("click", (event) => {
  event.stopPropagation();
  const isOpen = navDropdown.classList.toggle("active");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

document.addEventListener("click", (event) => {
  if (!navDropdown.contains(event.target)) {
    navDropdown.classList.remove("active");
    navToggle.setAttribute("aria-expanded", "false");
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    navDropdown.classList.remove("active");
    navToggle.setAttribute("aria-expanded", "false");
  }
});

navDropdown.querySelectorAll(".nav-menu a").forEach((link) => {
  link.addEventListener("click", () => {
    navDropdown.classList.remove("active");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

setMode("upcoming");
