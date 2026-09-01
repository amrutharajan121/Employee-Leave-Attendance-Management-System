const express = require("express");

const {
  getAllLeaves,
  updateLeaveStatus,
} = require("../controllers/leaveAdminController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// Admin: view all leave requests
router.get(
  "/",
  protect,
  authorize("admin"),
  getAllLeaves
);

// Admin: approve or reject a leave
router.put(
  "/:id",
  protect,
  authorize("admin"),
  updateLeaveStatus
);

module.exports = router;