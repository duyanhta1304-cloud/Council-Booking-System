import express from "express";
import { getClosures, createClosure } from "../controllers/closure.controller.js";
import authMiddleware, { requireRole } from "../middleware/auth.js";

const router = express.Router();

// GET request to /api/closures — list all closures (admin & staff)
router.get("/", authMiddleware, getClosures);

// POST request to /api/closures
// Closures now cancel overlapping bookings, so only Admins and Staff may create them.
router.post("/", authMiddleware, requireRole("admin", "staff"), createClosure);

export default router;
