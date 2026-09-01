const dotenv = require("dotenv");
const connectDB = require("./config/db");
const LeaveType = require("./models/LeaveType");

dotenv.config();

const seedLeaveTypes = async () => {
  try {
    await connectDB();

    const leaveTypes = [
      {
        name: "Casual",
        annualLimit: 12,
        isActive: true,
      },
      {
        name: "Sick",
        annualLimit: 10,
        isActive: true,
      },
      {
        name: "Annual",
        annualLimit: 15,
        isActive: true,
      },
      {
        name: "Other",
        annualLimit: 5,
        isActive: true,
      },
    ];

    for (const type of leaveTypes) {
      const existing = await LeaveType.findOne({
        name: type.name,
      });

      if (!existing) {
        await LeaveType.create(type);
        console.log(`${type.name} leave type created`);
      } else {
        console.log(`${type.name} already exists`);
      }
    }

    console.log("Leave types setup completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding leave types:", error);
    process.exit(1);
  }
};

seedLeaveTypes();