import express from "express"
import dotenv from "dotenv"
import loginRoute from "./routes/login.route.js"
import rateLimiter from "./middleware/rateLimit.js"
import { connectDB } from "./db/db.js"
import cors from "cors"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5001

//middleware
app.use(express.json())
app.use(rateLimiter)

app.use(cors({
    origin:"http://localhost:5173   "
}));

app.use("/login", loginRoute)

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log("Server started on PORT: " + PORT)
    })
})

