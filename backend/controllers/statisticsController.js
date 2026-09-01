const User = require("../models/user");
const Attendance = require("../models/Attendance");
const Leave = require("../models/Leave");
const Department = require("../models/Department");

// ==================== HELPER FUNCTION ====================

const calculateLeaveDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  return (
    Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1
  );
};

// ==================== GET ATTENDANCE STATISTICS ====================

const getAttendanceStatistics = async (req, res) => {
  try {
    const today = new Date();

    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const totalEmployees = await User.countDocuments({
      role: "employee",
      isActive: true,
    });

    const attendanceRecords = await Attendance.find({
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    const present = attendanceRecords.filter(
      (record) => record.status === "present"
    ).length;

    const absent = Math.max(totalEmployees - present, 0);

    const attendancePercentage =
      totalEmployees > 0
        ? Number(((present / totalEmployees) * 100).toFixed(2))
        : 0;

    return res.status(200).json({
      success: true,
      statistics: {
        totalEmployees,
        present,
        absent,
        attendancePercentage,
      },
    });
  } catch (error) {
    console.error("Attendance statistics error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching attendance statistics",
    });
  }
};

// ==================== GET LEAVE STATISTICS ====================

const getLeaveStatistics = async (req, res) => {
  try {
    const totalLeaves = await Leave.countDocuments();

    const pendingLeaves = await Leave.countDocuments({
      status: "pending",
    });

    const approvedLeaves = await Leave.countDocuments({
      status: "approved",
    });

    const rejectedLeaves = await Leave.countDocuments({
      status: "rejected",
    });

    const leaveTypeStatistics = await Leave.aggregate([
      {
        $group: {
          _id: "$leaveType",
          total: { $sum: 1 },
          pending: {
            $sum: {
              $cond: [
                { $eq: ["$status", "pending"] },
                1,
                0,
              ],
            },
          },
          approved: {
            $sum: {
              $cond: [
                { $eq: ["$status", "approved"] },
                1,
                0,
              ],
            },
          },
          rejected: {
            $sum: {
              $cond: [
                { $eq: ["$status", "rejected"] },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          leaveType: "$_id",
          total: 1,
          pending: 1,
          approved: 1,
          rejected: 1,
        },
      },
      {
        $sort: {
          leaveType: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      statistics: {
        totalLeaves,
        pendingLeaves,
        approvedLeaves,
        rejectedLeaves,
        leaveTypeStatistics,
      },
    });
  } catch (error) {
    console.error("Leave statistics error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching leave statistics",
    });
  }
};

// ==================== GET ADMIN DASHBOARD SUMMARY ====================

const getDashboardSummary = async (req, res) => {
  try {
    const today = new Date();

    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const [
      totalEmployees,
      totalDepartments,
      pendingLeaves,
      approvedLeaves,
      presentToday,
    ] = await Promise.all([
      User.countDocuments({
        role: "employee",
        isActive: true,
      }),

      Department.countDocuments(),

      Leave.countDocuments({
        status: "pending",
      }),

      Leave.countDocuments({
        status: "approved",
      }),

      Attendance.countDocuments({
        status: "present",
        date: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      summary: {
        totalEmployees,
        totalDepartments,
        pendingLeaves,
        approvedLeaves,
        presentToday,
      },
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching dashboard summary",
    });
  }
};

// ==================== GET MONTHLY ATTENDANCE REPORT ====================

const getMonthlyAttendanceReport = async (req, res) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const month = Number(req.query.month) || new Date().getMonth() + 1;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const attendance = await Attendance.aggregate([
      {
        $match: {
          date: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    let present = 0;
    let absent = 0;

    attendance.forEach((item) => {
      if (item._id === "present") present = item.count;
      if (item._id === "absent") absent = item.count;
    });

    const total = present + absent;

    const attendancePercentage =
      total > 0
        ? Number(((present / total) * 100).toFixed(2))
        : 0;

    return res.status(200).json({
      success: true,
      report: {
        year,
        month,
        present,
        absent,
        totalRecords: total,
        attendancePercentage,
      },
    });
  } catch (error) {
    console.error("Monthly attendance report error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Server error while generating monthly attendance report",
    });
  }
};

// ==================== GET LEAVE UTILIZATION REPORT ====================

const getLeaveUtilizationReport = async (req, res) => {
  try {
    const leaveUtilization = await Leave.aggregate([
      {
        $match: {
          status: "approved",
        },
      },
      {
        $group: {
          _id: "$leaveType",
          totalRequests: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          leaveType: "$_id",
          totalRequests: 1,
        },
      },
      {
        $sort: {
          leaveType: 1,
        },
      },
    ]);

    // Calculate total approved leave days for each type
    const detailedUtilization = await Promise.all(
      leaveUtilization.map(async (item) => {
        const leaves = await Leave.find({
          leaveType: item.leaveType,
          status: "approved",
        });

        let totalDays = 0;

        leaves.forEach((leave) => {
          totalDays += calculateLeaveDays(
            leave.startDate,
            leave.endDate
          );
        });

        return {
          ...item,
          totalDays,
        };
      })
    );

    return res.status(200).json({
      success: true,
      report: detailedUtilization,
    });
  } catch (error) {
    console.error("Leave utilization report error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Server error while generating leave utilization report",
    });
  }
};

// ==================== GET DEPARTMENT EMPLOYEE REPORT ====================

const getDepartmentEmployeeReport = async (req, res) => {
  try {
    const departments = await Department.find().sort({
      name: 1,
    });

    const report = await Promise.all(
      departments.map(async (department) => {
        const totalEmployees = await User.countDocuments({
          department: department._id,
          role: "employee",
        });

        const activeEmployees = await User.countDocuments({
          department: department._id,
          role: "employee",
          isActive: true,
        });

        return {
          department: department.name,
          totalEmployees,
          activeEmployees,
          inactiveEmployees:
            totalEmployees - activeEmployees,
        };
      })
    );

    return res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("Department employee report error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Server error while generating department report",
    });
  }
};

// ==================== GET LEAVE STATUS REPORT ====================

const getLeaveStatusReport = async (req, res) => {
  try {
    const pending = await Leave.countDocuments({
      status: "pending",
    });

    const approved = await Leave.countDocuments({
      status: "approved",
    });

    const rejected = await Leave.countDocuments({
      status: "rejected",
    });

    const total = pending + approved + rejected;

    return res.status(200).json({
      success: true,
      report: {
        total,
        pending,
        approved,
        rejected,
      },
    });
  } catch (error) {
    console.error("Leave status report error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Server error while generating leave status report",
    });
  }
};

// ==================== EXPORT ====================

module.exports = {
  getAttendanceStatistics,
  getLeaveStatistics,
  getDashboardSummary,
  getMonthlyAttendanceReport,
  getLeaveUtilizationReport,
  getDepartmentEmployeeReport,
  getLeaveStatusReport,
};