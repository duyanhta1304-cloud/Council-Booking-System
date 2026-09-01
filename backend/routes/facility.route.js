import express from "express";
import { createFacility, getAllFacilities, updateFacility } from "../controllers/facility.controller.js";
import authMiddleware, { requireRole } from "../middleware/auth.js";

const router = express.Router();

// GET request to /api/facilities
// Anyone can view facilities, so we don't put auth middleware here.
router.get("/", getAllFacilities);

// POST request to /api/facilities
// We put two bouncers here! You must be logged in (authMiddleware) AND be an 'admin' (requireRole)
router.post("/", authMiddleware, requireRole("admin"), createFacility);
router.patch("/:id", authMiddleware, requireRole("admin"), updateFacility);

export default router;
