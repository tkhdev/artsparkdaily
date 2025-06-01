import { useState, useRef, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserCircle,
  faBars,
  faSignOut,
  faUser,
  faChevronDown,
  faBell
} from "@fortawesome/free-solid-svg-icons";
import { db, doc, onSnapshot } from "../../firebase-config";
import { useAuth } from "../../context/AuthContext";
import { useAuthActions } from "../../hooks/useAuthActions";
import { useOwnUserProfile } from "../../hooks/useOwnUserProfile";

// Custom hook to fetch unread notification count
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

    const summaryRef = doc(
      db,
      "users",
      user.uid,
      "notificationSummary",
      "summary"
    );

    const unsubscribe = onSnapshot(
      summaryRef,
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
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
  const { user, loading: authLoading } = useAuth();
  const { profile } = useOwnUserProfile();
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
                  {path === "/notifications" && (
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faBell} />
                      {label}
                      {!notificationsLoading && unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  )}
                  {path !== "/notifications" && label}
                </NavLink>
              );
            })}
          </div>

          <div className="flex items-center space-x-4 relative">
            {!authLoading && (
              <div className="hidden md:block">
                {user && profile ? (
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setDropdownOpen((prev) => !prev)}
                      className="bg-white/10 hover:bg-white/20 text-white rounded-full px-4 py-2 flex items-center space-x-2 transition duration-300 cursor-pointer"
                    >
                      <FontAwesomeIcon icon={faUserCircle} />
                      <span>{profile.displayName || "User"}</span>
                      <FontAwesomeIcon
                        icon={faChevronDown}
                        className="ml-1 text-xs"
                      />
                    </button>

                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded-md shadow-lg z-50 overflow-hidden">
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-2 hover:bg-gray-100 transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <FontAwesomeIcon icon={faUser} className="mr-2" />
                          Profile
                        </Link>
                        <button
                          onClick={() => {
                            logout();
                            setDropdownOpen(false);
                          }}
                          className="w-full text-left flex items-center px-4 py-2 hover:bg-gray-100 transition-colors"
                        >
                          <FontAwesomeIcon icon={faSignOut} className="mr-2" />
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    className="bg-white/10 hover:bg-white/20 text-white rounded-full px-4 py-2 flex items-center space-x-2 transition duration-300"
                    onClick={loginWithGoogle}
                  >
                    <FontAwesomeIcon icon={faUserCircle} />
                    <span>Sign In</span>
                  </button>
                )}
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              className="md:hidden text-gray-300 hover:text-white"
              onClick={() => setMobileOpen((prev) => !prev)}
            >
              <FontAwesomeIcon icon={faBars} />
            </button>
          </div>
        </div>

        {/* Mobile Nav Menu */}
        {mobileOpen && (
          <div className="md:hidden flex flex-col space-y-2 mt-2">
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
                  className="block px-4 py-2 text-white hover:bg-white/10 rounded-md relative"
                  onClick={() => setMobileOpen(false)}
                >
                  {path === "/notifications" && (
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faBell} />
                      {label}
                      {!notificationsLoading && unreadCount > 0 && (
                        <span className="ml-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  )}
                  {path !== "/notifications" && label}
                </NavLink>
              );
            })}

            {!authLoading &&
              (user ? (
                <>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-white hover:bg-white/10 rounded-md"
                    onClick={() => setMobileOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileOpen(false);
                    }}
                    className="block text-left w-full px-4 py-2 text-white hover:bg-white/10 rounded-md"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    loginWithGoogle();
                    setMobileOpen(false);
                  }}
                  className="block text-left w-full px-4 py-2 text-white hover:bg-white/10 rounded-md"
                >
                  Sign In
                </button>
              ))}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Header;
