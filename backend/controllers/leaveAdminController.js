const Leave = require("../models/Leave");

// ==================== GET ALL LEAVES ====================

const getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate("employee", "name email department")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leaves.length,
      leaves,
    });
  } catch (error) {
    console.error("Get all leaves error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching leaves",
    });
  }
};


// ==================== UPDATE LEAVE STATUS ====================

const updateLeaveStatus = async (req, res) => {
  try {
    const { status, adminComment } = req.body;

    // Validate status
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be approved or rejected",
      });
    }

    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
    }

    // Only pending leaves can be updated
    if (leave.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending leave requests can be updated",
      });
    }

    leave.status = status;
    leave.adminComment = adminComment ? adminComment.trim() : "";

    await leave.save();

    res.status(200).json({
      success: true,
      message: `Leave request ${status} successfully`,
      leave,
    });
  } catch (error) {
    console.error("Update leave status error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while updating leave",
    });
  }
};


module.exports = {
  getAllLeaves,
  updateLeaveStatus,
};