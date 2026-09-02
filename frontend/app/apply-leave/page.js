"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ApplyLeave() {
  const router = useRouter();

  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingLeaveTypes, setLoadingLeaveTypes] = useState(true);

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const fetchLeaveTypes = async () => {
    try {
      setLoadingLeaveTypes(true);
      setMessage("");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/leave-types`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to load leave types");
        return;
      }

      const allTypes = data.leaveTypes || [];

      // Employee should only see active leave types
      const activeTypes = allTypes.filter(
        (type) => type.isActive !== false
      );

      setLeaveTypes(activeTypes);

      if (activeTypes.length > 0) {
        setLeaveType(activeTypes[0].name);
      } else {
        setLeaveType("");
        setMessage("No active leave types available");
      }
    } catch (error) {
      console.error("Fetch leave types error:", error);
      setMessage("Unable to load leave types");
    } finally {
      setLoadingLeaveTypes(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!leaveType) {
      setMessage("Please select a leave type");
      return;
    }

    if (!startDate || !endDate || !reason.trim()) {
      setMessage("Please fill in all fields");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setMessage("Start date cannot be after end date");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/leaves`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            leaveType: leaveType,
            startDate: startDate,
            endDate: endDate,
            reason: reason.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Failed to apply for leave"
        );
        return;
      }

      setMessage("Leave application submitted successfully!");

      setStartDate("");
      setEndDate("");
      setReason("");

      if (leaveTypes.length > 0) {
        setLeaveType(leaveTypes[0].name);
      }

      setTimeout(() => {
        router.push("/employee");
      }, 1500);
    } catch (error) {
      console.error("Apply leave error:", error);
      setMessage("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="app-container">
      {/* Navbar */}
      <nav className="bg-blue-600 text-white px-8 py-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">
            Employee Leave Management
          </h1>

          <button
            onClick={() => router.push("/employee")}
            className="bg-white text-blue-600 px-5 py-2 rounded-lg font-medium hover:bg-gray-100 transition"
          >
            Dashboard
          </button>
        </div>
      </nav>

      {/* Form */}
      <div className="page-container flex justify-center">
        <div className="card w-full max-w-2xl">
          <div className="mb-8">
            <div className="text-4xl mb-3">📝</div>

            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Apply for Leave
            </h2>

            <p className="text-gray-500">
              Fill in the details below to submit your leave request.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Leave Type */}
            <div className="mb-5">
              <label className="block mb-2 font-semibold text-gray-700">
                Leave Type
              </label>

              {loadingLeaveTypes ? (
                <div className="w-full border border-gray-300 rounded-lg p-3 text-gray-500">
                  Loading leave types...
                </div>
              ) : (
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 bg-white"
                  required
                  disabled={leaveTypes.length === 0}
                >
                  <option value="">
                    Select Leave Type
                  </option>

                  {leaveTypes.map((type) => (
                    <option
                      key={type._id}
                      value={type.name}
                    >
                      {type.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block mb-2 font-semibold text-gray-700">
                  Start Date
                </label>

                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full border border-gray-300 rounded-lg p-3"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-700">
                  End Date
                </label>

                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={
                    startDate ||
                    new Date().toISOString().split("T")[0]
                  }
                  className="w-full border border-gray-300 rounded-lg p-3"
                  required
                />
              </div>
            </div>

            {/* Reason */}
            <div className="mb-6">
              <label className="block mb-2 font-semibold text-gray-700">
                Reason
              </label>

              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Briefly describe the reason for your leave..."
                rows="5"
                className="w-full border border-gray-300 rounded-lg p-3 resize-none"
                required
              />
            </div>

            {/* Message */}
            {message && (
              <div
                className={`mb-5 p-3 rounded-lg text-center font-medium ${
                  message.toLowerCase().includes("success")
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {message}
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={
                  loading ||
                  loadingLeaveTypes ||
                  leaveTypes.length === 0
                }
                className="primary-btn flex-1 disabled:opacity-60"
              >
                {loading
                  ? "Submitting..."
                  : "Submit Leave Request"}
              </button>

              <button
                type="button"
                onClick={() => router.push("/employee")}
                className="secondary-btn flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}