// @ts-check
"use strict";

const fs = require("fs");
const path = require("path");
const { IntelligenceBriefingSchema } = require("./intelligence-schema");

const DEFAULT_DATA_PATH = path.join(
  __dirname,
  "..",
  "public",
  "data",
  "briefings.json",
);
const MAX_STORED_BRIEFINGS = 30;

/**
 * @typedef {import('./intelligence-schema').NewsHeadlineSchema['_output']} NewsHeadline
 * @typedef {import('./intelligence-schema').CompanyEntrySchema['_output']} CompanyEntry
 * @typedef {import('./intelligence-schema').IntelligenceBriefingSchema['_output']} IntelligenceBriefing
 */

/**
 * Read persisted briefings from disk.
 * Returns an empty array if the file does not exist or is malformed.
 *
 * @param {string} [dataPath]
 * @returns {IntelligenceBriefing[]}
 */
function readBriefings(dataPath) {
  const filePath = dataPath || DEFAULT_DATA_PATH;
  if (!fs.existsSync(filePath)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Write briefings array to disk, creating directories as needed.
 *
 * @param {IntelligenceBriefing[]} briefings
 * @param {string} [dataPath]
 * @returns {void}
 */
function writeBriefings(briefings, dataPath) {
  const filePath = dataPath || DEFAULT_DATA_PATH;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(briefings, null, 2), "utf8");
}

/**
 * Validate and ingest a raw briefing object.
 * The briefing is prepended to the stored list (newest first).
 * Older entries beyond MAX_STORED_BRIEFINGS are pruned.
 *
 * @param {unknown} raw - Raw input object (from webhook body or file upload)
 * @param {object} [options]
 * @param {string} [options.dataPath] - Override storage path (useful in tests)
 * @returns {{ ok: true; briefing: IntelligenceBriefing } | { ok: false; error: string }}
 */
function ingestBriefing(raw, options) {
  const dataPath = options && options.dataPath;

  const withTimestamp =
    raw && typeof raw === "object"
      ? { receivedAt: new Date().toISOString(), .../** @type {object} */ (raw) }
      : raw;

  const result = IntelligenceBriefingSchema.safeParse(withTimestamp);
  if (!result.success) {
    return { ok: false, error: result.error.message };
  }

  const briefing = result.data;
  const existing = readBriefings(dataPath);

  // Avoid duplicate entries for the same date
  const deduplicated = existing.filter((b) => b.date !== briefing.date);
  const updated = [briefing, ...deduplicated].slice(0, MAX_STORED_BRIEFINGS);

  writeBriefings(updated, dataPath);
  return { ok: true, briefing };
}

/**
 * Return the most-recently stored briefing, or null if none exists.
 *
 * @param {string} [dataPath]
 * @returns {IntelligenceBriefing | null}
 */
function getLatestBriefing(dataPath) {
  const briefings = readBriefings(dataPath);
  return briefings.length > 0 ? briefings[0] : null;
}

module.exports = {
  ingestBriefing,
  getLatestBriefing,
  readBriefings,
  writeBriefings,
  DEFAULT_DATA_PATH,
  MAX_STORED_BRIEFINGS,
};
