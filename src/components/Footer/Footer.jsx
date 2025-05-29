import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTwitter,
  faInstagram,
  faDiscord,
  faGithub,
} from "@fortawesome/free-brands-svg-icons";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";

function Footer() {
  return (
    <footer className="bg-black/30 border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              Art Spark Daily
            </h3>
            <p className="text-gray-400">
              Create, share, and connect through AI-generated art with daily
              creative prompts.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-medium mb-4">Navigation</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-white">Home</Link></li>
              <li><Link to="/gallery" className="text-gray-400 hover:text-white">Gallery</Link></li>
              <li><Link to="/leaderboard" className="text-gray-400 hover:text-white">Leaderboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-medium mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-400 hover:text-white">About</Link></li>
              <li><Link to="/how-it-works" className="text-gray-400 hover:text-white">How It Works?</Link></li>
              <li><Link to="/privacy-policy" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" className="text-gray-400 hover:text-white">Terms of Service</Link></li>
              <li><Link to="/faq" className="text-gray-400 hover:text-white">FAQ</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-medium mb-4">Connect</h4>
            <div className="flex space-x-4 mb-6">
              <a href="https://twitter.com" className="text-gray-400 hover:text-white text-xl" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faTwitter} />
              </a>
              <a href="https://instagram.com" className="text-gray-400 hover:text-white text-xl" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faInstagram} />
              </a>
              <a href="https://discord.com" className="text-gray-400 hover:text-white text-xl" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faDiscord} />
              </a>
              <a href="https://github.com" className="text-gray-400 hover:text-white text-xl" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faGithub} />
              </a>
            </div>
            <p className="text-gray-400 text-sm">Subscribe to our newsletter</p>
            <div className="mt-2 flex">
              <input
                type="email"
                placeholder="Your email"
                className="bg-white/5 border border-white/10 rounded-l-lg px-4 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent flex-1"
              />
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-r-lg">
                <FontAwesomeIcon icon={faPaperPlane} />
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 mt-12 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; 2025 Art Spark Daily. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;