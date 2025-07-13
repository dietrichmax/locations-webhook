import { Router, Request, Response } from "express"
import locationsRoutes from "./locations.routes"

/**
 * Main API router that aggregates all route modules.
 *
 * This router serves as the central routing hub, mounting
 * individual feature routers under their respective paths.
 *
 * Currently mounted routes:
 * - `/staticmaps` for static maps related endpoints.
 *
 * Additional route modules can be mounted here as the API expands.
 */
const router = Router()

// Mount routes under /
router.use("/", locationsRoutes)

router.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() })
})

// Catch-all for unknown routes
router.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Not Found" })
})


export default router