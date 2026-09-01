const User = require("../models/user");
const Attendance = require("../models/Attendance");
const Leave = require("../models/Leave");
const Department = require("../models/Department");

// ==================== MONTHLY ATTENDANCE SUMMARY ====================

const getMonthlyAttendanceSummary = async (req, res) => {
  try {
    const { month, year } = req.query;

    const selectedMonth = month
      ? parseInt(month)
      : new Date().getMonth() + 1;

    const selectedYear = year
      ? parseInt(year)
      : new Date().getFullYear();

    const startDate = new Date(
      selectedYear,
      selectedMonth - 1,
      1
    );

    const endDate = new Date(
      selectedYear,
      selectedMonth,
      0,
      23,
      59,
      59
    );

    const employees = await User.find({
      role: "employee",
      isActive: true,
    }).select("name email department");

    const report = [];

    for (const employee of employees) {
      const attendanceRecords = await Attendance.find({
        employee: employee._id,
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      });

      const present = attendanceRecords.filter(
        (record) => record.status === "present"
      ).length;

      const absent = attendanceRecords.filter(
        (record) => record.status === "absent"
      ).length;

      report.push({
        employeeId: employee._id,
        name: employee.name,
        email: employee.email,
        present,
        absent,
        totalRecords: attendanceRecords.length,
      });
    }

    return res.status(200).json({
      success: true,
      month: selectedMonth,
      year: selectedYear,
      report,
    });
  } catch (error) {
    console.error(
      "Monthly attendance report error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while generating attendance report",
    });
  }
};

// ==================== LEAVE UTILIZATION REPORT ====================

const getLeaveUtilizationReport = async (req, res) => {
  try {
    const { year } = req.query;

    const selectedYear = year
      ? parseInt(year)
      : new Date().getFullYear();

    const startDate = new Date(
      `${selectedYear}-01-01T00:00:00.000Z`
    );

    const endDate = new Date(
      `${selectedYear}-12-31T23:59:59.999Z`
    );

    const leaves = await Leave.find({
      startDate: {
        $gte: startDate,
        $lte: endDate,
      },
    }).populate("employee", "name email");

    const utilization = {};

    leaves.forEach((leave) => {
      if (!utilization[leave.leaveType]) {
        utilization[leave.leaveType] = {
          leaveType: leave.leaveType,
          totalRequests: 0,
          approved: 0,
          rejected: 0,
          pending: 0,
          totalDays: 0,
        };
      }

      utilization[leave.leaveType].totalRequests++;

      if (leave.status === "approved") {
        utilization[leave.leaveType].approved++;
      }

      if (leave.status === "rejected") {
        utilization[leave.leaveType].rejected++;
      }

      if (leave.status === "pending") {
        utilization[leave.leaveType].pending++;
      }

      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);

      const days =
        Math.floor(
          (end - start) /
            (1000 * 60 * 60 * 24)
        ) + 1;

      utilization[leave.leaveType].totalDays += days;
    });

    return res.status(200).json({
      success: true,
      year: selectedYear,
      report: Object.values(utilization),
    });
  } catch (error) {
    console.error(
      "Leave utilization report error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while generating leave utilization report",
    });
  }
};

// ==================== DEPARTMENT-WISE EMPLOYEE STATISTICS ====================

const getDepartmentEmployeeStatistics = async (
  req,
  res
) => {
  try {
    const departments = await Department.find()
      .populate({
        path: "manager",
        select: "name email",
      });

    const report = [];

    for (const department of departments) {
      const totalEmployees = await User.countDocuments({
        department: department._id,
        role: "employee",
      });

      const activeEmployees =
        await User.countDocuments({
          department: department._id,
          role: "employee",
          isActive: true,
        });

      const managers = await User.countDocuments({
        department: department._id,
        role: "manager",
        isActive: true,
      });

      report.push({
        departmentId: department._id,
        departmentName: department.name,
        totalEmployees,
        activeEmployees,
        managers,
        assignedManager: department.manager
          ? department.manager.name
          : "Not Assigned",
      });
    }

    return res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    console.error(
      "Department statistics error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while generating department statistics",
    });
  }
};

// ==================== LEAVE STATUS SUMMARY ====================

const getLeaveStatusSummary = async (req, res) => {
  try {
    const { year } = req.query;

    const selectedYear = year
      ? parseInt(year)
      : new Date().getFullYear();

    const startDate = new Date(
      `${selectedYear}-01-01T00:00:00.000Z`
    );

    const endDate = new Date(
      `${selectedYear}-12-31T23:59:59.999Z`
    );

    const total = await Leave.countDocuments({
      startDate: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    const approved = await Leave.countDocuments({
      status: "approved",
      startDate: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    const rejected = await Leave.countDocuments({
      status: "rejected",
      startDate: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    const pending = await Leave.countDocuments({
      status: "pending",
      startDate: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    return res.status(200).json({
      success: true,
      year: selectedYear,
      statistics: {
        total,
        approved,
        rejected,
        pending,
      },
    });
  } catch (error) {
    console.error(
      "Leave status summary error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while generating leave status summary",
    });
  }
};

// ==================== EXPORT ====================

module.exports = {
  getMonthlyAttendanceSummary,
  getLeaveUtilizationReport,
  getDepartmentEmployeeStatistics,
  getLeaveStatusSummary,
};