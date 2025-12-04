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

    status: {
      type: String,
      enum: ["active", "suspended", "pending"],
      default: "active",
    },

    // Doctor-specific fields
    specialization: { type: String },
    experience: { type: Number }, // years

    bio: { type: String, default: "" }, // NEW FIELD

    // Patient-specific fields
    medicalInfo: { type: String, default: "" },
    insurance: { type: String, default: "" },

    consultationFees: { type: Number }, // Consultation fees for doctors

    contactDetails: {
      phone: { type: String },
      address: { type: String },
    },

    workLocation: { type: String },

    profilePhoto: { type: String }, // URL/path

    isVerified: { type: Boolean, default: false },

    averageRating: { type: Number, default: 0 },

    hospital: { type: String },

    availability: {
      day: { type: String },
      startTime: { type: String },
      endTime: { type: String },
    },
  },
  { timestamps: true }
);

export default mongoose.model("user", userSchema);
