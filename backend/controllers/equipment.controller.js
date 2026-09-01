import Equipment from "../models/equipment.model.js";
import Booking from "../models/booking.model.js";
import AuditLog from "../models/auditLog.model.js";

export async function getAllEquipment(req, res) {
    try {
        const equipment = await Equipment.find()
            .populate("facility", "name status")
            .sort({ name: 1 });
        res.json(equipment);
    } catch (error) {
        console.log("Error fetching equipment:", error);
        res.status(500).json({ message: "Could not fetch equipment" });
    }
}

export async function createEquipment(req, res) {
    try {
        const { name, description, quantity, status, facility } = req.body;
        if (!name) return res.status(400).json({ message: "Name is required" });

        const created = await Equipment.create({
            name,
            description,
            quantity,
            status,
            // "" from an unselected dropdown must become null, not a cast error.
            facility: facility || null,
        });

        await AuditLog.create({
            action: "Created Equipment",
            principal: req.user.userId,
            details: created._id.toString(),
        });

        const populated = await created.populate("facility", "name status");
        res.status(201).json(populated);
    } catch (error) {
        console.log("Error creating equipment:", error);
        res.status(500).json({ message: "Could not create equipment" });
    }
}

export async function updateEquipment(req, res) {
    try {
        const { name, description, quantity, status, facility } = req.body;
        const allowedUpdate = {};
        if (name !== undefined) allowedUpdate.name = name;
        if (description !== undefined) allowedUpdate.description = description;
        if (quantity !== undefined) allowedUpdate.quantity = quantity;
        if (status !== undefined) allowedUpdate.status = status;
        if (facility !== undefined) allowedUpdate.facility = facility || null;

        const updated = await Equipment.findByIdAndUpdate(req.params.id, allowedUpdate, {
            new: true,
            runValidators: true,
        }).populate("facility", "name status");

        if (!updated) return res.status(404).json({ message: "Equipment not found" });
        res.json(updated);
    } catch (error) {
        console.log("Error updating equipment:", error);
        res.status(500).json({ message: "Could not update equipment" });
    }
}

// Deleting an item would orphan the bookings that name it, so an item still
// holding live bookings must be retired instead.
export async function deleteEquipment(req, res) {
    try {
        const liveBooking = await Booking.findOne({
            "equipment.equipmentId": req.params.id,
            status: { $in: ["Pending", "Approved"] },
            endTime: { $gt: new Date() },
        });

        if (liveBooking) {
            return res.status(409).json({
                message: "This item has upcoming bookings. Set it to Retired instead of deleting it.",
            });
        }

        const deleted = await Equipment.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Equipment not found" });

        await AuditLog.create({
            action: "Deleted Equipment",
            principal: req.user.userId,
            details: deleted._id.toString(),
        });

        res.json({ message: "Equipment deleted" });
    } catch (error) {
        console.log("Error deleting equipment:", error);
        res.status(500).json({ message: "Could not delete equipment" });
    }
}
