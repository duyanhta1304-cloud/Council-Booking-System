import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
    {
        action: {
            type: String, 
            required: true,
        },
        principal: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        details: {
            type: String,
        }
    },
    {
        timestamps: true,
    }
);

const AuditLog = mongoose.model("AuditLog", auditLogSchema);
export default AuditLog;