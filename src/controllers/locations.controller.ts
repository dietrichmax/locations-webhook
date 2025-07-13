import { Request, Response } from "express"
import { insertData, getLatestLocation } from "../services/locations.service"

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
    const { lat, long } = req.body
    
    const inserted = await insertData({ lat, long })
    if (inserted) {
      res.status(201).json({ message: "Location added" })
    } else {
      res.status(409).json({ error: "Duplicate location" })
    }
  } catch (err) {
    console.error("POST error:", err)
    res.status(400).json({ error: "Invalid request" })
  }
}
