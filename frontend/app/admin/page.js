"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();

  const [summary, setSummary] = useState({
    totalEmployees: 0,
    totalDepartments: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
    presentToday: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardSummary();
  }, []);

  // ==================== FETCH DASHBOARD SUMMARY ====================

  const fetchDashboardSummary = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/statistics/dashboard-summary`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setSummary({
          totalEmployees: data.summary?.totalEmployees || 0,
          totalDepartments: data.summary?.totalDepartments || 0,
          pendingLeaves: data.summary?.pendingLeaves || 0,
          approvedLeaves: data.summary?.approvedLeaves || 0,
          presentToday: data.summary?.presentToday || 0,
        });
      } else {
        console.error(
          data.message || "Failed to fetch dashboard summary"
        );
      }
    } catch (error) {
      console.error("Dashboard summary error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ==================== LOGOUT ====================

 const handleLogout = async () => {
  try {
    const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`,
  {
    method: "POST",
    credentials: "include",
  }
);

    const data = await response.json();

    if (response.ok) {
      router.replace("/");
    } else {
      alert(data.message || "Logout failed");
    }
  } catch (error) {
    console.error("Logout error:", error);
    alert("Unable to connect to server");
  }
};
  // ==================== DASHBOARD FEATURES ====================

  const features = [
    {
      title: "Employee Management",
      description: "Create, view and manage employee accounts.",
      icon: "👥",
      path: "/admin/employees",
      button: "Manage Employees",
    },
    {
      title: "Departments",
      description: "Create and manage departments in the organization.",
      icon: "🏢",
      path: "/admin/departments",
      button: "Manage Departments",
    },
    {
      title: "Leave Types",
      description:
        "Create, activate, deactivate and manage available leave types.",
      icon: "📋",
      path: "/admin/leave-types",
      button: "Manage Leave Types",
    },
    {
      title: "Leave Configuration",
      description: "Configure leave types and annual leave limits.",
      icon: "⚙️",
      path: "/admin/leave-settings",
      button: "Configure Leaves",
    },
    {
      title: "Attendance Statistics",
      description: "View organization-wide attendance statistics.",
      icon: "📊",
      path: "/admin/attendance-statistics",
      button: "View Statistics",
    },
    {
      title: "Leave Statistics",
      description: "View organization-wide leave statistics.",
      icon: "📈",
      path: "/admin/leave-statistics",
      button: "View Statistics",
    },

    {
  title: "Reports",
  description:
    "View attendance, leave utilization, department statistics and export reports as CSV.",
  icon: "📑",
  path: "/admin/reports",
  button: "View Reports",
},
  ];

  // ==================== SUMMARY CARDS ====================

  const summaryCards = [
    {
      title: "Total Employees",
      value: summary.totalEmployees,
      icon: "👥",
    },
    {
      title: "Total Departments",
      value: summary.totalDepartments,
      icon: "🏢",
    },
    {
      title: "Pending Leaves",
      value: summary.pendingLeaves,
      icon: "⏳",
    },
    {
      title: "Approved Leaves",
      value: summary.approvedLeaves,
      icon: "✅",
    },
    {
      title: "Present Today",
      value: summary.presentToday,
      icon: "📅",
    },

  ];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* ==================== NAVBAR ==================== */}

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
          onClick={handleLogout}
          className="bg-white text-blue-700 px-5 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
        >
          Logout
        </button>
      </nav>

      {/* ==================== MAIN CONTENT ==================== */}

      <div className="max-w-7xl mx-auto p-8">
        {/* HEADER */}

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">
            Admin Dashboard
          </h2>

          <p className="text-gray-600 mt-2">
            Manage employees, departments, leave policies and organization
            statistics.
          </p>
        </div>

        {/* ==================== ORGANIZATION OVERVIEW ==================== */}

        <div className="mb-10">
          <h3 className="text-xl font-semibold text-gray-800 mb-5">
            Organization Overview
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {summaryCards.map((card) => (
              <div
                key={card.title}
                className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition"
              >
                <div className="text-3xl mb-3">
                  {card.icon}
                </div>

                <p className="text-sm text-gray-500">
                  {card.title}
                </p>

                <h3 className="text-3xl font-bold text-gray-800 mt-1">
                  {loading ? "..." : card.value}
                </h3>
              </div>
            ))}
          </div>
        </div>

        {/* ==================== MANAGEMENT FEATURES ==================== */}

        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800">
            Management
          </h3>

          <p className="text-gray-500 mt-1">
            Access and manage different areas of the organization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition"
            >
              <div className="text-4xl mb-4">
                {feature.icon}
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                {feature.title}
              </h3>

              <p className="text-gray-500 mb-6 min-h-[48px]">
                {feature.description}
              </p>

              <button
                onClick={() => router.push(feature.path)}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                {feature.button}
              </button>
            </div>
          ))}
        </div>

        {/* ==================== BOTTOM BANNER ==================== */}

        <div className="mt-10 bg-blue-700 text-white p-8 rounded-xl shadow-md">
          <h3 className="text-2xl font-bold mb-2">
            Organization Management
          </h3>

          <p className="text-blue-100">
            Manage your workforce, configure leave policies, manage leave
            types, and monitor organization-wide attendance and leave
            activity.
          </p>
        </div>
      </div>
    </main>
  );
}