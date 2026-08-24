import express from "express";
import { getUtilisation } from "../controllers/report.controller.js";
import authMiddleware, { requireRole } from "../middleware/auth.js";
const router = express.Router();
router.get("/utilisation", authMiddleware, requireRole("admin"), getUtilisation);
export default router;
