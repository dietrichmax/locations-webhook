const { Pool } = require("pg")
const pool = new Pool()
import type { LocationData } from "../types/types"

// ────────────────────────────────────────────────────────────
// DAWARICH CONFIG
// ────────────────────────────────────────────────────────────

const DAWARICH_URL = process.env.DAWARICH_URL
const DAWARICH_API_KEY = process.env.DAWARICH_API_KEY

// ────────────────────────────────────────────────────────────
// DATABASE METHODS
// ────────────────────────────────────────────────────────────

/**
 * Inserts a location into the database if it's not a duplicate.
 * @param {LocationData} body - Location data.
 * @returns {Promise<boolean>} - Returns true if inserted, false if duplicate.
 */
export async function insertData(body: LocationData) {
  const select = await pool.query(
    "SELECT lat, lon FROM locations WHERE lat = $1 AND lon = $2",
    [body.lat, body.lon]
  )
  if (
    select.rows[0] &&
    select.rows[0].lat === body.lat &&
    select.rows[0].lon === body.lon
  ) {
    console.log(`Duplicate location lat: ${body.lat}, lon: ${body.lon}`)
    return false // duplicate found
  }

  await pool.query(
    `INSERT INTO locations (lat, lon, acc, alt, batt, bs, tst, vac, vel, conn, topic, inregions, ssid, bssid)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
    [
      body.lat,
      body.lon,
      body.acc,
      body.alt,
      body.batt,
      body.bs,
      body.tst,
      body.vac,
      body.vel,
      body.conn,
      body.topic,
      body.inregions,
      body.ssid,
      body.bssid,
    ]
  )

  console.log(`Added location lat: ${body.lat}, lon: ${body.lon}`)

  // ────────────────────────────────────────────────────────────
  // FORWARD TO DAWARICH (fire-and-forget)
  // ────────────────────────────────────────────────────────────
  fetch(`${DAWARICH_URL}?api_key=${DAWARICH_API_KEY}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
    .then(async (res) => {
      if (!res.ok) {
        console.warn(
          "Dawarich rejected request:",
          await res.text()
        )
      }
    })
    .catch((err) => {
      console.error("Failed to forward to Dawarich:", err)
    })

  return true
}

/**
 * Retrieves the latest coordinates and total count from the database.
 * @returns {Promise<{lat: number, lon: number, batt: number, bs: string, count: number}>}
 */
export async function getLatestLocation() {
  const [coordinates, count] = await Promise.all([
    pool.query(
      "SELECT lat, lon, batt, bs FROM locations ORDER BY id DESC LIMIT 1"
    ),
    pool.query("SELECT COUNT(*) FROM locations"),
  ])
  return {
    ...coordinates.rows[0],
    count: parseInt(count.rows[0].count, 10),
  }
}
