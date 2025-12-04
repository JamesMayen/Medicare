import mongoose from "mongoose";

const systemSettingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  description: { type: String },
  category: { type: String, enum: ['general', 'security', 'notifications', 'limits'] },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
}, { timestamps: true });

export default mongoose.model("SystemSettings", systemSettingsSchema);