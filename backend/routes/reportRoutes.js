const express = require("express");

const {
  getMonthlyAttendanceSummary,
  getLeaveUtilizationReport,
  getDepartmentEmployeeStatistics,
  getLeaveStatusSummary,
} = require("../controllers/reportController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// ==================== MONTHLY ATTENDANCE REPORT ====================

router.get(
  "/attendance/monthly",
  protect,
  authorize("admin"),
  getMonthlyAttendanceSummary
);

// ==================== LEAVE UTILIZATION REPORT ====================

router.get(
  "/leaves/utilization",
  protect,
  authorize("admin"),
  getLeaveUtilizationReport
);

// ==================== DEPARTMENT EMPLOYEE STATISTICS ====================

router.get(
  "/departments",
  protect,
  authorize("admin"),
  getDepartmentEmployeeStatistics
);

// ==================== LEAVE STATUS SUMMARY ====================

router.get(
  "/leaves/status",
  protect,
  authorize("admin"),
  getLeaveStatusSummary
);

module.exports = router;