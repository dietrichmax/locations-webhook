import { Router } from "express"
import {
  getLatestLocationHandler,
  postLocationHandler,
} from "../controllers/locations.controller"

const router = Router()

// GET / => latest location
router.get("/tracking", getLatestLocationHandler)

// POST /locations => add new location
router.post("/tracking/locations", postLocationHandler)

export default router
