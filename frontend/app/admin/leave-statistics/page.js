"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";


export default function LeaveStatisticsPage() {
  const router = useRouter();

  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchLeaveStatistics();
  }, []);

  const fetchLeaveStatistics = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/statistics/leaves`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Failed to fetch leave statistics"
        );
        return;
      }

      setStatistics(data.statistics);
    } catch (error) {
      console.error("Leave statistics error:", error);
      setMessage("Unable to connect to server");
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

        <div className="max-w-7xl mx-auto p-8">

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800">
              Leave Statistics
            </h2>

            <p className="text-gray-600 mt-2">
              Overview of leave requests across the organization.
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <p className="text-gray-500">
                Loading leave statistics...
              </p>
            </div>
          )}

          {/* Error */}
          {!loading && message && (
            <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-lg">
              {message}
            </div>
          )}

          {/* Statistics */}
          {!loading && !message && statistics && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

                {/* Total */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="text-3xl mb-3">📋</div>

                  <p className="text-gray-500 text-sm">
                    Total Leave Requests
                  </p>

                  <h3 className="text-3xl font-bold text-gray-800 mt-2">
                    {statistics.totalLeaves}
                  </h3>
                </div>

                {/* Pending */}
                <div className="bg-yellow-50 p-6 rounded-xl shadow-sm border border-yellow-200">
                  <div className="text-3xl mb-3">⏳</div>

                  <p className="text-yellow-700 text-sm">
                    Pending Requests
                  </p>

                  <h3 className="text-3xl font-bold text-yellow-700 mt-2">
                    {statistics.pendingLeaves}
                  </h3>
                </div>

                {/* Approved */}
                <div className="bg-green-50 p-6 rounded-xl shadow-sm border border-green-200">
                  <div className="text-3xl mb-3">✅</div>

                  <p className="text-green-700 text-sm">
                    Approved Requests
                  </p>

                  <h3 className="text-3xl font-bold text-green-700 mt-2">
                    {statistics.approvedLeaves}
                  </h3>
                </div>

                {/* Rejected */}
                <div className="bg-red-50 p-6 rounded-xl shadow-sm border border-red-200">
                  <div className="text-3xl mb-3">❌</div>

                  <p className="text-red-700 text-sm">
                    Rejected Requests
                  </p>

                  <h3 className="text-3xl font-bold text-red-700 mt-2">
                    {statistics.rejectedLeaves}
                  </h3>
                </div>

              </div>

              {/* Leave Type Statistics */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

                <div className="p-6 border-b">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Leave Type Statistics
                  </h3>

                  <p className="text-gray-500 text-sm mt-1">
                    Breakdown of leave requests based on leave type.
                  </p>
                </div>

                {!statistics.leaveTypeStatistics ||
                statistics.leaveTypeStatistics.length === 0 ? (
                  <div className="p-10 text-center">
                    <p className="text-gray-500">
                      No leave records available.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">

                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                            Leave Type
                          </th>

                          <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                            Total
                          </th>

                          <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                            Pending
                          </th>

                          <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                            Approved
                          </th>

                          <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                            Rejected
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {statistics.leaveTypeStatistics.map((item) => (
                          <tr
                            key={item.leaveType}
                            className="border-t hover:bg-gray-50"
                          >
                            <td className="px-6 py-4 font-medium text-gray-800">
                              {item.leaveType}
                            </td>

                            <td className="px-6 py-4 text-gray-700">
                              {item.total}
                            </td>

                            <td className="px-6 py-4">
                              <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
                                {item.pending}
                              </span>
                            </td>

                            <td className="px-6 py-4">
                              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                                {item.approved}
                              </span>
                            </td>

                            <td className="px-6 py-4">
                              <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                                {item.rejected}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>

                    </table>
                  </div>
                )}
              </div>

              {/* Back Button */}
              <div className="mt-8">
                <button
                  onClick={() => router.push("/admin")}
                  className="bg-gray-700 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-800 transition"
                >
                  ← Back to Dashboard
                </button>
              </div>
            </>
          )}

        </div>
      </main>
    
  );
}