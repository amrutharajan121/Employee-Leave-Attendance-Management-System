const express = require("express");

const {
  register,
  login,
  logout,
  getMe,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Register
router.post("/register", register);

// Login
router.post("/login", login);

// Logout
router.post("/logout", logout);

// Get current logged-in user
router.get("/me", protect, getMe);

module.exports = router;