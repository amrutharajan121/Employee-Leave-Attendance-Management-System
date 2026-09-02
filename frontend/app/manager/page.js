"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ManagerDashboard() {
  const router = useRouter();

  const [department, setDepartment] = useState("");
  const [managerName, setManagerName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchManagerProfile();
  }, []);

  const fetchManagerProfile = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/manager/profile`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.ok && data.manager) {
        setManagerName(data.manager.name || "");

        if (data.manager.department) {
          setDepartment(
            data.manager.department.name || "Not Assigned"
          );
        }
      }
    } catch (error) {
      console.error("Fetch manager profile error:", error);
    } finally {
      setLoading(false);
    }
  };

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
        router.push("/");
      } else {
        alert(data.message || "Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
      alert("Unable to connect to server");
    }
  };

  const features = [
    {
      title: "My Team",
      description:
        "View all employees in your department.",
      icon: "👥",
      path: "/manager/employees",
      button: "View Employees",
    },
    {
      title: "Team Attendance",
      description:
        "View attendance records of your department employees.",
      icon: "📊",
      path: "/manager/attendance",
      button: "View Attendance",
    },
    {
      title: "Pending Leave Requests",
      description:
        "Review and manage pending leave requests from your team.",
      icon: "📋",
      path: "/manager/pending-leaves",
      button: "View Requests",
    },
    {
      title: "Team Leave History",
      description:
        "View complete leave history of employees in your department.",
      icon: "📅",
      path: "/manager/leave-history",
      button: "View History",
    },
  ];

  return (
    <main className="app-container min-h-screen bg-gray-50">

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
          onClick={handleLogout}
          className="bg-white text-blue-600 px-5 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
        >
          Logout
        </button>
      </nav>

      <div className="page-container max-w-7xl mx-auto p-8">

        {/* Heading */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Manager Dashboard
          </h2>

          <p className="text-gray-600">
            Manage your team attendance and leave requests.
          </p>

          {/* Department Information */}
          <div className="mt-4 inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-lg">
            <span className="font-semibold">
              Department:
            </span>

            <span>
              {loading
                ? "Loading..."
                : department || "Not Assigned"}
            </span>
          </div>

          {managerName && (
            <p className="text-sm text-gray-500 mt-2">
              Manager: {managerName}
            </p>
          )}
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="card bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <div className="text-4xl mb-4">
                {feature.icon}
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                {feature.title}
              </h3>

              <p className="text-gray-500 mb-6">
                {feature.description}
              </p>

              <button
                onClick={() => router.push(feature.path)}
                className="primary-btn w-full"
              >
                {feature.button}
              </button>
            </div>
          ))}
        </div>

        {/* Information Section */}
        <div className="mt-10 bg-blue-600 text-white p-8 rounded-xl shadow-md">
          <h3 className="text-2xl font-bold mb-2">
            Team Management
          </h3>

          <p className="text-blue-100">
            Manage employees, attendance, and leave requests
            for your department.
          </p>

          {department && (
            <p className="text-blue-100 mt-2">
              Current Department: {department}
            </p>
          )}
        </div>

      </div>
    </main>
  );
}