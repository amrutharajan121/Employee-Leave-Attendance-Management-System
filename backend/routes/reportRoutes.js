const express = require("express");

const {
  getMonthlyAttendanceSummary,
  getLeaveUtilizationReport,
  getDepartmentEmployeeStatistics,
  getLeaveStatusSummary,
  exportAttendanceCSV,
  exportLeaveUtilizationCSV,
  exportDepartmentStatisticsCSV,
  exportLeaveStatusCSV,
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

// Export Monthly Attendance CSV
router.get(
  "/attendance/monthly/export",
  protect,
  authorize("admin"),
  exportAttendanceCSV
);

// ==================== LEAVE UTILIZATION REPORT ====================

router.get(
  "/leaves/utilization",
  protect,
  authorize("admin"),
  getLeaveUtilizationReport
);

// Export Leave Utilization CSV
router.get(
  "/leaves/utilization/export",
  protect,
  authorize("admin"),
  exportLeaveUtilizationCSV
);

// ==================== DEPARTMENT EMPLOYEE STATISTICS ====================

router.get(
  "/departments",
  protect,
  authorize("admin"),
  getDepartmentEmployeeStatistics
);

// Export Department Statistics CSV
router.get(
  "/departments/export",
  protect,
  authorize("admin"),
  exportDepartmentStatisticsCSV
);

// ==================== LEAVE STATUS SUMMARY ====================

router.get(
  "/leaves/status",
  protect,
  authorize("admin"),
  getLeaveStatusSummary
);

// Export Leave Status Summary CSV
router.get(
  "/leaves/status/export",
  protect,
  authorize("admin"),
  exportLeaveStatusCSV
);

module.exports = router;