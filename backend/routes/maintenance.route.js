import express from "express";
import { getAllMaintenance, createMaintenance, updateMaintenance } from "../controllers/maintenance.controller.js";
import authMiddleware, { requireRole } from "../middleware/auth.js";
const router = express.Router();
router.get("/", authMiddleware, requireRole("admin", "staff"), getAllMaintenance);
router.post("/", authMiddleware, requireRole("admin", "staff"), createMaintenance);
router.patch("/:id", authMiddleware, requireRole("admin", "staff"), updateMaintenance);
export default router;
