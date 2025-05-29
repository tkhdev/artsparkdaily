import {
  faLightbulb,
  faWandMagicSparkles,
  faShareNodes
} from "@fortawesome/free-solid-svg-icons";
import HowItWorksStep from "./HowItWorksStep";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function HowItWorks() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-gradient-to-b from-transparent to-purple-900/20 rounded-3xl">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold mb-4">How It Works</h2>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Create AI-powered art in three simple steps
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <HowItWorksStep
          icon={faLightbulb}
          iconBgClass="bg-gradient-to-br from-purple-500 to-pink-500"
          title="1. Get Inspired"
          description="Discover the daily challenge prompt and let your imagination flow"
        />
        <HowItWorksStep
          icon={faWandMagicSparkles}
          iconBgClass="bg-gradient-to-br from-blue-500 to-purple-500"
          title="2. Create Art"
          description="Use our AI-powered tool to transform your ideas into stunning visuals"
        />
        <HowItWorksStep
          icon={faShareNodes}
          iconBgClass="bg-gradient-to-br from-pink-500 to-orange-500"
          title="3. Share & Connect"
          description="Submit to the gallery, receive feedback, and connect with fellow artists"
        />
      </div>

      {!user && (
        <div className="text-center mt-16">
          <button
            className="bg-white text-purple-900 hover:bg-gray-100 font-bold py-4 px-8 rounded-full shadow-lg transform transition hover:scale-105 cursor-pointer"
            onClick={() => navigate("/pricing")}
          >
            Start Creating Now
          </button>
        </div>
      )}
    </section>
  );
}
