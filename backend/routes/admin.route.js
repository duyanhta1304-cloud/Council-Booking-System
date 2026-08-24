import express from "express";
import { getAdminDashboard } from "../controllers/portal.controller.js";
import authMiddleware, { requireRole } from "../middleware/auth.js";
const router = express.Router();
router.get("/dashboard", authMiddleware, requireRole("admin"), getAdminDashboard);
export default router;
