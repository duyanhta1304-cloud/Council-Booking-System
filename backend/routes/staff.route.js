import express from "express";
import { getStaffDashboard, getStaffBookings, getStaffMaintenance, getStaffSchedule } from "../controllers/portal.controller.js";
import authMiddleware, { requireRole } from "../middleware/auth.js";
const router = express.Router();
router.get("/dashboard", authMiddleware, requireRole("staff", "admin"), getStaffDashboard);
router.get("/bookings", authMiddleware, requireRole("staff", "admin"), getStaffBookings);
router.get("/maintenance-tasks", authMiddleware, requireRole("staff", "admin"), getStaffMaintenance);
router.get("/schedule", authMiddleware, requireRole("staff", "admin"), getStaffSchedule);
export default router;
