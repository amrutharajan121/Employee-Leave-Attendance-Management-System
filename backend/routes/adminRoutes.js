const express = require("express");

const {
  createAdmin,
  createEmployee,
  getEmployees,
  updateEmployee,
  toggleEmployeeStatus,
  assignManagerToDepartment,
} = require("../controllers/adminController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// ==================== TEMPORARY: CREATE FIRST ADMIN ====================
// Use only for initial setup
router.post("/create", createAdmin);

// ==================== ADMIN EMPLOYEE MANAGEMENT ====================

// Create Employee or Manager
router.post(
  "/employees",
  protect,
  authorize("admin"),
  createEmployee
);

// Get all Employees and Managers
router.get(
  "/employees",
  protect,
  authorize("admin"),
  getEmployees
);

// Update Employee or Manager
router.put(
  "/employees/:id",
  protect,
  authorize("admin"),
  updateEmployee
);

// Activate / Deactivate Employee or Manager
router.patch(
  "/employees/:id/status",
  protect,
  authorize("admin"),
  toggleEmployeeStatus
);

// ==================== DEPARTMENT MANAGER ====================

// Assign Manager to Department
router.put(
  "/departments/:departmentId/manager",
  protect,
  authorize("admin"),
  assignManagerToDepartment
);

module.exports = router;