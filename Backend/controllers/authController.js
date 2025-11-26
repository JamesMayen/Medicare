import User from "../models/user.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";

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

    email = email.toLowerCase().trim();
    password = password.trim();

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

    // Return user with token
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      ...(user.role === 'doctor' && {
        specialization: user.specialization,
        experience: user.experience,
        contactDetails: user.contactDetails,
        workLocation: user.workLocation,
        consultationFee: user.consultationFee,
        availability: user.availability,
        profilePhoto: user.profilePhoto,
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
      ...(user.role === 'doctor' && {
        specialization: user.specialization,
        experience: user.experience,
        contactDetails: user.contactDetails,
        workLocation: user.workLocation,
        consultationFee: user.consultationFee,
        availability: user.availability,
        profilePhoto: user.profilePhoto,
      }),
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------------
// Update user profile
// ------------------------
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const {
      name,
      specialization,
      experience,
      contactDetails,
      workLocation,
      consultationFee,
      availability,
      profilePhoto
    } = req.body;

    // Update fields
    if (name) user.name = name;
    if (specialization !== undefined) user.specialization = specialization;
    if (experience !== undefined) user.experience = experience;
    if (contactDetails) user.contactDetails = contactDetails;
    if (workLocation !== undefined) user.workLocation = workLocation;
    if (consultationFee !== undefined) user.consultationFee = consultationFee;
    if (availability) user.availability = availability;
    if (profilePhoto !== undefined) user.profilePhoto = profilePhoto;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      ...(updatedUser.role === 'doctor' && {
        specialization: updatedUser.specialization,
        experience: updatedUser.experience,
        contactDetails: updatedUser.contactDetails,
        workLocation: updatedUser.workLocation,
        consultationFee: updatedUser.consultationFee,
        availability: updatedUser.availability,
        profilePhoto: updatedUser.profilePhoto,
      }),
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error" });
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
      ...(user.role === 'doctor' && {
        specialization: user.specialization,
        experience: user.experience,
        contactDetails: user.contactDetails,
        workLocation: user.workLocation,
        consultationFee: user.consultationFee,
        availability: user.availability,
        profilePhoto: user.profilePhoto,
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
