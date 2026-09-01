import express from "express";
import { getAllEquipment, createEquipment, updateEquipment, deleteEquipment } from "../controllers/equipment.controller.js";
import authMiddleware, { requireRole } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authMiddleware, getAllEquipment);
router.post("/", authMiddleware, requireRole("admin"), createEquipment);
router.patch("/:id", authMiddleware, requireRole("admin"), updateEquipment);
router.delete("/:id", authMiddleware, requireRole("admin"), deleteEquipment);

export default router;
