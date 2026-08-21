import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        phoneNumber: {
            type: String, 
            unique: true,
        },
        role: {
            type: String,
            required: true,
            enum: ["Admin", "Staff", "Resident"],
            default: "Resident",
        },
        department: {
            type: String,
            required: false,
        },
        address: {
            street: {type: String},
            suburd: {type: String},
            city: {type: String},
            state: {type: String},
            postcode: {type: String},
            country: {type: String},
            required: false,
        }
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model("User", userSchema);
export default User;