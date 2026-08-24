import Booking from "../models/booking.model.js";
import Facility from "../models/facilities.model.js"; // filename is facilities.model.js
import MaintenanceReport from "../models/maintenanceReport.model.js";
import User from "../models/user.model.js";

export async function getAdminDashboard(req, res) {
    try {
        const users = await User.countDocuments();
        const facilities = await Facility.countDocuments();
        const pendingBookings = await Booking.countDocuments({ status: "Pending" });
        const activeMaintenance = await MaintenanceReport.countDocuments({ status: "In Progress" });
        res.json({ users, facilities, pendingBookings, activeMaintenance });
    } catch(err) { res.status(500).json({message:"Error"}); }
}
// Staff members an admin can assign maintenance work to.
export async function getStaffMembers(req, res) {
    try {
        const staff = await User.find({ role: "staff" })
            .select("name email")
            .sort({ name: 1 });
        res.json(staff);
    } catch(err) { res.status(500).json({message:"Error fetching staff members"}); }
}

export async function getStaffDashboard(req, res) {
    try {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(startOfDay);
        endOfDay.setDate(endOfDay.getDate() + 1);

        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const [todaysBookings, pendingMaintenance, overdueTasks, completedThisWeek, todaysBookingsList] = await Promise.all([
            Booking.countDocuments({ startTime: { $gte: startOfDay, $lt: endOfDay } }),
            MaintenanceReport.countDocuments({ status: "Pending" }),
            MaintenanceReport.countDocuments({ status: "In Progress", date: { $lt: startOfDay } }),
            MaintenanceReport.countDocuments({ status: "Completed", updatedAt: { $gte: startOfWeek } }),
            Booking.find({ startTime: { $gte: startOfDay, $lt: endOfDay } })
                .populate("user", "name")
                .populate("facility", "name")
                .sort({ startTime: 1 }),
        ]);

        res.json({
            stats: {
                todaysBookings,
                pendingMaintenance,
                overdueTasks,
                completedThisWeek,
            },
            todaysBookings: todaysBookingsList,
        });
    } catch(err) { res.status(500).json({message:"Error fetching staff dashboard"}); }
}
export async function getResidentDashboard(req, res) {
    try {
        const upcomingBookings = await Booking.find({ user: req.user.userId, status: "Approved", startTime: { $gte: new Date() } }).populate("facility");
        res.json({ upcomingBookings });
    } catch(err) { res.status(500).json({message:"Error"}); }
}
export async function getStaffBookings(req, res) {
    try {
        const bookings = await Booking.find({ status: "Approved" }).populate("user").populate("facility");
        res.json(bookings);
    } catch(err) { res.status(500).json({message:"Error"}); }
}
export async function getStaffMaintenance(req, res) {
    try {
        const tasks = await MaintenanceReport.find({ assignedTo: req.user.userId }).populate("facility");
        res.json(tasks);
    } catch(err) { res.status(500).json({message:"Error"}); }
}
export async function getStaffSchedule(req, res) {
    res.json([]);
}
export async function getResidentBookings(req, res) {
    try {
        const bookings = await Booking.find({ user: req.user.userId }).populate("facility");
        res.json(bookings);
    } catch(err) { res.status(500).json({message:"Error"}); }
}
