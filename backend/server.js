import express from "express"
import dotenv from "dotenv"
import authRoute from "./routes/login.route.js"
import rateLimiter from "./middleware/rateLimit.js"
import { connectDB } from "./db/db.js"
import cors from "cors"
import cookieParser from "cookie-parser"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5001

// Needed so req.ip is the real client address behind a proxy (rate limiting).
app.set("trust proxy", 1)

//middleware
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true // required for the httpOnly auth cookie
}));

app.use(express.json())
app.use(cookieParser())
app.use(rateLimiter)

app.use("/api/auth", authRoute)

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log("Server started on PORT: " + PORT)
    })
})
