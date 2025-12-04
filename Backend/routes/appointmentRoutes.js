import express from "express";
import multer from "multer";
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAvailableSlots,
} from "../controllers/appointmentController.js";
import { protect } from "../middleware/authMiddleware.js";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, JPG, and PNG files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const router = express.Router();

router.route("/").get(protect, getAppointments).post(protect, upload.array('documents'), createAppointment);
router
  .route("/:id")
  .put(protect, updateAppointment)
  .delete(protect, deleteAppointment);

router.get('/available-slots/:doctorId/:date', protect, getAvailableSlots);

export default router;