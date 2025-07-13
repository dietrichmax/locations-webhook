;(() => {
  "use strict"
  var o = {
      449: (o) => {
        o.exports = require("pg")
      },
    },
    t = {}
  function n(r) {
    var e = t[r]
    if (void 0 !== e) return e.exports
    var a = (t[r] = { exports: {} })
    return (o[r](a, a.exports, n), a.exports)
  }
  ;((n.n = (o) => {
    var t = o && o.__esModule ? () => o.default : () => o
    return (n.d(t, { a: t }), t)
  }),
    (n.d = (o, t) => {
      for (var r in t)
        n.o(t, r) &&
          !n.o(o, r) &&
          Object.defineProperty(o, r, { enumerable: !0, get: t[r] })
    }),
    (n.o = (o, t) => Object.prototype.hasOwnProperty.call(o, t)))
  const r = require("express")
  var e = n.n(r)
  const { Pool: a } = n(449),
    s = new a()
  function l(o, t, n) {
    ;(o.writeHead(t, { "Content-Type": "application/json" }),
      o.end(JSON.stringify(n)),
      (function (o, t) {
        console.log(`→ Responded with ${o}: ${JSON.stringify(t)}`)
      })(t, n))
  }
  const c = e()()
  ;(c.use(e().json()),
    c.post("/locations", (o, t, n) => {
      ;(async function (o, t) {
        const n = []
        ;(o.on("data", (o) => n.push(o)),
          o.on("end", async () => {
            try {
              const o = JSON.parse(Buffer.concat(n).toString())
              if (o.lat && o.lon) {
                const n = await (async function (o) {
                    const t = await s.query(
                      "SELECT lat, lon FROM locations WHERE lat = $1 AND lon = $2",
                      [o.lat, o.lon]
                    )
                    return t.rows[0] &&
                      t.rows[0].lat === o.lat &&
                      t.rows[0].lon === o.lon
                      ? (console.log(
                          `Duplicate location lat: ${o.lat}, lon: ${o.lon}`
                        ),
                        !1)
                      : (await s.query(
                          "INSERT INTO locations (lat, lon, acc, alt, batt, bs, tst, vac, vel, conn, topic, inregions, ssid, bssid)\n     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)",
                          [
                            o.lat,
                            o.lon,
                            o.acc,
                            o.alt,
                            o.batt,
                            o.bs,
                            o.tst,
                            o.vac,
                            o.vel,
                            o.conn,
                            o.topic,
                            o.inregions,
                            o.ssid,
                            o.bssid,
                          ]
                        ),
                        console.log(
                          `Added location lat: ${o.lat}, lon: ${o.lon}`
                        ),
                        !0)
                  })(o),
                  r = n ? 201 : 409,
                  e = n ? "Location added" : "Duplicate location"
                ;(console.log(`Added location: [${o.lat}, ${o.lon}]`),
                  l(t, r, { message: e }))
              } else l(t, 400, { error: "Missing lat or lon" })
            } catch (o) {
              ;(console.error("POST parse error:", o),
                l(t, 400, { error: "Invalid JSON format" }))
            }
          }))
      })(o, t).catch(n)
    }),
    c.get("/", (o, t, n) => {
      ;(async function (o, t) {
        try {
          l(
            t,
            200,
            await (async function () {
              const [o, t] = await Promise.all([
                s.query(
                  "SELECT lat, lon, batt, bs FROM locations ORDER BY id DESC LIMIT 1"
                ),
                s.query("SELECT COUNT(*) FROM locations"),
              ])
              return { ...o.rows[0], count: parseInt(t.rows[0].count, 10) }
            })()
          )
        } catch (o) {
          ;(console.error("DB error:", o),
            l(t, 500, { error: "Internal Server Error" }))
        }
      })(0, t).catch(n)
    }),
    c.get("/health", function (o, t) {
      l(t, 200, {
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      })
    }),
    c.use((o, t) => {
      t.status(404).json({ error: "Not Found" })
    }),
    c.use((o, t, n, r) => {
      ;(console.error("Internal Server Error:", o),
        n.status(500).json({ error: "Internal Server Error" }))
    }),
    c.listen(3e3, () => {
      console.log("Server running on port 3000")
    }))
})()
