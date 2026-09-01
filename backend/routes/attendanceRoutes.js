const express = require("express");

const {
  checkIn,
  checkOut,
  getMyAttendance,
  getTodayAttendance,
} = require("../controllers/attendanceController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// Check in - Employee only
router.post(
  "/check-in",
  protect,
  authorize("employee"),
  checkIn
);

// Check out - Employee only
router.put(
  "/check-out",
  protect,
  authorize("employee"),
  checkOut
);

// Get today's attendance - Employee only
router.get(
  "/today",
  protect,
  authorize("employee"),
  getTodayAttendance
);

// Get attendance history - Employee only
router.get(
  "/my",
  protect,
  authorize("employee"),
  getMyAttendance
);

module.exports = router;