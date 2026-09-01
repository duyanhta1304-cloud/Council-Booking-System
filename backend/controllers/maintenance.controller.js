import MaintenanceReport from "../models/maintenanceReport.model.js";

export async function getAllMaintenance(req, res) {
    try {
        const tasks = await MaintenanceReport.find()
            .populate('reportedBy')
            .populate('assignedTo')
            .populate('facility');
        res.json(tasks);
    } catch(err) { res.status(500).json({message:"Error fetching maintenance tasks"}); }
}

export async function createMaintenance(req, res) {
    try {
        const { facility, description, date, priority, assignedTo } = req.body;
        const report = await MaintenanceReport.create({
            facility,
            description,
            date: date || new Date(),
            priority,
            assignedTo: assignedTo || undefined,
            reportedBy: req.user.userId,
            status: "Pending",
        });
        const populated = await report.populate(['facility', 'reportedBy', 'assignedTo']);
        res.status(201).json(populated);
    } catch(err) { res.status(500).json({message:"Error creating maintenance report"}); }
}

export async function updateMaintenance(req, res) {
    try {
        // Only allow safe fields to be updated — never expose raw req.body to the DB
        const { status, assignedTo, description, priority } = req.body;
        const allowedUpdate = {};
        if (status !== undefined) allowedUpdate.status = status;
        if (assignedTo !== undefined) allowedUpdate.assignedTo = assignedTo;
        if (description !== undefined) allowedUpdate.description = description;
        if (priority !== undefined) allowedUpdate.priority = priority;

        // Reaching Completed is what closes the clock the maintenance-time
        // report measures; moving back off Completed reopens it.
        if (status === "Completed") allowedUpdate.completedAt = new Date();
        else if (status !== undefined) allowedUpdate.completedAt = null;

        const updated = await MaintenanceReport.findByIdAndUpdate(
            req.params.id,
            allowedUpdate,
            { new: true }
        ).populate(['facility', 'reportedBy', 'assignedTo']);
        if (!updated) return res.status(404).json({ message: "Task not found" });
        res.json(updated);
    } catch(err) { res.status(500).json({message:"Error updating maintenance task"}); }
}
