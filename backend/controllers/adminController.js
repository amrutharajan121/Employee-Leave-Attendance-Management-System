const bcrypt = require("bcryptjs");
const User = require("../models/user");
const Department = require("../models/Department");

// ==================== CREATE ADMIN ====================

const createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: "admin",
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Admin created successfully",
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Create admin error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while creating admin",
    });
  }
};

// ==================== CREATE EMPLOYEE / MANAGER ====================

const createEmployee = async (req, res) => {
  try {
    const { name, email, password, department, role } = req.body;

    if (!name || !email || !password || !department) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, password and department are required",
      });
    }

    // Only employee or manager can be created here
    const userRole = role || "employee";

    if (!["employee", "manager"].includes(userRole)) {
      return res.status(400).json({
        success: false,
        message: "Role must be either employee or manager",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Check department exists
    const departmentExists = await Department.findById(
      department
    );

    if (!departmentExists) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const employee = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: userRole,
      department,
      isActive: true,
    });

    // If user is a manager, assign them to the department
    if (userRole === "manager") {
      departmentExists.manager = employee._id;
      await departmentExists.save();
    }

    return res.status(201).json({
      success: true,
      message: `${
        userRole === "manager" ? "Manager" : "Employee"
      } created successfully`,
      user: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        department: employee.department,
      },
    });
  } catch (error) {
    console.error("Create employee error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while creating user",
    });
  }
};

// ==================== GET ALL EMPLOYEES ====================

const getEmployees = async (req, res) => {
  try {
    const employees = await User.find({
      role: { $in: ["employee", "manager"] },
    })
      .select("-password")
      .populate("department", "name");

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

// ==================== UPDATE EMPLOYEE ====================

const updateEmployee = async (req, res) => {
  try {
    const { name, email, department, role } = req.body;

    const employee = await User.findOne({
      _id: req.params.id,
      role: { $in: ["employee", "manager"] },
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    if (name !== undefined && name.trim() !== "") {
      employee.name = name.trim();
    }

    if (email !== undefined && email.trim() !== "") {
      const cleanEmail = email.toLowerCase().trim();

      const existingUser = await User.findOne({
        email: cleanEmail,
        _id: { $ne: employee._id },
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email is already in use",
        });
      }

      employee.email = cleanEmail;
    }

    // Update department
    if (department !== undefined) {
      const departmentExists = await Department.findById(
        department
      );

      if (!departmentExists) {
        return res.status(404).json({
          success: false,
          message: "Department not found",
        });
      }

      employee.department = department;
    }

    // Update role
    if (
      role !== undefined &&
      ["employee", "manager"].includes(role)
    ) {
      employee.role = role;
    }

    await employee.save();

    return res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      employee,
    });
  } catch (error) {
    console.error("Update employee error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating employee",
    });
  }
};

// ==================== DEACTIVATE / ACTIVATE EMPLOYEE ====================

const toggleEmployeeStatus = async (req, res) => {
  try {
    const employee = await User.findOne({
      _id: req.params.id,
      role: { $in: ["employee", "manager"] },
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
      employee,
    });
  } catch (error) {
    console.error("Toggle employee status error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating employee status",
    });
  }
};

// ==================== ASSIGN MANAGER TO DEPARTMENT ====================

const assignManagerToDepartment = async (req, res) => {
  try {
    const { managerId } = req.body;

    if (!managerId) {
      return res.status(400).json({
        success: false,
        message: "Manager ID is required",
      });
    }

    const department = await Department.findById(
      req.params.departmentId
    );

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    const manager = await User.findOne({
      _id: managerId,
      role: "manager",
      isActive: true,
    });

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "Active manager not found",
      });
    }

    // Manager must belong to the same department
    if (
      !manager.department ||
      manager.department.toString() !== department._id.toString()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Manager must belong to the same department",
      });
    }

    department.manager = manager._id;

    await department.save();

    return res.status(200).json({
      success: true,
      message: "Manager assigned to department successfully",
      department,
    });
  } catch (error) {
    console.error("Assign manager error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while assigning manager",
    });
  }
};

module.exports = {
  createAdmin,
  createEmployee,
  getEmployees,
  updateEmployee,
  toggleEmployeeStatus,
  assignManagerToDepartment,
};