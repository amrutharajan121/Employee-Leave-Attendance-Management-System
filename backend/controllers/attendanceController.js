const Attendance = require("../models/Attendance");

// ==================== CHECK IN ====================

const checkIn = async (req, res) => {
  try {
    // Get today's date without time
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if employee already has attendance for today
    const existingAttendance = await Attendance.findOne({
      employee: req.user._id,
      date: today,
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: "You have already checked in today",
      });
    }

    // Create attendance record
    const attendance = await Attendance.create({
      employee: req.user._id,
      date: today,
      checkIn: new Date(),
      status: "present",
    });

    return res.status(201).json({
      success: true,
      message: "Check-in successful",
      attendance,
    });
  } catch (error) {
    console.error("Check-in error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during check-in",
    });
  }
};

// ==================== CHECK OUT ====================

const checkOut = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find today's attendance
    const attendance = await Attendance.findOne({
      employee: req.user._id,
      date: today,
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "You have not checked in today",
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        success: false,
        message: "You have already checked out today",
      });
    }

    // Update check-out time
    attendance.checkOut = new Date();

    await attendance.save();

    return res.status(200).json({
      success: true,
      message: "Check-out successful",
      attendance,
    });
  } catch (error) {
    console.error("Check-out error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during check-out",
    });
  }
};

// ==================== GET MY ATTENDANCE HISTORY ====================

const getMyAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({
      employee: req.user._id,
    }).sort({ date: -1 });

    return res.status(200).json({
      success: true,
      count: attendance.length,
      attendance,
    });
  } catch (error) {
    console.error("Get attendance error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching attendance history",
    });
  }
};

// ==================== GET TODAY'S ATTENDANCE ====================

const getTodayAttendance = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employee: req.user._id,
      date: today,
    });

    return res.status(200).json({
      success: true,
      attendance,
    });
  } catch (error) {
    console.error("Get today's attendance error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching today's attendance",
    });
  }
};

module.exports = {
  checkIn,
  checkOut,
  getMyAttendance,
  getTodayAttendance,
};