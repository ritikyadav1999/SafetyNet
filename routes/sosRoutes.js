const express = require("express");
const router = express.Router();
const { authenticateToken, isAdmin } = require("../middleware/authMiddleware");

const {
  triggerSOS,
  getNearbyHelpers,
  acceptSOS,
  resolveSOS,
  getActiveSOS,
  getAllSOSAlerts
} = require("../controllers/sosController");

// Trigger an SOS
router.post("/trigger", authenticateToken, triggerSOS);

// Get nearby responders
router.get("/nearby", authenticateToken, getNearbyHelpers);

// Accept to help with an SOS
router.post("/accept/:sosId", authenticateToken, acceptSOS);

// Mark SOS as resolved
router.post("/resolve/:sosId", authenticateToken, resolveSOS);

// Get all active SOS alerts (optional use in map or admin)
router.get("/active", authenticateToken, getActiveSOS);

// Admin : Get all SOS alerts. 
router.get("/all", authenticateToken, isAdmin, getAllSOSAlerts);

module.exports = router;
