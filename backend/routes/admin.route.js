import express from "express";
import { getAdminDashboard, getStaffMembers } from "../controllers/portal.controller.js";
import authMiddleware, { requireRole } from "../middleware/auth.js";
const router = express.Router();
router.get("/dashboard", authMiddleware, requireRole("admin"), getAdminDashboard);
router.get("/staff", authMiddleware, requireRole("admin"), getStaffMembers);
export default router;
