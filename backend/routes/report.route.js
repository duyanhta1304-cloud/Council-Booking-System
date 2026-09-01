import express from "express";
import { getUtilisation, getMaintenanceTime, getBookingHeatmap } from "../controllers/report.controller.js";
import authMiddleware, { requireRole } from "../middleware/auth.js";
const router = express.Router();
router.get("/utilisation", authMiddleware, requireRole("admin"), getUtilisation);
router.get("/maintenance-time", authMiddleware, requireRole("admin"), getMaintenanceTime);
router.get("/booking-heatmap", authMiddleware, requireRole("admin"), getBookingHeatmap);
export default router;
