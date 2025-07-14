const SOSAlert = require("../models/SOSAlert");
const User = require("../models/User");
const { getIO } = require("../config/socket");

// 1. Trigger an SOS
exports.triggerSOS = async (req, res) => {
  try {
    const { lat, lng, message = "Please help me" } = req.body;

    if (!lat || !lng) {
      return res
        .status(400)
        .json({ error: "Latitude and longitude are required" });
    }

    const user = await User.findById(req.user.id);

    if (!user.canSendSOS) {
      return res.status(400).json({ error: "You can't send SOS right now" });
    }

    const sos = await SOSAlert.create({
      victim: req.user.id,
      location: {
        type: "Point",
        coordinates: [lng, lat],
      },
      message,
    });

    // Update user's last SOS info
    user.lastSOSAt = new Date();
    user.location = {
      type: "Point",
      coordinates: [lng, lat],
    };
    user.lastKnownLocationAt = new Date();
    user.canSendSOS = false;
    await user.save();

    const io = getIO();

    io.emit("new-sos", {
      victimId: req.user.idd,
      sosId: sos._id,
      location: { lat, lng },
      message
    });

    res.status(201).json({ success: true, sos });
  } catch (error) {
    console.error("Error in triggerSOS:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 2. Get nearby helpers (within 1km by default)
exports.getNearbyHelpers = async (req, res) => {
  try {
    const { lat, lng, radius = 5000 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: "Latitude and longitude required" });
    }

    const helpers = await User.find({
      isResponder: true,
      isOnline: true,
      location: {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseInt(radius),
        },
      },
    }).select("name email phone location");

    res.status(200).json({ success: true, count: helpers.length, helpers });
  } catch (error) {
    console.error("Error in getNearbyHelpers:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 3. Accept to help with an SOS
exports.acceptSOS = async (req, res) => {
  try {
    const sosId = req.params.sosId;
    const userId = req.user.id;

    const sos = await SOSAlert.findById(sosId);
    if (!sos || sos.status !== "active") {
      return res
        .status(404)
        .json({ error: "SOS not found or already resolved" });
    }

    if (sos.responders.includes(userId)) {
      return res
        .status(400)
        .json({ error: "You have already accepted this SOS" });
    }

    if (sos.victim.toString() === userId) {
      return res.status(400).json({ error: "You can't accept your own SOS" });
    }

    sos.responders.push(userId);
    await sos.save();

    res.status(200).json({
      success: true,
      message: "You have been added as a responder",
      sos,
    });
  } catch (error) {
    console.error("Error in acceptSOS:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 4. Resolve an SOS
exports.resolveSOS = async (req, res) => {
  try {
    const sosId = req.params.sosId;
    const userId = req.user.id;

    const sos = await SOSAlert.findById(sosId);
    if (!sos) {
      return res.status(404).json({ error: "SOS not found" });
    }

    sos.status = "resolved";
    sos.resolvedBy = userId;
    await sos.save();

    res
      .status(200)
      .json({ success: true, message: "SOS marked as resolved", sos });
  } catch (error) {
    console.error("Error in resolveSOS:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 5. Get all active SOS alerts
exports.getActiveSOS = async (req, res) => {
  try {
    const alerts = await SOSAlert.find({ status: "active" })
      .populate("victim", "name email phone")
      .populate("responders", "name email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: alerts.length, alerts });
  } catch (error) {
    console.error("Error in getActiveSOS:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAllSOSAlerts = async (req, res) => {
  try {
    const sosList = await SOSAlert.find()
      .populate("victim", "name email phone")
      .populate("responders", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: sosList.length,
      sosAlerts: sosList,
    });
  } catch (error) {
    console.error("Admin SOS Fetch Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
