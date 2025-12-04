import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true }, // e.g., 'USER_CREATED', 'APPOINTMENT_UPDATED'
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  details: { type: mongoose.Schema.Types.Mixed },
  ipAddress: { type: String },
  userAgent: { type: String },
}, { timestamps: true });

auditLogSchema.index({ createdAt: -1 });

export default mongoose.model("AuditLog", auditLogSchema);