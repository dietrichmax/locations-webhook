import { Router } from "express"
import {
  getLatestLocationHandler,
  postLocationHandler,
} from "../controllers/locations.controller"

const router = Router()

// GET / => latest location
router.get("/tracking", getLatestLocationHandler)

router.get("/tracking/locations", (_req, res) => {
  res.status(200).json({ status: "ready" })
})

// POST /locations => add new location
router.post("/tracking/locations", postLocationHandler)

export default router
