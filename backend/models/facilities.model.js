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
    description: { type: String, required: false }
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