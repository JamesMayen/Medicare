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
  console.log('DEBUG: createAvailability called with body:', req.body, 'for doctor:', req.user?.id);
  console.log('DEBUG: req.user exists:', !!req.user);
  console.log('DEBUG: req.user.id type:', typeof req.user?.id, 'value:', req.user?.id);
  console.log('DEBUG: req.body types - day:', typeof req.body.day, 'startTime:', typeof req.body.startTime, 'endTime:', typeof req.body.endTime);
  console.log('DEBUG: req.user object:', req.user);
  try {
    const { day, startTime, endTime } = req.body;

    if (req.user.role !== "doctor") {
      console.log('DEBUG: User role is not doctor:', req.user.role);
      return res.status(403).json({ message: "Only doctors can create availability slots" });
    }

    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (!day || !startTime || !endTime) {
      console.log('DEBUG: Missing fields - day:', day, 'startTime:', startTime, 'endTime:', endTime);
      return res.status(400).json({
        message: "Day, startTime and endTime are required",
      });
    }

    console.log('DEBUG: Creating new Availability with doctor:', req.user.id, 'day:', day, 'startTime:', startTime, 'endTime:', endTime);
    const newAvailability = new Availability({
      doctor: req.user.id,
      day,
      startTime,
      endTime,
    });

    console.log('DEBUG: newAvailability object before save:', newAvailability);
    console.log('DEBUG: About to save availability');
    let savedAvailability;
    try {
      savedAvailability = await newAvailability.save();
      console.log('DEBUG: Availability saved successfully:', savedAvailability._id);
    } catch (saveError) {
      console.error('Detailed save error:', saveError);
      console.error('Save error name:', saveError.name);
      console.error('Save error code:', saveError.code);
      if (saveError.errors) {
        console.error('Validation errors:', saveError.errors);
      }
      return res.status(500).json({ message: "Failed to save availability slot", error: saveError.message });
    }

    console.log('DEBUG: Proceeding to post-save operations');

    // Update consultation fee if provided
    if (req.body.consultationFee !== undefined) {
      console.log('DEBUG: Updating consultationFee to:', req.body.consultationFee);
      try {
        await User.findByIdAndUpdate(req.user.id, { consultationFees: req.body.consultationFee });
        console.log('DEBUG: ConsultationFee updated successfully');
      } catch (updateError) {
        console.error('DEBUG: ConsultationFee update error:', updateError);
        throw updateError;
      }
    }

    console.log('DEBUG: Fetching doctor for emit');
    const doctor = await User.findById(req.user.id).select('name specialization averageRating experience workLocation consultationFees profilePhoto hospital bio contactDetails isVerified');
    console.log('DEBUG: Doctor fetched:', doctor ? doctor._id : 'null');

    console.log('DEBUG: Fetching availabilities');
    const availabilities = await Availability.find({ doctor: req.user.id });
    console.log('DEBUG: Availabilities fetched:', availabilities.length);

    console.log('DEBUG: Creating doctorWithAvailabilities');
    const doctorWithAvailabilities = {
      ...doctor.toObject(),
      availabilities: availabilities.map(avail => ({
        _id: avail._id,
        day: avail.day,
        startTime: avail.startTime,
        endTime: avail.endTime,
      })),
    };

    console.log('DEBUG: Emitting update');
    emitDoctorProfileUpdated(doctorWithAvailabilities);

    res.status(201).json({
      message: "Availability slot created successfully",
      availability: savedAvailability,
    });
  } catch (error) {
    console.error("Availability creation error:", error);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
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

    availability.day = day || availability.day;
    availability.startTime = startTime || availability.startTime;
    availability.endTime = endTime || availability.endTime;

    await availability.save();

    // Update consultation fee if provided
    if (req.body.consultationFee !== undefined) {
      await User.findByIdAndUpdate(req.user.id, { consultationFees: req.body.consultationFee });
    }

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
