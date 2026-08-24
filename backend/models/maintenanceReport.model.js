import mongoose from "mongoose";

const maintenanceReportSchema = new mongoose.Schema(
    {
        reportedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
        },
        facility : {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Facility",
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        date : {
            type: Date,
            required: true,
            default: Date.now,
        },
        status: {
            type: String,
            enum : ["Pending", "In Progress", "Completed", "Cancelled"],
            default: "Pending",
        }
    },
    {
        timestamps: true,
    }
);

const MaintenanceReport = mongoose.model("MaintenanceReport", maintenanceReportSchema);
export default MaintenanceReport;