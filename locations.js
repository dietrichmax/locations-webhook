const http = require("http");
const { Pool} = require('pg')

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

const server = http.createServer((request, response) => {
  let body = [];
  console.log(request.method)
  if (request.method === "POST") {
     request.on('data', (chunk) => {
      body.push(chunk);
      }).on('end', () => {
        body = JSON.parse(Buffer.concat(body).toString());
        insertData(body)
      })
  }

  response.end();
});

server.listen(3000);
