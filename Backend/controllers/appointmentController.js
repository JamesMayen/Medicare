import Appointment from "../models/appointment.js";

// @desc    Get all appointments for a user
// @route   GET /api/appointments
// @access  Private
export const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      $or: [{ patient: req.user._id }, { doctor: req.user._id }],
    })
      .populate("patient", "name email")
      .populate("doctor", "name email")
      .sort({ date: 1, time: 1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Create a new appointment
// @route   POST /api/appointments
// @access  Private
export const createAppointment = async (req, res) => {
  const { doctor, date, time, reason } = req.body;

  try {
    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor,
      date,
      time,
      reason,
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate("patient", "name email")
      .populate("doctor", "name email");

    res.status(201).json(populatedAppointment);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id
// @access  Private
export const updateAppointment = async (req, res) => {
  const { status, notes } = req.body;

  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Check if user is authorized to update
    if (
      appointment.patient.toString() !== req.user._id.toString() &&
      appointment.doctor.toString() !== req.user._id.toString()
    ) {
      return res.status(401).json({ message: "Not authorized" });
    }

    appointment.status = status || appointment.status;
    appointment.notes = notes || appointment.notes;

    const updatedAppointment = await appointment.save();

    const populatedAppointment = await Appointment.findById(updatedAppointment._id)
      .populate("patient", "name email")
      .populate("doctor", "name email");

    res.json(populatedAppointment);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private
export const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Only patient can delete their appointment
    if (appointment.patient.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await appointment.deleteOne();
    res.json({ message: "Appointment removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};