import mongoose from "mongoose";

const roomSchema = mongoose.Schema(
    {
        roomNumber: {
            type: String,
            required: true,
        },
        capacity: {
            type: Number,
            required: true,
        }
    }
);
const equipmentSchema = new mongoose.Schema({
    name: {type: String, required: true},
    description: { type: String, required: false },
    // The attribute a room has no use for: a room is taken whole, so its
    // availability is a yes/no. Equipment is stocked in counts, so its
    // availability is "how many of the N units are still free this hour".
    quantity: { type: Number, required: true, default: 1, min: 1 },
    // Lets an admin pull a broken item out of circulation without deleting it
    // or taking the whole facility offline.
    status: {
        type: String,
        enum: ["Available", "Under Maintenance", "Retired"],
        default: "Available",
    }
});

const facilitiesSchema = mongoose.Schema(
    {
        name: { 
            type: String, 
            required: true 
        },
        description: { 
            type: String, 
            required: true 
        },
        status: { 
            type: String, 
            enum: ["Active", "Inactive", "Under Maintenance"],
            default: "Active" 
        },
        rooms: [roomSchema],
        equipment: [equipmentSchema]
    },
    {
        timestamps: true
    }
);

const Facility = mongoose.model("Facility",facilitiesSchema);
export default Facility;