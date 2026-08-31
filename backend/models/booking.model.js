import mongoose from "mongoose";

// One line of an equipment booking. Equipment lives as a subdocument of a
// Facility, so it is addressed by its subdocument id plus the parent facility;
// `name` is copied so a booking still reads correctly if the item is later
// renamed or removed from the facility.
const bookedEquipmentSchema = new mongoose.Schema(
    {
        equipmentId: {
            type: mongoose.Schema.Types.ObjectId,
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
        facility: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Facility",
            required: true,
        },
        // An equipment booking still names a facility — that's where the item
        // is collected from — but it holds stock, not the space itself, so the
        // two kinds never conflict with each other.
        bookingType: {
            type: String,
            enum: ["Facility", "Equipment"],
            default: "Facility",
        },
        equipment: {
            type: [bookedEquipmentSchema],
            default: [],
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