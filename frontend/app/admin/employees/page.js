"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function EmployeeManagement() {
  const router = useRouter();

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState({});
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    checkAdminAndLoadData();
  }, []);

  // ==================== CHECK ADMIN ====================

  const checkAdminAndLoadData = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/me",
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        router.replace("/");
        return;
      }

      // Admin protection
      if (data.user.role !== "admin") {
        if (data.user.role === "employee") {
          router.replace("/employee");
        } else if (data.user.role === "manager") {
          router.replace("/manager");
        } else {
          router.replace("/");
        }
        return;
      }

      await Promise.all([
        fetchEmployees(),
        fetchDepartments(),
      ]);
    } catch (error) {
      console.error("Authentication error:", error);
      setMessage("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  // ==================== FETCH EMPLOYEES ====================

  const fetchEmployees = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/employees",
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Failed to fetch employees"
        );
        return;
      }

      setEmployees(data.employees || []);

      // Set currently assigned departments
      const departmentSelections = {};

      data.employees?.forEach((employee) => {
        departmentSelections[employee._id] =
          employee.department?._id || "";
      });

      setSelectedDepartments(departmentSelections);
    } catch (error) {
      console.error("Fetch employees error:", error);
      setMessage("Unable to fetch employees");
    }
  };

  // ==================== FETCH DEPARTMENTS ====================

  const fetchDepartments = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/departments",
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(
          data.message || "Failed to fetch departments"
        );
        return;
      }

      setDepartments(data.departments || []);
    } catch (error) {
      console.error("Fetch departments error:", error);
    }
  };

  // ==================== ASSIGN DEPARTMENT ====================

  const handleAssignDepartment = async (employeeId) => {
  const departmentId = selectedDepartments[employeeId];

  if (!departmentId) {
    setMessage("Please select a department");
    return;
  }

  try {
    setUpdatingId(employeeId);
    setMessage("");

    const response = await fetch(
      `http://localhost:5000/api/admin/employees/${employeeId}/department`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          departmentId,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setMessage(
        data.message || "Failed to assign department"
      );
      return;
    }

    setMessage("Department assigned successfully");

    await fetchEmployees();
  } catch (error) {
    console.error("Assign department error:", error);
    setMessage("Unable to assign department");
  } finally {
    setUpdatingId(null);
  }
};
  // ==================== TOGGLE EMPLOYEE STATUS ====================

  const handleToggleStatus = async (employeeId) => {
    try {
      setUpdatingId(employeeId);
      setMessage("");

      const response = await fetch(
       `http://localhost:5000/api/admin/employees/${employeeId}/toggle-status`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Failed to update employee status"
        );
        return;
      }

      setMessage(data.message || "Employee status updated");

      await fetchEmployees();
    } catch (error) {
      console.error("Toggle employee status error:", error);
      setMessage("Unable to update employee status");
    } finally {
      setUpdatingId(null);
    }
  };

  // ==================== LOGOUT ====================

  const handleLogout = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/logout",
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (response.ok) {
        router.replace("/");
      } else {
        setMessage("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
      setMessage("Unable to connect to server");
    }
  };

  // ==================== LOADING ====================

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 text-lg">
          Loading Employee Management...
        </p>
      </main>
    );
  }

  // ==================== UI ====================

  return (
    <main className="min-h-screen bg-gray-50">

      {/* NAVBAR */}
      <nav className="bg-blue-700 text-white px-8 py-4 flex justify-between items-center shadow-md">
        <div>
          <h1 className="text-xl font-bold">
            Employee Leave Management
          </h1>

          <p className="text-sm text-blue-100">
            Admin Portal
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => router.push("/admin")}
            className="bg-blue-600 border border-blue-400 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-500 transition"
          >
            Dashboard
          </button>

          <button
            onClick={handleLogout}
            className="bg-white text-blue-700 px-5 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8">

        {/* HEADER */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">
            Employee Management
          </h2>

          <p className="text-gray-600 mt-2">
            Manage employees, assign departments and update account status.
          </p>
        </div>

        {/* MESSAGE */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              message.toLowerCase().includes("success")
                ? "bg-green-100 border-green-300 text-green-700"
                : "bg-red-100 border-red-300 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        {/* EMPLOYEE COUNT */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 shadow-sm">
          <p className="text-gray-500 text-sm">
            Total Registered Employees
          </p>

          <p className="text-3xl font-bold text-blue-700 mt-1">
            {employees.length}
          </p>
        </div>

        {/* EMPLOYEE TABLE */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                    Employee
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                    Email
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                    Current Department
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                    Assign Department
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                    Status
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>

                {employees.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center py-10 text-gray-500"
                    >
                      No employees found.
                    </td>
                  </tr>
                ) : (
                  employees.map((employee) => (
                    <tr
                      key={employee._id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >

                      {/* NAME */}
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-800">
                          {employee.name}
                        </p>
                      </td>

                      {/* EMAIL */}
                      <td className="px-6 py-4 text-gray-600">
                        {employee.email}
                      </td>

                      {/* CURRENT DEPARTMENT */}
                      <td className="px-6 py-4">
                        {employee.department ? (
                          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                            {employee.department.name}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">
                            Not Assigned
                          </span>
                        )}
                      </td>

                      {/* DEPARTMENT DROPDOWN */}
                      <td className="px-6 py-4">

                        <div className="flex gap-2 min-w-[280px]">

                          <select
                            value={
                              selectedDepartments[employee._id] || ""
                            }
                            onChange={(e) =>
                              setSelectedDepartments({
                                ...selectedDepartments,
                                [employee._id]: e.target.value,
                              })
                            }
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          >
                            <option value="">
                              Select Department
                            </option>

                            {departments.map((department) => (
                              <option
                                key={department._id}
                                value={department._id}
                              >
                                {department.name}
                              </option>
                            ))}
                          </select>

                          <button
                            onClick={() =>
                              handleAssignDepartment(employee._id)
                            }
                            disabled={
                              updatingId === employee._id
                            }
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-blue-300"
                          >
                            {updatingId === employee._id
                              ? "..."
                              : "Save"}
                          </button>

                        </div>

                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-4">

                        {employee.isActive ? (
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                            Active
                          </span>
                        ) : (
                          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                            Inactive
                          </span>
                        )}

                      </td>

                      {/* ACTION */}
                      <td className="px-6 py-4">

                        <button
                          onClick={() =>
                            handleToggleStatus(employee._id)
                          }
                          disabled={
                            updatingId === employee._id
                          }
                          className={`px-4 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50 ${
                            employee.isActive
                              ? "bg-red-100 text-red-700 hover:bg-red-200"
                              : "bg-green-100 text-green-700 hover:bg-green-200"
                          }`}
                        >
                          {updatingId === employee._id
                            ? "Updating..."
                            : employee.isActive
                            ? "Deactivate"
                            : "Activate"}
                        </button>

                      </td>

                    </tr>
                  ))
                )}

              </tbody>
            </table>

          </div>
        </div>
      </div>
    </main>
  );
}