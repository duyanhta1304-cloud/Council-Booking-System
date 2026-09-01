import Booking from "../models/booking.model.js";
import AuditLog from "../models/auditLog.model.js";
import Closure from "../models/closure.model.js";
import Facility from "../models/facilities.model.js";
import Equipment from "../models/equipment.model.js";

// Bookable hours are fixed one-hour blocks from 08:00 to 20:00, so the last
// block starts at 19:00. Kept here so the API and the UI agree on one source.
export const OPENING_HOUR = 8;
export const CLOSING_HOUR = 20;
export const MAX_DAYS_AHEAD = 90;

// A slot is taken by anything not yet dead — a pending request holds the slot
// until an admin decides on it.
const BLOCKING_STATUSES = ["Pending", "Approved"];

// Bookings written before `bookingType` existed have no such field, so match on
// "not Equipment" rather than "is Facility" — otherwise older room bookings
// would stop holding their slot.
const FACILITY_BOOKING = { bookingType: { $ne: "Equipment" } };

// The bookable hours of one day, as [start, end) Date pairs.
function hourSlots(dayStart) {
    const slots = [];
    for (let hour = OPENING_HOUR; hour < CLOSING_HOUR; hour++) {
        const slotStart = new Date(dayStart);
        slotStart.setHours(hour, 0, 0, 0);
        const slotEnd = new Date(slotStart);
        slotEnd.setHours(hour + 1);
        slots.push({ hour, slotStart, slotEnd });
    }
    return slots;
}

function overlaps(a, b) {
    return a.startTime < b.end && a.endTime > b.start;
}

function startOfDay(date) {
    const copy = new Date(date);
    copy.setHours(0, 0, 0, 0);
    return copy;
}

// Latest date a resident may book, inclusive.
function bookingHorizon() {
    const horizon = startOfDay(new Date());
    horizon.setDate(horizon.getDate() + MAX_DAYS_AHEAD);
    horizon.setHours(23, 59, 59, 999);
    return horizon;
}

// GET /api/bookings/availability?facility=<id>&date=YYYY-MM-DD
// Returns one entry per bookable hour so the client can render the grid
// without guessing which blocks are free.
export async function getAvailability(req, res) {
    try {
        const { facility, date } = req.query;
        if (!facility || !date) return res.status(400).json({ message: "facility and date are required" });

        const dayStart = startOfDay(new Date(`${date}T00:00:00`));
        if (Number.isNaN(dayStart.getTime())) return res.status(400).json({ message: "Invalid date" });

        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);

        const [facilityDoc, bookings, closures] = await Promise.all([
            Facility.findById(facility).select("name status"),
            Booking.find({
                facility,
                ...FACILITY_BOOKING,
                status: { $in: BLOCKING_STATUSES },
                startTime: { $lt: dayEnd },
                endTime: { $gt: dayStart },
            }).select("startTime endTime"),
            Closure.find({
                facility,
                startDate: { $lt: dayEnd },
                endDate: { $gt: dayStart },
            }).select("reason"),
        ]);

        if (!facilityDoc) return res.status(404).json({ message: "Facility not found" });

        const now = new Date();
        const closure = closures[0];
        const slots = [];

        for (const { hour, slotStart, slotEnd } of hourSlots(dayStart)) {
            let reason = null;
            if (facilityDoc.status !== "Active") reason = facilityDoc.status;
            else if (closure) reason = "Closed";
            else if (slotEnd <= now) reason = "Past";
            else if (bookings.some((b) => b.startTime < slotEnd && b.endTime > slotStart)) reason = "Booked";

            slots.push({
                hour,
                label: `${String(hour).padStart(2, "0")}:00`,
                startTime: slotStart.toISOString(),
                endTime: slotEnd.toISOString(),
                available: reason === null,
                reason,
            });
        }

        res.json({
            facility: { _id: facilityDoc._id, name: facilityDoc.name, status: facilityDoc.status },
            date,
            closureReason: closure?.reason ?? null,
            slots,
        });
    } catch (error) {
        console.log("Availability error:", error);
        res.status(500).json({ message: "Could not load availability" });
    }
}

// How many units of one item are already spoken for during [start, end).
function unitsHeld(bookings, equipmentId, start, end) {
    return bookings
        .filter((b) => overlaps(b, { start, end }))
        .reduce((total, b) => {
            const line = b.equipment.find((e) => e.equipmentId.equals(equipmentId));
            return total + (line?.quantity ?? 0);
        }, 0);
}

// Every booking that could be holding units of this item in this window.
// Equipment is booked in its own right, so this is not scoped to a facility.
function equipmentBookingsIn(equipmentId, from, to) {
    return Booking.find({
        bookingType: "Equipment",
        "equipment.equipmentId": equipmentId,
        status: { $in: BLOCKING_STATUSES },
        startTime: { $lt: to },
        endTime: { $gt: from },
    }).select("startTime endTime equipment");
}

// GET /api/bookings/equipment-availability?equipment=<id>&date=YYYY-MM-DD
// Same shape as getAvailability, but each slot also carries how many units are
// left — the resident picks a quantity, not just a time.
export async function getEquipmentAvailability(req, res) {
    try {
        const { equipment, date } = req.query;
        if (!equipment || !date) {
            return res.status(400).json({ message: "equipment and date are required" });
        }

        const dayStart = startOfDay(new Date(`${date}T00:00:00`));
        if (Number.isNaN(dayStart.getTime())) return res.status(400).json({ message: "Invalid date" });

        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);

        const item = await Equipment.findById(equipment).populate("facility", "name status");
        if (!item) return res.status(404).json({ message: "Equipment not found" });

        const bookings = await equipmentBookingsIn(item._id, dayStart, dayEnd);

        const now = new Date();
        const slots = [];

        for (const { hour, slotStart, slotEnd } of hourSlots(dayStart)) {
            const remaining = item.quantity - unitsHeld(bookings, item._id, slotStart, slotEnd);

            let reason = null;
            if (item.status !== "Available") reason = item.status;
            else if (slotEnd <= now) reason = "Past";
            else if (remaining <= 0) reason = "All out";

            slots.push({
                hour,
                label: `${String(hour).padStart(2, "0")}:00`,
                startTime: slotStart.toISOString(),
                endTime: slotEnd.toISOString(),
                remaining: Math.max(remaining, 0),
                available: reason === null,
                reason,
            });
        }

        res.json({
            equipment: { _id: item._id, name: item.name, quantity: item.quantity, status: item.status },
            date,
            slots,
        });
    } catch (error) {
        console.log("Equipment availability error:", error);
        res.status(500).json({ message: "Could not load equipment availability" });
    }
}

export async function createBooking(req, res) {
    try {
        const { facility, startTime, endTime, purpose, equipmentId, quantity, linkedBooking } = req.body;
        if (!startTime || !endTime) return res.status(400).json({ message: "Missing fields" });

        // An equipment request is told apart by carrying an item id; everything
        // else is a request for the space itself. Only the latter needs a facility.
        const isEquipment = Boolean(equipmentId);
        if (!isEquipment && !facility) return res.status(400).json({ message: "Missing fields" });

        const start = new Date(startTime);
        const end = new Date(endTime);
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
            return res.status(400).json({ message: "Invalid start or end time" });
        }
        if (end <= start) return res.status(400).json({ message: "End time must be after start time" });
        if (start < new Date()) return res.status(400).json({ message: "That time has already passed" });
        if (start > bookingHorizon()) {
            return res.status(400).json({ message: `Bookings can only be made up to ${MAX_DAYS_AHEAD} days ahead` });
        }

        // Whole one-hour blocks only, and both ends inside opening hours.
        const isWholeHour = (d) => d.getMinutes() === 0 && d.getSeconds() === 0 && d.getMilliseconds() === 0;
        if (!isWholeHour(start) || !isWholeHour(end)) {
            return res.status(400).json({ message: "Bookings must start and end on the hour" });
        }
        if (start.getHours() < OPENING_HOUR || end.getHours() > CLOSING_HOUR || end.getDate() !== start.getDate()) {
            return res.status(400).json({ message: `Bookings must fall between ${OPENING_HOUR}:00 and ${CLOSING_HOUR}:00` });
        }

        let item = null;
        let wanted = 0;
        let link = null;

        if (isEquipment) {
            item = await Equipment.findById(equipmentId);
            if (!item) return res.status(404).json({ message: "Equipment not found" });
            if (item.status !== "Available") return res.status(409).json({ message: `That item is ${item.status.toLowerCase()}` });

            wanted = Number(quantity);
            if (!Number.isInteger(wanted) || wanted < 1) return res.status(400).json({ message: "Quantity must be a whole number of at least 1" });
            if (wanted > item.quantity) {
                return res.status(400).json({ message: `Only ${item.quantity} of ${item.name} exist` });
            }

            // Linking is optional, but a link that is offered must be the
            // resident's own approved facility booking, and the gear must be
            // wanted for a time that booking actually covers.
            if (linkedBooking) {
                link = await Booking.findOne({
                    _id: linkedBooking,
                    user: req.user.userId,
                    bookingType: { $ne: "Equipment" },
                    status: "Approved",
                });
                if (!link) return res.status(404).json({ message: "That approved booking is not one of yours" });
                if (start < link.startTime || end > link.endTime) {
                    return res.status(400).json({ message: "Equipment times must fall inside the booking you linked it to" });
                }
            }

            // Unlike a room, the item is not taken or free — it is counted. The
            // request fits only if every hour it spans still has `wanted` units
            // left, so check the tightest hour rather than the range as a whole.
            const held = await equipmentBookingsIn(item._id, start, end);
            for (const { slotStart, slotEnd } of hourSlots(startOfDay(start))) {
                if (slotEnd <= start || slotStart >= end) continue;
                const remaining = item.quantity - unitsHeld(held, item._id, slotStart, slotEnd);
                if (remaining < wanted) {
                    return res.status(409).json({
                        message: `Only ${Math.max(remaining, 0)} left at ${String(slotStart.getHours()).padStart(2, "0")}:00. Pick a smaller quantity or another time.`,
                    });
                }
            }
        } else {
            const facilityDoc = await Facility.findById(facility).select("status");
            if (!facilityDoc) return res.status(404).json({ message: "Facility not found" });
            if (facilityDoc.status !== "Active") return res.status(409).json({ message: "That facility is not available for booking" });

            const closure = await Closure.findOne({ facility, startDate: { $lt: end }, endDate: { $gt: start } });
            if (closure) return res.status(409).json({ message: `Facility is closed: ${closure.reason}` });

            // Overlap test: an existing booking clashes when it starts before this
            // one ends and ends after this one starts.
            const clash = await Booking.findOne({
                facility,
                ...FACILITY_BOOKING,
                status: { $in: BLOCKING_STATUSES },
                startTime: { $lt: end },
                endTime: { $gt: start },
            });
            if (clash) return res.status(409).json({ message: "That time slot has just been taken. Please pick another." });
        }

        const newBooking = await Booking.create({
            user: req.user.userId,
            // An equipment booking borrows the item's home facility for display
            // only, and stays facility-less when the item has no home.
            facility: isEquipment ? (item.facility ?? undefined) : facility,
            startTime: start,
            endTime: end,
            purpose,
            status: "Pending",
            bookingType: isEquipment ? "Equipment" : "Facility",
            equipment: isEquipment ? [{ equipmentId: item._id, name: item.name, quantity: wanted }] : [],
            linkedBooking: link?._id ?? null,
        });
        await AuditLog.create({
            action: isEquipment ? "Created Equipment Booking" : "Created Booking",
            principal: req.user.userId,
            details: newBooking._id.toString(),
        });
        res.status(201).json(newBooking);
    } catch (error) {
        console.log("Create booking error:", error);
        res.status(500).json({ message: "Error" });
    }
}
export async function getBookings(req, res) {
    try {
        const { status } = req.query;
        let query = {};
        if (status) query.status = status;
        const bookings = await Booking.find(query)
            .populate('user')
            .populate('facility')
            .populate({ path: 'linkedBooking', populate: { path: 'facility', select: 'name' } });
        res.json(bookings);
    } catch (error) { res.status(500).json({ message: "Error" }); }
}
export async function updateBookingStatus(req, res) {
    try {
        const { status } = req.body;
        const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
        await AuditLog.create({ action: `Updated Booking to ${status}`, principal: req.user.userId, details: booking._id.toString() });
        res.json(booking);
    } catch (error) { res.status(500).json({ message: "Error" }); }
}
export async function cancelMyBooking(req, res) {
    try {
        const booking = await Booking.findOneAndUpdate({ _id: req.params.id, user: req.user.userId }, { status: 'Cancelled' }, { new: true });
        if(!booking) return res.status(404).json({message: "Booking not found or not yours"});
        await AuditLog.create({ action: "Cancelled own booking", principal: req.user.userId, details: booking._id.toString() });
        res.json(booking);
    } catch (error) { res.status(500).json({ message: "Error" }); }
}
