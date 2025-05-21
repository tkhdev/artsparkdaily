import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle, faBars } from "@fortawesome/free-solid-svg-icons";

function Header() {
  return (
    <nav className="bg-black/30 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <NavLink to="/" className="flex items-center">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 text-2xl font-bold">
                Daily AI Art
              </span>
            </NavLink>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium ${
                  isActive ? "text-white" : "text-gray-300 hover:text-white"
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/gallery"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium ${
                  isActive ? "text-white" : "text-gray-300 hover:text-white"
                }`
              }
            >
              Gallery
            </NavLink>
            <NavLink
              to="/leaderboard"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium ${
                  isActive ? "text-white" : "text-gray-300 hover:text-white"
                }`
              }
            >
              Leaderboard
            </NavLink>
            <NavLink
              to="/community"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium ${
                  isActive ? "text-white" : "text-gray-300 hover:text-white"
                }`
              }
            >
              Community
            </NavLink>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:block">
              <button className="bg-white/10 hover:bg-white/20 text-white rounded-full px-4 py-2 flex items-center space-x-2 transition duration-300">
                <FontAwesomeIcon icon={faUserCircle} />
                <span>Sign In</span>
              </button>
            </div>
            <button className="md:hidden text-gray-300 hover:text-white">
              <FontAwesomeIcon icon={faBars} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Header;
