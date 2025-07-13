import express, { Request, Response, NextFunction } from "express"
import locationsRoutes from "./routes/locations.routes"

const app = express()

// Middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`)
  next()
})

app.use(express.json())

// Mount locations routes at root
app.use("/", locationsRoutes)

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() })
})

// 404 catch-all
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" })
})

// Global error handler
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error("Internal Server Error:", err)
  res.status(500).json({ error: "Internal Server Error" })
})

// Start server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
