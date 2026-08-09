"use strict";

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");
const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(__dirname, "data"));
const SAVED_PAGE_PATH = path.join(DATA_DIR, "upcoming-events-page.html");
const SAVED_DATA_PATH = path.join(DATA_DIR, "upcoming-events-data.json");
const SINGLE_EVENT_PAGES_PATH = path.join(DATA_DIR, "single-event-pages.json");
const MAX_BODY_BYTES = 2 * 1024 * 1024;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon"
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(payload));
}

function sendFile(res, filePath, cacheControl) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(error.code === "ENOENT" ? 404 : 500, {
        "Content-Type": "text/plain; charset=utf-8"
      });
      res.end(error.code === "ENOENT" ? "Not found" : "Server error");
      return;
    }

    res.writeHead(200, {
      "Content-Type": MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      "Cache-Control": cacheControl || (path.extname(filePath) === ".html" ? "no-cache" : "public, max-age=3600")
    });
    res.end(data);
  });
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    let receivedBytes = 0;

    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      receivedBytes += Buffer.byteLength(chunk);
      if (receivedBytes > MAX_BODY_BYTES) {
        reject(Object.assign(new Error("Request body is too large."), { statusCode: 413 }));
        req.destroy();
        return;
      }
      body += chunk;
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch {
        reject(Object.assign(new Error("Request body must contain valid JSON."), { statusCode: 400 }));
      }
    });
    req.on("error", reject);
  });
}

async function writeAtomic(filePath, contents) {
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  await fs.promises.writeFile(temporaryPath, contents, "utf8");
  await fs.promises.rename(temporaryPath, filePath);
}

const SINGLE_EVENT_DETAIL_FIELDS = [
  "eventName",
  "venueName",
  "venueAddress",
  "eventDate",
  "eventTz",
  "flyerUrl",
  "ticketMode",
  "ticketUrl",
  "ticketEmbed",
  "ticketBtnText",
  "eventDescription",
  "spotifyInput",
  "soundcloudInput"
];

function normalizeSingleEventMusicEmbeds(source) {
  const supplied = Array.isArray(source.musicEmbeds) ? source.musicEmbeds.slice(0, 2) : [];
  const normalized = supplied.map((item, index) => ({
    type: item?.type === "soundcloud" ? "soundcloud" : "spotify",
    value: String(item?.value || "").slice(0, 250000)
  }));

  if (normalized.length) return normalized;

  return [
    { type: "spotify", value: String(source.spotifyInput || "").slice(0, 250000) },
    { type: "soundcloud", value: String(source.soundcloudInput || "").slice(0, 250000) }
  ].filter((item) => item.value.trim());
}

function normalizeSingleEventDetails(input) {
  const source = input && typeof input === "object" && !Array.isArray(input) ? input : {};
  const details = {};
  SINGLE_EVENT_DETAIL_FIELDS.forEach((field) => {
    const value = typeof source[field] === "string" ? source[field] : "";
    details[field] = value.slice(0, field.includes("Embed") || field.includes("Input") ? 250000 : 10000);
  });

  details.musicEmbeds = normalizeSingleEventMusicEmbeds(source);
  if (details.musicEmbeds.length) {
    details.spotifyInput = details.musicEmbeds.find((item) => item.type === "spotify")?.value || "";
    details.soundcloudInput = details.musicEmbeds.find((item) => item.type === "soundcloud")?.value || "";
  }

  details.ticketMode = details.ticketMode === "embed" ? "embed" : "button";
  details.eventTz = [
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "UTC"
  ].includes(details.eventTz) ? details.eventTz : "America/New_York";
  details.ticketBtnText = details.ticketBtnText || "Get Tickets";
  return details;
}

async function readSingleEventPages() {
  try {
    const contents = await fs.promises.readFile(SINGLE_EVENT_PAGES_PATH, "utf8");
    const parsed = JSON.parse(contents);
    return Array.isArray(parsed.pages) ? parsed.pages : [];
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function listSingleEventPages(res) {
  try {
    const pages = await readSingleEventPages();
    pages.sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")));
    sendJson(res, 200, { pages });
  } catch (error) {
    console.error("Failed to read saved single-event pages.", error);
    sendJson(res, 500, { error: "The server could not load saved event pages." });
  }
}

async function saveSingleEventPage(req, res) {
  try {
    const payload = await readJsonBody(req);
    const details = normalizeSingleEventDetails(payload.details);
    const eventName = details.eventName.trim();
    if (!eventName) {
      sendJson(res, 400, { error: "An event name is required before saving." });
      return;
    }

    const pages = await readSingleEventPages();
    const now = new Date().toISOString();
    const requestedId = typeof payload.id === "string" && /^[a-zA-Z0-9_-]{8,100}$/.test(payload.id)
      ? payload.id
      : "";
    const existingIndex = requestedId ? pages.findIndex((page) => page.id === requestedId) : -1;
    const existing = existingIndex >= 0 ? pages[existingIndex] : null;
    const page = {
      id: existing?.id || crypto.randomUUID(),
      name: eventName,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      details
    };

    if (existingIndex >= 0) pages[existingIndex] = page;
    else pages.unshift(page);

    const limitedPages = pages
      .sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")))
      .slice(0, 100);
    await writeAtomic(SINGLE_EVENT_PAGES_PATH, `${JSON.stringify({ pages: limitedPages }, null, 2)}\n`);

    sendJson(res, 200, { status: "saved", page });
  } catch (error) {
    console.error("Failed to save single-event page details.", error);
    sendJson(res, error.statusCode || 500, {
      error: error.statusCode ? error.message : "The server could not save the event page details."
    });
  }
}

async function saveGeneratedPage(req, res) {
  try {
    const payload = await readJsonBody(req);
    const code = typeof payload.code === "string" ? payload.code.trim() : "";
    const events = Array.isArray(payload.events) ? payload.events.slice(0, 20) : [];

    if (!code) {
      sendJson(res, 400, { error: "Generated page code is required." });
      return;
    }

    const savedAt = new Date().toISOString();
    const savedData = JSON.stringify({ savedAt, events }, null, 2);

    await Promise.all([
      writeAtomic(SAVED_PAGE_PATH, `${code}\n`),
      writeAtomic(SAVED_DATA_PATH, `${savedData}\n`)
    ]);

    sendJson(res, 200, {
      status: "saved",
      savedAt,
      pageUrl: "/saved-page"
    });
  } catch (error) {
    console.error("Failed to save generated page.", error);
    sendJson(res, error.statusCode || 500, {
      error: error.statusCode ? error.message : "The server could not save the generated page."
    });
  }
}

const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  if (requestUrl.pathname === "/health") {
    sendJson(res, 200, { status: "ok" });
    return;
  }

  if (requestUrl.pathname === "/api/event-pages") {
    if (req.method === "GET") {
      void listSingleEventPages(res);
      return;
    }
    if (req.method === "POST") {
      void saveSingleEventPage(req, res);
      return;
    }
    res.writeHead(405, { "Allow": "GET, POST", "Content-Type": "text/plain; charset=utf-8" });
    res.end("Method not allowed");
    return;
  }

  if (requestUrl.pathname === "/api/save-page") {
    if (req.method !== "POST") {
      res.writeHead(405, { "Allow": "POST", "Content-Type": "text/plain; charset=utf-8" });
      res.end("Method not allowed");
      return;
    }
    void saveGeneratedPage(req, res);
    return;
  }

  if (requestUrl.pathname === "/saved-page") {
    sendFile(res, SAVED_PAGE_PATH, "no-cache");
    return;
  }

  const requestedPath = requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname;
  const safePath = path.normalize(decodeURIComponent(requestedPath)).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(PUBLIC_DIR, safePath);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
    return;
  }

  fs.stat(filePath, (error, stats) => {
    if (!error && stats.isFile()) {
      sendFile(res, filePath);
      return;
    }

    // Single-page fallback keeps direct Railway URLs working.
    sendFile(res, path.join(PUBLIC_DIR, "index.html"));
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Event Page Generator listening on port ${PORT}`);
});
