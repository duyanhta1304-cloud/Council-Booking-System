import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ["closure", "booking-cancelled"],
            default: "closure",
        },
        relatedBooking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking",
        },
        relatedFacility: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Facility",
        },
        read: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
