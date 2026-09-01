const Leave = require("../models/Leave");

// ==================== GET LEAVE STATISTICS ====================

const getLeaveStatistics = async (req, res) => {
  try {
    // Get all leave requests
    const totalLeaves = await Leave.countDocuments();

    // Count by status
    const pending = await Leave.countDocuments({
      status: "pending",
    });

    const approved = await Leave.countDocuments({
      status: "approved",
    });

    const rejected = await Leave.countDocuments({
      status: "rejected",
    });

    // Calculate approval rate
    const processedLeaves = approved + rejected;

    const approvalRate =
      processedLeaves > 0
        ? Number(
            ((approved / processedLeaves) * 100).toFixed(2)
          )
        : 0;

    return res.status(200).json({
      success: true,
      statistics: {
        totalLeaves,
        pending,
        approved,
        rejected,
        approvalRate,
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

module.exports = {
  getLeaveStatistics,
};