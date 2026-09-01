"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function TeamLeaveHistoryPage() {
  const router = useRouter();

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLeaveHistory();
  }, []);

  const fetchLeaveHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/manager/leaves/history",
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.ok) {
        setLeaves(data.leaves || []);
      } else {
        setError(
          data.message || "Failed to fetch team leave history"
        );
      }
    } catch (error) {
      console.error("Fetch team leave history error:", error);
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700";

      case "rejected":
        return "bg-red-100 text-red-700";

      case "pending":
        return "bg-yellow-100 text-yellow-700";

      case "cancelled":
        return "bg-gray-200 text-gray-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-blue-600 text-white px-8 py-4 flex justify-between items-center shadow-md">
        <div>
          <h1 className="text-xl font-bold">
            Employee Leave Management
          </h1>

          <p className="text-sm text-blue-100">
            Manager Portal
          </p>
        </div>

        <button
          onClick={() => router.push("/manager")}
          className="bg-white text-blue-600 px-5 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
        >
          Dashboard
        </button>
      </nav>

      <div className="max-w-7xl mx-auto p-8">
        {/* Heading */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              Team Leave History
            </h2>

            <p className="text-gray-600 mt-2">
              View all leave requests from employees in your department.
            </p>
          </div>

          <button
            onClick={fetchLeaveHistory}
            disabled={loading}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300 transition"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-white p-10 rounded-xl shadow-sm border border-gray-200 text-center">
            <p className="text-gray-500">
              Loading leave history...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* No Leave Records */}
        {!loading && !error && leaves.length === 0 && (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
            <div className="text-4xl mb-3">📋</div>

            <p className="text-gray-500">
              No leave history found.
            </p>
          </div>
        )}

        {/* Leave History Table */}
        {!loading && !error && leaves.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-5 py-4 text-sm font-semibold text-gray-700">
                      #
                    </th>

                    <th className="px-5 py-4 text-sm font-semibold text-gray-700">
                      Employee
                    </th>

                    <th className="px-5 py-4 text-sm font-semibold text-gray-700">
                      Leave Type
                    </th>

                    <th className="px-5 py-4 text-sm font-semibold text-gray-700">
                      Start Date
                    </th>

                    <th className="px-5 py-4 text-sm font-semibold text-gray-700">
                      End Date
                    </th>

                    <th className="px-5 py-4 text-sm font-semibold text-gray-700">
                      Reason
                    </th>

                    <th className="px-5 py-4 text-sm font-semibold text-gray-700">
                      Status
                    </th>

                    <th className="px-5 py-4 text-sm font-semibold text-gray-700">
                      Manager Comment
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {leaves.map((leave, index) => (
                    <tr
                      key={leave._id}
                      className="border-t border-gray-200 hover:bg-gray-50"
                    >
                      <td className="px-5 py-4 text-gray-600">
                        {index + 1}
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-800">
                          {leave.employee?.name || "Unknown"}
                        </p>

                        <p className="text-sm text-gray-500">
                          {leave.employee?.email || ""}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-gray-700">
                        {leave.leaveType}
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {formatDate(leave.startDate)}
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {formatDate(leave.endDate)}
                      </td>

                      <td className="px-5 py-4 text-gray-600 max-w-xs">
                        {leave.reason}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusStyle(
                            leave.status
                          )}`}
                        >
                          {leave.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {leave.adminComment || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="mt-8">
          <button
            onClick={() => router.push("/manager")}
            className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 transition"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </main>
  );
}