import Rating from "../models/rating.js";
import User from "../models/user.js";
import Appointment from "../models/appointment.js";

// @desc    Create a rating for a doctor
// @route   POST /api/ratings
// @access  Private (patients only)
export const createRating = async (req, res) => {
  const { doctor, rating, review } = req.body;

  // Validate input
  if (!doctor || !rating) {
    return res.status(400).json({ message: "Doctor and rating are required" });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  }

  try {
    // Check if user is a patient
    if (req.user.role !== 'patient') {
      return res.status(403).json({ message: "Only patients can rate doctors" });
    }

    // Check if doctor exists and is a doctor
    const doctorUser = await User.findById(doctor);
    if (!doctorUser || doctorUser.role !== 'doctor') {
      return res.status(400).json({ message: "Invalid doctor" });
    }

    // Check if patient has had a completed appointment with this doctor
    const completedAppointment = await Appointment.findOne({
      patient: req.user._id,
      doctor,
      status: 'completed'
    });

    if (!completedAppointment) {
      return res.status(400).json({ message: "You can only rate doctors after a completed appointment" });
    }

    // Check if patient has already rated this doctor
    const existingRating = await Rating.findOne({
      patient: req.user._id,
      doctor
    });

    if (existingRating) {
      return res.status(400).json({ message: "You have already rated this doctor" });
    }

    // Create rating
    const newRating = await Rating.create({
      patient: req.user._id,
      doctor,
      rating,
      review: review ? review.trim() : undefined
    });

    // Calculate new average rating for the doctor
    const allRatings = await Rating.find({ doctor });
    const averageRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;

    // Update doctor's averageRating
    await User.findByIdAndUpdate(doctor, { averageRating });

    const populatedRating = await Rating.findById(newRating._id)
      .populate("patient", "name")
      .populate("doctor", "name");

    res.status(201).json(populatedRating);
  } catch (error) {
    console.error("Create rating error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get ratings for a doctor
// @route   GET /api/ratings/:doctorId
// @access  Private
export const getDoctorRatings = async (req, res) => {
  const { doctorId } = req.params;

  try {
    // Check if doctor exists
    const doctorUser = await User.findById(doctorId);
    if (!doctorUser || doctorUser.role !== 'doctor') {
      return res.status(400).json({ message: "Invalid doctor" });
    }

    const ratings = await Rating.find({ doctor: doctorId })
      .populate("patient", "name")
      .sort({ createdAt: -1 });

    res.json(ratings);
  } catch (error) {
    console.error("Get doctor ratings error:", error);
    res.status(500).json({ message: "Server error" });
  }
};