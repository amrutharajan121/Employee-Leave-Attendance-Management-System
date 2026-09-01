const express = require("express");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// Employee only
router.get(
  "/employee",
  protect,
  authorize("employee"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Employee area accessed successfully",
      user: {
        name: req.user.name,
        role: req.user.role,
      },
    });
  }
);

// Admin only
router.get(
  "/admin",
  protect,
  authorize("admin"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Admin area accessed successfully",
      user: {
        name: req.user.name,
        role: req.user.role,
      },
    });
  }
);

module.exports = router;