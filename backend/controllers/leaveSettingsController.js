const LeaveSettings = require("../models/LeaveSettings");

// ==================== GET LEAVE SETTINGS ====================

const getLeaveSettings = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    let settings = await LeaveSettings.findOne({
      year: currentYear,
    });

    // Create default settings if not found
    if (!settings) {
      settings = await LeaveSettings.create({
        casual: 12,
        sick: 10,
        annual: 15,
        other: 5,
        year: currentYear,
      });
    }

    return res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Get leave settings error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching leave settings",
    });
  }
};

// ==================== UPDATE LEAVE SETTINGS ====================

const updateLeaveSettings = async (req, res) => {
  try {
    const { casual, sick, annual, other } = req.body;

    if (
      casual === undefined ||
      sick === undefined ||
      annual === undefined ||
      other === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "All leave limits are required",
      });
    }

    // Validate numbers
    const values = [casual, sick, annual, other];

    if (
      values.some(
        (value) =>
          typeof value !== "number" ||
          value < 0
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Leave limits must be valid positive numbers",
      });
    }

    const currentYear = new Date().getFullYear();

    const settings =
      await LeaveSettings.findOneAndUpdate(
        {
          year: currentYear,
        },
        {
          casual,
          sick,
          annual,
          other,
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
        }
      );

    return res.status(200).json({
      success: true,
      message: "Leave settings updated successfully",
      settings,
    });
  } catch (error) {
    console.error("Update leave settings error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating leave settings",
    });
  }
};

module.exports = {
  getLeaveSettings,
  updateLeaveSettings,
};