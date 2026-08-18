import express from "express"
import { loginGet, loginPost } from "../controllers/login.controller.js"

const router = express.Router()

router.put("/:id", loginGet)

router.post("/", loginPost)

export default router