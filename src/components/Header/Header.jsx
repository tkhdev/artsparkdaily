import { useState, useRef, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserCircle,
  faBars,
  faSignOut,
  faUser,
  faChevronDown,
  faBell,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { db } from "../../firebase-config";
import { doc, onSnapshot } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { useAuthActions } from "../../hooks/useAuthActions";

export function useNotifications() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    const summaryRef = doc(db, "users", user.uid, "notificationSummary", "summary");

    const unsubscribe = onSnapshot(
      summaryRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUnreadCount(data.unreadCount || 0);
        } else {
          setUnreadCount(0);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error listening to notification summary:", err);
        setUnreadCount(0);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return { unreadCount, loading };
}

function Header() {
  const { user, loading: authLoading, profile: authProfile, error: authError } = useAuth();
  const profile = authProfile;

  const { loginWithGoogle, logout } = useAuthActions();
  const { unreadCount, loading: notificationsLoading } = useNotifications();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogin = async () => {
    await loginWithGoogle();
  };

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    setMobileOpen(false);
  };

  return (
    <nav className="bg-black/30 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <NavLink to="/" className="flex items-center">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 text-2xl font-bold">
              Art Spark Daily
            </span>
          </NavLink>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-4">
            {[
              "/",
              "/daily-challenge",
              "/gallery",
              "/leaderboard",
              "/pricing",
              ...(user ? ["/notifications"] : [])
            ].map((path) => {
              const label =
                path === "/"
                  ? "Home"
                  : (
                      path.replace("/", "").charAt(0).toUpperCase() +
                      path.slice(2)
                    ).replaceAll("-", " ");
              return (
                <NavLink
                  key={path}
                  to={path}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium relative ${
                      isActive ? "text-white" : "text-gray-300 hover:text-white"
                    }`
                  }
                >
                  {path === "/notifications" ? (
                    <div className="flex items-center gap-2 relative">
                      <FontAwesomeIcon icon={faBell} />
                      {label}
                      {!notificationsLoading && unreadCount > 0 && (
                        <span className="absolute -top-1 -right-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                      {notificationsLoading && user && (
                        <FontAwesomeIcon icon={faSpinner} className="animate-spin ml-2 text-xs" />
                      )}
                    </div>
                  ) : (
                    label
                  )}
                </NavLink>
              );
            })}
          </div>

          <div className="flex items-center space-x-4 relative min-w-0">
            {/* Desktop User/Login Button */}
            <div className="hidden md:block min-w-0">
              {authLoading ? (
                <div className="bg-white/5 animate-pulse text-white rounded-full px-4 py-2 flex items-center space-x-2 h-[40px] w-[120px]">
                  {/* Loading placeholder */}
                </div>
              ) : user && profile ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen((prev) => !prev)}
                    className="bg-white/10 hover:bg-white/20 text-white rounded-full px-4 py-2 flex items-center space-x-2 transition duration-300 cursor-pointer max-w-[200px] min-w-[100px] truncate"
                    title={profile.displayName || "User"}
                    type="button"
                  >
                    {profile.profilePic ? (
                      <img src={profile.profilePic} alt="User" className="w-6 h-6 rounded-full flex-shrink-0" />
                    ) : (
                      <FontAwesomeIcon icon={faUserCircle} className="flex-shrink-0" />
                    )}
                    <span
                      className="max-w-[120px] truncate block"
                      style={{ userSelect: "none" }}
                    >
                      {profile.displayName || "User"}
                    </span>
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className={`ml-1 text-xs transition-transform duration-200 flex-shrink-0 ${dropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-md shadow-lg z-50 overflow-hidden py-1">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 hover:bg-gray-100 transition-colors text-sm"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <FontAwesomeIcon icon={faUser} className="mr-2 w-4" />
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center px-4 py-2 hover:bg-gray-100 transition-colors cursor-pointer text-sm"
                      >
                        <FontAwesomeIcon icon={faSignOut} className="mr-2 w-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full px-6 py-2 flex items-center space-x-2 transition duration-300 cursor-pointer"
                  onClick={handleLogin}
                  disabled={authLoading}
                  type="button"
                >
                  <FontAwesomeIcon icon={faUserCircle} />
                  <span>Sign In</span>
                </button>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              className="md:hidden text-gray-300 hover:text-white"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Toggle mobile menu"
              type="button"
            >
              <FontAwesomeIcon icon={faBars} size="lg" />
            </button>
          </div>
        </div>

        {/* Mobile Nav Menu */}
        {mobileOpen && (
          <div className="md:hidden flex flex-col space-y-1 py-2">
            {[
              "/",
              "/daily-challenge",
              "/gallery",
              "/leaderboard",
              "/pricing",
              ...(user ? ["/notifications"] : [])
            ].map((path) => {
              const label =
                path === "/"
                  ? "Home"
                  : (
                      path.replace("/", "").charAt(0).toUpperCase() +
                      path.slice(2)
                    ).replaceAll("-", " ");
              return (
                <NavLink
                  key={path}
                  to={path}
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-md text-base font-medium ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "text-gray-300 hover:bg-white/10 hover:text-white"
                    }`
                  }
                  onClick={() => setMobileOpen(false)}
                >
                  {path === "/notifications" ? (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faBell} />
                        {label}
                      </span>
                      {!notificationsLoading && unreadCount > 0 && (
                        <span className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                      {notificationsLoading && user && (
                        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-xs" />
                      )}
                    </div>
                  ) : (
                    label
                  )}
                </NavLink>
              );
            })}

            <div className="border-t border-white/10 mt-2 pt-2">
              {authLoading ? (
                <div className="px-3 py-2 text-gray-400 flex items-center">
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" /> Authenticating...
                </div>
              ) : user ? (
                <>
                  <Link
                    to="/profile"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-white/10 hover:text-white"
                    onClick={() => setMobileOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block text-left w-full px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-white/10 hover:text-white cursor-pointer"
                    type="button"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={handleLogin}
                  className="block text-left w-full px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-white/10 hover:text-white cursor-pointer"
                  disabled={authLoading}
                  type="button"
                >
                  Sign In
                </button>
              )}
            </div>
            {authError && (
              <div className="px-3 py-2 text-red-400 text-sm">
                Error: {authError}
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Header;
