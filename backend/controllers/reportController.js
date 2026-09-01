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
    });

    const utilization = {};

    leaves.forEach((leave) => {
      const type = leave.leaveType || "Other";

      if (!utilization[type]) {
        utilization[type] = {
          leaveType: type,
          totalRequests: 0,
          approved: 0,
          rejected: 0,
          pending: 0,
          totalDays: 0,
        };
      }

      utilization[type].totalRequests++;

      if (leave.status === "approved") {
        utilization[type].approved++;
      } else if (leave.status === "rejected") {
        utilization[type].rejected++;
      } else if (leave.status === "pending") {
        utilization[type].pending++;
      }

      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);

      const days =
        Math.floor(
          (end - start) / (1000 * 60 * 60 * 24)
        ) + 1;

      utilization[type].totalDays += days;
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
    const departments = await Department.find().sort({
      name: 1,
    });

    const report = [];

    for (const department of departments) {
      const totalEmployees = await User.countDocuments({
        department: department._id,
        role: "employee",
      });

      const activeEmployees = await User.countDocuments({
        department: department._id,
        role: "employee",
        isActive: true,
      });

      const managers = await User.find({
        department: department._id,
        role: "manager",
        isActive: true,
      }).select("name email");

      report.push({
        departmentId: department._id,
        departmentName: department.name,
        totalEmployees,
        activeEmployees,
        managers: managers.length,
        assignedManager:
          managers.length > 0
            ? managers.map((manager) => manager.name).join(", ")
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

    const leaves = await Leave.find({
      startDate: {
        $gte: startDate,
        $lte: endDate,
      },
    }).select("status");

    const statistics = {
      total: leaves.length,
      approved: 0,
      rejected: 0,
      pending: 0,
    };

    leaves.forEach((leave) => {
      if (leave.status === "approved") {
        statistics.approved++;
      } else if (leave.status === "rejected") {
        statistics.rejected++;
      } else if (leave.status === "pending") {
        statistics.pending++;
      }
    });

    return res.status(200).json({
      success: true,
      year: selectedYear,
      statistics,
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

// ==================== EXPORT CSV HELPER ====================

const convertToCSV = (data) => {
  if (!data || data.length === 0) {
    return "";
  }

  const headers = Object.keys(data[0]);

  const rows = data.map((item) =>
    headers
      .map((header) => {
        const value = item[header] ?? "";

        const escapedValue = String(value).replace(
          /"/g,
          '""'
        );

        return `"${escapedValue}"`;
      })
      .join(",")
  );

  return [headers.join(","), ...rows].join("\n");
};

// ==================== EXPORT MONTHLY ATTENDANCE CSV ====================

const exportAttendanceCSV = async (req, res) => {
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
    }).select("name email");

    const report = [];

    for (const employee of employees) {
      const records = await Attendance.find({
        employee: employee._id,
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      });

      const present = records.filter(
        (record) => record.status === "present"
      ).length;

      const absent = records.filter(
        (record) => record.status === "absent"
      ).length;

      report.push({
        Name: employee.name,
        Email: employee.email,
        Present: present,
        Absent: absent,
        TotalRecords: records.length,
      });
    }

    const csv = convertToCSV(report);

    res.header(
      "Content-Type",
      "text/csv"
    );

    res.attachment(
      `attendance-report-${selectedMonth}-${selectedYear}.csv`
    );

    return res.send(csv);
  } catch (error) {
    console.error(
      "Export attendance CSV error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to export attendance report",
    });
  }
};

// ==================== EXPORT LEAVE UTILIZATION CSV ====================

const exportLeaveUtilizationCSV = async (req, res) => {
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
    });

    const utilization = {};

    leaves.forEach((leave) => {
      const type = leave.leaveType || "Other";

      if (!utilization[type]) {
        utilization[type] = {
          "Leave Type": type,
          "Total Requests": 0,
          Approved: 0,
          Rejected: 0,
          Pending: 0,
          "Total Days": 0,
        };
      }

      utilization[type]["Total Requests"]++;

      if (leave.status === "approved") {
        utilization[type].Approved++;
      } else if (leave.status === "rejected") {
        utilization[type].Rejected++;
      } else if (leave.status === "pending") {
        utilization[type].Pending++;
      }

      const days =
        Math.floor(
          (new Date(leave.endDate) -
            new Date(leave.startDate)) /
            (1000 * 60 * 60 * 24)
        ) + 1;

      utilization[type]["Total Days"] += days;
    });

    const csv = convertToCSV(
      Object.values(utilization)
    );

    res.header("Content-Type", "text/csv");

    res.attachment(
      `leave-utilization-${selectedYear}.csv`
    );

    return res.send(csv);
  } catch (error) {
    console.error(
      "Export leave utilization CSV error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to export leave utilization report",
    });
  }
};

// ==================== EXPORT DEPARTMENT STATISTICS CSV ====================

const exportDepartmentStatisticsCSV = async (
  req,
  res
) => {
  try {
    const departments = await Department.find().sort({
      name: 1,
    });

    const report = [];

    for (const department of departments) {
      const totalEmployees = await User.countDocuments({
        department: department._id,
        role: "employee",
      });

      const activeEmployees = await User.countDocuments({
        department: department._id,
        role: "employee",
        isActive: true,
      });

      const managers = await User.find({
        department: department._id,
        role: "manager",
        isActive: true,
      }).select("name");

      report.push({
        Department: department.name,
        "Total Employees": totalEmployees,
        "Active Employees": activeEmployees,
        Managers: managers.length,
        "Assigned Manager":
          managers.length > 0
            ? managers.map((manager) => manager.name).join(", ")
            : "Not Assigned",
      });
    }

    const csv = convertToCSV(report);

    res.header("Content-Type", "text/csv");

    res.attachment(
      "department-statistics.csv"
    );

    return res.send(csv);
  } catch (error) {
    console.error(
      "Export department statistics CSV error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to export department statistics",
    });
  }
};

// ==================== EXPORT LEAVE STATUS CSV ====================

const exportLeaveStatusCSV = async (req, res) => {
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
    }).select("status");

    const statistics = {
      Year: selectedYear,
      Total: leaves.length,
      Approved: leaves.filter(
        (leave) => leave.status === "approved"
      ).length,
      Rejected: leaves.filter(
        (leave) => leave.status === "rejected"
      ).length,
      Pending: leaves.filter(
        (leave) => leave.status === "pending"
      ).length,
    };

    const csv = convertToCSV([statistics]);

    res.header("Content-Type", "text/csv");

    res.attachment(
      `leave-status-summary-${selectedYear}.csv`
    );

    return res.send(csv);
  } catch (error) {
    console.error(
      "Export leave status CSV error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to export leave status report",
    });
  }
};

// ==================== EXPORT ====================

module.exports = {
  getMonthlyAttendanceSummary,
  getLeaveUtilizationReport,
  getDepartmentEmployeeStatistics,
  getLeaveStatusSummary,
  exportAttendanceCSV,
  exportLeaveUtilizationCSV,
  exportDepartmentStatisticsCSV,
  exportLeaveStatusCSV,
};