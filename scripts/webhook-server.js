#!/usr/bin/env node
// @ts-check
"use strict";

/**
 * Intelligence Briefing Webhook Server
 *
 * Listens for incoming POST requests at /api/ingest-briefing with a JSON body
 * matching the IntelligenceBriefing schema. On success the briefing is persisted
 * to public/data/briefings.json and the frontend can immediately read it.
 *
 * Usage:
 *   node scripts/webhook-server.js
 *
 * Environment variables:
 *   PORT            - HTTP port (default: 3001)
 *   WEBHOOK_SECRET  - Optional shared secret checked against X-Webhook-Secret header
 */

require("./load-env");

const http = require("http");
const { ingestBriefing } = require("../lib/intelligence-ingest");

const PORT = Number(process.env.PORT) || 3001;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "";

/**
 * Collect the full request body as a UTF-8 string.
 *
 * @param {http.IncomingMessage} req
 * @returns {Promise<string>}
 */
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = /** @type {Buffer[]} */ ([]);
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

/**
 * Send a JSON response.
 *
 * @param {http.ServerResponse} res
 * @param {number} status
 * @param {object} body
 */
function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://localhost:${PORT}`);

  // Health check
  if (req.method === "GET" && url.pathname === "/health") {
    return sendJson(res, 200, { ok: true });
  }

  // Briefing ingestion endpoint
  if (req.method === "POST" && url.pathname === "/api/ingest-briefing") {
    // Optional shared-secret authentication
    if (WEBHOOK_SECRET) {
      const provided = req.headers["x-webhook-secret"];
      if (provided !== WEBHOOK_SECRET) {
        return sendJson(res, 401, { ok: false, error: "Unauthorized" });
      }
    }

    let raw;
    try {
      const body = await readBody(req);
      raw = JSON.parse(body);
    } catch {
      return sendJson(res, 400, { ok: false, error: "Invalid JSON body" });
    }

    const result = ingestBriefing(raw);
    if (!result.ok) {
      return sendJson(res, 422, { ok: false, error: result.error });
    }

    return sendJson(res, 200, {
      ok: true,
      date: result.briefing.date,
      headlineCount: result.briefing.headlines.length,
      companyCount: result.briefing.companies.length,
    });
  }

  return sendJson(res, 404, { ok: false, error: "Not found" });
});

server.listen(PORT, () => {
  console.log(
    JSON.stringify({ message: "Webhook server listening", port: PORT }),
  );
});

module.exports = server;
