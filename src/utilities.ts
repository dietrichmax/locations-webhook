import type { IncomingMessage, ServerResponse } from "http"

// ────────────────────────────────────────────────────────────
// UTILITIES
// ────────────────────────────────────────────────────────────

/**
 * Logs an incoming HTTP request.
 * @param {http.IncomingMessage} req - The HTTP request object.
 */
export function logRequest(req: IncomingMessage) {
  const ip = req.socket.remoteAddress
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.url} from ${ip}`
  )
}

/**
 * Logs a response with status and payload.
 * @param {number} statusCode - HTTP status code.
 * @param {object} payload - Response payload.
 */
export function logResponse(statusCode: number, payload: object) {
  console.log(`→ Responded with ${statusCode}: ${JSON.stringify(payload)}`)
}

/**
 * Sends a JSON response and logs it.
 * @param {http.ServerResponse} response - The HTTP response object.
 * @param {number} statusCode - HTTP status code.
 * @param {object} data - Response JSON data.
 */
export function sendJSON(response: ServerResponse, statusCode: number, data: object) {
  response.writeHead(statusCode, { "Content-Type": "application/json" })
  response.end(JSON.stringify(data))
  logResponse(statusCode, data)
}
