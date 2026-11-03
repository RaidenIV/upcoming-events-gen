"use strict";
import { renderPreview } from "./preview.js";

const form = document.getElementById("kidRaveForm");
const status = document.getElementById("kidStatus");
const panel = document.getElementById("kidRaveMode");
const storageKey = "xmg-kid-rave-generator-v1";
const defaults = {
  name: "KID RAVE 9", date: "2026-12-06", showTime: "1:00 PM – 5:00 PM",
  venue: "Skully's Music Diner", city: "Columbus, OH",
  description: "A family friendly EDM event!",
  flyer: "https://images.squarespace-cdn.com/content/v2/namespaces/website/libraries/681ea18dd168a935c26295bd/56632144-ddf7-41b9-84b4-1678a354a29a/Christmas+Kid+Rave+Square.jpg?format=500w",
  eventUrl: "https://www.xodiamediagroup.com/kidrave9",
  ticketUrl: "https://www.xodiamediagroup.com/kidrave9",
  heroLabel: "Get Your Tickets", navLabel: "Get Tickets",
  detailsLabel: "Get Tickets on Eventbrite →", pricing: "Various Package Pricing"
};
let templatePromise;
let generatedCode = "";
let lastValidCode = "";
let updateSequence = 0;

function safeUrl(value) {
  const url = new URL(value, "https://www.xodiamediagroup.com/");
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("Use an http(s) URL or a page path for links and flyers.");
  return url.href;
}

export function buildKidRavePage(template, data) {
  const doc = new DOMParser().parseFromString(template, "text/html");
  const setText = (selector, value) => { doc.querySelector(selector).textContent = value; };
  const date = new Date(`${data.date}T12:00:00`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date) || Number.isNaN(date.getTime())) throw new Error("Enter a valid event date.");
  const dateText = date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  setText(".next-event-title", data.name);
  setText(".next-event-venue-text", [data.venue, data.city].filter(Boolean).join(" · "));
  setText(".next-event-description", data.description);
  setText(".next-event-date", dateText.toUpperCase());
  const card = doc.querySelector(".next-event-card");
  card.href = safeUrl(data.eventUrl);
  card.dataset.eventDate = data.date;
  const flyer = card.querySelector("img");
  flyer.src = safeUrl(data.flyer);
  flyer.alt = `${data.name} flyer`;
  const time = doc.createElement("p");
  time.className = "next-event-show-time";
  time.textContent = data.showTime;
  time.style.cssText = "color:#fff;font-size:15px;margin:8px 0 12px;font-weight:600";
  card.querySelector(".next-event-description").before(time);

  setText("#event .event-title", data.name);
  const description = doc.createElement("p");
  description.className = "event-subtitle";
  description.textContent = data.description;
  doc.querySelector("#event .event-title").after(description);
  // Select each item's own value so nested spans cannot shift the field mapping.
  const items = doc.querySelectorAll("#event .event-detail-item");
  [dateText, data.showTime, [data.city, data.venue].filter(Boolean).join(" · "), data.pricing]
    .forEach((value, i) => { items[i].querySelector("span").textContent = value; });

  const ticketUrl = safeUrl(data.ticketUrl);
  doc.querySelectorAll(".nav-cta, .hero-ctas .btn-primary, #event .btn-primary, .cta-section .btn-primary").forEach(link => { link.href = ticketUrl; });
  setText(".nav-cta", data.navLabel);
  setText(".hero-ctas .btn-primary", data.heroLabel);
  setText("#event .btn-primary", data.detailsLabel);
  setText(".cta-section .btn-primary", data.detailsLabel);
  return "<!DOCTYPE html>\n" + doc.documentElement.outerHTML;
}

function readData() { return Object.fromEntries(new FormData(form)); }
function fill(data) { for (const key of Object.keys(defaults)) form.elements.namedItem(key).value = data[key] ?? defaults[key]; }
try { fill({ ...defaults, ...JSON.parse(localStorage.getItem(storageKey) || "{}") }); }
catch { fill(defaults); }

async function loadTemplate() {
  if (!templatePromise) templatePromise = fetch(new URL("../kid-rave-template.html", import.meta.url)).then(response => {
    if (!response.ok) throw new Error("The KID RAVE template could not be loaded.");
    return response.text();
  }).catch(error => { templatePromise = undefined; throw error; });
  return templatePromise;
}

async function update() {
  const sequence = ++updateSequence;
  generatedCode = "";
  if (!form.checkValidity()) { status.textContent = "Complete all fields with valid values to generate the page."; return false; }
  const data = readData();
  try {
    const template = await loadTemplate();
    if (sequence !== updateSequence) return false;
    generatedCode = buildKidRavePage(template, data);
    lastValidCode = generatedCode;
    let saved = true;
    try { localStorage.setItem(storageKey, JSON.stringify(data)); } catch { saved = false; }
    if (!panel.hidden) renderPreview(generatedCode);
    status.textContent = saved ? "Page updated · Saved in this browser" : "Page updated · Browser storage unavailable";
    return true;
  } catch (error) { if (sequence === updateSequence) status.textContent = error.message; return false; }
}
form.addEventListener("submit", event => event.preventDefault());
form.addEventListener("input", update);
document.getElementById("kidReset").addEventListener("click", () => { fill(defaults); update(); });
document.getElementById("kidCopy").addEventListener("click", async () => {
  if (!await update()) { form.reportValidity(); return; }
  try {
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(generatedCode);
    else {
      const area = document.createElement("textarea"); area.value = generatedCode;
      document.body.append(area); area.select();
      const copied = document.execCommand("copy"); area.remove();
      if (!copied) throw new Error("Copy unavailable");
    }
    status.textContent = "Copied KID RAVE page code.";
  } catch { status.textContent = "Copy unavailable. Use Download HTML instead."; }
});
document.getElementById("kidDownload").addEventListener("click", async () => {
  if (!await update()) { form.reportValidity(); return; }
  const url = URL.createObjectURL(new Blob([generatedCode], { type: "text/html;charset=utf-8" }));
  const link = document.createElement("a"); link.href = url; link.download = "kid-rave.html";
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
export async function activateKidRave() {
  // Switching modes must switch the preview even when the form is incomplete.
  // Keep invalid draft fields untouched and show the last valid page or template.
  status.textContent = "Loading KID RAVE preview…";
  try {
    const template = await loadTemplate();
    if (panel.hidden) return;
    renderPreview(lastValidCode || template, { force: true });
    await update();
  } catch (error) {
    if (!panel.hidden) status.textContent = error.message;
  }
}
