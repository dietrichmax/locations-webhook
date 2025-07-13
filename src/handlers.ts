import { insertData, getLatestLocation } from "./methods"
import type { Request, Response } from "express"

// ────────────────────────────────────────────────────────────
// REQUEST HANDLERS
// ────────────────────────────────────────────────────────────

/**
 * Handles POST /locations
 * 
 * @param req - Express request containing JSON body with `lat` and `lon`
 * @param res - Express response
 * 
 * @returns 201 Created if location added, 409 Conflict if duplicate,
 *          400 Bad Request if invalid input, 500 Internal Server Error on DB error
 */
export async function handlePostLocations(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { lat, lon } = req.body

    if (typeof lat !== "number" || typeof lon !== "number") {
      res.status(400).json({ error: "Missing or invalid 'lat' or 'lon'" })
      return
    }

    const inserted = await insertData({ lat, lon })
    const status = inserted ? 201 : 409
    const message = inserted ? "Location added" : "Duplicate location"
    console.log(`Added location: [${lat}, ${lon}]`)
    res.status(status).json({ message })
  } catch (err) {
    console.error("POST error:", err)
    res.status(500).json({ error: "Internal Server Error" })
  }
}

/**
 * Handles GET /
 * 
 * @param req - Express request
 * @param res - Express response
 * 
 * @returns 200 OK with the latest location or 500 Internal Server Error
 */
export async function handleGetLatestLocation(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const data = await getLatestLocation()
    res.status(200).json(data)
  } catch (err) {
    console.error("GET error:", err)
    res.status(500).json({ error: "Internal Server Error" })
  }
}

/**
 * Handles GET /health
 * 
 * @param req - Express request
 * @param res - Express response
 * 
 * @returns 200 OK with server health status
 */
export function handleHealth(req: Request, res: Response): void {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  })
}
