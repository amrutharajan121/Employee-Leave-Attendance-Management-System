"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Profile() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchProfile = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to fetch profile");
        return;
      }

      setUser(data.user);
    } catch (error) {
      console.error("Profile error:", error);
      setMessage("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
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
              Employee Portal
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
        <div className="mb-8">
          <p className="text-blue-600 font-semibold text-sm mb-1">
            ACCOUNT SETTINGS
          </p>

          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            My Profile
          </h2>

          <p className="text-gray-500">
            View your personal and employment information.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="card text-center py-10">
            <p className="text-gray-500">
              Loading profile...
            </p>
          </div>
        )}

        {/* Error */}
        {message && (
          <div className="bg-red-100 border border-red-200 text-red-700 p-4 rounded-xl">
            {message}
          </div>
        )}

        {/* Profile */}
        {user && !loading && (
          <div className="max-w-3xl">

            <div className="card">

              {/* Profile Header */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-gray-200">

                {/* Avatar */}
                <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold shadow-md">
                  {user.name
                    ? user.name.charAt(0).toUpperCase()
                    : "U"}
                </div>

                <div className="text-center sm:text-left">
                  <h3 className="text-2xl font-bold text-gray-800">
                    {user.name}
                  </h3>

                  <p className="text-gray-500 mt-1">
                    {user.email}
                  </p>

                  <span className="inline-block mt-3 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold capitalize">
                    {user.role}
                  </span>
                </div>

              </div>

              {/* Profile Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-7">

                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 font-semibold uppercase mb-2">
                    Full Name
                  </p>

                  <p className="text-lg font-semibold text-gray-800">
                    {user.name}
                  </p>
                </div>

                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 font-semibold uppercase mb-2">
                    Email Address
                  </p>

                  <p className="text-lg font-semibold text-gray-800 break-all">
                    {user.email}
                  </p>
                </div>

                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 font-semibold uppercase mb-2">
                    Role
                  </p>

                  <p className="text-lg font-semibold text-gray-800 capitalize">
                    {user.role}
                  </p>
                </div>

                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 font-semibold uppercase mb-2">
                    Department
                  </p>

                  <p className="text-lg font-semibold text-gray-800">
                    {user.department?.name || "Not assigned"}
                  </p>
                </div>

              </div>

            </div>

          </div>
        )}

      </div>
    </main>
  );
}