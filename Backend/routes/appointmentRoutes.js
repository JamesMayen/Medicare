import express from "express";
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from "../controllers/appointmentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getAppointments).post(protect, createAppointment);
router
  .route("/:id")
  .put(protect, updateAppointment)
  .delete(protect, deleteAppointment);

export default router;