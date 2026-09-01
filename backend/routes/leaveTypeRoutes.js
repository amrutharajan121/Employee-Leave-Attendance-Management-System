const express = require("express");

const {
  createLeaveType,
  getLeaveTypes,
  updateLeaveType,
  toggleLeaveTypeStatus,
} = require("../controllers/leaveTypeController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// Any logged-in user can get leave types
router.get("/", protect, getLeaveTypes);

// Admin only routes
router.post(
  "/",
  protect,
  authorize("admin"),
  createLeaveType
);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  updateLeaveType
);

router.patch(
  "/:id/status",
  protect,
  authorize("admin"),
  toggleLeaveTypeStatus
);

module.exports = router;