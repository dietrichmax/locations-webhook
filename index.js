const express = require("express");
const app = express();
const port = 3000;
const { Pool } = require('pg')

const pool = new Pool()

async function insertData(body) {
  try {
    const res = await pool.query(
      "INSERT INTO locations (lat, lon, acc, alt, batt, bs, tst, vac, vel, conn, topic, inregions, ssid, bssid) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)",
      [body.lat, body.lon, body.acc, body.alt, body.batt, body.bs, body.tst, body.vac, body.vel, body.conn, body.topic, body.inregions, body.ssid, body.bssid]
    );
    console.log(`Added location ${body.lat}, ${body.lon}`);
  } catch (error) {
    console.error(error)
  }
}

async function getCoordinates() {
  const res = await pool.query(
    "SELECT lat, lon FROM locations ORDER BY id DESC LIMIT 1"
  );
  return res
}

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.get("/", async (req, res, next) => {
    console.log(req.method)
    try {
        coordinates = await getCoordinates()
        coords = coordinates.rows[0]
        res.json(coords);
    } catch (err) {
        console.error(`Error while getting coordinates `, err.message);
        next(err);
    }
});

app.post("/", (req, res) => {
    console.log(req.method)
    req.on('data', (chunk) => {
        body.push(chunk);
        }).on('end', () => {
          body = JSON.parse(Buffer.concat(body).toString());
          insertData(body)
       })
})


app.listen(port, () => {
  console.log(`Locations webhook app listening at http://localhost:${port}`);
});