import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/user.model.js";
import Facility from "./models/facilities.model.js";
import Booking from "./models/booking.model.js";
import Closure from "./models/closure.model.js";
import MaintenanceReport from "./models/maintenanceReport.model.js";
import AuditLog from "./models/auditLog.model.js";

dotenv.config();

async function wipeDb() {
    try {
        console.log("Connecting to database...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected.");

        // Find an admin user to keep
        const adminUser = await User.findOne({ role: "admin" });
        if (!adminUser) {
            console.log("No admin user found! I won't delete users to prevent locking you out. Please create an admin first.");
        } else {
            console.log(`Found admin user: ${adminUser.email} (ID: ${adminUser._id})`);
            
            // Delete all users EXCEPT the admin we found
            const result = await User.deleteMany({ _id: { $ne: adminUser._id } });
            console.log(`Deleted ${result.deletedCount} non-admin users.`);
        }

        console.log("Wiping Facilities...");
        await Facility.deleteMany({});
        
        console.log("Wiping Bookings...");
        await Booking.deleteMany({});
        
        console.log("Wiping Closures...");
        await Closure.deleteMany({});
        
        console.log("Wiping Maintenance Reports...");
        await MaintenanceReport.deleteMany({});
        
        console.log("Wiping Audit Logs...");
        await AuditLog.deleteMany({});

        console.log("Database wipe complete.");
    } catch (err) {
        console.error("Error wiping database:", err);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected.");
    }
}

wipeDb();
