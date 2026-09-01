"use client";

import { useRouter } from "next/navigation";


export default function EmployeeDashboard() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/logout",
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

  return (
    
      <main className="app-container">
        {/* Navbar */}
        <nav className="bg-blue-600 text-white px-8 py-4 flex justify-between items-center shadow-md">
          <h1 className="text-xl font-bold">
            Employee Leave Management
          </h1>

          <button
            onClick={handleLogout}
            className="secondary-btn"
          >
            Logout
          </button>
        </nav>

        {/* Dashboard */}
        <div className="page-container">
          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Employee Dashboard
            </h2>

            <p className="text-gray-600">
              Manage your attendance and leave requests.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Attendance */}
            <div className="card">
              <div className="text-4xl mb-4">⏰</div>

              <h3 className="text-xl font-semibold mb-3">
                Attendance
              </h3>

              <p className="text-gray-500 mb-6">
                Check in, check out and view attendance history.
              </p>

              <button
                onClick={() => router.push("/attendance")}
                className="primary-btn w-full"
              >
                Attendance
              </button>
            </div>

            {/* Apply Leave */}
            <div className="card">
              <div className="text-4xl mb-4">📝</div>

              <h3 className="text-xl font-semibold mb-3">
                Apply for Leave
              </h3>

              <p className="text-gray-500 mb-6">
                Submit a new leave request quickly and easily.
              </p>

              <button
                onClick={() => router.push("/apply-leave")}
                className="primary-btn w-full"
              >
                Apply Leave
              </button>
            </div>

            {/* My Leaves */}
            <div className="card">
              <div className="text-4xl mb-4">📅</div>

              <h3 className="text-xl font-semibold mb-3">
                My Leaves
              </h3>

              <p className="text-gray-500 mb-6">
                View previous leave requests and their status.
              </p>

              <button
                onClick={() => router.push("/my-leaves")}
                className="primary-btn w-full"
              >
                View Leaves
              </button>
            </div>

            {/* Leave Balance */}
            <div className="card">
              <div className="text-4xl mb-4">⚖️</div>

              <h3 className="text-xl font-semibold mb-3">
                Leave Balance
              </h3>

              <p className="text-gray-500 mb-6">
                Check your available and remaining leave days.
              </p>

              <button
                onClick={() => router.push("/leave-balance")}
                className="primary-btn w-full"
              >
                View Balance
              </button>
            </div>

            {/* Profile */}
            <div className="card">
              <div className="text-4xl mb-4">👤</div>

              <h3 className="text-xl font-semibold mb-3">
                My Profile
              </h3>

              <p className="text-gray-500 mb-6">
                View your employee and account information.
              </p>

              <button
                onClick={() => router.push("/profile")}
                className="primary-btn w-full"
              >
                View Profile
              </button>
            </div>

          </div>

          {/* Quick Action */}
          <div className="card mt-10 bg-blue-600 text-white border-none">
            <h3 className="text-2xl font-bold mb-2">
              Need some time off?
            </h3>

            <p className="mb-5 text-blue-100">
              Submit your leave request and track its approval status anytime.
            </p>

            <button
              onClick={() => router.push("/apply-leave")}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Apply Now
            </button>
          </div>
        </div>
      </main>
    
  );
}