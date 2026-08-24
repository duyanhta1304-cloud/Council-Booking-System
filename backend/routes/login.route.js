import express from "express"
import { register, login, googleLogin, logout, me, deleteAccount } from "../controllers/login.controller.js"
import authMiddleware from "../middleware/auth.js"

const router = express.Router()

router.post("/register", register)

router.post("/login", login)

router.post("/google", googleLogin)

router.post("/logout", logout)

router.get("/me", authMiddleware, me)

router.delete("/me", authMiddleware, deleteAccount)

export default router
