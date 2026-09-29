import mongoose from "mongoose"

// Module globals survive between invocations of a warm function, so the
// connection is opened once and reused instead of per request.
let cached = globalThis._mongoose
if (!cached) cached = globalThis._mongoose = { conn: null, promise: null }

export const connectDB = async () => {
    if (cached.conn) return cached.conn

    if (!cached.promise) {
        cached.promise = mongoose.connect(process.env.MONGO_URI, {
            bufferCommands: false,
        })
    }

    try {
        cached.conn = await cached.promise
    } catch (error) {
        cached.promise = null   // let the next request try again
        throw error
    }

    return cached.conn
}