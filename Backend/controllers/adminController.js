import User from "../models/user.js";
import Appointment from "../models/appointment.js";
import AuditLog from "../models/auditLog.js";
import SystemSettings from "../models/systemSettings.js";
import Hospital from "../models/hospital.js";

// Helper function to log admin actions
const logAdminAction = async (action, user, admin, details, req) => {
  try {
    await AuditLog.create({
      action,
      user,
      admin,
      details,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
    });
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
};

// ------------------------
// User Management
// ------------------------

// Get all users with pagination and filtering
export const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const role = req.query.role;
    const status = req.query.status;
    const search = req.query.search;

    let query = {};

    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalUsers: total,
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user details
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { role, status, isVerified, hospital } = req.body;

    if (role) user.role = role;
    if (status) user.status = status;
    if (isVerified !== undefined) user.isVerified = isVerified;
    if (hospital !== undefined) {
      if (hospital.trim() === "") {
        user.hospital = null;
      } else {
        user.hospital = hospital.trim();
      }
    }

    const updatedUser = await user.save();

    // Log admin action
    await logAdminAction('USER_UPDATED', user._id, req.user._id, { changes: req.body }, req);

    res.json(updatedUser);
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Deactivate user
export const deactivateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.status = 'suspended';
    await user.save();

    // Log admin action
    await logAdminAction('USER_DEACTIVATED', user._id, req.user._id, {}, req);

    res.json({ message: "User deactivated successfully" });
  } catch (error) {
    console.error("Deactivate user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Force password reset
export const resetUserPassword = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate temporary password or send reset email
    // For now, just log the action
    await logAdminAction('PASSWORD_RESET_FORCED', user._id, req.user._id, {}, req);

    res.json({ message: "Password reset initiated" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------------
// Doctor Management
// ------------------------

// Get doctors
export const getDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(doctors);
  } catch (error) {
    console.error("Get doctors error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Verify doctor
export const verifyDoctor = async (req, res) => {
  try {
    const doctor = await User.findById(req.params.id);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: "Doctor not found" });
    }

    doctor.isVerified = true;
    await doctor.save();

    // Log admin action
    await logAdminAction('DOCTOR_VERIFIED', doctor._id, req.user._id, {}, req);

    res.json({ message: "Doctor verified successfully" });
  } catch (error) {
    console.error("Verify doctor error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Suspend doctor
export const suspendDoctor = async (req, res) => {
  try {
    const doctor = await User.findById(req.params.id);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: "Doctor not found" });
    }

    doctor.status = 'suspended';
    await doctor.save();

    // Log admin action
    await logAdminAction('DOCTOR_SUSPENDED', doctor._id, req.user._id, {}, req);

    res.json({ message: "Doctor suspended successfully" });
  } catch (error) {
    console.error("Suspend doctor error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get doctor's appointments
export const getDoctorAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctor: req.params.id })
      .populate('patient', 'name email')
      .populate('doctor', 'name email')
      .sort({ date: -1, time: -1 });

    res.json(appointments);
  } catch (error) {
    console.error("Get doctor appointments error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------------
// Appointment Management
// ------------------------

// Get all appointments
export const getAppointments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const date = req.query.date;

    let query = {};
    if (status) query.status = status;
    if (date) query.date = date;

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email')
      .populate('doctor', 'name email specialization')
      .sort({ date: -1, time: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Appointment.countDocuments(query);

    res.json({
      appointments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalAppointments: total,
    });
  } catch (error) {
    console.error("Get appointments error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update appointment status
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.status = status;
    await appointment.save();

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'name email')
      .populate('doctor', 'name email');

    // Log admin action
    await logAdminAction('APPOINTMENT_STATUS_UPDATED', null, req.user._id, { appointmentId: appointment._id, status }, req);

    res.json(populatedAppointment);
  } catch (error) {
    console.error("Update appointment status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Cancel appointment
export const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    // Log admin action
    await logAdminAction('APPOINTMENT_CANCELLED', null, req.user._id, { appointmentId: appointment._id }, req);

    res.json({ message: "Appointment cancelled successfully" });
  } catch (error) {
    console.error("Cancel appointment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get appointment statistics
export const getAppointmentStats = async (req, res) => {
  try {
    const stats = await Appointment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalAppointments = await Appointment.countDocuments();
    const todayAppointments = await Appointment.countDocuments({
      date: new Date().toISOString().split('T')[0]
    });

    res.json({
      total: totalAppointments,
      today: todayAppointments,
      byStatus: stats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {})
    });
  } catch (error) {
    console.error("Get appointment stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------------
// System Settings
// ------------------------

// Get system settings
export const getSystemSettings = async (req, res) => {
  try {
    const settings = await SystemSettings.find({});
    res.json(settings);
  } catch (error) {
    console.error("Get system settings error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update system settings
export const updateSystemSettings = async (req, res) => {
  try {
    const { key, value, description, category } = req.body;

    const setting = await SystemSettings.findOneAndUpdate(
      { key },
      { value, description, category, updatedBy: req.user._id },
      { upsert: true, new: true }
    );

    // Log admin action
    await logAdminAction('SYSTEM_SETTINGS_UPDATED', null, req.user._id, { key, value }, req);

    res.json(setting);
  } catch (error) {
    console.error("Update system settings error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create system backup
export const createSystemBackup = async (req, res) => {
  try {
    // This would implement actual backup logic
    // For now, just log the action
    await logAdminAction('SYSTEM_BACKUP_CREATED', null, req.user._id, {}, req);

    res.json({ message: "System backup initiated" });
  } catch (error) {
    console.error("Create system backup error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------------
// Reports
// ------------------------

// User registration/activity reports
export const getUserReports = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let matchQuery = {};
    if (startDate && endDate) {
      matchQuery.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const reports = await User.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 },
          roles: { $push: '$role' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } }
    ]);

    res.json(reports);
  } catch (error) {
    console.error("Get user reports error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Appointment reports
export const getAppointmentReports = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let matchQuery = {};
    if (startDate && endDate) {
      matchQuery.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const reports = await Appointment.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } }
    ]);

    res.json(reports);
  } catch (error) {
    console.error("Get appointment reports error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Revenue reports
export const getRevenueReports = async (req, res) => {
  try {
    // This would calculate revenue based on completed appointments and doctor fees
    // For now, return placeholder
    res.json({ message: "Revenue reports not implemented yet" });
  } catch (error) {
    console.error("Get revenue reports error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Export reports
export const exportReports = async (req, res) => {
  try {
    const { type } = req.query;
    // This would implement CSV/PDF export
    // For now, return placeholder
    res.json({ message: "Report export not implemented yet" });
  } catch (error) {
    console.error("Export reports error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------------
// Audit Logs
// ------------------------

// Get audit logs
export const getAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const action = req.query.action;
    const admin = req.query.admin;

    let query = {};
    if (action) query.action = action;
    if (admin) query.admin = admin;

    const logs = await AuditLog.find(query)
      .populate('user', 'name email')
      .populate('admin', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await AuditLog.countDocuments(query);

    res.json({
      logs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalLogs: total,
    });
  } catch (error) {
    console.error("Get audit logs error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get audit log by ID
export const getAuditLogById = async (req, res) => {
  try {
    const log = await AuditLog.findById(req.params.id)
      .populate('user', 'name email')
      .populate('admin', 'name email');

    if (!log) {
      return res.status(404).json({ message: "Audit log not found" });
    }

    res.json(log);
  } catch (error) {
    console.error("Get audit log by ID error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Search audit logs
export const searchAuditLogs = async (req, res) => {
  try {
    const { query } = req.body;

    const logs = await AuditLog.find({
      $or: [
        { action: { $regex: query, $options: 'i' } },
        { details: { $regex: query, $options: 'i' } }
      ]
    })
      .populate('user', 'name email')
      .populate('admin', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(logs);
  } catch (error) {
    console.error("Search audit logs error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------------
// Hospital Management
// ------------------------

// Get all hospitals
export const getHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find({}).sort({ name: 1 });
    res.json(hospitals);
  } catch (error) {
    console.error("Get hospitals error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create hospital
export const createHospital = async (req, res) => {
  try {
    const { name, address, departments, contactInfo } = req.body;

    const hospital = await Hospital.create({
      name,
      address,
      departments,
      contactInfo,
    });

    // Log admin action
    await logAdminAction('HOSPITAL_CREATED', null, req.user._id, { hospitalId: hospital._id }, req);

    res.status(201).json(hospital);
  } catch (error) {
    console.error("Create hospital error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update hospital
export const updateHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    const { name, address, departments, contactInfo, isActive } = req.body;

    hospital.name = name || hospital.name;
    hospital.address = address || hospital.address;
    hospital.departments = departments || hospital.departments;
    hospital.contactInfo = contactInfo || hospital.contactInfo;
    hospital.isActive = isActive !== undefined ? isActive : hospital.isActive;

    await hospital.save();

    // Log admin action
    await logAdminAction('HOSPITAL_UPDATED', null, req.user._id, { hospitalId: hospital._id }, req);

    res.json(hospital);
  } catch (error) {
    console.error("Update hospital error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete hospital
export const deleteHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    await hospital.deleteOne();

    // Log admin action
    await logAdminAction('HOSPITAL_DELETED', null, req.user._id, { hospitalId: req.params.id }, req);

    res.json({ message: "Hospital deleted successfully" });
  } catch (error) {
    console.error("Delete hospital error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------------
// Overview/Stats
// ------------------------

// Get system statistics
export const getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const doctors = await User.countDocuments({ role: 'doctor' });
    const patients = await User.countDocuments({ role: 'patient' });
    const admins = await User.countDocuments({ role: 'admin' });

    const totalAppointments = await Appointment.countDocuments();
    const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });

    const recentActivities = await AuditLog.find({})
      .populate('admin', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        byRole: { doctors, patients, admins }
      },
      appointments: {
        total: totalAppointments,
        pending: pendingAppointments,
        completed: completedAppointments
      },
      recentActivities
    });
  } catch (error) {
    console.error("Get system stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};