const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

dotenv.config();

const connectDB = require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const adminEmployeeRoutes = require("./routes/adminEmployeeRoutes");
const testRoutes = require("./routes/testRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const managerRoutes = require("./routes/managerRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const leaveTypeRoutes = require("./routes/leaveTypeRoutes");
const statisticsRoutes = require("./routes/statisticsRoutes");
const leaveSettingsRoutes = require("./routes/leaveSettingsRoutes");
const leaveStatisticsRoutes = require("./routes/leaveStatisticsRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();

// Database
connectDB();

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Test Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Employee Leave Management API is running",
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin", adminEmployeeRoutes);
app.use("/api/admin/leave-settings", leaveSettingsRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/leave-types", leaveTypeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/manager", managerRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/statistics", statisticsRoutes);
app.use("/api/statistics/leaves", leaveStatisticsRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/test", testRoutes);

// Run locally
if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel
module.exports = app;