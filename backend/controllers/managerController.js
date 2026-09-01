const User = require("../models/user");
const Attendance = require("../models/Attendance");
const Leave = require("../models/Leave");

// ==================== GET MANAGER DEPARTMENT ====================
// Fetch latest manager department directly from database.
// This prevents problems caused by stale JWT/session data.

const getManagerDepartment = async (req) => {
  const managerId = req.user._id || req.user.id;

  const manager = await User.findById(managerId)
    .select("name email department")
    .populate("department", "name");

  if (!manager) {
    return null;
  }

  return manager;
};

// ==================== GET DEPARTMENT EMPLOYEES ====================

const getDepartmentEmployees = async (req, res) => {
  try {
    const manager = await getManagerDepartment(req);

    if (!manager || !manager.department) {
      return res.status(400).json({
        success: false,
        message: "Manager is not assigned to any department",
      });
    }

    const departmentId = manager.department._id;

    const employees = await User.find({
      department: departmentId,
      role: "employee",
      isActive: true,
    })
      .select("-password")
      .populate("department", "name")
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      department: manager.department.name,
      count: employees.length,
      employees,
    });
  } catch (error) {
    console.error("Get department employees error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching department employees",
    });
  }
};

// ==================== GET TEAM ATTENDANCE ====================

const getTeamAttendance = async (req, res) => {
  try {
    const manager = await getManagerDepartment(req);

    if (!manager || !manager.department) {
      return res.status(400).json({
        success: false,
        message: "Manager is not assigned to any department",
      });
    }

    const departmentId = manager.department._id;

    const employees = await User.find({
      department: departmentId,
      role: "employee",
      isActive: true,
    }).select("_id");

    const employeeIds = employees.map(
      (employee) => employee._id
    );

    const attendance = await Attendance.find({
      employee: {
        $in: employeeIds,
      },
    })
      .populate("employee", "name email")
      .sort({ date: -1 });

    return res.status(200).json({
      success: true,
      department: manager.department.name,
      count: attendance.length,
      attendance,
    });
  } catch (error) {
    console.error("Get team attendance error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching team attendance",
    });
  }
};

// ==================== GET PENDING LEAVE REQUESTS ====================

const getPendingLeaveRequests = async (req, res) => {
  try {
    const manager = await getManagerDepartment(req);

    if (!manager || !manager.department) {
      return res.status(400).json({
        success: false,
        message: "Manager is not assigned to any department",
      });
    }

    const departmentId = manager.department._id;

    const employees = await User.find({
      department: departmentId,
      role: "employee",
      isActive: true,
    }).select("_id");

    const employeeIds = employees.map(
      (employee) => employee._id
    );

    const leaves = await Leave.find({
      employee: {
        $in: employeeIds,
      },
      status: "pending",
    })
      .populate("employee", "name email department")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      department: manager.department.name,
      count: leaves.length,
      leaves,
    });
  } catch (error) {
    console.error("Get pending leave requests error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching pending leave requests",
    });
  }
};

// ==================== APPROVE LEAVE REQUEST ====================

const approveLeaveRequest = async (req, res) => {
  try {
    const manager = await getManagerDepartment(req);

    if (!manager || !manager.department) {
      return res.status(400).json({
        success: false,
        message: "Manager is not assigned to any department",
      });
    }

    const departmentId = manager.department._id;

    const leave = await Leave.findById(req.params.id).populate(
      "employee",
      "name department"
    );

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
    }

    if (
      !leave.employee ||
      !leave.employee.department ||
      leave.employee.department.toString() !== departmentId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You can only approve leave requests from your department",
      });
    }

    if (leave.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending leave requests can be approved",
      });
    }

    leave.status = "approved";
    leave.adminComment = "";

    await leave.save();

    return res.status(200).json({
      success: true,
      message: "Leave request approved successfully",
      leave,
    });
  } catch (error) {
    console.error("Approve leave request error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while approving leave request",
    });
  }
};

// ==================== REJECT LEAVE REQUEST ====================

const rejectLeaveRequest = async (req, res) => {
  try {
    const { reason } = req.body;

    const manager = await getManagerDepartment(req);

    if (!manager || !manager.department) {
      return res.status(400).json({
        success: false,
        message: "Manager is not assigned to any department",
      });
    }

    if (!reason || reason.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const departmentId = manager.department._id;

    const leave = await Leave.findById(req.params.id).populate(
      "employee",
      "name department"
    );

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
    }

    if (
      !leave.employee ||
      !leave.employee.department ||
      leave.employee.department.toString() !== departmentId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You can only reject leave requests from your department",
      });
    }

    if (leave.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending leave requests can be rejected",
      });
    }

    leave.status = "rejected";
    leave.adminComment = reason.trim();

    await leave.save();

    return res.status(200).json({
      success: true,
      message: "Leave request rejected successfully",
      leave,
    });
  } catch (error) {
    console.error("Reject leave request error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while rejecting leave request",
    });
  }
};

// ==================== GET TEAM LEAVE HISTORY ====================

const getTeamLeaveHistory = async (req, res) => {
  try {
    const manager = await getManagerDepartment(req);

    if (!manager || !manager.department) {
      return res.status(400).json({
        success: false,
        message: "Manager is not assigned to any department",
      });
    }

    const departmentId = manager.department._id;

    const employees = await User.find({
      department: departmentId,
      role: "employee",
    }).select("_id");

    const employeeIds = employees.map(
      (employee) => employee._id
    );

    const leaves = await Leave.find({
      employee: {
        $in: employeeIds,
      },
    })
      .populate({
        path: "employee",
        select: "name email department",
        populate: {
          path: "department",
          select: "name",
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      department: manager.department.name,
      count: leaves.length,
      leaves,
    });
  } catch (error) {
    console.error("Get team leave history error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching team leave history",
    });
  }
};

// ==================== EXPORT ====================

module.exports = {
  getDepartmentEmployees,
  getTeamAttendance,
  getPendingLeaveRequests,
  approveLeaveRequest,
  rejectLeaveRequest,
  getTeamLeaveHistory,
};