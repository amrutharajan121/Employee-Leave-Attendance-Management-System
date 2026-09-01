const express = require("express");

const {
  getAllEmployees,
  assignDepartment,
  toggleEmployeeStatus,
} = require("../controllers/adminEmployeeController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// ==================== ADMIN EMPLOYEE MANAGEMENT ====================

// Get all employees
router.get(
  "/employees",
  protect,
  authorize("admin"),
  getAllEmployees
);

// Assign department to employee
router.patch(
  "/employees/:id/department",
  protect,
  authorize("admin"),
  assignDepartment
);

// Activate / deactivate employee
router.patch(
  "/employees/:id/toggle-status",
  protect,
  authorize("admin"),
  toggleEmployeeStatus
);

module.exports = router;