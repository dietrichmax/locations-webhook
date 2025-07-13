// ────────────────────────────────────────────────────────────
// UTILITIES
// ────────────────────────────────────────────────────────────

/**
 * Logs a response with status and payload.
 * @param {number} statusCode - HTTP status code.
 * @param {object} payload - Response payload.
 */
export function logResponse(statusCode: number, payload: object) {
  console.log(`→ Responded with ${statusCode}: ${JSON.stringify(payload)}`)
}
