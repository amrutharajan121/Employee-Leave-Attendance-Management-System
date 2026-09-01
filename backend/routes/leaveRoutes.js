const express = require("express");

const {
  applyLeave,
  getMyLeaves,
  cancelLeave,
  getLeaveBalance,
} = require("../controllers/leaveController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// ==================== GET LEAVE BALANCE ====================
// Employee only
router.get(
  "/balance",
  protect,
  authorize("employee"),
  getLeaveBalance
);

// ==================== APPLY FOR LEAVE ====================
// Employee only
router.post(
  "/",
  protect,
  authorize("employee"),
  applyLeave
);

// ==================== VIEW MY LEAVES ====================
// Employee only
router.get(
  "/my",
  protect,
  authorize("employee"),
  getMyLeaves
);

// ==================== CANCEL LEAVE ====================
// Employee only
router.delete(
  "/:id",
  protect,
  authorize("employee"),
  cancelLeave
);

module.exports = router;