"use strict";

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");
const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(__dirname, "data"));
const SAVED_PAGE_PATH = path.join(DATA_DIR, "upcoming-events-page.html");
const SAVED_DATA_PATH = path.join(DATA_DIR, "upcoming-events-data.json");
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
  console.log(`Upcoming Events Page Generator listening on port ${PORT}`);
});
