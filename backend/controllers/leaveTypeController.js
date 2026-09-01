const LeaveType = require("../models/LeaveType");

// Default/old leave types that should always exist
const DEFAULT_LEAVE_TYPES = [
  {
    name: "Casual Leave",
    annualLimit: 12,
    isActive: true,
  },
  {
    name: "Sick Leave",
    annualLimit: 10,
    isActive: true,
  },
  {
    name: "Annual Leave",
    annualLimit: 15,
    isActive: true,
  },
  {
    name: "Other Leave",
    annualLimit: 5,
    isActive: true,
  },
];

// ==================== ENSURE DEFAULT LEAVE TYPES ====================

const ensureDefaultLeaveTypes = async () => {
  for (const defaultType of DEFAULT_LEAVE_TYPES) {
    const existing = await LeaveType.findOne({
      name: {
        $regex: new RegExp(
          `^${defaultType.name}$`,
          "i"
        ),
      },
    });

    if (!existing) {
      await LeaveType.create(defaultType);
    }
  }
};

// ==================== CREATE LEAVE TYPE ====================

const createLeaveType = async (req, res) => {
  try {
    const { name, annualLimit } = req.body;

    if (!name || annualLimit === undefined) {
      return res.status(400).json({
        success: false,
        message: "Leave type name and annual limit are required",
      });
    }

    if (Number(annualLimit) < 0) {
      return res.status(400).json({
        success: false,
        message: "Annual leave limit cannot be negative",
      });
    }

    const trimmedName = name.trim();

    const existingLeaveType = await LeaveType.findOne({
      name: {
        $regex: new RegExp(`^${trimmedName}$`, "i"),
      },
    });

    if (existingLeaveType) {
      return res.status(409).json({
        success: false,
        message: "Leave type already exists",
      });
    }

    const leaveType = await LeaveType.create({
      name: trimmedName,
      annualLimit: Number(annualLimit),
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Leave type created successfully",
      leaveType,
    });
  } catch (error) {
    console.error("Create leave type error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while creating leave type",
    });
  }
};

// ==================== GET LEAVE TYPES ====================

const getLeaveTypes = async (req, res) => {
  try {
    // Automatically restore old/default leave types if missing
    await ensureDefaultLeaveTypes();

    let leaveTypes;

    // Admin can see all leave types
    if (req.user && req.user.role === "admin") {
      leaveTypes = await LeaveType.find().sort({
        createdAt: 1,
      });
    } else {
      // Employee and Manager see active leave types
      leaveTypes = await LeaveType.find({
        isActive: true,
      }).sort({
        createdAt: 1,
      });
    }

    return res.status(200).json({
      success: true,
      count: leaveTypes.length,
      leaveTypes,
    });
  } catch (error) {
    console.error("Get leave types error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching leave types",
    });
  }
};

// ==================== UPDATE LEAVE TYPE ====================

const updateLeaveType = async (req, res) => {
  try {
    const { name, annualLimit, isActive } = req.body;

    const leaveType = await LeaveType.findById(req.params.id);

    if (!leaveType) {
      return res.status(404).json({
        success: false,
        message: "Leave type not found",
      });
    }

    if (name !== undefined && name.trim() !== "") {
      leaveType.name = name.trim();
    }

    if (annualLimit !== undefined) {
      if (Number(annualLimit) < 0) {
        return res.status(400).json({
          success: false,
          message: "Annual leave limit cannot be negative",
        });
      }

      leaveType.annualLimit = Number(annualLimit);
    }

    if (isActive !== undefined) {
      leaveType.isActive = isActive;
    }

    await leaveType.save();

    return res.status(200).json({
      success: true,
      message: "Leave type updated successfully",
      leaveType,
    });
  } catch (error) {
    console.error("Update leave type error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A leave type with this name already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while updating leave type",
    });
  }
};

// ==================== ACTIVATE / DEACTIVATE ====================

const toggleLeaveTypeStatus = async (req, res) => {
  try {
    const leaveType = await LeaveType.findById(req.params.id);

    if (!leaveType) {
      return res.status(404).json({
        success: false,
        message: "Leave type not found",
      });
    }

    leaveType.isActive = !leaveType.isActive;

    await leaveType.save();

    return res.status(200).json({
      success: true,
      message: `Leave type ${
        leaveType.isActive ? "activated" : "deactivated"
      } successfully`,
      leaveType,
    });
  } catch (error) {
    console.error("Toggle leave type error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating leave type status",
    });
  }
};

// ==================== EXPORT ====================

module.exports = {
  createLeaveType,
  getLeaveTypes,
  updateLeaveType,
  toggleLeaveTypeStatus,
};