import express, { Request, Response, NextFunction } from "express"
import routes from "./routes"
import { authenticateApiKey } from "./middlewares/apiKeyAuth"

const app = express()

const PORT = process.env.PORT || 3000

// Middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`)
  next()
})

app.use(express.json())

// Mount api protected locations routes at root
app.use("/", authenticateApiKey, routes)

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() })
})

// Global error handler
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error("Internal Server Error:", err)
  res.status(500).json({ error: "Internal Server Error" })
})


// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
