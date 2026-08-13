import express from "express"
import { testPost, testGet } from "../controllers/test.controller.js"

const router = express.Router()

router.get("/", testGet)

router.post("/", testPost)

export default router