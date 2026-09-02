"use client";

import { useEffect, useState } from "react";

export default function LeaveTypesPage() {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [name, setName] = useState("");
  const [annualLimit, setAnnualLimit] = useState("");
  const [description, setDescription] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ================= FETCH LEAVE TYPES =================

  const fetchLeaveTypes = async () => {
    try {
      setError("");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/leave-types`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // Do not throw error here, otherwise Next.js shows error overlay
        setError(data.message || "Failed to fetch leave types");
        setLeaveTypes([]);
        return;
      }

      setLeaveTypes(data.leaveTypes || []);
    } catch (err) {
      console.error("Fetch leave types error:", err);
      setError("Unable to connect to server");
      setLeaveTypes([]);
    }
  };

  // ================= LOAD DATA =================

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  // ================= CREATE LEAVE TYPE =================

  const handleCreate = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!name.trim() || !annualLimit) {
      setError("Leave type name and annual limit are required");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/leave-types`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name: name.trim(),
            annualLimit: Number(annualLimit),
            description: description.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to create leave type");
        return;
      }

      setMessage("Leave type created successfully");

      setName("");
      setAnnualLimit("");
      setDescription("");

      await fetchLeaveTypes();
    } catch (err) {
      console.error("Create leave type error:", err);
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  // ================= TOGGLE STATUS =================

  const toggleStatus = async (id) => {
    try {
      setError("");
      setMessage("");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/leave-types/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to update leave type status");
        return;
      }

      setMessage("Leave type status updated successfully");

      await fetchLeaveTypes();
    } catch (err) {
      console.error("Toggle status error:", err);
      setError("Unable to connect to server");
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* PAGE HEADER */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            Leave Type Management
          </h1>

          <p className="text-gray-600 mt-1">
            Create and manage available leave types.
          </p>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-5 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* SUCCESS MESSAGE */}
        {message && (
          <div className="mb-5 bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-lg">
            {message}
          </div>
        )}

        {/* CREATE FORM */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Add New Leave Type
          </h2>

          <form onSubmit={handleCreate}>
            {/* NAME */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Leave Type Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter leave type name"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* ANNUAL LIMIT */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Annual Limit (Days)
              </label>

              <input
                type="number"
                min="1"
                value={annualLimit}
                onChange={(e) => setAnnualLimit(e.target.value)}
                placeholder="Enter annual leave limit"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* DESCRIPTION */}
            <div className="mb-5">
              <label className="block text-gray-700 font-medium mb-2">
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description"
                rows="4"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition disabled:bg-blue-400"
            >
              {loading ? "Creating..." : "Create Leave Type"}
            </button>
          </form>
        </div>

        {/* LEAVE TYPES TABLE */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-4">#</th>
                <th className="text-left px-4 py-4">Leave Type</th>
                <th className="text-left px-4 py-4">Annual Limit</th>
                <th className="text-left px-4 py-4">Description</th>
                <th className="text-left px-4 py-4">Status</th>
                <th className="text-left px-4 py-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {leaveTypes.length > 0 ? (
                leaveTypes.map((leaveType, index) => (
                  <tr
                    key={leaveType._id}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="px-4 py-4">{index + 1}</td>

                    <td className="px-4 py-4 font-medium">
                      {leaveType.name}
                    </td>

                    <td className="px-4 py-4">
                      {leaveType.annualLimit} days
                    </td>

                    <td className="px-4 py-4">
                      {leaveType.description || "-"}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          leaveType.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {leaveType.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <button
                        onClick={() => toggleStatus(leaveType._id)}
                        className={`px-4 py-2 rounded-lg text-white font-medium ${
                          leaveType.isActive
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                      >
                        {leaveType.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-8 text-gray-500"
                  >
                    No leave types found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}