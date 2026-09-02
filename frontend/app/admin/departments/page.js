"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DepartmentManagement() {
  const router = useRouter();

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  // ==================== FETCH DEPARTMENTS ====================

  const fetchDepartments = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/departments`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch departments");
      }

      setDepartments(data.departments || []);
    } catch (error) {
      console.error("Fetch departments error:", error);
      setMessage(error.message || "Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  // ==================== INITIAL LOAD ====================

  useEffect(() => {
    fetchDepartments();
  }, []);

  // ==================== CREATE DEPARTMENT ====================

  const handleAddDepartment = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Department name is required");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/departments`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to create department");
        return;
      }

      setName("");
      setDescription("");
      setShowForm(false);

      await fetchDepartments();

      alert("Department created successfully");
    } catch (error) {
      console.error("Create department error:", error);
      alert("Unable to connect to server");
    }
  };

  // ==================== TOGGLE STATUS ====================

  const handleToggleStatus = async (id) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/departments/${id}/status`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to update department status");
        return;
      }

      // Update only the changed department in UI
      setDepartments((prevDepartments) =>
        prevDepartments.map((department) =>
          department._id === id
            ? data.department
            : department
        )
      );

      alert(data.message);
    } catch (error) {
      console.error("Toggle status error:", error);
      alert("Unable to connect to server");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f6fa",
      }}
    >
      {/* HEADER */}

      <header
        style={{
          background: "#2447a5",
          color: "white",
          padding: "20px 35px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>Employee Leave Management</h2>
          <p style={{ margin: "5px 0 0", opacity: 0.8 }}>
            Admin Portal
          </p>
        </div>

        <button
          onClick={() => router.push("/admin")}
          style={{
            padding: "12px 25px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Dashboard
        </button>
      </header>

      {/* MAIN CONTENT */}

      <main
        style={{
          maxWidth: "1340px",
          margin: "35px auto",
          padding: "0 20px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "35px",
          }}
        >
          <div>
            <h1 style={{ marginBottom: "10px" }}>
              Department Management
            </h1>

            <p style={{ color: "#555", fontSize: "17px" }}>
              Create and manage departments in your organization.
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              background: "#2447a5",
              color: "white",
              border: "none",
              padding: "15px 25px",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            + Add Department
          </button>
        </div>

        {/* ERROR MESSAGE */}

        {message && (
          <div
            style={{
              padding: "15px",
              marginBottom: "20px",
              border: "1px solid #f5c2c7",
              background: "#f8d7da",
              color: "#842029",
              borderRadius: "6px",
            }}
          >
            {message}
          </div>
        )}

        {/* ADD DEPARTMENT FORM */}

        {showForm && (
          <form
            onSubmit={handleAddDepartment}
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "10px",
              marginBottom: "25px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <h3>Add New Department</h3>

            <div style={{ marginBottom: "15px" }}>
              <label>Department Name</label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter department name"
                style={{
                  width: "100%",
                  padding: "12px",
                  marginTop: "7px",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label>Description</label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description"
                rows="3"
                style={{
                  width: "100%",
                  padding: "12px",
                  marginTop: "7px",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                background: "#2447a5",
                color: "white",
                border: "none",
                padding: "12px 25px",
                borderRadius: "6px",
                cursor: "pointer",
                marginRight: "10px",
              }}
            >
              Create Department
            </button>

            <button
              type="button"
              onClick={() => setShowForm(false)}
              style={{
                background: "#777",
                color: "white",
                border: "none",
                padding: "12px 25px",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </form>
        )}

        {/* DEPARTMENTS TABLE */}

        <div
          style={{
            background: "white",
            borderRadius: "10px",
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid #ddd",
                  textAlign: "left",
                }}
              >
                <th style={{ padding: "20px" }}>#</th>
                <th style={{ padding: "20px" }}>Department</th>
                <th style={{ padding: "20px" }}>Description</th>
                <th style={{ padding: "20px" }}>Status</th>
                <th style={{ padding: "20px" }}>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      textAlign: "center",
                      padding: "30px",
                    }}
                  >
                    Loading departments...
                  </td>
                </tr>
              ) : departments.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      textAlign: "center",
                      padding: "30px",
                    }}
                  >
                    No departments found
                  </td>
                </tr>
              ) : (
                departments.map((department, index) => (
                  <tr
                    key={department._id}
                    style={{
                      borderBottom: "1px solid #ddd",
                    }}
                  >
                    <td style={{ padding: "20px" }}>
                      {index + 1}
                    </td>

                    <td style={{ padding: "20px" }}>
                      {department.name}
                    </td>

                    <td style={{ padding: "20px" }}>
                      {department.description || "-"}
                    </td>

                    <td style={{ padding: "20px" }}>
                      <span
                        style={{
                          padding: "7px 15px",
                          borderRadius: "20px",
                          background: department.isActive
                            ? "#d1e7dd"
                            : "#f8d7da",
                          color: department.isActive
                            ? "#0f5132"
                            : "#842029",
                        }}
                      >
                        {department.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    <td style={{ padding: "20px" }}>
                      <button
                        onClick={() =>
                          handleToggleStatus(department._id)
                        }
                        style={{
                          background: department.isActive
                            ? "#dc2626"
                            : "#16a34a",
                          color: "white",
                          border: "none",
                          padding: "10px 20px",
                          borderRadius: "7px",
                          cursor: "pointer",
                          fontWeight: "bold",
                        }}
                      >
                        {department.isActive
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

        <div style={{ marginTop: "35px" }}>
          <button
            onClick={() => router.push("/admin")}
            style={{
              background: "transparent",
              border: "none",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            ← Back to Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}