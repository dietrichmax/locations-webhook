if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = 3000;

// PostgreSQL connection pool config (adjust as needed)
const pool = new Pool({
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

app.use(express.json());

// Middleware to check for API key
app.use((req, res, next) => {
  if (req.path === '/health') return next();
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing API key' });
  }
  next();
});


// Insert data with duplication check
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

// Get latest coordinates and count
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

// POST endpoint
app.post('/', async (req, res) => {
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

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// GET latest location
app.get('/', async (req, res) => {
  try {
    const data = await getCoordinates();
    res.json(data);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: "Database error" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
