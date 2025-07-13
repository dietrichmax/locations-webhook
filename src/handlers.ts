import { insertData, getLatestLocation } from "./methods"
import { sendJSON } from "./utilities"
import type { IncomingMessage, ServerResponse } from "http"

// ────────────────────────────────────────────────────────────
// REQUEST HANDLERS
// ────────────────────────────────────────────────────────────

/**
 * Handles POST requests and inserts location data.
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
export async function handlePostLocations(
  req: IncomingMessage,
  res: ServerResponse
) {
  const chunks: Buffer[] = []
  req.on("data", (chunk: Buffer) => chunks.push(chunk))
  req.on("end", async () => {
    try {
      const body = JSON.parse(Buffer.concat(chunks).toString())
      if (body.lat && body.lon) {
        const inserted = await insertData(body)
        const status = inserted ? 201 : 409
        const message = inserted ? "Location added" : "Duplicate location"
        sendJSON(res, status, { message })
      } else {
        sendJSON(res, 400, { error: "Missing lat or lon" })
      }
    } catch (err) {
      console.error("POST parse error:", err)
      sendJSON(res, 400, { error: "Invalid JSON format" })
    }
  })
}

/**
 * Handles GET /locations/latest
 */
export async function handleGetLatestLocation(
  req: IncomingMessage,
  res: ServerResponse
){
  try {
    const data = await getLatestLocation()
    sendJSON(res, 200, data)
  } catch (err) {
    console.error("DB error:", err)
    sendJSON(res, 500, { error: "Internal Server Error" })
  }
}

/**
 * Handles GET /health
 */
export function handleHealth(
  req: IncomingMessage,
  res: ServerResponse
) {
  sendJSON(res, 200, {
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  })
}
