import { useState, useRef, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserCircle,
  faBars,
  faSignOut,
  faUser,
  faChevronDown
} from "@fortawesome/free-solid-svg-icons";

import { useAuth } from "../../context/AuthContext";
import { useAuthActions } from "../../hooks/useAuthActions";
import { useOwnUserProfile } from "../../hooks/useOwnUserProfile";

function Header() {
  const { user, loading } = useAuth();
  const { profile } = useOwnUserProfile();
  const { loginWithGoogle, logout } = useAuthActions();
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
              Daily AI Art
            </span>
          </NavLink>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-4">
            {["/", "/gallery", "/leaderboard"].map((path) => {
              const label = path === "/" ? "Home" : path.replace("/", "").charAt(0).toUpperCase() + path.slice(2);
              return (
                <NavLink
                  key={path}
                  to={path}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium ${
                      isActive ? "text-white" : "text-gray-300 hover:text-white"
                    }`
                  }
                >
                  {label}
                </NavLink>
              );
            })}
          </div>

          <div className="flex items-center space-x-4 relative">
            {!loading && (
              <div className="hidden md:block">
                {user && profile ? (
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setDropdownOpen((prev) => !prev)}
                      className="bg-white/10 hover:bg-white/20 text-white rounded-full px-4 py-2 flex items-center space-x-2 transition duration-300 cursor-pointer"
                    >
                      <FontAwesomeIcon icon={faUserCircle} />
                      <span>{profile.displayName || "User"}</span>
                      <FontAwesomeIcon icon={faChevronDown} className="ml-1 text-xs" />
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
            {["/", "/gallery", "/leaderboard"].map((path) => {
              const label = path === "/" ? "Home" : path.replace("/", "").charAt(0).toUpperCase() + path.slice(2);
              return (
                <NavLink
                  key={path}
                  to={path}
                  className="block px-4 py-2 text-white hover:bg-white/10 rounded-md"
                  onClick={() => setMobileOpen(false)}
                >
                  {label}
                </NavLink>
              );
            })}

            {!loading && (
              user ? (
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
              )
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Header;
