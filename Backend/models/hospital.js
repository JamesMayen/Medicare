import mongoose from "mongoose";

const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  departments: [{ type: String }],
  contactInfo: {
    phone: { type: String },
    email: { type: String },
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model("Hospital", hospitalSchema);