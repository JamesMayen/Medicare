import Appointment from "../models/appointment.js";
import { io } from "../server.js";

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
  const { doctor, date, time, reason, type, fee } = req.body;
  const documents = req.files ? req.files.map(file => file.path) : [];

  // Validate input
  if (!doctor || !date || !time || !reason || !type) {
    return res.status(400).json({ message: "All required fields are required" });
  }

  if (reason.trim().length < 10) {
    return res.status(400).json({ message: "Reason must be at least 10 characters" });
  }

  // Validate date is in future
  const appointmentDate = new Date(`${date}T${time}`);
  if (appointmentDate <= new Date()) {
    return res.status(400).json({ message: "Appointment must be in the future" });
  }

  try {
    // Check if doctor exists and is a doctor
    const User = (await import("../models/user.js")).default;
    const doctorUser = await User.findById(doctor);
    if (!doctorUser || doctorUser.role !== 'doctor') {
      return res.status(400).json({ message: "Invalid doctor" });
    }

    // Check if slot is within doctor's availability
    const dateObj = new Date(date);
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = daysOfWeek[dateObj.getDay()];

    const Availability = (await import("../models/availability.js")).default;
    const doctorAvailability = await Availability.findOne({
      doctor,
      day: dayOfWeek
    });

    if (!doctorAvailability) {
      return res.status(400).json({ message: "Doctor is not available on this day" });
    }

    // Check if requested time is within availability
    const requestedMinutes = parseInt(time.split(':')[0]) * 60 + parseInt(time.split(':')[1]);
    const availStartMinutes = parseInt(doctorAvailability.startTime.split(':')[0]) * 60 + parseInt(doctorAvailability.startTime.split(':')[1]);
    const availEndMinutes = parseInt(doctorAvailability.endTime.split(':')[0]) * 60 + parseInt(doctorAvailability.endTime.split(':')[1]);

    if (requestedMinutes < availStartMinutes || requestedMinutes >= availEndMinutes) {
      return res.status(400).json({ message: "Requested time is outside doctor's availability" });
    }

    // Check if slot is already booked
    const existingAppointment = await Appointment.findOne({
      doctor,
      date,
      time,
      status: 'confirmed'
    });
    if (existingAppointment) {
      return res.status(400).json({ message: "Doctor is not available at this time" });
    }

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor,
      date,
      time,
      reason: reason.trim(),
      type,
      documents,
      fee,
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate("patient", "name email")
      .populate("doctor", "name email");

    // Emit real-time appointment creation to both patient and doctor
    io.to(`user_${populatedAppointment.patient._id}`).emit("appointment_created", populatedAppointment);
    io.to(`user_${populatedAppointment.doctor._id}`).emit("appointment_created", populatedAppointment);

    // Emit dashboard update
    io.to(`user_${populatedAppointment.patient._id}`).emit("dashboard_update");
    io.to(`user_${populatedAppointment.doctor._id}`).emit("dashboard_update");

    res.status(201).json(populatedAppointment);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get available slots for a doctor on a specific date
// @route   GET /api/appointments/available/:doctorId/:date
// @access  Private
export const getAvailableSlots = async (req, res) => {
  const { doctorId, date } = req.params;

  try {
    // Validate doctor exists
    const User = (await import("../models/user.js")).default;
    const doctorUser = await User.findById(doctorId);
    if (!doctorUser || doctorUser.role !== 'doctor') {
      return res.status(400).json({ message: "Invalid doctor" });
    }

    // Get day of week from date
    const dateObj = new Date(date);
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = daysOfWeek[dateObj.getDay()];

    // Get doctor's availability for this day
    const Availability = (await import("../models/availability.js")).default;
    const availabilities = await Availability.find({
      doctor: doctorId,
      day: dayOfWeek
    });

    if (availabilities.length === 0) {
      return res.json({ availableSlots: [] }); // No availability for this day
    }

    // Generate slots from availabilities (1-hour intervals)
    const slots = [];
    availabilities.forEach(avail => {
      const startHour = parseInt(avail.startTime.split(':')[0]);
      const startMin = parseInt(avail.startTime.split(':')[1]) || 0;
      const endHour = parseInt(avail.endTime.split(':')[0]);
      const endMin = parseInt(avail.endTime.split(':')[1]) || 0;

      for (let h = startHour; h < endHour; h++) {
        slots.push(`${h.toString().padStart(2, '0')}:00`);
      }
      // If end time has minutes, might need adjustment, but for now assume :00
    });

    // Remove duplicates
    const uniqueSlots = [...new Set(slots)];

    // Get booked confirmed appointments
    const bookedAppointments = await Appointment.find({
      doctor: doctorId,
      date,
      status: 'confirmed'
    }, 'time');

    const bookedTimes = bookedAppointments.map(a => a.time);

    // Available slots
    const availableSlots = uniqueSlots.filter(slot => !bookedTimes.includes(slot));

    res.json({ availableSlots });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id
// @access  Private
export const updateAppointment = async (req, res) => {
  const { status, notes, date, time } = req.body;

  // Validate status
  const validStatuses = ["pending", "confirmed", "completed", "cancelled", "rejected"];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  // Validate notes
  if (notes && notes.length > 500) {
    return res.status(400).json({ message: "Notes too long (max 500 characters)" });
  }

  // Validate date/time if provided
  if (date && time) {
    const appointmentDate = new Date(`${date}T${time}`);
    if (appointmentDate <= new Date()) {
      return res.status(400).json({ message: "Appointment must be in the future" });
    }
  }

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

    // Only doctors can confirm appointments
    if (status === 'confirmed' && req.user.role !== 'doctor') {
      return res.status(401).json({ message: "Only doctors can confirm appointments" });
    }

    // Only patients can request cancellation
    if (status === 'cancelled' && req.user._id.toString() !== appointment.patient.toString()) {
      return res.status(401).json({ message: "Only patients can request cancellation" });
    }

    // Handle rescheduling: only patients can request, sets status to pending
    if ((date && date !== appointment.date.toISOString().split('T')[0]) || (time && time !== appointment.time)) {
      if (req.user._id.toString() !== appointment.patient.toString()) {
        return res.status(401).json({ message: "Only patients can request rescheduling" });
      }
      // Check if new slot is within doctor's availability
      const newDate = date || appointment.date;
      const newTime = time || appointment.time;
      const dateObj = new Date(newDate);
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayOfWeek = daysOfWeek[dateObj.getDay()];

      const Availability = (await import("../models/availability.js")).default;
      const doctorAvailability = await Availability.findOne({
        doctor: appointment.doctor,
        day: dayOfWeek
      });

      if (!doctorAvailability) {
        return res.status(400).json({ message: "Doctor is not available on the requested day" });
      }

      const requestedMinutes = parseInt(newTime.split(':')[0]) * 60 + parseInt(newTime.split(':')[1]);
      const availStartMinutes = parseInt(doctorAvailability.startTime.split(':')[0]) * 60 + parseInt(doctorAvailability.startTime.split(':')[1]);
      const availEndMinutes = parseInt(doctorAvailability.endTime.split(':')[0]) * 60 + parseInt(doctorAvailability.endTime.split(':')[1]);

      if (requestedMinutes < availStartMinutes || requestedMinutes >= availEndMinutes) {
        return res.status(400).json({ message: "Requested time is outside doctor's availability" });
      }

      // Check if new slot is already booked
      const existingAppointment = await Appointment.findOne({
        doctor: appointment.doctor,
        date: newDate,
        time: newTime,
        status: 'confirmed'
      });
      if (existingAppointment) {
        return res.status(400).json({ message: "New time slot is not available" });
      }
      appointment.status = 'pending';
    } else {
      appointment.status = status || appointment.status;
    }

    appointment.notes = notes ? notes.trim() : appointment.notes;
    appointment.date = date || appointment.date;
    appointment.time = time || appointment.time;

    // Check availability if confirming appointment
    if (appointment.status === 'confirmed') {
      // Check if slot is within doctor's availability
      const dateObj = new Date(appointment.date);
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayOfWeek = daysOfWeek[dateObj.getDay()];

      const Availability = (await import("../models/availability.js")).default;
      const doctorAvailability = await Availability.findOne({
        doctor: appointment.doctor,
        day: dayOfWeek
      });

      if (!doctorAvailability) {
        return res.status(400).json({ message: "Doctor is not available on this day" });
      }

      const requestedMinutes = parseInt(appointment.time.split(':')[0]) * 60 + parseInt(appointment.time.split(':')[1]);
      const availStartMinutes = parseInt(doctorAvailability.startTime.split(':')[0]) * 60 + parseInt(doctorAvailability.startTime.split(':')[1]);
      const availEndMinutes = parseInt(doctorAvailability.endTime.split(':')[0]) * 60 + parseInt(doctorAvailability.endTime.split(':')[1]);

      if (requestedMinutes < availStartMinutes || requestedMinutes >= availEndMinutes) {
        return res.status(400).json({ message: "Appointment time is outside doctor's availability" });
      }

      // Check if slot is already booked
      const existingAppointment = await Appointment.findOne({
        doctor: appointment.doctor,
        date: appointment.date,
        time: appointment.time,
        status: 'confirmed',
        _id: { $ne: appointment._id }
      });
      if (existingAppointment) {
        return res.status(400).json({ message: "Doctor is not available at this time" });
      }
    }

    const updatedAppointment = await appointment.save();

    const populatedAppointment = await Appointment.findById(updatedAppointment._id)
      .populate("patient", "name email")
      .populate("doctor", "name email");

    // Emit real-time appointment update to both patient and doctor
    io.to(`user_${populatedAppointment.patient._id}`).emit("appointment_updated", populatedAppointment);
    io.to(`user_${populatedAppointment.doctor._id}`).emit("appointment_updated", populatedAppointment);

    // Also emit dashboard update
    io.to(`user_${populatedAppointment.patient._id}`).emit("dashboard_update");
    io.to(`user_${populatedAppointment.doctor._id}`).emit("dashboard_update");

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