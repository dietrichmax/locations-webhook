import { Request, Response } from "express"
import { insertData, getLatestLocation } from "../services/locations.service"
import type { LocationData } from "../types/types"

/**
 * Get the latest location data.
 */
export async function getLatestLocationHandler(req: Request, res: Response) {
  try {
    const data = await getLatestLocation()
    res.status(200).json(data)
  } catch (err) {
    console.error("DB error:", err)
    res.status(500).json({ error: "Internal Server Error" })
  }
}

/**
 * Accept and store a new location.
 */
export async function postLocationHandler(req: Request, res: Response) {
  try {
    const { lat, lon } = req.body

    console.log("Incoming request body:", req.body)

    const isValid =
      typeof lat === "number" &&
      typeof lon === "number" &&
      lat >= -90 &&
      lat <= 90 &&
      lon >= -180 &&
      lon <= 180

    if (!isValid) {
      console.warn("Invalid lat/lon received, ignoring:", { lat, lon })
      return res.status(200).json({ message: "Ignored invalid input" })
    }
    
    const inserted = await insertData({ lat, lon } as LocationData)
    if (inserted) {
      res.status(201).json({ message: "Location added" })
    } else {
      res.status(200).json({ error: "Duplicate location" })
    }
  } catch (err) {
    console.error("POST error:", err)
    res.status(400).json({ error: "Invalid request" })
  }
}
