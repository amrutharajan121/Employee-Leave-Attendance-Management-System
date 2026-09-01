const User = require("../models/user");
const Department = require("../models/Department");

// ==================== GET ALL EMPLOYEES ====================

const getAllEmployees = async (req, res) => {
  try {
    const employees = await User.find({
      role: "employee",
    })
      .populate("department", "name")
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: employees.length,
      employees,
    });
  } catch (error) {
    console.error("Get employees error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching employees",
    });
  }
};

// ==================== ASSIGN DEPARTMENT ====================

const assignDepartment = async (req, res) => {
  try {
    const { departmentId } = req.body;

    if (!departmentId) {
      return res.status(400).json({
        success: false,
        message: "Department is required",
      });
    }

    // Find employee or manager
    const employee = await User.findOne({
      _id: req.params.id,
      role: { $in: ["employee", "manager"] },
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify department exists
    const department = await Department.findById(departmentId);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    // Assign department
    employee.department = departmentId;

    await employee.save();

    // Populate department before sending response
    await employee.populate("department", "name");

    return res.status(200).json({
      success: true,
      message: "Department assigned successfully",
      employee: {
        _id: employee._id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        department: employee.department,
        isActive: employee.isActive,
      },
    });
  } catch (error) {
    console.error("Assign department error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while assigning department",
    });
  }
};

// ==================== ACTIVATE / DEACTIVATE EMPLOYEE ====================

const toggleEmployeeStatus = async (req, res) => {
  try {
    const employee = await User.findOne({
      _id: req.params.id,
      role: "employee",
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    employee.isActive = !employee.isActive;

    await employee.save();

    return res.status(200).json({
      success: true,
      message: `Employee ${
        employee.isActive ? "activated" : "deactivated"
      } successfully`,
      employee: {
        _id: employee._id,
        name: employee.name,
        email: employee.email,
        isActive: employee.isActive,
      },
    });
  } catch (error) {
    console.error("Toggle employee status error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating employee status",
    });
  }
};

module.exports = {
  getAllEmployees,
  assignDepartment,
  toggleEmployeeStatus,
};