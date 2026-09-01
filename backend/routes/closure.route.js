import express from "express";
import { getClosures, createClosure, deleteClosure } from "../controllers/closure.controller.js";
import authMiddleware, { requireRole } from "../middleware/auth.js";

const router = express.Router();

// GET request to /api/closures — list all closures (admin & staff)
router.get("/", authMiddleware, getClosures);

// POST request to /api/closures
// Closures now cancel overlapping bookings, so only Admins and Staff may create them.
router.post("/", authMiddleware, requireRole("admin", "staff"), createClosure);

// Only an Admin may call off a closure and reopen the facility.
router.delete("/:id", authMiddleware, requireRole("admin"), deleteClosure);

export default router;
