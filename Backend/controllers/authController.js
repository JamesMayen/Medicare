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
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken({
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      }),
    });
  } catch (error) {
    console.error("Register error:", error);
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
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken({
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      }),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
