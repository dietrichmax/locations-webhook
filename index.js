const http = require("http")
const { Pool } = require("pg")
const pool = new Pool()

/**
 * Logs an incoming HTTP request.
 * @param {http.IncomingMessage} req - The HTTP request object.
 */
function logRequest(req) {
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
function logResponse(statusCode, payload) {
  console.log(`→ Responded with ${statusCode}: ${JSON.stringify(payload)}`)
}

/**
 * Sends a JSON response and logs it.
 * @param {http.ServerResponse} response - The HTTP response object.
 * @param {number} statusCode - HTTP status code.
 * @param {object} data - Response JSON data.
 */
function sendJSON(response, statusCode, data) {
  response.writeHead(statusCode, { "Content-Type": "application/json" })
  response.end(JSON.stringify(data))
  logResponse(statusCode, data)
}

// ────────────────────────────────────────────────────────────
// DATABASE METHODS
// ────────────────────────────────────────────────────────────

/**
 * Inserts a location into the database if it's not a duplicate.
 * @param {object} body - Location data.
 * @param {number} body.lat - Latitude.
 * @param {number} body.lon - Longitude.
 * @returns {Promise<boolean>} - Returns true if inserted, false if duplicate.
 */
async function insertData(body) {
  console.log(body)

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
  return true
}

/**
 * Retrieves the latest coordinates and total count from the database.
 * @returns {Promise<{lat: number, lon: number, batt: number, bs: string, count: number}>}
 */
async function getCoordinates() {
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

// ────────────────────────────────────────────────────────────
// REQUEST HANDLERS
// ────────────────────────────────────────────────────────────

/**
 * Handles POST requests and inserts location data.
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
async function handlePost(req, res) {
  let chunks = []

  req.on("data", (chunk) => {
    chunks.push(chunk)
  })

  req.on("end", async () => {
    try {
      const body = JSON.parse(Buffer.concat(chunks).toString())
      console.log("Received body:", body)

      if (body.lat && body.lon) {
        const inserted = await insertData(body)
        const status = inserted ? 201 : 409
        const msg = inserted ? "Location added" : "Duplicate location"
        sendJSON(res, status, { message: msg })
      } else {
        sendJSON(res, 400, { error: "Missing lat or lon" })
      }
    } catch (err) {
      console.error("POST body parse error:", err)
      sendJSON(res, 400, { error: "Invalid JSON format" })
    }
  })
}

/**
 * Handles GET requests.
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
async function handleGet(req, res) {
  if (req.url === "/health") {
    sendJSON(res, 200, {
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    })
  } else {
    try {
      const data = await getCoordinates()
      sendJSON(res, 200, data)
    } catch (err) {
      console.error("Error fetching coordinates:", err)
      sendJSON(res, 500, { error: "Database error" })
    }
  }
}

// ────────────────────────────────────────────────────────────
// SERVER
// ────────────────────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  logRequest(req)

  if (req.method === "POST") {
    await handlePost(req, res)
  } else if (req.method === "GET") {
    await handleGet(req, res)
  } else {
    sendJSON(res, 405, { error: "Method not allowed" })
  }
})

server.listen(3000, () => console.log("Server running on port 3000"))
