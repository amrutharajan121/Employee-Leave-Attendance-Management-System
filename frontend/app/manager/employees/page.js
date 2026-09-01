"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ManagerEmployeesPage() {
  const router = useRouter();

  const [employees, setEmployees] = useState([]);
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/manager/employees",
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Failed to fetch department employees"
        );
        return;
      }

      setEmployees(data.employees || []);
      setDepartment(data.department || "");
    } catch (error) {
      console.error("Fetch employees error:", error);
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
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
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              My Team
            </h2>

            <p className="text-gray-600 mt-2">
              View employees in your department.
            </p>

            {department && (
              <div className="mt-3 inline-block bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-lg">
                <span className="font-semibold">
                  Department:
                </span>{" "}
                {department}
              </div>
            )}
          </div>

          <button
            onClick={fetchEmployees}
            className="primary-btn mt-4 md:mt-0"
          >
            Refresh
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-10">
            <p className="text-gray-500">
              Loading employees...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* No Employees */}
        {!loading &&
          !error &&
          employees.length === 0 && (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
              <div className="text-4xl mb-3">
                👥
              </div>

              <p className="text-gray-500">
                No employees found in your department.
              </p>
            </div>
          )}

        {/* Employee Table */}
        {!loading &&
          !error &&
          employees.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-5 py-4 text-sm font-semibold text-gray-700">
                        #
                      </th>

                      <th className="px-5 py-4 text-sm font-semibold text-gray-700">
                        Employee Name
                      </th>

                      <th className="px-5 py-4 text-sm font-semibold text-gray-700">
                        Email
                      </th>

                      <th className="px-5 py-4 text-sm font-semibold text-gray-700">
                        Department
                      </th>

                      <th className="px-5 py-4 text-sm font-semibold text-gray-700">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {employees.map((employee, index) => (
                      <tr
                        key={employee._id}
                        className="border-t hover:bg-gray-50"
                      >
                        <td className="px-5 py-4 text-gray-600">
                          {index + 1}
                        </td>

                        <td className="px-5 py-4 font-medium text-gray-800">
                          {employee.name || "-"}
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {employee.email || "-"}
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {employee.department?.name ||
                            department ||
                            "-"}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              employee.isActive === false
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {employee.isActive === false
                              ? "Inactive"
                              : "Active"}
                          </span>
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
            className="secondary-btn"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </main>
  );
}