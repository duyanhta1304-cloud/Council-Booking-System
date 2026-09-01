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
        // A data URI ("data:image/jpeg;base64,...") rather than a file path, so
        // the picture travels with the document and nothing depends on an
        // uploads folder existing. The API caps the size on the way in.
        image: {
            type: String,
            required: false,
        },
        rooms: [roomSchema]
    },
    {
        timestamps: true
    }
);

const Facility = mongoose.model("Facility",facilitiesSchema);
export default Facility;
