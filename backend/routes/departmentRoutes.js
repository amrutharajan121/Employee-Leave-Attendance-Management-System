const express = require("express");

const router = express.Router();

const {
  getAllDepartments,
  createDepartment,
  toggleDepartmentStatus,
} = require("../controllers/departmentController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

// Get all departments
router.get("/", protect, getAllDepartments);

// Create department
router.post(
  "/",
  protect,
  authorize("admin"),
  createDepartment
);

// Activate / Deactivate department
router.patch(
  "/:id/status",
  protect,
  authorize("admin"),
  toggleDepartmentStatus
);

module.exports = router;