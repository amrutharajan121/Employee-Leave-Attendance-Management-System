"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ManagerAttendancePage() {
  const router = useRouter();

  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/manager/attendance`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.replace("/");
          return;
        }

        if (response.status === 403) {
          setError(
            data.message || "You are not authorized to access this page"
          );
          return;
        }

        setError(
          data.message || "Failed to fetch team attendance"
        );
        return;
      }

      setAttendance(data.attendance || []);
    } catch (error) {
      console.error("Fetch team attendance error:", error);
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

  const formatTime = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatus = (record) => {
    if (record.checkIn && !record.checkOut) {
      return {
        label: "Working",
        className: "bg-green-100 text-green-700",
      };
    }

    if (record.checkIn && record.checkOut) {
      return {
        label: "Completed",
        className: "bg-blue-100 text-blue-700",
      };
    }

    if (record.status === "absent") {
      return {
        label: "Absent",
        className: "bg-red-100 text-red-700",
      };
    }

    return {
      label: "Not Available",
      className: "bg-gray-100 text-gray-700",
    };
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
              Team Attendance
            </h2>

            <p className="text-gray-600 mt-2">
              View attendance records of employees in your department.
            </p>
          </div>

          <button
            onClick={fetchAttendance}
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
              Loading attendance records...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        )}

        {/* No Records */}
        {!loading && !error && attendance.length === 0 && (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
            <p className="text-gray-500">
              No attendance records found for your department.
            </p>
          </div>
        )}

        {/* Attendance Table */}
        {!loading && !error && attendance.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      #
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Employee
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Email
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Date
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Check In
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Check Out
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {attendance.map((record, index) => {
                    const status = getStatus(record);

                    return (
                      <tr
                        key={record._id}
                        className="border-t border-gray-200 hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4 text-gray-600">
                          {index + 1}
                        </td>

                        <td className="px-6 py-4 font-medium text-gray-800">
                          {record.employee?.name || "Unknown"}
                        </td>

                        <td className="px-6 py-4 text-gray-600">
                          {record.employee?.email || "-"}
                        </td>

                        <td className="px-6 py-4 text-gray-600">
                          {formatDate(record.date)}
                        </td>

                        <td className="px-6 py-4 text-gray-600">
                          {formatTime(record.checkIn)}
                        </td>

                        <td className="px-6 py-4 text-gray-600">
                          {formatTime(record.checkOut)}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
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