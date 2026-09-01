const Leave = require("../models/Leave");
const LeaveType = require("../models/LeaveType");
const LeaveSettings = require("../models/LeaveSettings");

// ==================== HELPER FUNCTION ====================

// Calculate number of days including both start and end dates
const calculateDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  return (
    Math.floor(
      (end - start) / (1000 * 60 * 60 * 24)
    ) + 1
  );
};

// ==================== APPLY FOR LEAVE ====================

const applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    // Validate required fields
    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message:
          "Leave type, start date, end date and reason are required",
      });
    }

    const selectedLeaveType = leaveType.trim();

    // ==================== VALIDATE LEAVE TYPE ====================

    // Check selected leave type from database
    const selectedLeaveTypeData = await LeaveType.findOne({
      name: selectedLeaveType,
      isActive: true,
    });

    // If leave types are configured in database,
    // selected type must exist and be active
    const leaveTypeCount = await LeaveType.countDocuments();

    if (leaveTypeCount > 0 && !selectedLeaveTypeData) {
      return res.status(400).json({
        success: false,
        message: "Invalid or inactive leave type",
      });
    }

    // ==================== CONVERT DATES ====================

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate dates
    if (
      isNaN(start.getTime()) ||
      isNaN(end.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
    }

    // Remove time portion
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Prevent past date leave application
    if (start < today) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot apply for leave for past dates",
      });
    }

    // Validate date range
    if (start > end) {
      return res.status(400).json({
        success: false,
        message:
          "Start date cannot be after end date",
      });
    }

    // Calculate requested leave days
    const requestedDays = calculateDays(
      start,
      end
    );

    // Current year
    const currentYear = start.getFullYear();

    // Prevent leave spanning multiple years
    if (end.getFullYear() !== currentYear) {
      return res.status(400).json({
        success: false,
        message:
          "Leave request cannot span across different years",
      });
    }

    // ==================== GET LEAVE LIMIT ====================

    let leaveLimit;

    // If leave type exists in dynamic LeaveType collection,
    // use its annualLimit
    if (selectedLeaveTypeData) {
      leaveLimit = Number(
        selectedLeaveTypeData.annualLimit
      );
    } else {
      // Fallback to existing LeaveSettings logic
      // This keeps old functionality working
      let leaveSettings =
        await LeaveSettings.findOne({
          year: currentYear,
        });

      // Default settings
      if (!leaveSettings) {
        leaveSettings = {
          casual: 12,
          sick: 10,
          annual: 15,
          other: 5,
        };
      }

      const leaveLimits = {
        Casual: Number(leaveSettings.casual),
        Sick: Number(leaveSettings.sick),
        Annual: Number(leaveSettings.annual),
        Other: Number(leaveSettings.other),
      };

      leaveLimit =
        leaveLimits[selectedLeaveType];
    }

    if (
      leaveLimit === undefined ||
      leaveLimit === null
    ) {
      return res.status(400).json({
        success: false,
        message: `No leave limit configured for ${selectedLeaveType}`,
      });
    }

    // ==================== CHECK USED LEAVES ====================

    const startOfYear = new Date(
      `${currentYear}-01-01T00:00:00.000Z`
    );

    const endOfYear = new Date(
      `${currentYear}-12-31T23:59:59.999Z`
    );

    const approvedLeaves = await Leave.find({
      employee: req.user._id,
      leaveType: selectedLeaveType,
      status: "approved",
      startDate: {
        $gte: startOfYear,
        $lte: endOfYear,
      },
    });

    let usedDays = 0;

    approvedLeaves.forEach((leave) => {
      usedDays += calculateDays(
        leave.startDate,
        leave.endDate
      );
    });

    const remainingDays =
      Number(leaveLimit) - usedDays;

    // Check leave balance
    if (requestedDays > remainingDays) {
      return res.status(400).json({
        success: false,
        message: `Insufficient ${selectedLeaveType} leave balance. You have only ${Math.max(
          remainingDays,
          0
        )} day(s) remaining.`,
      });
    }

    // ==================== CHECK OVERLAPPING LEAVES ====================

    const overlappingLeave = await Leave.findOne({
      employee: req.user._id,
      status: {
        $in: ["pending", "approved"],
      },
      startDate: {
        $lte: end,
      },
      endDate: {
        $gte: start,
      },
    });

    if (overlappingLeave) {
      return res.status(400).json({
        success: false,
        message:
          "You already have a pending or approved leave request for the selected date range",
      });
    }

    // ==================== CREATE LEAVE ====================

    const leave = await Leave.create({
      employee: req.user._id,
      leaveType: selectedLeaveType,
      startDate: start,
      endDate: end,
      reason: reason.trim(),
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Leave application submitted successfully",
      leave,
    });
  } catch (error) {
    console.error(
      "Apply leave error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while applying for leave",
    });
  }
};

// ==================== GET MY LEAVES ====================

const getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({
      employee: req.user._id,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: leaves.length,
      leaves,
    });
  } catch (error) {
    console.error(
      "Get my leaves error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching leaves",
    });
  }
};

// ==================== CANCEL LEAVE ====================

const cancelLeave = async (req, res) => {
  try {
    const leave = await Leave.findOne({
      _id: req.params.id,
      employee: req.user._id,
      status: "pending",
    });

    if (!leave) {
      return res.status(404).json({
        success: false,
        message:
          "Pending leave request not found",
      });
    }

    // Change status instead of deleting
    leave.status = "cancelled";

    await leave.save();

    return res.status(200).json({
      success: true,
      message:
        "Leave cancelled successfully",
      leave,
    });
  } catch (error) {
    console.error(
      "Cancel leave error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while cancelling leave",
    });
  }
};

// ==================== GET LEAVE BALANCE ====================

const getLeaveBalance = async (req, res) => {
  try {
    const currentYear =
      new Date().getFullYear();

    const startOfYear = new Date(
      `${currentYear}-01-01T00:00:00.000Z`
    );

    const endOfYear = new Date(
      `${currentYear}-12-31T23:59:59.999Z`
    );

    // Get all leave types from database
    const leaveTypes = await LeaveType.find({
      isActive: true,
    }).sort({ name: 1 });

    // Get approved leaves only
    const approvedLeaves = await Leave.find({
      employee: req.user._id,
      status: "approved",
      startDate: {
        $gte: startOfYear,
        $lte: endOfYear,
      },
    });

    const balance = {};

    // ================================
    // DYNAMIC LEAVE TYPES
    // ================================

    if (leaveTypes.length > 0) {
      leaveTypes.forEach((type) => {
        balance[type.name] = {
          leaveType: type.name,
          total: Number(type.annualLimit),
          used: 0,
          remaining: Number(type.annualLimit),
        };
      });

      // Calculate used leaves
      approvedLeaves.forEach((leave) => {
        if (balance[leave.leaveType]) {
          const days = calculateDays(
            leave.startDate,
            leave.endDate
          );

          balance[leave.leaveType].used += days;
        }
      });

      // Calculate remaining balance
      Object.keys(balance).forEach((type) => {
        balance[type].remaining = Math.max(
          balance[type].total -
            balance[type].used,
          0
        );
      });
    } else {
      // ================================
      // FALLBACK TO OLD LOGIC
      // ================================

      let leaveSettings =
        await LeaveSettings.findOne({
          year: currentYear,
        });

      // Default settings
      if (!leaveSettings) {
        leaveSettings = {
          casual: 12,
          sick: 10,
          annual: 15,
          other: 5,
        };
      }

      const leaveLimits = {
        Casual: Number(leaveSettings.casual),
        Sick: Number(leaveSettings.sick),
        Annual: Number(leaveSettings.annual),
        Other: Number(leaveSettings.other),
      };

      const usedLeaves = {
        Casual: 0,
        Sick: 0,
        Annual: 0,
        Other: 0,
      };

      approvedLeaves.forEach((leave) => {
        const days = calculateDays(
          leave.startDate,
          leave.endDate
        );

        if (
          Object.prototype.hasOwnProperty.call(
            usedLeaves,
            leave.leaveType
          )
        ) {
          usedLeaves[leave.leaveType] += days;
        }
      });

      Object.keys(leaveLimits).forEach(
        (type) => {
          balance[type] = {
            leaveType: type,
            total: leaveLimits[type],
            used: usedLeaves[type],
            remaining: Math.max(
              leaveLimits[type] -
                usedLeaves[type],
              0
            ),
          };
        }
      );
    }

    return res.status(200).json({
      success: true,
      year: currentYear,
      balance,
    });
  } catch (error) {
    console.error(
      "Get leave balance error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching leave balance",
    });
  }
};

// ==================== EXPORT ====================

module.exports = {
  applyLeave,
  getMyLeaves,
  cancelLeave,
  getLeaveBalance,
};