const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const dotenv = require("dotenv");



const router = express.Router();
dotenv.config();

const generateToken = (user) =>
  jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });


// ✅ Manual Registration
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, lat, lng } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Fallback to default location if not provided
    const coordinates = lat && lng ? [parseFloat(lng), parseFloat(lat)] : [77.2090, 28.6139]; // Default: New Delhi

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      hasPassword: true,
      location: {
        type: "Point",
        coordinates,
      },
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        location: user.location,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Manual Login
router.post("/login", async (req, res) => {
  try {
    const { email, password, lat=null, lng=null } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // ✅ If lat/lng is provided, update location
    if (lat && lng) {
      user.location = {
        type: "Point",
        coordinates: [parseFloat(lng), parseFloat(lat)],
      };
      user.lastKnownLocationAt = new Date();
      await user.save();
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isResponder: user.isResponder,
        canSendSOS: user.canSendSOS,
        location: user.location,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// 🟢 Logout (Clears JWT Cookie)
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: true,
    sameSite: 'none'
  });
  res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;

