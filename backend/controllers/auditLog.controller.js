import AuditLog from "../models/auditLog.model.js";
export async function getAuditLogs(req, res) {
    try {
        const logs = await AuditLog.find().populate('principal').sort({ createdAt: -1 });
        res.json(logs);
    } catch(err) { res.status(500).json({message:"Error"}); }
}
