import express from "express"
import dotenv from "dotenv"
import testRoute from "./routes/test.route.js"
import rateLimiter from "./middleware/rateLimit.js"
import { connectDB } from "./db/db.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5001

//middleware
app.use(express.json())
app.use(rateLimiter)

app.use("/test", testRoute)

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log("Server started on PORT: " + PORT)
    })
})

