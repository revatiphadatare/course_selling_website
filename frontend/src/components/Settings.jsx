import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { BACKEND_URL } from "../utils/utils";

function Settings() {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [preferences, setPreferences] = useState({
    newsletter: false,
    darkMode: false,
  });

  const token = JSON.parse(localStorage.getItem("user"))?.token;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BACKEND_URL}/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setUser(res.data.user);
        setEmail(res.data.user.email);
        setName(res.data.user.firstName);
        setPreferences({
          newsletter: res.data.user.newsletter || false,
          darkMode: res.data.user.darkMode || false,
        });
      } catch (err) {
        toast.error("Failed to load user settings");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  const handleSave = async () => {
    try {
      setLoading(true);
      await axios.put(
        `${BACKEND_URL}/user/update`,
        { name, email, preferences },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      toast.success("Settings updated successfully");
    } catch (err) {
      toast.error("Error saving settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto my-20 p-6 bg-white rounded-lg shadow-md max-w-xl">
      <h1 className="text-2xl font-bold mb-6 text-center text-indigo-600">Account Settings</h1>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : (
        <>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Preferences</label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.newsletter}
                  onChange={(e) =>
                    setPreferences({ ...preferences, newsletter: e.target.checked })
                  }
                  className="mr-2"
                />
                Subscribe to newsletter
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.darkMode}
                  onChange={(e) =>
                    setPreferences({ ...preferences, darkMode: e.target.checked })
                  }
                  className="mr-2"
                />
                Enable dark mode
              </label>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-indigo-500 text-white py-2 rounded hover:bg-indigo-600 transition duration-200"
          >
            Save Settings
          </button>
        </>
      )}
    </div>
  );
}

export default Settings;