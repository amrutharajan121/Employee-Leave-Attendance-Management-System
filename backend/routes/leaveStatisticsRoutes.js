const express = require("express");

const {
  getLeaveStatistics,
} = require("../controllers/leaveStatisticsController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// ==================== LEAVE STATISTICS ====================

router.get(
  "/",
  protect,
  authorize("admin"),
  getLeaveStatistics
);

module.exports = router;