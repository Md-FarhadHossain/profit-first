"use client";

import { useState, useEffect } from "react";

const API_URL = "https://profit-first-server.vercel.app"; // Your backend URL

export default function BlockScammerPage() {
  const [identifier, setIdentifier] = useState("");
  const [note, setNote] = useState("");
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  const fetchBlockedUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/blocked-users`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setBlockedUsers(data);
      } else {
        setBlockedUsers([]); 
        console.error("API returned non-array data:", data);
      }
    } catch (error) {
      console.error("Failed to fetch blocked users", error);
    }
  };

  const handleBlockUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // FIX: Trim whitespace from identifier
    const cleanIdentifier = identifier.trim();

    if (!cleanIdentifier) {
      setMessage({ type: "error", text: "Please enter a Device ID, Phone Number, or IP" });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/admin/block-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: cleanIdentifier, note }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "User blocked successfully!" });
        setIdentifier(""); 
        setNote(""); 
        fetchBlockedUsers(); 
      } else {
        setMessage({ type: "error", text: data.message || "Failed to block user" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Server error occurred" });
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (targetIdentifier) => {
    if(!confirm("Are you sure you want to unblock this user?")) return;

    try {
      const res = await fetch(`${API_URL}/admin/blocked-users/${encodeURIComponent(targetIdentifier)}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchBlockedUsers(); 
      } else {
        alert("Failed to unblock");
      }
    } catch (error) {
      alert("Error unblocking user");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-red-600 mb-8">🛡️ Scammer Shield</h1>

        {/* --- BLOCK FORM --- */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Block a User</h2>
          
          <form onSubmit={handleBlockUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Identifier (Device ID / Phone / IP)
              </label>
              <input
                type="text"
                placeholder="e.g. 01712345678 or 103.102.x.x"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 outline-none font-mono"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Paste the <code>deviceId</code>, <code>number</code>, or <code>IP</code> here. Spaces will be removed automatically.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason / Note
              </label>
              <input
                type="text"
                placeholder="e.g. Fake order scammer"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 outline-none"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            {message && (
              <div className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-md transition-colors disabled:opacity-50"
            >
              {loading ? "Processing..." : "BLOCK USER NOW"}
            </button>
          </form>
        </div>

        {/* --- BLOCKED LIST --- */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Blocked Database ({blockedUsers.length})</h2>
            <button onClick={fetchBlockedUsers} className="text-sm text-blue-600 hover:underline">Refresh List</button>
          </div>

          {blockedUsers.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No blocked users yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="p-3 text-sm font-semibold text-gray-600">Identifier</th>
                    <th className="p-3 text-sm font-semibold text-gray-600">Note</th>
                    <th className="p-3 text-sm font-semibold text-gray-600">Date</th>
                    <th className="p-3 text-sm font-semibold text-gray-600 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {blockedUsers.map((user) => (
                    <tr key={user._id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-mono text-sm text-gray-800">{user.identifier}</td>
                      <td className="p-3 text-sm text-gray-600">{user.note}</td>
                      <td className="p-3 text-sm text-gray-500">
                        {user.blockedAt ? new Date(user.blockedAt).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleUnblock(user.identifier)}
                          className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded"
                        >
                          Unblock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}