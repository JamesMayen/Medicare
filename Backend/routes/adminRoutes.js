import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import {
  // User Management
  getUsers,
  getUserById,
  updateUser,
  deactivateUser,
  resetUserPassword,

  // Doctor Management
  getDoctors,
  verifyDoctor,
  suspendDoctor,
  getDoctorAppointments,

  // Appointment Management
  getAppointments,
  updateAppointmentStatus,
  cancelAppointment,
  getAppointmentStats,

  // System Settings
  getSystemSettings,
  updateSystemSettings,
  createSystemBackup,

  // Reports
  getUserReports,
  getAppointmentReports,
  getRevenueReports,
  exportReports,

  // Audit Logs
  getAuditLogs,
  getAuditLogById,
  searchAuditLogs,

  // Hospital Management
  getHospitals,
  createHospital,
  updateHospital,
  deleteHospital,

  // Overview/Stats
  getSystemStats,
} from "../controllers/adminController.js";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(adminOnly);

// ------------------------
// Overview/Dashboard
// ------------------------
router.get("/stats", getSystemStats);

// ------------------------
// User Management Routes
// ------------------------
router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deactivateUser);
router.post("/users/:id/reset-password", resetUserPassword);

// ------------------------
// Doctor Management Routes
// ------------------------
router.get("/doctors", getDoctors);
router.put("/doctors/:id/verify", verifyDoctor);
router.put("/doctors/:id/suspend", suspendDoctor);
router.get("/doctors/:id/appointments", getDoctorAppointments);

// ------------------------
// Appointment Management Routes
// ------------------------
router.get("/appointments", getAppointments);
router.put("/appointments/:id/status", updateAppointmentStatus);
router.delete("/appointments/:id", cancelAppointment);
router.get("/appointments/stats", getAppointmentStats);

// ------------------------
// Hospital Management Routes
// ------------------------
router.get("/hospitals", getHospitals);
router.post("/hospitals", createHospital);
router.put("/hospitals/:id", updateHospital);
router.delete("/hospitals/:id", deleteHospital);

// ------------------------
// System Settings Routes
// ------------------------
router.get("/settings", getSystemSettings);
router.put("/settings", updateSystemSettings);
router.post("/settings/backup", createSystemBackup);

// ------------------------
// Reports Routes
// ------------------------
router.get("/reports/users", getUserReports);
router.get("/reports/appointments", getAppointmentReports);
router.get("/reports/revenue", getRevenueReports);
router.get("/reports/export", exportReports);

// ------------------------
// Audit Logs Routes
// ------------------------
router.get("/audit-logs", getAuditLogs);
router.get("/audit-logs/:id", getAuditLogById);
router.post("/audit-logs/search", searchAuditLogs);

export default router;