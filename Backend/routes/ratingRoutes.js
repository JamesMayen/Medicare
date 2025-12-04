import express from "express";
import { createRating, getDoctorRatings } from "../controllers/ratingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createRating);
router.get("/:doctorId", protect, getDoctorRatings);

export default router;