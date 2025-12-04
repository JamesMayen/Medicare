import express from "express";
const router = express.Router();
import { protect } from "../middleware/authMiddleware.js";
import { getAvailabilities, createAvailability, updateAvailability, deleteAvailability } from "../controllers/doctorController.js";

// Get doctor's availabilities
router.get("/availability", protect, getAvailabilities);

// Create new availability slot
router.post("/availability", protect, express.json(), createAvailability);

// Update specific availability slot
router.put("/availability/:id", protect, updateAvailability);

// Delete specific availability slot
router.delete("/availability/:id", protect, deleteAvailability);

export default router;
