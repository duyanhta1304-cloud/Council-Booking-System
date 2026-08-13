import mongoose  from "mongoose";
import dotenv from "dotenv"

export const connectDB = async() => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("MONGODB CONNECTED")
    } catch (error) {
        console.error("Error: ", error)
        process.exit(1)
    }
}