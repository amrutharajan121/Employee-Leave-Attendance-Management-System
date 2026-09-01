const express = require("express");

const {
  getDepartmentEmployees,
  getTeamAttendance,
  getPendingLeaveRequests,
  approveLeaveRequest,
  rejectLeaveRequest,
  getTeamLeaveHistory,
} = require("../controllers/managerController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// View employees in manager's department
router.get(
  "/employees",
  protect,
  authorize("manager"),
  getDepartmentEmployees
);

// View team attendance
router.get(
  "/attendance",
  protect,
  authorize("manager"),
  getTeamAttendance
);

// View pending leave requests
router.get(
  "/leaves/pending",
  protect,
  authorize("manager"),
  getPendingLeaveRequests
);

// Approve leave request
router.patch(
  "/leaves/:id/approve",
  protect,
  authorize("manager"),
  approveLeaveRequest
);

// Reject leave request with reason
router.patch(
  "/leaves/:id/reject",
  protect,
  authorize("manager"),
  rejectLeaveRequest
);

// View complete team leave history
router.get(
  "/leaves/history",
  protect,
  authorize("manager"),
  getTeamLeaveHistory
);

module.exports = router;