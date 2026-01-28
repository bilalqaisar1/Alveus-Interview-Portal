import {
  Briefcase,
  ChevronDown,
  LoaderCircle,
  LogOut,
  Menu,
  Upload,
  UserRound,
  X,
  Settings,
  Bell,
} from "lucide-react";
import React, { useContext, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import NotificationDropdown from "./NotificationDropdown";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const notificationRef = useRef(null);
  const {
    isLogin, isCompanyLogin, userData, companyData, userDataLoading, companyLoading,
    fetchUserData, setIsLogin, unreadCount, backendUrl,
    setUserToken, setCompanyToken, setIsCompanyLogin
  } = useContext(AppContext);
  const location = useLocation();

  const navigate = useNavigate();

  // Different menu items for candidates vs recruiters
  const candidateMenu = [
    { name: "Home", path: "/" },
    { name: "All Jobs", path: "/all-jobs/all" },
    { name: "AI Interview", path: "/ai-interview" },
    { name: "AI Assistant", path: "/ai-assistant" },
    { name: "About", path: "/about" },
  ];

  const recruiterMenu = [
    { name: "Home", path: "/" },
    { name: "Manage Jobs", path: "/dashboard/manage-jobs" },
    { name: "View Applications", path: "/dashboard/view-applications" },
    { name: "AI Assistant", path: "/ai-assistant" },
  ];

  const menu = isCompanyLogin ? recruiterMenu : candidateMenu;
  const activeData = isCompanyLogin ? companyData : userData;
  const isLoading = isCompanyLogin ? companyLoading : userDataLoading;

  const toggleMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsProfileMenuOpen(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsNotificationOpen(false);
      }

      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        !event.target.closest('[aria-label="Toggle menu"]')
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    if (isCompanyLogin) {
      setCompanyToken(null);
      setIsCompanyLogin(false);
      localStorage.removeItem("companyToken");
      toast.success("Logout successfully");
      navigate("/recruiter-login");
    } else {
      setUserToken(null);
      setIsLogin(false);
      localStorage.removeItem("userToken");
      toast.success("Logout successfully");
      navigate("/candidate-login");
    }
  };

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
    setIsNotificationOpen(false);
  }, [location.pathname]);

  return (
    <header className="border-b border-gray-200 mb-10">
      <nav>
        <div className="h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img className="w-[120px]" src={assets.logo} alt="Alveous Co. Logo" />
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden lg:flex items-center gap-4">
            {menu.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-lg font-medium transition-colors ${isActive
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-600 hover:text-blue-500 hover:bg-blue-50"
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Desktop Buttons */}
          {isLoading ? (
            <LoaderCircle className="animate-spin text-gray-600 hidden lg:block" />
          ) : (isLogin || isCompanyLogin) ? (
            <div className="hidden lg:flex items-center gap-4">
              {/* Notification Bell */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors relative"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
                <NotificationDropdown
                  isOpen={isNotificationOpen}
                  onClose={() => setIsNotificationOpen(false)}
                />
              </div>

              <div
                className="relative"
                ref={profileMenuRef}
              >
                <button
                  onClick={toggleProfileMenu}
                  className="flex items-center gap-2 focus:outline-none"
                  aria-expanded={isProfileMenuOpen}
                >
                  <span className="text-sm font-medium text-gray-700">
                    Hi, {activeData?.name || "User"}
                  </span>
                  <img
                    className="w-8 h-8 rounded-full object-cover"
                    src={
                      activeData?.image
                        ? activeData.image.startsWith("http")
                          ? activeData.image
                          : `${backendUrl}${activeData.image}`
                        : assets.avatarPlaceholder
                    }
                    alt="Profile"
                    onError={(e) => {
                      e.currentTarget.src = assets.avatarPlaceholder;
                    }}
                  />
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${isProfileMenuOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 top-12 mt-2 w-56 origin-top-right rounded-md border border-gray-200 bg-white z-50 overflow-hidden">
                    <div>
                      <Link
                        to={isCompanyLogin ? "/dashboard/settings" : "/user-settings"}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 gap-2"
                      >
                        <Settings size={16} />
                        Settings
                      </Link>
                      <Link
                        to={`/profile/${activeData?._id || "undefined"}`}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 gap-2"
                      >
                        <UserRound size={16} />
                        My Profile
                      </Link>
                      {!isCompanyLogin && (
                        <Link
                          to="/applications"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 gap-2"
                        >
                          <Briefcase size={16} />
                          Applied Jobs
                        </Link>
                      )}

                      <button
                        className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 gap-2"
                        onClick={handleLogout}
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-3">
              <Link
                to="/recruiter-login"
                className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors"
              >
                Recruiter Login
              </Link>
              <Link
                to="/candidate-login"
                className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm  hover:bg-blue-700 transition-colors font-medium"
              >
                Login
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
            onClick={toggleMenu}
            className="lg:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden fixed inset-0 z-40 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        ref={mobileMenuRef}
      >
        <div className="fixed inset-0 backdrop-blur-sm" onClick={toggleMenu} />
        <div className="relative flex flex-col w-4/5 max-w-sm h-full bg-white border-r border-r-gray-200">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <Link to="/" onClick={toggleMenu}>
              <img className="h-8" src={assets.logo} alt="Lecruiter Logo" />
            </Link>
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {menu.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={toggleMenu}
                    className={({ isActive }) =>
                      `block px-3 py-2 rounded-md text-lg font-medium ${isActive
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-100"
                      }`
                    }
                  >
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>

            {isLoading ? (
              <LoaderCircle className="animate-spin text-gray-600 hidden lg:block" />
            ) : (isLogin || isCompanyLogin) ? (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <img
                    className="w-10 h-10 rounded-full object-cover"
                    src={
                      activeData?.image
                        ? activeData.image.startsWith("http")
                          ? activeData.image
                          : `${backendUrl}${activeData.image}`
                        : assets.avatarPlaceholder
                    }
                    alt="Profile"
                    onError={(e) => {
                      e.currentTarget.src = assets.avatarPlaceholder;
                    }}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {activeData?.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500">{activeData?.email}</p>
                  </div>
                </div>
                <ul className="space-y-1">
                  <li>
                    <Link
                      to={isCompanyLogin ? "/dashboard/settings" : "/user-settings"}
                      onClick={toggleMenu}
                      className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                      <Settings size={16} />
                      Settings
                    </Link>
                  </li>
                  <li>
                    <Link
                      to={`/profile/${activeData?._id || "undefined"}`}
                      onClick={toggleMenu}
                      className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                      <UserRound size={16} />
                      My Profile
                    </Link>
                  </li>
                  {!isCompanyLogin && (
                    <li>
                      <Link
                        to="/applications"
                        onClick={toggleMenu}
                        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                      >
                        <Briefcase size={16} />
                        Applied Jobs
                      </Link>
                    </li>
                  )}
                  <li>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 cursor-pointer"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <Link
                  to="/recruiter-login"
                  onClick={toggleMenu}
                  className="block w-full bg-blue-50 text-blue-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-100 text-center"
                >
                  Recruiter Login
                </Link>
                <Link
                  to="/candidate-login"
                  onClick={toggleMenu}
                  className="block w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 text-center cursor-pointer"
                >
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
