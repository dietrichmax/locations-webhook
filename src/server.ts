import express, { Request, Response, NextFunction } from "express"
import {
  handleGetLatestLocation,
  handlePostLocations,
  handleHealth,
} from "./handlers"

const app = express()

// ────────────────────────────────────────────────────────────
// Middleware
// ────────────────────────────────────────────────────────────

// Logging middleware
app.use((req: Request, _res: Response, next: NextFunction): void => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`)
  next()
})

/**
 * JSON body parser middleware
 */
app.use(express.json())

// ────────────────────────────────────────────────────────────
// Routes
// ────────────────────────────────────────────────────────────

/**
 * @route   POST /locations
 * @desc    Handle incoming location data from client
 */
app.post("/locations", (req: Request, res: Response, next: NextFunction) => {
  handlePostLocations(req, res).catch(next)
})

/**
 * @route   GET /
 * @desc    Get latest known location
 */
app.get("/", (req: Request, res: Response, next: NextFunction) => {
  handleGetLatestLocation(req, res).catch(next)
})

/**
 * @route   GET /health
 * @desc    Health check endpoint
 */
app.get("/health", handleHealth)

// ────────────────────────────────────────────────────────────
// 404 Handler
// ────────────────────────────────────────────────────────────

/**
 * Catch-all for unknown routes
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Not Found" })
})

// ────────────────────────────────────────────────────────────
// Error Handler
// ────────────────────────────────────────────────────────────

/**
 * Global error handler
 */
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error("Internal Server Error:", err)
  res.status(500).json({ error: "Internal Server Error" })
})

// ────────────────────────────────────────────────────────────
// Start Server
// ────────────────────────────────────────────────────────────

const PORT = 3000

/**
 * Start the Express HTTP server
 */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
