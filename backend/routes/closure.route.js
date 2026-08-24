import express from "express";
import { getClosures, createClosure } from "../controllers/closure.controller.js";
import authMiddleware, { requireRole } from "../middleware/auth.js";

const router = express.Router();

// GET request to /api/closures — list all closures (admin & staff)
router.get("/", authMiddleware, requireRole("admin", "staff"), getClosures);

// POST request to /api/closures
// Only Admins (and maybe Staff) should be able to schedule closures
router.post("/", authMiddleware, requireRole("admin", "staff"), createClosure);

export default router;