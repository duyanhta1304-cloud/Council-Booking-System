import Notification from "../models/notification.model.js";

// GET /api/notifications — the signed-in user's own notifications, newest first.
export async function getMyNotifications(req, res) {
    try {
        const notifications = await Notification.find({ user: req.user.userId })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(notifications);
    } catch (error) {
        console.log("Error fetching notifications:", error);
        res.status(500).json({ message: "Could not fetch notifications" });
    }
}

// PATCH /api/notifications/:id/read
export async function markNotificationRead(req, res) {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user.userId },
            { read: true },
            { new: true }
        );
        if (!notification) return res.status(404).json({ message: "Notification not found" });
        res.json(notification);
    } catch (error) {
        console.log("Error marking notification read:", error);
        res.status(500).json({ message: "Could not update notification" });
    }
}
