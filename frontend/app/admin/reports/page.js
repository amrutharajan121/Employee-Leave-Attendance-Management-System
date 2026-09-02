"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";


export default function ReportsPage() {
  const router = useRouter();

  const [attendanceReport, setAttendanceReport] = useState([]);
  const [leaveUtilization, setLeaveUtilization] = useState([]);
  const [departmentStats, setDepartmentStats] = useState([]);
  const [leaveStatus, setLeaveStatus] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentDate = new Date();

  const [month, setMonth] = useState(
    currentDate.getMonth() + 1
  );

  const [year, setYear] = useState(
    currentDate.getFullYear()
  );

  // ==================== FETCH REPORTS ====================

  useEffect(() => {
    fetchReports();
  }, [month, year]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        attendanceResponse,
        utilizationResponse,
        departmentResponse,
        statusResponse,
      ] = await Promise.all([
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/reports/attendance/monthly?month=${month}&year=${year}`,
          {
            credentials: "include",
          }
        ),

        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/reports/leaves/utilization?year=${year}`,
          {
            credentials: "include",
          }
        ),

        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/reports/departments`,
          {
            credentials: "include",
          }
        ),

        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/reports/leaves/status?year=${year}`,
          {
            credentials: "include",
          }
        ),
      ]);

      const attendanceData =
        await attendanceResponse.json();

      const utilizationData =
        await utilizationResponse.json();

      const departmentData =
        await departmentResponse.json();

      const statusData =
        await statusResponse.json();

      if (
        !attendanceResponse.ok ||
        !utilizationResponse.ok ||
        !departmentResponse.ok ||
        !statusResponse.ok
      ) {
        setError("Failed to fetch reports");
        return;
      }

      setAttendanceReport(
        attendanceData.report || []
      );

      setLeaveUtilization(
        utilizationData.report || []
      );

      setDepartmentStats(
        departmentData.report || []
      );

      setLeaveStatus(
        statusData.statistics || null
      );
    } catch (error) {
      console.error("Reports error:", error);
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  // ==================== DOWNLOAD CSV ====================

  const downloadCSV = (data, fileName) => {
    if (!data || data.length === 0) {
      alert("No data available to export");
      return;
    }

    const headers = Object.keys(data[0]);

    const csvRows = [
      headers.join(","),

      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header] ?? "";

            return `"${String(value).replace(
              /"/g,
              '""'
            )}"`;
          })
          .join(",")
      ),
    ];

    const csvContent = csvRows.join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // ==================== MONTHS ====================

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
   
      <main className="min-h-screen bg-gray-50">

        {/* ==================== NAVBAR ==================== */}

        <nav className="bg-blue-700 text-white px-8 py-4 flex justify-between items-center shadow-md">
          <div>
            <h1 className="text-xl font-bold">
              Employee Leave Management
            </h1>

            <p className="text-sm text-blue-100">
              Admin Portal
            </p>
          </div>

          <button
            onClick={() => router.push("/admin")}
            className="bg-white text-blue-700 px-5 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Dashboard
          </button>
        </nav>

        <div className="max-w-7xl mx-auto p-8">

          {/* ==================== HEADING ==================== */}

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800">
              Organization Reports
            </h2>

            <p className="text-gray-600 mt-2">
              View attendance, leave and department reports.
            </p>
          </div>

          {/* ==================== FILTERS ==================== */}

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 mb-8 flex flex-wrap gap-4">

            {/* Month */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Month
              </label>

              <select
                value={month}
                onChange={(e) =>
                  setMonth(Number(e.target.value))
                }
                className="border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              >
                {months.map((monthName, index) => (
                  <option
                    key={monthName}
                    value={index + 1}
                  >
                    {monthName}
                  </option>
                ))}
              </select>
            </div>

            {/* Year */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>

              <input
                type="number"
                value={year}
                onChange={(e) =>
                  setYear(Number(e.target.value))
                }
                className="border border-gray-300 rounded-lg px-4 py-2 w-32 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

          </div>

          {/* ==================== ERROR ==================== */}

          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* ==================== LOADING ==================== */}

          {loading ? (
            <div className="text-center py-16">
              <p className="text-gray-500">
                Loading reports...
              </p>
            </div>
          ) : (
            <>

              {/* ================================================= */}
              {/* LEAVE REQUEST SUMMARY */}
              {/* ================================================= */}

              <div className="flex justify-between items-center mb-4">

                <h3 className="text-xl font-bold text-gray-800">
                  Leave Request Summary
                </h3>

                <button
                  onClick={() =>
                    downloadCSV(
                      [
                        {
                          Year: year,
                          "Total Requests":
                            leaveStatus?.total || 0,
                          Approved:
                            leaveStatus?.approved || 0,
                          Rejected:
                            leaveStatus?.rejected || 0,
                          Pending:
                            leaveStatus?.pending || 0,
                        },
                      ],
                      `leave-status-summary-${year}.csv`
                    )
                  }
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition"
                >
                  Download CSV
                </button>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">

                {/* Total */}

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <p className="text-gray-500">
                    Total Requests
                  </p>

                  <p className="text-3xl font-bold text-gray-800 mt-2">
                    {leaveStatus?.total || 0}
                  </p>
                </div>

                {/* Approved */}

                <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                  <p className="text-green-700">
                    Approved
                  </p>

                  <p className="text-3xl font-bold text-green-700 mt-2">
                    {leaveStatus?.approved || 0}
                  </p>
                </div>

                {/* Rejected */}

                <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                  <p className="text-red-700">
                    Rejected
                  </p>

                  <p className="text-3xl font-bold text-red-700 mt-2">
                    {leaveStatus?.rejected || 0}
                  </p>
                </div>

                {/* Pending */}

                <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
                  <p className="text-yellow-700">
                    Pending
                  </p>

                  <p className="text-3xl font-bold text-yellow-700 mt-2">
                    {leaveStatus?.pending || 0}
                  </p>
                </div>

              </div>


              {/* ================================================= */}
              {/* MONTHLY ATTENDANCE */}
              {/* ================================================= */}

              <div className="mb-10">

                <div className="flex justify-between items-center mb-4">

                  <h3 className="text-xl font-bold text-gray-800">
                    Monthly Attendance Summary
                  </h3>

                  <button
                    onClick={() =>
                      downloadCSV(
                        attendanceReport.map(
                          (employee) => ({
                            Employee: employee.name,
                            Email: employee.email,
                            Present: employee.present,
                            Absent: employee.absent,
                            "Total Records":
                              employee.totalRecords,
                          })
                        ),
                        `attendance-report-${month}-${year}.csv`
                      )
                    }
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition"
                  >
                    Download CSV
                  </button>

                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

                  <div className="overflow-x-auto">

                    <table className="w-full text-left">

                      <thead className="bg-gray-100">
                        <tr>

                          <th className="px-5 py-4">
                            Employee
                          </th>

                          <th className="px-5 py-4">
                            Email
                          </th>

                          <th className="px-5 py-4">
                            Present
                          </th>

                          <th className="px-5 py-4">
                            Absent
                          </th>

                          <th className="px-5 py-4">
                            Total Records
                          </th>

                        </tr>
                      </thead>

                      <tbody>

                        {attendanceReport.length === 0 ? (
                          <tr>
                            <td
                              colSpan="5"
                              className="text-center py-8 text-gray-500"
                            >
                              No attendance records found.
                            </td>
                          </tr>
                        ) : (
                          attendanceReport.map(
                            (employee) => (
                              <tr
                                key={employee.employeeId}
                                className="border-t hover:bg-gray-50"
                              >

                                <td className="px-5 py-4 font-medium">
                                  {employee.name}
                                </td>

                                <td className="px-5 py-4 text-gray-600">
                                  {employee.email}
                                </td>

                                <td className="px-5 py-4 text-green-600 font-semibold">
                                  {employee.present}
                                </td>

                                <td className="px-5 py-4 text-red-600 font-semibold">
                                  {employee.absent}
                                </td>

                                <td className="px-5 py-4">
                                  {employee.totalRecords}
                                </td>

                              </tr>
                            )
                          )
                        )}

                      </tbody>

                    </table>

                  </div>

                </div>
              </div>


              {/* ================================================= */}
              {/* LEAVE UTILIZATION */}
              {/* ================================================= */}

              <div className="mb-10">

                <div className="flex justify-between items-center mb-4">

                  <h3 className="text-xl font-bold text-gray-800">
                    Leave Utilization
                  </h3>

                  <button
                    onClick={() =>
                      downloadCSV(
                        leaveUtilization.map((item) => ({
                          "Leave Type": item.leaveType,
                          "Total Requests":
                            item.totalRequests,
                          Approved: item.approved,
                          Rejected: item.rejected,
                          Pending: item.pending,
                          "Total Leave Days":
                            item.totalDays,
                        })),
                        `leave-utilization-${year}.csv`
                      )
                    }
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition"
                  >
                    Download CSV
                  </button>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

                  {leaveUtilization.length === 0 ? (

                    <div className="col-span-full bg-white p-8 rounded-xl text-center text-gray-500">
                      No leave data found.
                    </div>

                  ) : (

                    leaveUtilization.map((item) => (

                      <div
                        key={item.leaveType}
                        className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
                      >

                        <h4 className="text-lg font-bold text-gray-800 mb-4">
                          {item.leaveType}
                        </h4>

                        <div className="space-y-3 text-sm">

                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Total Requests
                            </span>

                            <span className="font-semibold">
                              {item.totalRequests}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-green-600">
                              Approved
                            </span>

                            <span className="font-semibold text-green-600">
                              {item.approved}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-red-600">
                              Rejected
                            </span>

                            <span className="font-semibold text-red-600">
                              {item.rejected}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-yellow-600">
                              Pending
                            </span>

                            <span className="font-semibold text-yellow-600">
                              {item.pending}
                            </span>
                          </div>

                          <div className="border-t pt-3 flex justify-between">
                            <span className="font-medium">
                              Total Leave Days
                            </span>

                            <span className="font-bold">
                              {item.totalDays}
                            </span>
                          </div>

                        </div>

                      </div>

                    ))
                  )}

                </div>
              </div>


              {/* ================================================= */}
              {/* DEPARTMENT STATISTICS */}
              {/* ================================================= */}

              <div className="mb-10">

                <div className="flex justify-between items-center mb-4">

                  <h3 className="text-xl font-bold text-gray-800">
                    Department-wise Employee Statistics
                  </h3>

                  <button
                    onClick={() =>
                      downloadCSV(
                        departmentStats.map(
                          (department) => ({
                            Department:
                              department.departmentName,
                            "Total Employees":
                              department.totalEmployees,
                            "Active Employees":
                              department.activeEmployees,
                            Managers:
                              department.managers,
                            "Assigned Manager":
                              department.assignedManager,
                          })
                        ),
                        `department-statistics.csv`
                      )
                    }
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition"
                  >
                    Download CSV
                  </button>

                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

                  <div className="overflow-x-auto">

                    <table className="w-full text-left">

                      <thead className="bg-gray-100">

                        <tr>

                          <th className="px-5 py-4">
                            Department
                          </th>

                          <th className="px-5 py-4">
                            Total Employees
                          </th>

                          <th className="px-5 py-4">
                            Active Employees
                          </th>

                          <th className="px-5 py-4">
                            Managers
                          </th>

                          <th className="px-5 py-4">
                            Assigned Manager
                          </th>

                        </tr>

                      </thead>

                      <tbody>

                        {departmentStats.length === 0 ? (

                          <tr>
                            <td
                              colSpan="5"
                              className="text-center py-8 text-gray-500"
                            >
                              No department data found.
                            </td>
                          </tr>

                        ) : (

                          departmentStats.map(
                            (department) => (

                              <tr
                                key={department.departmentId}
                                className="border-t hover:bg-gray-50"
                              >

                                <td className="px-5 py-4 font-medium">
                                  {department.departmentName}
                                </td>

                                <td className="px-5 py-4">
                                  {department.totalEmployees}
                                </td>

                                <td className="px-5 py-4 text-green-600 font-semibold">
                                  {department.activeEmployees}
                                </td>

                                <td className="px-5 py-4">
                                  {department.managers}
                                </td>

                                <td className="px-5 py-4">
                                  {department.assignedManager}
                                </td>

                              </tr>

                            )
                          )
                        )}

                      </tbody>

                    </table>

                  </div>

                </div>
              </div>

            </>
          )}

          {/* ==================== BACK BUTTON ==================== */}

          <div className="mt-8">

            <button
              onClick={() => router.push("/admin")}
              className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              ← Back to Dashboard
            </button>

          </div>

        </div>

      </main>
   
  );
}