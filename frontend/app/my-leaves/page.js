"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function MyLeaves() {
  const router = useRouter();

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Fetch all leaves
  const fetchLeaves = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/leaves/my`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to fetch leaves");
        return;
      }

      setLeaves(data.leaves || []);
    } catch (error) {
      console.error("Fetch leaves error:", error);
      setMessage("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  // Cancel leave
  const cancelLeave = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this leave request?"
    );

    if (!confirmed) return;

    try {
      setMessage("");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/leaves/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to cancel leave");
        return;
      }

      setMessage(data.message || "Leave cancelled successfully");

      fetchLeaves();
    } catch (error) {
      console.error("Cancel leave error:", error);
      setMessage("Unable to connect to server");
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  return (
    <main className="app-container">
      
      {/* Navbar */}
      <nav className="bg-blue-600 text-white px-8 py-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">
              Employee Leave Management
            </h1>
            <p className="text-xs text-blue-100">
              Manage your leave requests
            </p>
          </div>

          <button
            onClick={() => router.push("/employee")}
            className="bg-white text-blue-600 px-5 py-2 rounded-lg font-medium hover:bg-gray-100 transition"
          >
            Dashboard
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="page-container">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-blue-600 font-semibold text-sm mb-1">
              LEAVE MANAGEMENT
            </p>

            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              My Leave Requests
            </h2>

            <p className="text-gray-500">
              Track and manage all your leave applications.
            </p>
          </div>

          <button
            onClick={() => router.push("/apply-leave")}
            className="primary-btn"
          >
            + Apply Leave
          </button>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl font-medium ${
              message.toLowerCase().includes("success")
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-red-100 text-red-700 border border-red-200"
            }`}
          >
            {message}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="card text-center py-10">
            <p className="text-gray-500">Loading your leave requests...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && leaves.length === 0 && (
          <div className="card text-center py-12">
            <div className="text-5xl mb-4">📅</div>

            <h3 className="text-xl font-bold text-gray-800 mb-2">
              No Leave Requests Yet
            </h3>

            <p className="text-gray-500 mb-6">
              You haven't applied for any leave yet.
            </p>

            <button
              onClick={() => router.push("/apply-leave")}
              className="primary-btn"
            >
              Apply for Leave
            </button>
          </div>
        )}

        {/* Leave Cards */}
        {!loading && leaves.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {leaves.map((leave) => (
              <div
                key={leave._id}
                className="card"
              >
                {/* Card Header */}
                <div className="flex justify-between items-start mb-5">

                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {leave.leaveType} Leave
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      Leave Request
                    </p>
                  </div>

                  <span
                    className={
                      leave.status === "pending"
                        ? "status-pending"
                        : leave.status === "approved"
                        ? "status-approved"
                        : "status-rejected"
                    }
                  >
                    {leave.status.charAt(0).toUpperCase() +
                      leave.status.slice(1)}
                  </span>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4 mb-5">

                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">
                      START DATE
                    </p>

                    <p className="font-semibold text-gray-800">
                      {new Date(
                        leave.startDate
                      ).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">
                      END DATE
                    </p>

                    <p className="font-semibold text-gray-800">
                      {new Date(
                        leave.endDate
                      ).toLocaleDateString()}
                    </p>
                  </div>

                </div>

                {/* Reason */}
                <div className="border-t pt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    Reason
                  </p>

                  <p className="text-gray-500 leading-relaxed">
                    {leave.reason}
                  </p>
                </div>

                {/* Cancel Button */}
                {leave.status === "pending" && (
                  <button
                    onClick={() => cancelLeave(leave._id)}
                    className="danger-btn mt-5"
                  >
                    Cancel Leave
                  </button>
                )}

              </div>
            ))}

          </div>
        )}

      </div>
    </main>
  );
}