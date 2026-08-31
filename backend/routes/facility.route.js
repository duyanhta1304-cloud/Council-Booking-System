import express from "express";
import { createFacility, getAllFacilities, updateFacility, getAllEquipment, addEquipment, updateEquipment } from "../controllers/facility.controller.js";
import authMiddleware, { requireRole } from "../middleware/auth.js";

const router = express.Router();

// Must come before "/:id" routes so "equipment" isn't read as a facility id.
router.get("/equipment", getAllEquipment);

// GET request to /api/facilities
// Anyone can view facilities, so we don't put auth middleware here.
router.get("/", getAllFacilities);

// POST request to /api/facilities
// We put two bouncers here! You must be logged in (authMiddleware) AND be an 'admin' (requireRole)
router.post("/", authMiddleware, requireRole("admin"), createFacility);
router.patch("/:id", authMiddleware, requireRole("admin"), updateFacility);

// Equipment lives inside its facility, so it is managed through that facility.
router.post("/:id/equipment", authMiddleware, requireRole("admin"), addEquipment);
router.patch("/:id/equipment/:equipmentId", authMiddleware, requireRole("admin"), updateEquipment);

export default router;