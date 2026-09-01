"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PendingLeavesPage() {
  const router = useRouter();

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  const [rejectingLeave, setRejectingLeave] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchPendingLeaves();
  }, []);

  // ================= FETCH PENDING LEAVES =================

  const fetchPendingLeaves = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/manager/leaves/pending",
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.ok) {
        setLeaves(data.leaves || []);
      } else {
        setError(data.message || "Failed to fetch pending leave requests");
      }
    } catch (error) {
      console.error("Fetch pending leaves error:", error);
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  // ================= APPROVE LEAVE =================

  const handleApprove = async (leaveId) => {
    try {
      setActionLoading(leaveId);
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/manager/leaves/${leaveId}/approve`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Remove approved leave from pending list
        setLeaves((currentLeaves) =>
          currentLeaves.filter((leave) => leave._id !== leaveId)
        );
      } else {
        setError(data.message || "Failed to approve leave request");
      }
    } catch (error) {
      console.error("Approve leave error:", error);
      setError("Unable to connect to server");
    } finally {
      setActionLoading("");
    }
  };

  // ================= OPEN REJECT BOX =================

  const openRejectBox = (leave) => {
    setRejectingLeave(leave);
    setRejectionReason("");
    setError("");
  };

  // ================= REJECT LEAVE =================

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert("Please enter a reason for rejection");
      return;
    }

    if (!rejectingLeave) return;

    try {
      setActionLoading(rejectingLeave._id);
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/manager/leaves/${rejectingLeave._id}/reject`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            reason: rejectionReason,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Remove rejected leave from pending list
        setLeaves((currentLeaves) =>
          currentLeaves.filter(
            (leave) => leave._id !== rejectingLeave._id
          )
        );

        setRejectingLeave(null);
        setRejectionReason("");
      } else {
        setError(data.message || "Failed to reject leave request");
      }
    } catch (error) {
      console.error("Reject leave error:", error);
      setError("Unable to connect to server");
    } finally {
      setActionLoading("");
    }
  };

  // ================= DATE FORMAT =================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              Pending Leave Requests
            </h2>

            <p className="text-gray-600 mt-2">
              Review and manage pending leave requests from your team.
            </p>
          </div>

          <button
            onClick={fetchPendingLeaves}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Refresh
          </button>
        </div>

        {/* Error */}
        {!loading && error && (
          <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-10">
            <p className="text-gray-500">
              Loading pending leave requests...
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && leaves.length === 0 && (
          <div className="bg-white p-10 rounded-xl shadow-sm border border-gray-200 text-center">
            <div className="text-4xl mb-3">✅</div>

            <h3 className="text-xl font-semibold text-gray-700">
              No Pending Requests
            </h3>

            <p className="text-gray-500 mt-2">
              There are no pending leave requests from your team.
            </p>
          </div>
        )}

        {/* Leave Requests */}
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
                      Actions
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
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(leave._id)}
                            disabled={actionLoading === leave._id}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 disabled:bg-green-300 transition"
                          >
                            {actionLoading === leave._id
                              ? "Processing..."
                              : "Approve"}
                          </button>

                          <button
                            onClick={() => openRejectBox(leave)}
                            disabled={actionLoading === leave._id}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 disabled:bg-red-300 transition"
                          >
                            Reject
                          </button>
                        </div>
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

      {/* Reject Modal */}
      {rejectingLeave && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-800">
              Reject Leave Request
            </h3>

            <p className="text-gray-600 mt-2">
              Please provide a reason for rejecting this leave request.
            </p>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason"
              rows="4"
              className="w-full border border-gray-300 rounded-lg p-3 mt-4 outline-none focus:ring-2 focus:ring-red-400"
            />

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => {
                  setRejectingLeave(null);
                  setRejectionReason("");
                }}
                disabled={actionLoading !== ""}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={handleReject}
                disabled={actionLoading !== ""}
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 disabled:bg-red-300"
              >
                {actionLoading !== ""
                  ? "Rejecting..."
                  : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}