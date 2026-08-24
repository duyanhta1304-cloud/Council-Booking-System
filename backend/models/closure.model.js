import mongoose from "mongoose";
const closureSchema = new mongoose.Schema({
    facility: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true }
}, { timestamps: true });
export default mongoose.model("Closure", closureSchema);