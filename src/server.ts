const http = require("http")
import {
  handleGetLatestLocation,
  handlePostLocations,
  handleHealth,
} from "./handlers"
import { sendJSON, logRequest } from "./utilities"
import type { IncomingMessage, ServerResponse } from "http"

// ────────────────────────────────────────────────────────────
// SERVER
// ────────────────────────────────────────────────────────────

const server = http.createServer(async (
  req: IncomingMessage,
  res: ServerResponse
) => {
  logRequest(req)

  const { method, url } = req

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
