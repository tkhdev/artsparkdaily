import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import GlowButton from "../GlowButton/GlowButton";
import { Link, useNavigate } from "react-router-dom";

export default function JoinCommunity() {
  const navigate = useNavigate();

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-gradient-to-r from-purple-800/50 to-pink-800/50 rounded-3xl shadow-xl border border-white/10 overflow-hidden">
        <div className="px-8 py-16 sm:p-16 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Join our creative community today
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Connect with thousands of artists, get inspired daily, and share
            your unique AI-generated creations with the world.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <GlowButton
              className="glow-button bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-lg flex items-center justify-center cursor-pointer"
              onClick={() => navigate("/pricing")}
            >
              <FontAwesomeIcon icon={faGoogle} className="mr-2" />
              Sign up with Google
            </GlowButton>
            <Link to="how-it-works">
              <button className="bg-white/10 hover:bg-white/20 text-white font-bold py-4 px-8 rounded-lg cursor-pointer">
                Learn More
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
