"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LeaveSettingsPage() {
  const router = useRouter();

  // Old/default leave types
  const defaultLeaveTypes = [
    {
      id: "casual",
      key: "casual",
      name: "Casual Leave",
      defaultLimit: 12,
    },
    {
      id: "sick",
      key: "sick",
      name: "Sick Leave",
      defaultLimit: 10,
    },
    {
      id: "annual",
      key: "annual",
      name: "Annual Leave",
      defaultLimit: 15,
    },
    {
      id: "other",
      key: "other",
      name: "Other Leave",
      defaultLimit: 5,
    },
  ];

  const [leaveTypes, setLeaveTypes] = useState(defaultLeaveTypes);

  const [settings, setSettings] = useState({
    casual: 12,
    sick: 10,
    annual: 15,
    other: 5,
  });

  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // ==================== FETCH SETTINGS + ALL LEAVE TYPES ====================

  useEffect(() => {
    fetchLeaveData();
  }, []);

  const fetchLeaveData = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      // Fetch old leave settings and dynamically created leave types
      const [settingsResponse, leaveTypesResponse] = await Promise.all([
        fetch(`${API_URL}/api/admin/leave-settings`, {
          method: "GET",
          credentials: "include",
        }),
        fetch(`${API_URL}/api/leave-types`, {
          method: "GET",
          credentials: "include",
        }),
      ]);

      const settingsData = await settingsResponse.json();
      const leaveTypesData = await leaveTypesResponse.json();

      // ==================== LOAD OLD SETTINGS ====================

      const updatedSettings = {
        casual: 12,
        sick: 10,
        annual: 15,
        other: 5,
      };

      if (settingsResponse.ok && settingsData.success) {
        updatedSettings.casual =
          settingsData.settings.casual ?? 12;

        updatedSettings.sick =
          settingsData.settings.sick ?? 10;

        updatedSettings.annual =
          settingsData.settings.annual ?? 15;

        updatedSettings.other =
          settingsData.settings.other ?? 5;

        setYear(
          settingsData.settings.year ||
            new Date().getFullYear()
        );
      } else {
        console.warn(
          "Could not load leave settings:",
          settingsData.message
        );
      }

      // ==================== GET DYNAMIC LEAVE TYPES ====================

      let apiLeaveTypes = [];

      if (leaveTypesResponse.ok) {
        apiLeaveTypes =
          leaveTypesData.leaveTypes ||
          leaveTypesData.data ||
          [];

        if (!Array.isArray(apiLeaveTypes)) {
          apiLeaveTypes = [];
        }
      } else {
        console.warn(
          "Could not load leave types:",
          leaveTypesData.message
        );
      }

      // Start with old/default leave types
      const combinedLeaveTypes = [...defaultLeaveTypes];

      // Add newly created leave types
      apiLeaveTypes.forEach((type) => {
        const typeName =
          type.name ||
          type.leaveTypeName ||
          "";

        if (!typeName) return;

        // Check if the leave type already exists
        const alreadyExists = combinedLeaveTypes.some(
          (existingType) =>
            existingType.name.toLowerCase() ===
            typeName.toLowerCase()
        );

        // Add only new leave types
        if (!alreadyExists) {
          const dynamicId =
            type._id ||
            type.id ||
            typeName
              .toLowerCase()
              .replace(/\s+/g, "-");

          const dynamicKey = `dynamic_${dynamicId}`;

          combinedLeaveTypes.push({
            id: dynamicId,
            key: dynamicKey,
            name: typeName,
            defaultLimit:
              type.annualLimit ??
              type.limit ??
              0,
          });

          // Add newly created leave type limit
          updatedSettings[dynamicKey] =
            type.annualLimit ??
            type.limit ??
            0;
        }
      });

      setLeaveTypes(combinedLeaveTypes);
      setSettings(updatedSettings);

      // Set current year if backend doesn't provide it
      if (
        !settingsResponse.ok ||
        !settingsData.settings?.year
      ) {
        setYear(new Date().getFullYear());
      }
    } catch (error) {
      console.error("Fetch leave data error:", error);
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  // ==================== HANDLE INPUT CHANGE ====================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setSettings((previous) => ({
      ...previous,
      [name]: value === "" ? 0 : Number(value),
    }));
  };

  // ==================== UPDATE LEAVE SETTINGS ====================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      // Prepare dynamically created leave type limits
      const dynamicLeaveLimits = leaveTypes
        .filter(
          (type) =>
            !["casual", "sick", "annual", "other"].includes(
              type.key
            )
        )
        .map((type) => ({
          leaveTypeId: type.id,
          name: type.name,
          annualLimit: Number(settings[type.key]) || 0,
        }));

      const response = await fetch(
        `${API_URL}/api/admin/leave-settings`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            // Existing old leave settings
            casual: Number(settings.casual),
            sick: Number(settings.sick),
            annual: Number(settings.annual),
            other: Number(settings.other),

            // Newly created leave type settings
            dynamicLeaveLimits,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage(
          data.message ||
            "Leave settings updated successfully"
        );

        setYear(
          data.settings?.year ||
            new Date().getFullYear()
        );
      } else {
        setError(
          data.message ||
            "Failed to update leave settings"
        );
      }
    } catch (error) {
      console.error("Update leave settings error:", error);
      setError("Unable to connect to server");
    } finally {
      setSaving(false);
    }
  };

  // ==================== RESET ====================

  const handleReset = () => {
    fetchLeaveData();
  };

  // ==================== LOADING SCREEN ====================

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 text-lg">
          Loading leave settings...
        </p>
      </main>
    );
  }

  // ==================== PAGE ====================

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

      <div className="max-w-4xl mx-auto p-8">
        {/* Heading */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">
            Leave Configuration
          </h2>

          <p className="text-gray-600 mt-2">
            Configure leave limits for all leave categories.
          </p>

          {year && (
            <p className="text-sm text-blue-600 font-medium mt-2">
              Leave policy for the year {year}
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Success */}
        {message && (
          <div className="bg-green-100 border border-green-300 text-green-700 p-4 rounded-lg mb-6">
            {message}
          </div>
        )}

        {/* Settings Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">
            Leave Limits
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* DYNAMICALLY DISPLAY ALL LEAVE TYPES */}
              {leaveTypes.map((type) => (
                <div key={type.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {type.name}
                  </label>

                  <input
                    type="number"
                    name={type.key}
                    min="0"
                    value={settings[type.key] ?? 0}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <p className="text-sm text-gray-500 mt-1">
                    Maximum {type.name.toLowerCase()} days per year
                  </p>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="mt-8 flex flex-wrap gap-4">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {saving
                  ? "Saving..."
                  : "Save Leave Settings"}
              </button>

              <button
                type="button"
                onClick={handleReset}
                disabled={saving}
                className="border border-gray-300 px-6 py-3 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Information */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-800 mb-2">
            ℹ️ Important
          </h3>

          <p className="text-blue-700 text-sm">
            These limits represent the maximum number of leave days
            available to each employee for the selected year. All
            newly created leave types will automatically appear here.
          </p>
        </div>

        {/* Back Button */}
        <div className="mt-8">
          <button
            onClick={() => router.push("/admin")}
            className="border border-gray-300 px-6 py-3 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 transition"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </main>
  );
}