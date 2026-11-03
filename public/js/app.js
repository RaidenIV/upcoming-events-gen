"use strict";

import { activateUpcomingEvents } from "./upcoming-events.js?v=kid-mode-3";
import { activateEventCodeBlock } from "./event-code-block.js?v=kid-mode-3";
async function activateKidRave() {
  try {
    const module = await import("./kid-rave.js?v=kid-save-4");
    if (!document.getElementById("kidRaveMode").hidden) await module.activateKidRave();
  } catch (error) {
    document.getElementById("kidStatus").textContent = "Unable to load KID RAVE: " + error.message;
    console.error(error);
  }
}
import { setPreviewTitle } from "./preview.js";

const appTitle = document.getElementById("appTitle");
const modeToggle = document.getElementById("modeToggle");
const upcomingMode = document.getElementById("upcomingMode");
const codeBlockMode = document.getElementById("codeBlockMode");
const kidRaveMode = document.getElementById("kidRaveMode");
const generatorMode = document.getElementById("generatorMode");
const navDropdown = document.getElementById("navDropdown");
const navToggle = document.getElementById("navToggle");

let activeMode = "upcoming";

function setMode(mode) {
  activeMode = ["code", "kid"].includes(mode) ? mode : "upcoming";
  const isKidMode = activeMode === "kid";
  generatorMode.value = activeMode;
  kidRaveMode.hidden = !isKidMode;
  const isCodeMode = activeMode === "code";
  document.body.classList.toggle("is-code-mode", isCodeMode);

  upcomingMode.hidden = isCodeMode || isKidMode;
  codeBlockMode.hidden = !isCodeMode;
  appTitle.textContent = isKidMode ? "KID RAVE PAGE GENERATOR" : isCodeMode ? "EVENT PAGE GENERATOR" : "UPCOMING EVENTS PAGE GENERATOR";
  document.title = appTitle.textContent;

  modeToggle.classList.toggle("is-code-mode", isCodeMode);
  modeToggle.setAttribute("aria-pressed", String(isCodeMode));
  modeToggle.setAttribute(
    "aria-label",
    isCodeMode ? "Switch to Upcoming Events Page Generator" : "Switch to Event Page Generator"
  );
  modeToggle.title = modeToggle.getAttribute("aria-label");
  setPreviewTitle(isKidMode ? "KID RAVE page preview" : isCodeMode ? "Event code block page preview" : "Upcoming events page preview");

  if (isKidMode) activateKidRave();
  else if (isCodeMode) activateEventCodeBlock();
  else activateUpcomingEvents();
}

generatorMode.addEventListener("change", () => setMode(generatorMode.value));

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
