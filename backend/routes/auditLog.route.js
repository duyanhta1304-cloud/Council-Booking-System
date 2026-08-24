import express from "express";
import { getAuditLogs } from "../controllers/auditLog.controller.js";
import authMiddleware, { requireRole } from "../middleware/auth.js";
const router = express.Router();
router.get("/", authMiddleware, requireRole("admin"), getAuditLogs);
export default router;
