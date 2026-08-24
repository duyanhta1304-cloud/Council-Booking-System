import express from "express";
import { getResidentDashboard, getResidentBookings } from "../controllers/portal.controller.js";
import authMiddleware from "../middleware/auth.js";
const router = express.Router();
router.get("/dashboard", authMiddleware, getResidentDashboard);
router.get("/bookings", authMiddleware, getResidentBookings);
export default router;
