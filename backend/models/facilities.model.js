import mongoose from "mongoose";

const roomSchema = mongoose.Schema(
    {
        roomNumber: {
            type: String,
            required: true,
        },
        capacity: {
            type: Number,
            require: true,
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

const Facility = new mongoose.model("Facility","facilitiesSchema");
export default Facility;