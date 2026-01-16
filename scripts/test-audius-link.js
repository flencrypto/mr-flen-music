#!/usr/bin/env node
// Load environment variables from .env file
require("./load-env");

const {
  DEFAULT_BASE_URL,
  DEFAULT_TIMEOUT_MS,
  checkAudiusHealth,
  normaliseBaseUrl,
} = require("../lib/audius-health");

/**
 * @param {string | undefined} rawTimeout
 * @returns {number}
 */
function parseTimeout(rawTimeout) {
  if (!rawTimeout) {
    return DEFAULT_TIMEOUT_MS;
  }

  const parsed = Number(rawTimeout);
  if (Number.isNaN(parsed) || parsed <= 0) {
    throw new Error("AUDIUS_TEST_TIMEOUT_MS must be a positive number");
  }
  return parsed;
}

(async () => {
  const baseUrl = process.env.AUDIUS_BASE_URL || DEFAULT_BASE_URL;
  const timeoutMs = parseTimeout(process.env.AUDIUS_TEST_TIMEOUT_MS);

  try {
    const result = await checkAudiusHealth({
      baseUrl: normaliseBaseUrl(baseUrl),
      timeoutMs,
    });

    if (result.ok) {
      console.log(
        JSON.stringify(
          {
            message: "Audius discovery provider is reachable.",
            baseUrl,
            status: result.status,
            payload: result.payload,
          },
          null,
          2,
        ),
      );
      process.exit(0);
    }

    console.error(
      JSON.stringify(
        {
          message: "Audius discovery provider health check failed.",
          baseUrl,
          status: result.status,
          error: result.error,
          payload: result.payload,
        },
        null,
        2,
      ),
    );
    process.exit(1);
  } catch (error) {
    const failure = /** @type {unknown} */ (error);
    console.error(
      JSON.stringify(
        {
          message: "Audius discovery provider health check crashed.",
          baseUrl,
          error: failure instanceof Error ? failure.message : "Unknown error",
        },
        null,
        2,
      ),
    );
    process.exit(1);
  }
})();
