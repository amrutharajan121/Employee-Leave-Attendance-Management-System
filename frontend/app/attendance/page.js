"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";


export default function AttendancePage() {
  const router = useRouter();

  const [todayAttendance, setTodayAttendance] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);

      const [todayResponse, historyResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/attendance/today`, {
          method: "GET",
          credentials: "include",
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/attendance/my`, {
          method: "GET",
          credentials: "include",
        }),
      ]);

      const todayData = await todayResponse.json();
      const historyData = await historyResponse.json();

      if (todayResponse.ok) {
        setTodayAttendance(todayData.attendance);
      }

      if (historyResponse.ok) {
        setAttendanceHistory(historyData.attendance || []);
      }

      if (!todayResponse.ok || !historyResponse.ok) {
        setMessage("Failed to load attendance data");
      }
    } catch (error) {
      console.error("Attendance fetch error:", error);
      setMessage("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      setMessage("");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/attendance/check-in`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Check-in failed");
        return;
      }

      setMessage("Check-in successful!");
      fetchAttendanceData();
    } catch (error) {
      console.error("Check-in error:", error);
      setMessage("Unable to connect to server");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      setMessage("");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/attendance/check-out`,
        {
          method: "PUT",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Check-out failed");
        return;
      }

      setMessage("Check-out successful!");
      fetchAttendanceData();
    } catch (error) {
      console.error("Check-out error:", error);
      setMessage("Unable to connect to server");
    } finally {
      setActionLoading(false);
    }
  };

  const formatTime = (dateTime) => {
    if (!dateTime) return "--";

    return new Date(dateTime).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    
      <main className="app-container min-h-screen bg-gray-100">

        {/* Navbar */}
        <nav className="bg-blue-600 text-white px-8 py-4 flex justify-between items-center shadow-md">
          <h1 className="text-xl font-bold">
            Employee Leave Management
          </h1>

          <button
            onClick={() => router.push("/employee")}
            className="secondary-btn"
          >
            Dashboard
          </button>
        </nav>

        <div className="page-container p-8">

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Attendance
            </h2>

            <p className="text-gray-600">
              Check in, check out and view your attendance history.
            </p>
          </div>

          {/* Message */}
          {message && (
            <div className="bg-white border p-4 rounded-lg mb-6 shadow-sm">
              {message}
            </div>
          )}

          {loading ? (
            <p className="text-gray-600">Loading attendance...</p>
          ) : (
            <>
              {/* Today's Attendance */}
              <div className="card mb-8">
                <h3 className="text-xl font-semibold mb-6">
                  Today's Attendance
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                  <div className="bg-gray-50 p-5 rounded-lg">
                    <p className="text-gray-500 mb-2">
                      Check In
                    </p>

                    <p className="text-2xl font-bold text-green-600">
                      {todayAttendance?.checkIn
                        ? formatTime(todayAttendance.checkIn)
                        : "--"}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-5 rounded-lg">
                    <p className="text-gray-500 mb-2">
                      Check Out
                    </p>

                    <p className="text-2xl font-bold text-red-600">
                      {todayAttendance?.checkOut
                        ? formatTime(todayAttendance.checkOut)
                        : "--"}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-5 rounded-lg">
                    <p className="text-gray-500 mb-2">
                      Status
                    </p>

                    <p className="text-2xl font-bold text-blue-600 capitalize">
                      {todayAttendance?.status || "Not checked in"}
                    </p>
                  </div>

                </div>

                {/* Attendance Actions */}
                <div className="flex gap-4 mt-6">

                  {!todayAttendance && (
                    <button
                      onClick={handleCheckIn}
                      disabled={actionLoading}
                      className="primary-btn"
                    >
                      {actionLoading
                        ? "Processing..."
                        : "Check In"}
                    </button>
                  )}

                  {todayAttendance && !todayAttendance.checkOut && (
                    <button
                      onClick={handleCheckOut}
                      disabled={actionLoading}
                      className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-400"
                    >
                      {actionLoading
                        ? "Processing..."
                        : "Check Out"}
                    </button>
                  )}

                  {todayAttendance?.checkOut && (
                    <p className="text-green-600 font-semibold py-3">
                      ✓ Attendance completed for today
                    </p>
                  )}

                </div>
              </div>

              {/* Attendance History */}
              <div className="card">
                <h3 className="text-xl font-semibold mb-6">
                  Attendance History
                </h3>

                {attendanceHistory.length === 0 ? (
                  <p className="text-gray-500">
                    No attendance records found.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b">
                          <th className="p-3">Date</th>
                          <th className="p-3">Check In</th>
                          <th className="p-3">Check Out</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>

                      <tbody>
                        {attendanceHistory.map((record) => (
                          <tr
                            key={record._id}
                            className="border-b hover:bg-gray-50"
                          >
                            <td className="p-3">
                              {new Date(
                                record.date
                              ).toLocaleDateString()}
                            </td>

                            <td className="p-3">
                              {formatTime(record.checkIn)}
                            </td>

                            <td className="p-3">
                              {formatTime(record.checkOut)}
                            </td>

                            <td className="p-3">
                              <span className="capitalize px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">
                                {record.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    
  );
}