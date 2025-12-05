import mongoose from 'mongoose';
import User from "../models/user.js";
import Availability from "../models/availability.js";
import { emitDoctorProfileUpdated } from "../utils/socketEmitter.js";

// =============================
// Update Consultation Fee
// =============================
export const updateConsultationFee = async (req, res) => {
try {
  const { consultationFees } = req.body;

  if (req.user.role !== "doctor") {
    return res.status(403).json({ message: "Only doctors can update fees" });
  }

  if (!consultationFees) {
    return res.status(400).json({ message: "Consultation fee is required" });
  }

  const updatedDoctor = await User.findByIdAndUpdate(
    req.user.id,
    { consultationFees },
    { new: true }
  ).select("-password");

  // Emit real-time update
  emitDoctorProfileUpdated({
    _id: updatedDoctor._id,
    name: updatedDoctor.name,
    specialization: updatedDoctor.specialization,
    averageRating: updatedDoctor.averageRating,
    experience: updatedDoctor.experience,
    workLocation: updatedDoctor.workLocation,
    consultationFees: updatedDoctor.consultationFees,
    profilePhoto: updatedDoctor.profilePhoto,
    hospital: updatedDoctor.hospital,
    bio: updatedDoctor.bio,
    contactDetails: updatedDoctor.contactDetails,
    isVerified: updatedDoctor.isVerified,
  });

    res.json({
      message: "Consultation fee updated successfully",
      doctor: updatedDoctor,
    });
  } catch (error) {
    console.error("Consultation fee update error:", error);
    res.status(500).json({ message: "Server error updating consultation fee" });
  }
};

// =============================
// Create Availability Slot
// =============================
export const createAvailability = async (req, res) => {
  try {
    const { day, startTime, endTime } = req.body;

    if (req.user.role !== "doctor") {
      return res.status(403).json({ message: "Only doctors can create availability slots" });
    }

    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (!day || !startTime || !endTime) {
      return res.status(400).json({
        message: "Day, startTime and endTime are required",
      });
    }

    // Validate day
    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    if (!validDays.includes(day)) {
      return res.status(400).json({ message: "Invalid day. Must be a valid day of the week." });
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return res.status(400).json({ message: "Invalid time format. Use HH:MM (24-hour format)." });
    }

    // Validate startTime < endTime
    const startMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
    const endMinutes = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);
    if (startMinutes >= endMinutes) {
      return res.status(400).json({ message: "Start time must be before end time." });
    }

    // Check for overlapping availabilities
    const existingAvailabilities = await Availability.find({ doctor: req.user.id, day });
    for (const avail of existingAvailabilities) {
      const existingStart = parseInt(avail.startTime.split(':')[0]) * 60 + parseInt(avail.startTime.split(':')[1]);
      const existingEnd = parseInt(avail.endTime.split(':')[0]) * 60 + parseInt(avail.endTime.split(':')[1]);
      if (startMinutes < existingEnd && endMinutes > existingStart) {
        return res.status(400).json({ message: "Availability slot overlaps with existing slot." });
      }
    }

    const newAvailability = new Availability({
      doctor: req.user.id,
      day,
      startTime,
      endTime,
    });

    const savedAvailability = await newAvailability.save();

    // Fetch doctor and availabilities for real-time update
    const doctor = await User.findById(req.user.id).select('name specialization averageRating experience workLocation consultationFees profilePhoto hospital bio contactDetails isVerified');
    const availabilities = await Availability.find({ doctor: req.user.id });

    const doctorWithAvailabilities = {
      ...doctor.toObject(),
      availabilities: availabilities.map(avail => ({
        _id: avail._id,
        day: avail.day,
        startTime: avail.startTime,
        endTime: avail.endTime,
      })),
    };

    emitDoctorProfileUpdated(doctorWithAvailabilities);

    res.status(201).json({
      message: "Availability slot created successfully",
      availability: savedAvailability,
    });
  } catch (error) {
    console.error("Availability creation error:", error);
    res.status(500).json({ message: "Server error creating availability slot" });
  }
};

// =============================
// Get All Availabilities for Doctor
// =============================
export const getAvailabilities = async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ message: "Only doctors can view their availabilities" });
    }

    const availabilities = await Availability.find({ doctor: req.user.id });

    res.json({
      availabilities,
    });
  } catch (error) {
    console.error("Get availabilities error:", error);
    res.status(500).json({ message: "Server error fetching availabilities" });
  }
};


// =============================
// Update Availability Slot
// =============================
export const updateAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { day, startTime, endTime } = req.body;

    if (req.user.role !== "doctor") {
      return res.status(403).json({ message: "Only doctors can update availability slots" });
    }

    const availability = await Availability.findById(id);

    if (!availability) {
      return res.status(404).json({ message: "Availability slot not found" });
    }

    if (availability.doctor.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this availability slot" });
    }

    // Use existing values if not provided
    const updatedDay = day || availability.day;
    const updatedStartTime = startTime || availability.startTime;
    const updatedEndTime = endTime || availability.endTime;

    // Validate day
    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    if (!validDays.includes(updatedDay)) {
      return res.status(400).json({ message: "Invalid day. Must be a valid day of the week." });
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(updatedStartTime) || !timeRegex.test(updatedEndTime)) {
      return res.status(400).json({ message: "Invalid time format. Use HH:MM (24-hour format)." });
    }

    // Validate startTime < endTime
    const startMinutes = parseInt(updatedStartTime.split(':')[0]) * 60 + parseInt(updatedStartTime.split(':')[1]);
    const endMinutes = parseInt(updatedEndTime.split(':')[0]) * 60 + parseInt(updatedEndTime.split(':')[1]);
    if (startMinutes >= endMinutes) {
      return res.status(400).json({ message: "Start time must be before end time." });
    }

    // Check for overlapping availabilities (excluding current one)
    const existingAvailabilities = await Availability.find({
      doctor: req.user.id,
      day: updatedDay,
      _id: { $ne: id }
    });
    for (const avail of existingAvailabilities) {
      const existingStart = parseInt(avail.startTime.split(':')[0]) * 60 + parseInt(avail.startTime.split(':')[1]);
      const existingEnd = parseInt(avail.endTime.split(':')[0]) * 60 + parseInt(avail.endTime.split(':')[1]);
      if (startMinutes < existingEnd && endMinutes > existingStart) {
        return res.status(400).json({ message: "Availability slot overlaps with existing slot." });
      }
    }

    availability.day = updatedDay;
    availability.startTime = updatedStartTime;
    availability.endTime = updatedEndTime;

    await availability.save();

    // Fetch updated doctor with availabilities for real-time update
    const doctor = await User.findById(req.user.id).select('name specialization averageRating experience workLocation consultationFees profilePhoto hospital bio contactDetails isVerified');
    const availabilities = await Availability.find({ doctor: req.user.id });

    const doctorWithAvailabilities = {
      ...doctor.toObject(),
      availabilities: availabilities.map(avail => ({
        _id: avail._id,
        day: avail.day,
        startTime: avail.startTime,
        endTime: avail.endTime,
      })),
    };

    emitDoctorProfileUpdated(doctorWithAvailabilities);

    res.json({
      message: "Availability slot updated successfully",
      availability,
    });
  } catch (error) {
    console.error("Availability update error:", error);
    res.status(500).json({ message: "Server error updating availability slot" });
  }
};

// =============================
// Delete Availability Slot
// =============================
export const deleteAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== "doctor") {
      return res.status(403).json({ message: "Only doctors can delete availability slots" });
    }

    const availability = await Availability.findById(id);

    if (!availability) {
      return res.status(404).json({ message: "Availability slot not found" });
    }

    if (availability.doctor.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this availability slot" });
    }

    await Availability.findByIdAndDelete(id);

    // Fetch updated doctor with availabilities for real-time update
    const doctor = await User.findById(req.user.id).select('name specialization averageRating experience workLocation consultationFees profilePhoto hospital bio contactDetails isVerified');
    const availabilities = await Availability.find({ doctor: req.user.id });

    const doctorWithAvailabilities = {
      ...doctor.toObject(),
      availabilities: availabilities.map(avail => ({
        _id: avail._id,
        day: avail.day,
        startTime: avail.startTime,
        endTime: avail.endTime,
      })),
    };

    emitDoctorProfileUpdated(doctorWithAvailabilities);

    res.json({
      message: "Availability slot deleted successfully",
    });
  } catch (error) {
    console.error("Availability delete error:", error);
    res.status(500).json({ message: "Server error deleting availability slot" });
  }
};
