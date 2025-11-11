import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaCircleUser } from "react-icons/fa6";
import { RiHome2Fill } from "react-icons/ri";
import { FaDiscourse, FaDownload } from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";
import { IoLogIn, IoLogOut } from "react-icons/io5";
import { FiSearch } from "react-icons/fi";
import { HiMenu, HiX } from "react-icons/hi";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { BACKEND_URL } from "../utils/utils";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  console.log("courses:", courses);

  // Check login status
  useEffect(() => {
    const user = localStorage.getItem("user");
    setIsLoggedIn(!!user);
  }, []);

  // Fetch all courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/course/courses`, {
          withCredentials: true,
        });
        console.log("Fetched courses:", response.data.courses);
        setCourses(response.data.courses || []);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Logout
  const handleLogout = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/user/logout`, {
        withCredentials: true,
      });
      toast.success(response.data.message);
      localStorage.removeItem("user");
      setIsLoggedIn(false);
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error(error.response?.data?.errors || "Error in logging out");
    }
  };

  // Toggle sidebar (for mobile)
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Close sidebar when a link is clicked (mobile)
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex relative">
      {/* Hamburger Menu (Mobile) */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 text-3xl text-gray-800"
        onClick={toggleSidebar}
      >
        {isSidebarOpen ? <HiX /> : <HiMenu />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-gray-100 w-64 p-5 z-40 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static`}
      >
        <div className="flex items-center mb-10 mt-10 md:mt-0">
          <img src="/logo.webp" alt="Profile" className="rounded-full h-12 w-12" />
        </div>

        <nav>
          <ul>
            <li className="mb-4">
              <Link
                to="/"
                className="flex items-center hover:text-blue-600 duration-200"
                onClick={closeSidebar}
              >
                <RiHome2Fill className="mr-2" /> Home
              </Link>
            </li>

            <li className="mb-4">
              <span className="flex items-center text-blue-500 font-semibold">
                <FaDiscourse className="mr-2" /> Courses
              </span>
            </li>

            <li className="mb-4">
              <Link
                to="/purchases"
                className="flex items-center hover:text-blue-600 duration-200"
                onClick={closeSidebar}
              >
                <FaDownload className="mr-2" /> Purchases
              </Link>
            </li>

            <li className="mb-4">
              {/* Real link to Settings page */}
              <Link
                to="/settings"
                className="flex items-center hover:text-blue-600 duration-200"
                onClick={closeSidebar}
              >
                <IoMdSettings className="mr-2" /> Settings
              </Link>
            </li>

            <li>
              {isLoggedIn ? (
                <button
                  onClick={() => {
                    handleLogout();
                    closeSidebar();
                  }}
                  className="flex items-center text-red-600"
                >
                  <IoLogOut className="mr-2" /> Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center hover:text-blue-600 duration-200"
                  onClick={closeSidebar}
                >
                  <IoLogIn className="mr-2" /> Login
                </Link>
              )}
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-0 md:ml-64 w-full bg-white p-10 relative z-30">
        {/* Header */}
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-xl font-bold text-gray-800">Courses</h1>
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Type here to search..."
                className="border border-gray-300 rounded-l-full px-4 py-2 h-10 focus:outline-none"
              />
              <button className="h-10 border border-gray-300 rounded-r-full px-4 flex items-center justify-center">
                <FiSearch className="text-xl text-gray-600" />
              </button>
            </div>
            <FaCircleUser className="text-4xl text-blue-600" />
          </div>
        </header>

        {/* Scrollable Courses Section */}
        <div className="overflow-y-auto h-[75vh]">
          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : courses.length === 0 ? (
            <p className="text-center text-gray-500">
              No courses posted yet by admin.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {courses
                .filter((course) => course && course._id)
                .map((course) => (
                  <div
                    key={course._id}
                    className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition duration-300"
                  >
                    <img
                      src={course.image?.url || "/logo.webp"}
                      alt={course.title || "Course image"}
                      className="rounded mb-4 w-full h-40 object-contain bg-gray-50"
                    />
                    <h2 className="font-bold text-lg mb-2 text-gray-800">
                      {course.title || "Untitled Course"}
                    </h2>
                    <p className="text-gray-600 mb-4 text-sm">
                      {course.description
                        ? course.description.length > 100
                          ? `${course.description.slice(0, 100)}...`
                          : course.description
                        : "No description available."}
                    </p>
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-bold text-xl text-gray-800">
                        ₹{course.price || 0}{" "}
                        <span className="text-gray-400 line-through">₹5999</span>
                      </span>
                      <span className="text-green-600 font-semibold">
                        20% off
                      </span>
                    </div>
                    <Link
                      to={`/buy/${course._id}`}
                      className="bg-orange-500 w-full text-white px-4 py-2 rounded-lg hover:bg-blue-900 duration-300 text-center block"
                    >
                      Buy Now
                    </Link>
                  </div>
                ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Courses;
