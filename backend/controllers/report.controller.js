import Booking from "../models/booking.model.js";
import Facility from "../models/facilities.model.js";

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
