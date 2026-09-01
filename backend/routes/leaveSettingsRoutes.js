const express = require("express");

const {
  getLeaveSettings,
  updateLeaveSettings,
} = require("../controllers/leaveSettingsController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// Get current leave settings
router.get(
  "/",
  protect,
  authorize("admin"),
  getLeaveSettings
);

// Update leave settings
router.put(
  "/",
  protect,
  authorize("admin"),
  updateLeaveSettings
);

module.exports = router;