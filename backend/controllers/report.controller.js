import Booking from "../models/booking.model.js";
import Facility from "../models/facilities.model.js";
import MaintenanceReport from "../models/maintenanceReport.model.js";

export async function getUtilisation(req, res) {
    try {
        const rangeDays = parseInt(req.query.range) || 30;
        const since = new Date();
        since.setDate(since.getDate() - rangeDays);

        // Get all active facilities
        const facilities = await Facility.find({ status: "Active" }, "name");

        // Aggregate booking hours per facility in the date range
        const bookingAgg = await Booking.aggregate([
            {
                $match: {
                    startTime: { $gte: since },
                    status: { $in: ["Approved", "Pending"] },
                },
            },
            {
                $group: {
                    _id: "$facility",
                    totalHours: {
                        $sum: {
                            $divide: [
                                { $subtract: ["$endTime", "$startTime"] },
                                1000 * 60 * 60, // ms → hours
                            ],
                        },
                    },
                    bookingCount: { $sum: 1 },
                },
            },
        ]);

        // Build a lookup map: facilityId → totalHours
        const hoursMap = {};
        bookingAgg.forEach((b) => {
            hoursMap[b._id.toString()] = b.totalHours;
        });

        // Assume 8 available hours per day per facility
        const availableHours = 8 * rangeDays;

        const utilisation = facilities.map((f) => {
            const booked = hoursMap[f._id.toString()] || 0;
            const rate = Math.min(100, Math.round((booked / availableHours) * 100));
            return { facility: f.name, rate, booked: Math.round(booked) };
        });

        // Sort descending by rate
        utilisation.sort((a, b) => b.rate - a.rate);

        res.json({ range: rangeDays, utilisation });
    } catch (err) {
        console.error("Utilisation report error:", err);
        res.status(500).json({ message: "Could not generate utilisation report" });
    }
}

// GET /api/reports/maintenance-time?range=30
// How many hours each facility spent under maintenance in the period. A task
// still open is measured up to now, so long-running problems show their weight
// rather than counting as zero until someone closes them.
export async function getMaintenanceTime(req, res) {
    try {
        const rangeDays = parseInt(req.query.range) || 30;
        const since = new Date();
        since.setDate(since.getDate() - rangeDays);
        const now = new Date();

        const reports = await MaintenanceReport.find({
            status: { $ne: "Cancelled" },
            $or: [
                { completedAt: { $gte: since } },
                { completedAt: null, date: { $lte: now } },
                { completedAt: { $exists: false }, date: { $lte: now } },
            ],
        }).populate("facility", "name");

        const byFacility = new Map();

        for (const report of reports) {
            if (!report.facility) continue;

            // Clip to the window so a months-old task doesn't dominate a 7-day view.
            const opened = new Date(Math.max(new Date(report.date).getTime(), since.getTime()));
            const closed = report.completedAt ? new Date(report.completedAt) : now;
            if (closed <= opened) continue;

            const hours = (closed - opened) / (1000 * 60 * 60);
            const key = report.facility._id.toString();
            const entry = byFacility.get(key) ?? { facility: report.facility.name, hours: 0, tasks: 0, open: 0 };

            entry.hours += hours;
            entry.tasks += 1;
            if (!report.completedAt) entry.open += 1;
            byFacility.set(key, entry);
        }

        const maintenance = [...byFacility.values()]
            .map((e) => ({ ...e, hours: Math.round(e.hours) }))
            .sort((a, b) => b.hours - a.hours);

        res.json({ range: rangeDays, maintenance });
    } catch (err) {
        console.error("Maintenance time report error:", err);
        res.status(500).json({ message: "Could not generate maintenance time report" });
    }
}

// GET /api/reports/booking-heatmap?month=YYYY-MM
// Booked hours per weekday-by-hour cell across one month, so an admin can see
// when demand actually lands rather than just how much of it there was.
export async function getBookingHeatmap(req, res) {
    try {
        const monthParam = req.query.month;
        const anchor = monthParam ? new Date(`${monthParam}-01T00:00:00`) : new Date();
        if (Number.isNaN(anchor.getTime())) return res.status(400).json({ message: "Invalid month" });

        const monthStart = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
        const monthEnd = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1);

        const bookings = await Booking.find({
            status: { $in: ["Approved", "Pending"] },
            startTime: { $lt: monthEnd },
            endTime: { $gt: monthStart },
        }).select("startTime endTime");

        // cells[weekday][hour] — a booking spanning several hours lights up each
        // hour it covers, so a 3-hour booking counts three times, once per cell.
        const cells = Array.from({ length: 7 }, () => Array(24).fill(0));
        let total = 0;

        for (const booking of bookings) {
            const cursor = new Date(booking.startTime);
            cursor.setMinutes(0, 0, 0);

            while (cursor < booking.endTime) {
                if (cursor >= monthStart && cursor < monthEnd) {
                    cells[cursor.getDay()][cursor.getHours()] += 1;
                    total += 1;
                }
                cursor.setHours(cursor.getHours() + 1);
            }
        }

        const peak = Math.max(0, ...cells.flat());

        res.json({
            month: `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, "0")}`,
            cells,
            peak,
            total,
        });
    } catch (err) {
        console.error("Booking heatmap error:", err);
        res.status(500).json({ message: "Could not generate booking heatmap" });
    }
}
