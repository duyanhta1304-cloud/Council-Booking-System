import Closure from "../models/closure.model.js";
import Booking from "../models/booking.model.js";
import AuditLog from "../models/auditLog.model.js";
import Notification from "../models/notification.model.js";

// A slot is taken by anything not yet dead — a pending request holds the slot
// until an admin decides on it. Matches booking.controller.js's definition.
const BLOCKING_STATUSES = ["Pending", "Approved"];

// GET ALL CLOSURES
export async function getClosures(req, res) {
    try {
        const closures = await Closure.find()
            .populate("facility", "name")
            .sort({ startDate: -1 });
        res.json(closures);
    } catch (error) {
        console.log("Error fetching closures:", error);
        res.status(500).json({ message: "Could not fetch closures" });
    }
}

// CREATE A CLOSURE
// Cancels any Pending/Approved bookings that overlap the closure window and
// notifies the residents who held them — a closure otherwise leaves stale
// bookings for a facility that is no longer open on those dates.
export async function createClosure(req, res) {
    try {
        // req.body will contain { facility, startDate, endDate, reason }
        const newClosure = await Closure.create(req.body);
        const populated = await newClosure.populate("facility", "name");

        const affectedBookings = await Booking.find({
            facility: newClosure.facility,
            status: { $in: BLOCKING_STATUSES },
            startTime: { $lt: newClosure.endDate },
            endTime: { $gt: newClosure.startDate },
        });

        await Promise.all(affectedBookings.map(async (booking) => {
            booking.status = "Cancelled";
            await booking.save();

            await AuditLog.create({
                action: "Booking Cancelled by Closure",
                principal: req.user.userId,
                details: booking._id.toString(),
            });

            await Notification.create({
                user: booking.user,
                type: "booking-cancelled",
                message: `Your booking for ${populated.facility.name} on ${new Date(booking.startTime).toLocaleDateString()} was cancelled — ${newClosure.reason}`,
                relatedBooking: booking._id,
                relatedFacility: newClosure.facility,
            });
        }));

        res.status(201).json(populated);
    } catch (error) {
        console.log("Error scheduling closure:", error);
        res.status(500).json({ message: "Could not schedule closure" });
    }
}
