if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL connection pool
const pool = new Pool({
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});


app.use(express.json());

/**
 * Middleware to check for API key in query parameters.
 * Skips check for `/health` route.
 */
app.use((req, res, next) => {
  const logBody = ['POST', 'PUT', 'PATCH'].includes(req.method) ? JSON.stringify(req.body) : '{}';
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - Query: ${JSON.stringify(req.query)} - Body: ${logBody}`);
  
  if (req.path === '/health') return next();

  const apiKey = req.query['api_key'];
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing API key' });
  }
  
  next();
});


/**
 * Inserts a new location into the database if it doesn't already exist
 * based on `lat` and `lon`.
 *
 * @param {Object} data - The location data.
 * @param {number} data.lat - Latitude.
 * @param {number} data.lon - Longitude.
 * @param {number} [data.acc] - Accuracy.
 * @param {number} [data.alt] - Altitude.
 * @param {number} [data.batt] - Battery level.
 * @param {string} [data.bs] - Base station.
 * @param {number} [data.tst] - Timestamp.
 * @param {string} [data.vac] - Vac mode.
 * @param {number} [data.vel] - Velocity.
 * @param {string} [data.conn] - Connection type.
 * @param {string} [data.topic] - Topic.
 * @param {string} [data.inregions] - Region info.
 * @param {string} [data.ssid] - SSID.
 * @param {string} [data.bssid] - BSSID.
 * @returns {Promise<boolean>} - True if inserted, false if duplicate.
 */
async function insertData(body) {
  const query = `
    INSERT INTO locations (lat, lon, acc, alt, batt, bs, tst, vac, vel, conn, topic, inregions, ssid, bssid)
    SELECT $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
    WHERE NOT EXISTS (
      SELECT 1 FROM locations WHERE lat = $1 AND lon = $2
    )
  `;

  const values = [
    body.lat, body.lon, body.acc, body.alt, body.batt,
    body.bs, body.tst, body.vac, body.vel, body.conn,
    body.topic, body.inregions, body.ssid, body.bssid
  ];

  const result = await pool.query(query, values);
  return result.rowCount > 0; // true if inserted
}

/**
 * Retrieves the latest location entry and total number of records.
 *
 * @returns {Promise<Object>} Latest location data with total count.
 * @returns {number} return.lat - Latitude.
 * @returns {number} return.lon - Longitude.
 * @returns {number} return.batt - Battery.
 * @returns {string} return.bs - Base station.
 * @returns {number} return.count - Total records.
 */
async function getCoordinates() {
  const [coordResult, countResult] = await Promise.all([
    pool.query("SELECT lat, lon, batt, bs FROM locations ORDER BY id DESC LIMIT 1"),
    pool.query("SELECT COUNT(*) FROM locations"),
  ]);

  return {
    ...coordResult.rows[0],
    count: parseInt(countResult.rows[0].count, 10),
  };
}

/**
 * POST / - Accepts new location data and inserts it if not a duplicate.
 */
app.post('/', async (req, res) => {
  console.log(`[${new Date().toISOString()}] Incoming POST / request with body:`, JSON.stringify(req.body));

  const body = req.body;

  if (!body.lat || !body.lon) {
    return res.status(400).json({ error: "Missing coordinates" });
  }

  try {
    const inserted = await insertData(body);
    if (inserted) {
      console.log(`Added lat: ${body.lat}, lon: ${body.lon}`);
      res.status(201).json({ status: 'inserted' });
    } else {
      console.log(`Duplicate lat: ${body.lat}, lon: ${body.lon}`);
      res.status(200).json({ status: 'duplicate' });
    }
  } catch (err) {
    console.error('Insert error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

/**
 * GET / - Returns the most recent location data and total record count.
 */
app.get('/', async (req, res) => {
  try {
    const data = await getCoordinates();
    console.log('Fetched latest coordinates:', data); 
    res.json(data);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: "Database error" });
  }
});

/**
 * GET /health - Returns server uptime and health check info.
 */
app.get('/health', (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

/**
 * Starts the Express server.
 */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
