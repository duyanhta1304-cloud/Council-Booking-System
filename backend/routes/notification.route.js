import express from "express";
import { getMyNotifications, markNotificationRead } from "../controllers/notification.controller.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.get("/", authMiddleware, getMyNotifications);
router.patch("/:id/read", authMiddleware, markNotificationRead);

export default router;
