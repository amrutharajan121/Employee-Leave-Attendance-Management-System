const express = require("express");

const {
  getAttendanceStatistics,
  getLeaveStatistics,
  getDashboardSummary,
  getMonthlyAttendanceReport,
  getLeaveUtilizationReport,
  getDepartmentEmployeeReport,
  getLeaveStatusReport,
} = require("../controllers/statisticsController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// ==================== DASHBOARD SUMMARY ====================

router.get(
  "/dashboard-summary",
  protect,
  authorize("admin"),
  getDashboardSummary
);

// ==================== ATTENDANCE STATISTICS ====================

router.get(
  "/attendance",
  protect,
  authorize("admin"),
  getAttendanceStatistics
);

// ==================== LEAVE STATISTICS ====================

router.get(
  "/leaves",
  protect,
  authorize("admin"),
  getLeaveStatistics
);

// ==================== MONTHLY ATTENDANCE REPORT ====================

router.get(
  "/reports/monthly-attendance",
  protect,
  authorize("admin"),
  getMonthlyAttendanceReport
);

// ==================== LEAVE UTILIZATION REPORT ====================

router.get(
  "/reports/leave-utilization",
  protect,
  authorize("admin"),
  getLeaveUtilizationReport
);

// ==================== DEPARTMENT EMPLOYEE REPORT ====================

router.get(
  "/reports/department-employees",
  protect,
  authorize("admin"),
  getDepartmentEmployeeReport
);

// ==================== LEAVE STATUS REPORT ====================

router.get(
  "/reports/leave-status",
  protect,
  authorize("admin"),
  getLeaveStatusReport
);

module.exports = router;