import app from "./app.js"
import { connectDB } from "./db/db.js"

// Local dev only. On Vercel there is no long-lived process to listen on a
// port — api/index.js is the entry point there.
const PORT = process.env.PORT || 5001

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log("Server started on PORT: " + PORT)
    })
})
