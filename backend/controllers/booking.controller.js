import Booking from "../models/booking.model.js";
import AuditLog from "../models/auditLog.model.js";

export async function createBooking(req, res) {
    try {
        const { facility, startTime, endTime } = req.body;
        if (!facility || !startTime || !endTime) return res.status(400).json({ message: "Missing fields" });
        const newBooking = await Booking.create({ user: req.user.userId, facility, startTime, endTime, status: "Pending" });
        await AuditLog.create({ action: "Created Booking", principal: req.user.userId, details: newBooking._id.toString() });
        res.status(201).json(newBooking);
    } catch (error) { res.status(500).json({ message: "Error" }); }
}
export async function getBookings(req, res) {
    try {
        const { status } = req.query;
        let query = {};
        if (status) query.status = status;
        const bookings = await Booking.find(query).populate('user').populate('facility');
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
