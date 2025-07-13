const http = require("http")
import {
  handleGetLatestLocation,
  handlePostLocations,
  handleHealth,
} from "./handlers"
import { sendJSON } from "./utilities"
import type { IncomingMessage, ServerResponse } from "http"

// ────────────────────────────────────────────────────────────
// SERVER
// ────────────────────────────────────────────────────────────

/**
 * Creates and starts an HTTP server that handles incoming requests.
 * 
 * Routes:
 * - POST /locations       : Handles posting new location data.
 * - GET  /               : Retrieves the latest location.
 * - GET  /health         : Returns server health status.
 * - All other routes     : Responds with 404 Not Found.
 * 
 * @listens 3000
 * @fires console.log When the server starts listening.
 */
const server = http.createServer(async (
  req: IncomingMessage,
  res: ServerResponse
) => {
  const { method, url } = req

  console.log(`Received ${method} request for ${url}`)
  
  if (method === "POST" && url === "/locations") {
    await handlePostLocations(req, res)
  } else if (method === "GET" && url === "/") {
    await handleGetLatestLocation(req, res)
  } else if (method === "GET" && url === "/health") {
    handleHealth(req, res)
  } else {
    sendJSON(res, 404, { error: "Not Found" })
  }
})

server.listen(3000, () => console.log("Server running on port 3000"))
