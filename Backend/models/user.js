import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "doctor", "patient"],
      default: "patient",
    },
    // Doctor-specific fields
    specialization: { type: String },
    experience: { type: Number }, // years
    contactDetails: {
      phone: { type: String },
      address: { type: String },
    },
    workLocation: { type: String },
    consultationFee: { type: Number, default: 0 },
    availability: [{
      day: { type: String, enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] },
      startTime: { type: String },
      endTime: { type: String },
      isAvailable: { type: Boolean, default: true }
    }],
    profilePhoto: { type: String }, // URL or path
  },
  { timestamps: true }
);

export default mongoose.model("user", userSchema);
