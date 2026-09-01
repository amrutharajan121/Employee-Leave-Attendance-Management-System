const Department = require("../models/Department");

// ==================== CREATE DEPARTMENT ====================

const createDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Department name is required",
      });
    }

    const existingDepartment = await Department.findOne({
      name: name.trim(),
    });

    if (existingDepartment) {
      return res.status(409).json({
        success: false,
        message: "Department already exists",
      });
    }

    const department = await Department.create({
      name: name.trim(),
      description: description?.trim() || "",
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Department created successfully",
      department,
    });
  } catch (error) {
    console.error("Create department error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while creating department",
    });
  }
};

// ==================== GET ALL DEPARTMENTS ====================

const getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: departments.length,
      departments,
    });
  } catch (error) {
    console.error("Get departments error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching departments",
    });
  }
};

// ==================== TOGGLE DEPARTMENT STATUS ====================

const toggleDepartmentStatus = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    department.isActive = !department.isActive;

    await department.save();

    return res.status(200).json({
      success: true,
      message: `Department ${
        department.isActive ? "activated" : "deactivated"
      } successfully`,
      department,
    });
  } catch (error) {
    console.error("Toggle department status error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating department status",
    });
  }
};

module.exports = {
  createDepartment,
  getAllDepartments,
  toggleDepartmentStatus,
};