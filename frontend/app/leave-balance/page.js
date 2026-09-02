"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";


export default function LeaveBalance() {
  const router = useRouter();

  const [balance, setBalance] = useState([]);
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchLeaveBalance();
  }, []);

  const fetchLeaveBalance = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/leaves/balance`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Failed to fetch leave balance"
        );
        return;
      }

      setBalance(data.balance || []);
      setYear(data.year || "");
    } catch (error) {
      console.error("Leave balance error:", error);
      setMessage("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    
      <main className="app-container min-h-screen bg-gray-100">

        {/* Navbar */}
        <nav className="bg-blue-600 text-white px-8 py-4 flex justify-between items-center shadow-md">
          <div>
            <h1 className="text-xl font-bold">
              Employee Leave Management
            </h1>
          </div>

          <button
            onClick={() => router.push("/employee")}
            className="secondary-btn"
          >
            Dashboard
          </button>
        </nav>

        <div className="page-container p-8">

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Leave Balance
            </h2>

            <p className="text-gray-600">
              View your available leave balance for {year || "this year"}.
            </p>
          </div>

          {/* Error Message */}
          {message && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6">
              {message}
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="card">
              <p className="text-gray-600">
                Loading leave balance...
              </p>
            </div>
          ) : balance.length === 0 ? (
            <div className="card text-center py-10">
              <div className="text-5xl mb-4">📋</div>

              <h3 className="text-xl font-semibold mb-2">
                No Leave Types Available
              </h3>

              <p className="text-gray-500">
                No active leave types have been configured yet.
              </p>
            </div>
          ) : (
            <>
              {/* Leave Balance Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {Object.entries(balance).map(([leaveType, item]) => (
                  <div
                    key={leaveType}
                    className="card"
                  >
                    <div className="flex justify-between items-start mb-5">
                      <div>
                        <div className="text-3xl mb-2">
                          📅
                        </div>

                        {/* Leave Type Name */}
                        <h3 className="text-xl font-semibold text-gray-800">
                          {leaveType}
                        </h3>
                      </div>

                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                        {item.remaining} Left
                      </span>
                    </div>

                    <div className="space-y-4">

                      {/* Total */}
                      <div className="flex justify-between text-gray-600">
                        <span>Total Annual Limit</span>
                        <span className="font-semibold text-gray-800">
                          {item.total} Days
                        </span>
                      </div>

                      {/* Used */}
                      <div className="flex justify-between text-gray-600">
                        <span>Used</span>
                        <span className="font-semibold text-red-600">
                          {item.used} Days
                        </span>
                      </div>

                      {/* Remaining */}
                      <div className="flex justify-between border-t pt-4">
                        <span className="font-medium">
                          Remaining
                        </span>

                        <span className="text-lg font-bold text-green-600">
                          {item.remaining} Days
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${
                              item.total > 0
                                ? Math.min(
                                    (item.used / item.total) * 100,
                                    100
                                  )
                                : 0
                            }%`,
                          }}
                        />
                      </div>

                    </div>
                  </div>
                ))}

              </div>

              {/* Information Section */}
              <div className="card mt-10">
                <h3 className="text-lg font-semibold mb-2">
                  Leave Balance Information
                </h3>

                <p className="text-gray-600">
                  Your leave balance is calculated based on the annual
                  limits configured by the administrator. Only approved
                  leave requests are counted as used leave days.
                </p>
              </div>
            </>
          )}

        </div>
      </main>
   
  );
}