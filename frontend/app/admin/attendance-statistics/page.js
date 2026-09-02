"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AttendanceStatisticsPage() {
  const router = useRouter();

  const [statistics, setStatistics] = useState({
    totalEmployees: 0,
    present: 0,
    absent: 0,
    attendancePercentage: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==================== FETCH STATISTICS ====================

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/statistics/attendance",
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.ok) {
        setStatistics(data.statistics);
      } else {
        setError(
          data.message || "Failed to fetch attendance statistics"
        );
      }
    } catch (error) {
      console.error("Fetch attendance statistics error:", error);
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navbar */}
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

      <div className="max-w-6xl mx-auto p-8">
        {/* Heading */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              Attendance Statistics
            </h2>

            <p className="text-gray-600 mt-2">
              Organization-wide attendance overview for today.
            </p>
          </div>

          <button
            onClick={fetchStatistics}
            className="secondary-btn"
          >
            Refresh
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="text-center py-16">
            <p className="text-gray-500">
              Loading attendance statistics...
            </p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Employees */}
              <div className="card">
                <div className="text-4xl mb-4">👥</div>

                <p className="text-gray-500 font-medium">
                  Total Employees
                </p>

                <h3 className="text-4xl font-bold text-gray-800 mt-2">
                  {statistics.totalEmployees}
                </h3>
              </div>

              {/* Present */}
              <div className="card">
                <div className="text-4xl mb-4">✅</div>

                <p className="text-gray-500 font-medium">
                  Present Today
                </p>

                <h3 className="text-4xl font-bold text-green-600 mt-2">
                  {statistics.present}
                </h3>
              </div>

              {/* Absent */}
              <div className="card">
                <div className="text-4xl mb-4">❌</div>

                <p className="text-gray-500 font-medium">
                  Absent Today
                </p>

                <h3 className="text-4xl font-bold text-red-600 mt-2">
                  {statistics.absent}
                </h3>
              </div>

              {/* Attendance Percentage */}
              <div className="card">
                <div className="text-4xl mb-4">📊</div>

                <p className="text-gray-500 font-medium">
                  Attendance Rate
                </p>

                <h3 className="text-4xl font-bold text-blue-600 mt-2">
                  {statistics.attendancePercentage}%
                </h3>
              </div>
            </div>

            {/* Summary Card */}
            <div className="card mt-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Today's Attendance Summary
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">
                      Overall Attendance
                    </span>

                    <span className="font-semibold">
                      {statistics.attendancePercentage}%
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-blue-600 h-4 rounded-full transition-all duration-500"
                      style={{
                        width: `${statistics.attendancePercentage}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">
                      Total Workforce
                    </p>
                    <p className="text-2xl font-bold">
                      {statistics.totalEmployees}
                    </p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">
                      Employees Present
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {statistics.present}
                    </p>
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">
                      Employees Absent
                    </p>
                    <p className="text-2xl font-bold text-red-600">
                      {statistics.absent}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Back Button */}
        <div className="mt-8">
          <button
            onClick={() => router.push("/admin")}
            className="secondary-btn"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </main>
  );
}