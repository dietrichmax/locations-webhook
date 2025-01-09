const http = require("http");
const { Pool} = require('pg')

const pool = new Pool()

async function insertData(body) {
  let isDuplicate = false
  console.log(body)

  const select = await pool.query(`SELECT lat, lon FROM locations WHERE lat = ${body.lat} AND lon = ${body.lon}`);
  if (select.rows[0] && select.rows[0].lat === body.lat && select.rows[0].lon === body.lon){
    isDuplicate = true
    console.log(`duplicate: ${isDuplicate}`)
  } 

  if (!isDuplicate) {
    const res = await pool.query(
      "INSERT INTO locations (lat, lon, acc, alt, batt, bs, tst, vac, vel, conn, topic, inregions, ssid, bssid) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)",
      [body.lat, body.lon, body.acc, body.alt, body.batt, body.bs, body.tst, body.vac, body.vel, body.conn, body.topic, body.inregions, body.ssid, body.bssid]
    );
    console.log(`Added location lat: ${body.lat}, lon: ${body.lon}`);
  }
}

async function getCoordinates() {
  const coordinates = await pool.query(
    "SELECT lat, lon, batt, bs FROM locations ORDER BY id DESC LIMIT 1"
  );
  
  const count = await pool.query(
    "SELECT COUNT(*) FROM locations"
  );
  return {
    ...coordinates.rows[0],
    ...count.rows[0]
  }
}

const server = http.createServer()

server.on("request", async (request, response) => {
  let body = [];
  if (request.method === "POST") {
    request.on('data', (chunk) => {
    body.push(chunk);
    }).on('end', () => {
      body = JSON.parse(Buffer.concat(body).toString());
      if (body.lon && body.lat) {
        insertData(body)
      } else {
        console.log("no coordinates")
      }
    })
    response.end();
  } else if (request.method === "GET") {
    const data = await getCoordinates()
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify(data));
  }
});

server.listen(3000);
