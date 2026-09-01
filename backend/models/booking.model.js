import mongoose from "mongoose";

// One line of an equipment booking. `quantity` is the attribute a room booking
// has no use for: rooms are taken whole, equipment is taken in counts. `name`
// is copied so a past booking still reads correctly if the item is renamed.
const bookedEquipmentSchema = new mongoose.Schema(
    {
        equipmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Equipment",
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
    },
    { _id: false }
);

const bookingSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        // Required for a facility booking, absent for standalone equipment —
        // equipment is booked in its own right and need not involve a space.
        facility: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Facility",
            required: function () {
                return this.bookingType !== "Equipment";
            },
        },
        bookingType: {
            type: String,
            enum: ["Facility", "Equipment"],
            default: "Facility",
        },
        equipment: {
            type: [bookedEquipmentSchema],
            default: [],
        },
        // Optionally ties an equipment booking to one of the resident's own
        // approved facility bookings, so staff know the gear is wanted for
        // that event. Never set on a facility booking.
        linkedBooking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking",
            required: false,
            default: null,
        },
        startTime: {
            type: Date,
            required: true,
        },
        endTime: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ["Pending", "Approved", "Rejected", "Cancelled"],
            default: "Pending",
        },
        purpose: {
            type: String,
        }
    },
    {
        timestamps: true,
    }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
