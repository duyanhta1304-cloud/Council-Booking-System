import express from "express"
import dotenv from "dotenv"
import authRoute from "./routes/login.route.js"
import facilityRoute from "./routes/facility.route.js";
import equipmentRoute from "./routes/equipment.route.js";
import closureRoute from "./routes/closure.route.js";
import bookingRoute from "./routes/booking.route.js";
import maintenanceRoute from "./routes/maintenance.route.js";
import adminRoute from "./routes/admin.route.js";
import staffRoute from "./routes/staff.route.js";
import residentRoute from "./routes/resident.route.js";
import auditLogRoute from "./routes/auditLog.route.js";
import reportRoute from "./routes/report.route.js";
import notificationRoute from "./routes/notification.route.js";
import { connectDB } from "./db/db.js"
import cors from "cors"
import cookieParser from "cookie-parser"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5001

// Needed so req.ip is the real client address behind a proxy (rate limiting).
app.set("trust proxy", 1)

// FRONTEND_URL may hold several comma-separated origins, so the same server
// can serve http://localhost:5173 and the LAN address other devices use.
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)

//middleware
app.use(cors({
    origin: allowedOrigins,
    credentials: true // required for the httpOnly auth cookie
}));

// Facility images arrive inline as base64 data URIs, which sail past the 100kb
// default. The facility controller enforces the real 2MB cap; this just has to
// be roomy enough for the encoded payload to reach it.
app.use(express.json({ limit: "5mb" }))
app.use(cookieParser())

app.use("/api/auth", authRoute)
app.use("/api/facilities", facilityRoute)
app.use("/api/equipment", equipmentRoute)
app.use("/api/closures", closureRoute);
app.use("/api/bookings", bookingRoute);
app.use("/api/maintenance", maintenanceRoute);
app.use("/api/admin", adminRoute);
app.use("/api/staff", staffRoute);
app.use("/api/resident", residentRoute);
app.use("/api/audit-log", auditLogRoute);
app.use("/api/reports", reportRoute);
app.use("/api/notifications", notificationRoute);

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log("Server started on PORT: " + PORT)
    })
})
