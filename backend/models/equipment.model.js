import mongoose from "mongoose";

const equipmentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: false,
        },
        // The attribute a room has no use for: a room is taken whole, so its
        // availability is a yes/no. Equipment is stocked in counts, so its
        // availability is "how many of the N units are still free this hour".
        quantity: {
            type: Number,
            required: true,
            default: 1,
            min: 1,
        },
        status: {
            type: String,
            enum: ["Available", "Under Maintenance", "Retired"],
            default: "Available",
        },
        // Optional on purpose — equipment exists in its own right, so an admin
        // can stock the catalogue before any facility is set up. When it is
        // set, it only says where the item is collected from.
        facility: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Facility",
            required: false,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const Equipment = mongoose.model("Equipment", equipmentSchema);
export default Equipment;
