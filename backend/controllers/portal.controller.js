import Booking from "../models/booking.model.js";
import Facility from "../models/facilities.model.js"; // filename is facilities.model.js
import MaintenanceReport from "../models/maintenanceReport.model.js";
import User from "../models/user.model.js";

// The last `days` calendar days as YYYY-MM-DD keys, oldest first, so a chart
// shows a flat line on quiet days instead of skipping them.
function recentDays(days) {
    const out = [];
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    cursor.setDate(cursor.getDate() - (days - 1));

    for (let i = 0; i < days; i++) {
        out.push({
            key: `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`,
            label: cursor.toLocaleDateString("en-AU", { day: "numeric", month: "short" }),
            date: new Date(cursor),
        });
        cursor.setDate(cursor.getDate() + 1);
    }
    return out;
}

function dayKey(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export async function getAdminDashboard(req, res) {
    try {
        const days = recentDays(14);
        const since = days[0].date;

        const [users, facilities, pendingBookings, activeMaintenance, trendBookings, allMaintenance, bookingsByStatus] =
            await Promise.all([
                User.countDocuments(),
                Facility.countDocuments(),
                Booking.countDocuments({ status: "Pending" }),
                MaintenanceReport.countDocuments({ status: "In Progress" }),
                Booking.find({ createdAt: { $gte: since } }).select("createdAt bookingType"),
                MaintenanceReport.find().select("status priority"),
                Booking.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
            ]);

        // Two series so the split between space and gear demand is visible.
        const trendIndex = new Map(days.map((d) => [d.key, { date: d.label, facility: 0, equipment: 0 }]));
        for (const booking of trendBookings) {
            const bucket = trendIndex.get(dayKey(booking.createdAt));
            if (!bucket) continue;
            if (booking.bookingType === "Equipment") bucket.equipment += 1;
            else bucket.facility += 1;
        }

        const countBy = (items, field, keys) =>
            keys.map((key) => ({ name: key, value: items.filter((i) => (i[field] ?? "Medium") === key).length }));

        res.json({
            users,
            facilities,
            pendingBookings,
            activeMaintenance,
            bookingTrend: [...trendIndex.values()],
            maintenanceByStatus: countBy(allMaintenance, "status", ["Pending", "In Progress", "Completed", "Cancelled"]),
            maintenanceByPriority: countBy(allMaintenance, "priority", ["High", "Medium", "Low"]),
            bookingsByStatus: bookingsByStatus.map((b) => ({ name: b._id, value: b.count })),
        });
    } catch(err) {
        console.log("Admin dashboard error:", err);
        res.status(500).json({message:"Error"});
    }
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

        // The week ahead, so staff can see the load coming rather than only today's.
        const weekAhead = recentDays(1)[0];
        const upcomingDays = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(weekAhead.date);
            day.setDate(day.getDate() + i);
            upcomingDays.push({
                key: dayKey(day),
                label: day.toLocaleDateString("en-AU", { weekday: "short" }),
            });
        }

        const weekEnd = new Date(startOfDay);
        weekEnd.setDate(weekEnd.getDate() + 7);

        const [weekBookings, myTasks] = await Promise.all([
            Booking.find({
                startTime: { $gte: startOfDay, $lt: weekEnd },
                status: { $in: ["Approved", "Pending"] },
            }).select("startTime bookingType"),
            MaintenanceReport.find({ assignedTo: req.user.userId }).select("status priority"),
        ]);

        const weekIndex = new Map(upcomingDays.map((d) => [d.key, { date: d.label, facility: 0, equipment: 0 }]));
        for (const booking of weekBookings) {
            const bucket = weekIndex.get(dayKey(booking.startTime));
            if (!bucket) continue;
            if (booking.bookingType === "Equipment") bucket.equipment += 1;
            else bucket.facility += 1;
        }

        const taskStatuses = ["Pending", "In Progress", "Completed", "Cancelled"];

        res.json({
            stats: {
                todaysBookings,
                pendingMaintenance,
                overdueTasks,
                completedThisWeek,
            },
            todaysBookings: todaysBookingsList,
            weekAhead: [...weekIndex.values()],
            myTasksByStatus: taskStatuses.map((s) => ({
                name: s,
                value: myTasks.filter((t) => t.status === s).length,
            })),
        });
    } catch(err) {
        console.log("Staff dashboard error:", err);
        res.status(500).json({message:"Error fetching staff dashboard"});
    }
}
export async function getResidentDashboard(req, res) {
    try {
        const days = recentDays(30);
        const since = days[0].date;

        const [upcomingBookings, myBookings] = await Promise.all([
            Booking.find({ user: req.user.userId, status: "Approved", startTime: { $gte: new Date() } })
                .populate("facility")
                .sort({ startTime: 1 }),
            Booking.find({ user: req.user.userId, startTime: { $gte: since } })
                .select("startTime endTime status bookingType facility")
                .populate("facility", "name"),
        ]);

        // Hours booked per facility over the last 30 days — the resident's own
        // usage, which is the only slice of the utilisation report that's theirs.
        const hoursByFacility = new Map();
        for (const booking of myBookings) {
            if (booking.status === "Cancelled" || booking.status === "Rejected") continue;
            const name = booking.facility?.name ?? "Equipment only";
            const hours = (booking.endTime - booking.startTime) / (1000 * 60 * 60);
            hoursByFacility.set(name, (hoursByFacility.get(name) ?? 0) + hours);
        }

        const statuses = ["Pending", "Approved", "Rejected", "Cancelled"];

        res.json({
            upcomingBookings,
            myHoursByFacility: [...hoursByFacility.entries()]
                .map(([name, hours]) => ({ name, value: Math.round(hours) }))
                .sort((a, b) => b.value - a.value),
            myBookingsByStatus: statuses.map((s) => ({
                name: s,
                value: myBookings.filter((b) => b.status === s).length,
            })),
        });
    } catch(err) {
        console.log("Resident dashboard error:", err);
        res.status(500).json({message:"Error"});
    }
}
export async function getStaffBookings(req, res) {
    try {
        const bookings = await Booking.find({ status: "Approved" })
            .populate("user")
            .populate("facility")
            .populate({ path: "linkedBooking", populate: { path: "facility", select: "name" } });
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
        const bookings = await Booking.find({ user: req.user.userId })
            .populate("facility")
            .populate({ path: "linkedBooking", populate: { path: "facility", select: "name" } })
            .sort({ startTime: -1 });
        res.json(bookings);
    } catch(err) { res.status(500).json({message:"Error"}); }
}
