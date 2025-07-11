const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { authenticateToken } = require("../middleware/authMiddleware");

// @desc   Get current user's profile
// @route  GET /api/users/profile
// @access Private
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc   Update current user's profile
// @route  PUT /api/users/profile
// @access Private
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const { name, phone } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name || user.name;
    user.phone = phone || user.phone;

    await user.save();
    res.json({ message: "Profile updated successfully", user });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// OPTIONAL (for admin dashboards)
// @desc   Get all users (admin only)
// @route  GET /api/users
// @access Private/Admin
router.get("/", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user's current location
router.put("/location", authenticateToken, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    if (!latitude || !longitude)
      return res
        .status(400)
        .json({ message: "Longitude and latitude are required" });

    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.location = { latitude, longitude };
    await user.save();

    res.json({ message: "Location updated successfully" });
  } catch (err) {
    console.error("Error updating location:", err);
    res.status(500).json({ message: "Server error" });
  }
});


router.post("/toggleResponder", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.isResponder = !user.isResponder;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Responder mode ${user.isResponder ? "ENABLED" : "DISABLED"}`,
      isResponder: user.isResponder,
    });
  } catch (error) {
    console.error("Toggle Responder Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/updateLocation", authenticateToken, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    if (!latitude || !longitude)
      return res
        .status(400)  
        .json({ message: "Latitude and longitude are required" });

    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.location = { latitude, longitude };  
    await user.save();

    res.json({ message: "Location updated successfully" });
  } catch (err) {
    console.error("Error updating location:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
