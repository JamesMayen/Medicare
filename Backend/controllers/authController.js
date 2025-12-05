import User from "../models/user.js";
import Availability from "../models/availability.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import { emitDoctorProfileUpdated } from "../utils/socketEmitter.js";

// ------------------------
// Register a new user
// ------------------------
export const registerUser = async (req, res) => {
  try {
    let { name, email, password, role } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide name, email, and password" });
    }

    name = name.trim();
    if (name.length < 2) {
      return res.status(400).json({ message: "Name must be at least 2 characters long" });
    }

    email = email.toLowerCase().trim();
    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    password = password.trim();
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    if (role && !['patient', 'doctor'].includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be 'patient' or 'doctor'" });
    }

    role = role || "patient";

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "patient",
    });
    if (user.role === 'doctor') {
      console.log(`User ${user.name} has created an account as a doctor. Please review them.`);
    }

    // Return user with token
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePhoto: user.profilePhoto,
      createdAt: user.createdAt,
      ...(user.role === 'doctor' && {
        specialization: user.specialization,
        experience: user.experience,
        contactDetails: user.contactDetails,
        workLocation: user.workLocation,
        consultationFees: user.consultationFees,
      }),
      token: generateToken({
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      }),
    };

    res.status(201).json(userResponse);
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------------
// Get user profile
// ------------------------
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      contactDetails: user.contactDetails,
      bio: user.bio,
      profilePhoto: user.profilePhoto,
      createdAt: user.createdAt,
      ...(user.role === 'doctor' && {
        specialization: user.specialization,
        experience: user.experience,
        workLocation: user.workLocation,
        consultationFees: user.consultationFees,
        availability: user.availability,
        hospital: user.hospital,
      }),
      ...(user.role === 'patient' && {
        medicalInfo: user.medicalInfo,
        insurance: user.insurance,
      }),
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------------
// Update user profile  (UPDATED VERSION WITHOUT FEE & AVAILABILITY)
// ------------------------
export const updateProfile = async (req, res) => {
  try {
    console.log("Updating profile for user:", req.user._id);
    console.log("req.body received:", req.body);
    console.log("req.files received:", req.files);
    console.log("req.file received:", req.file);

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Handle both JSON and multipart data
    let bodyData = req.body || {};

    // If req.body is empty but we have files, try to extract text fields from files
    if (!req.body && req.files) {
      bodyData = {};
      req.files.forEach(file => {
        if (file.fieldname !== 'profilePhoto') {
          bodyData[file.fieldname] = file.value || file.buffer?.toString();
        }
      });
    }

    const {
      name,
      email,
      phone,
      gender,
      address,
      specialization,
      experience,
      bio,
      medicalInfo,
      insurance,
      hospital,
      workLocation,
      consultationFees
    } = bodyData;

    console.log("Destructured fields - bio:", bio, "medicalInfo:", medicalInfo, "insurance:", insurance);
    console.log("Destructured fields - workLocation:", workLocation, "hospital:", hospital);

    // =======================
    // Basic Validations
    // =======================
    if (name && name.trim().length < 2) {
      return res.status(400).json({ message: "Name must be at least 2 characters" });
    }

    if (email && !email.includes("@")) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    if (user.role === "doctor") {
      // Doctor-specific validations
      if (bio && bio.trim().length < 10) {
        return res.status(400).json({ message: "Bio must be at least 10 characters long" });
      }

      if (experience !== undefined) {
        const expValue = parseInt(experience, 10);
        if (isNaN(expValue) || expValue < 0 || expValue > 50) {
          return res.status(400).json({
            message: "Experience must be a number between 0 and 50",
          });
        }
        user.experience = expValue;
      }

      if (specialization !== undefined) {
        user.specialization = specialization.trim();
      }

      if (consultationFees !== undefined) {
        const feeValue = parseFloat(consultationFees);
        if (isNaN(feeValue) || feeValue < 0) {
          return res.status(400).json({ message: "Consultation fees must be a positive number" });
        }
        user.consultationFees = feeValue;
      }

      if (workLocation !== undefined) {
        console.log("Updating workLocation to:", workLocation.trim());
        user.workLocation = workLocation.trim();
      }

      // Hospital update
      if (hospital !== undefined) {
        if (hospital.trim() === "") {
          user.hospital = null;
          console.log("Clearing hospital field");
        } else {
          user.hospital = hospital.trim();
          console.log("Setting hospital to:", hospital.trim());
        }
      }
    }

    // Handle bio for all users
    if (bio !== undefined) {
      user.bio = bio.trim();
    }

    // Patient-specific fields
    if (user.role === "patient") {
      if (medicalInfo !== undefined) {
        user.medicalInfo = medicalInfo.trim();
      }
      if (insurance !== undefined) {
        user.insurance = insurance.trim();
      }
    }

    // Profile photo upload for all users
    let profilePhotoFile = req.file;
    if (!profilePhotoFile && req.files) {
      profilePhotoFile = req.files.find(file => file.fieldname === 'profilePhoto');
    }
    if (profilePhotoFile) {
      user.profilePhoto = "/uploads/" + profilePhotoFile.filename;
    }

    // =======================
    // Update general fields (for all roles)
    // =======================
    if (name !== undefined) user.name = name.trim();
    if (email !== undefined) user.email = email.trim().toLowerCase();
    if (phone !== undefined) user.contactDetails.phone = phone.trim();
    if (address !== undefined) user.contactDetails.address = address.trim();
    if (gender !== undefined) user.gender = gender;

    const updatedUser = await user.save();

    console.log("Profile updated successfully. New bio:", updatedUser.bio, "New medicalInfo:", updatedUser.medicalInfo, "New insurance:", updatedUser.insurance);
    console.log("Profile updated successfully. New workLocation:", updatedUser.workLocation, "New hospital:", updatedUser.hospital);

    // Emit real-time update for doctor profiles
    if (updatedUser.role === "doctor") {
      emitDoctorProfileUpdated({
        _id: updatedUser._id,
        name: updatedUser.name,
        specialization: updatedUser.specialization,
        averageRating: updatedUser.averageRating,
        experience: updatedUser.experience,
        workLocation: updatedUser.workLocation,
        consultationFees: updatedUser.consultationFees,
        profilePhoto: updatedUser.profilePhoto,
        hospital: updatedUser.hospital,
        bio: updatedUser.bio,
        contactDetails: updatedUser.contactDetails,
        isVerified: updatedUser.isVerified,
      });
    }

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      contactDetails: updatedUser.contactDetails,
      bio: updatedUser.bio,
      profilePhoto: updatedUser.profilePhoto,
      createdAt: updatedUser.createdAt,
      ...(updatedUser.role === "doctor" && {
        specialization: updatedUser.specialization,
        experience: updatedUser.experience,
        workLocation: updatedUser.workLocation,
        consultationFees: updatedUser.consultationFees,
        hospital: updatedUser.hospital,
      }),
      ...(updatedUser.role === "patient" && {
        medicalInfo: updatedUser.medicalInfo,
        insurance: updatedUser.insurance,
      }),
    });

  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ------------------------
// Login user
// ------------------------
export const loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    email = email.toLowerCase().trim();
    password = password.trim();

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check if account is active
    if (user.status !== 'active') {
      return res.status(403).json({ message: "Account is suspended or pending verification" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Return user with token
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePhoto: user.profilePhoto,
      createdAt: user.createdAt,
      ...(user.role === 'doctor' && {
        specialization: user.specialization,
        experience: user.experience,
        contactDetails: user.contactDetails,
        workLocation: user.workLocation,
        consultationFees: user.consultationFees,
      }),
      token: generateToken({
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      }),
    };

    res.json(userResponse);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------------
// Get all doctors
// ------------------------
export const getDoctors = async (req, res) => {
  try {
    // Fetch all doctors
    const doctors = await User.find({ role: 'doctor' })
      .select('name specialization averageRating experience workLocation consultationFees profilePhoto hospital bio contactDetails isVerified');

    // Fetch all availabilities
    const availabilities = await Availability.find({});

    // Group availabilities by doctor
    const availabilitiesMap = {};
    availabilities.forEach(avail => {
      const doctorId = avail.doctor.toString();
      if (!availabilitiesMap[doctorId]) {
        availabilitiesMap[doctorId] = [];
      }
      availabilitiesMap[doctorId].push({
        _id: avail._id,
        day: avail.day,
        startTime: avail.startTime,
        endTime: avail.endTime,
      });
    });

    // Add availabilities to each doctor
    const doctorsWithAvailabilities = doctors.map(doctor => ({
      ...doctor.toObject(),
      availabilities: availabilitiesMap[doctor._id.toString()] || [],
    }));

    res.json(doctorsWithAvailabilities);
  } catch (error) {
    console.error("Get doctors error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
