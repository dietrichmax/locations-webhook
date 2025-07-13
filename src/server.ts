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
 * HTTP server request handler.
 *
 * Handles the following routes:
 * - POST /locations       : Processes location data (requires valid api_key)
 * - GET /                : Returns the latest location (requires valid api_key)
 * - GET /health          : Health check endpoint (no api_key required)
 * 
 * Validates the API key passed as a query parameter for all routes except /health.
 * The accepted api_key query parameters are: api_key, API_KEY, apikey, APIKEY.
 * 
 * Sends appropriate JSON responses with status codes for errors and success.
 *
 * @param {IncomingMessage} req - The HTTP request object.
 * @param {ServerResponse} res - The HTTP response object.
 * @returns {Promise<void>} Resolves when the request has been handled.
 */
const server = http.createServer(async (
  req: IncomingMessage,
  res: ServerResponse
) => {
  const { method, url } = req

  if (!url) {
    sendJSON(res, 400, { error: "Bad Request" })
    return
  }
  
  const parsedUrl = new URL(url, `http://${req.headers.host}`)
  const apiKey = parsedUrl.searchParams.get("api_key")

  // Validate api_key except for /health
  if (parsedUrl.pathname !== "/health") {
    const validApiKey = process.env.API_KEY || "your_expected_api_key_here"
    if (!apiKey || apiKey !== validApiKey) {
      sendJSON(res, 401, { error: "Unauthorized: Invalid or missing api_key" })
      return
    }
  }

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
