import express from "express";
import asyncHandler from "express-async-handler";
import multer from "multer";
import path from "path";
import fs from "fs";
import { 
  registerUser, 
  loginUser, 
  getProfile, 
  updateProfile, 
  getDoctors 
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Ensure uploads folder exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// ---------------------------------------------
// Multer storage configuration
// ---------------------------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// ---------------------------------------------
// File filter for images only
// ---------------------------------------------
const fileFilter = (req, file, cb) => {
  if (!file) {
    return cb(null, false);
  }
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// ---------------------------------------------
// Wrapper to catch multer errors
// ---------------------------------------------
const uploadProfilePhoto = (req, res, next) => {
  upload.single('profilePhoto')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            message: "File too large. Maximum size is 5MB.",
          });
        }
        return res
          .status(400)
          .json({ message: `Upload error: ${err.message}` });
      }

      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

// ---------------------------------------------
// Routes
// ---------------------------------------------
router.post("/register", express.json(), asyncHandler(registerUser));
router.post("/login", express.json(), asyncHandler(loginUser));

router.get("/profile", protect, asyncHandler(getProfile));

router.put(
  "/profile",
  protect,
  uploadProfilePhoto, // handles multipart data
  asyncHandler(updateProfile)
);

router.get("/doctors", asyncHandler(getDoctors));

export default router;
