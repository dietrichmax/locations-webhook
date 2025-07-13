import { Router } from "express"
import {
  getLatestLocationHandler,
  postLocationHandler,
} from "../controllers/locations.controller"

const router = Router()

// GET / => latest location
router.get("/", getLatestLocationHandler)

// POST /locations => add new location
router.post("/locations", postLocationHandler)

export default router
