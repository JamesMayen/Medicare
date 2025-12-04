import express from "express";
const router = express.Router();
import { protect } from "../middleware/authMiddleware.js";
import { updateConsultationFee } from "../controllers/doctorController.js";

// Update consultation fee (ONLY doctors)
router.put("/consultation-fee", protect, updateConsultationFee);

export default router;
