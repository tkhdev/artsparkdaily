import React from "react";
import { FontAwesomeIcon as FontAwesome } from "@fortawesome/react-fontawesome";
import {
  faUserPlus,
  faLightbulb,
  faImage,
  faThumbsUp,
  faArrowRight,
  faArrowDown,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { useAuthActions } from "../../hooks/useAuthActions";

const HowItWorks = () => {
  const { loginWithGoogle } = useAuthActions();

  const steps = [
    {
      number: "01",
      icon: faUserPlus,
      title: "Sign Up",
      description:
        "Create your free account using Google Sign-In to start your creative journey. It's quick, secure, and gives you access to all features.",
      action: "Sign Up Now",
      onClick: loginWithGoogle,
      gradient: "from-pink-500 to-purple-600",
    },
    {
      number: "02",
      icon: faLightbulb,
      title: "Explore the Daily Prompt",
      description:
        "A new AI-generated prompt is released every day at 00:00 UTC. Find it on the homepage or challenge page to spark your creativity.",
      action: "View Today's Prompt",
      link: "/",
      gradient: "from-purple-500 to-cyan-600",
    },
    {
      number: "03",
      icon: faImage,
      title: "Generate Art",
      description:
        "Use up to 5 free prompt attempts per challenge with the Pollinations API to create AI-generated art. Experiment, download, or share your creations.",
      action: null,
      link: null,
      gradient: "from-cyan-500 to-pink-600",
    },
    {
      number: "04",
      icon: faThumbsUp,
      title: "Submit & Engage",
      description:
        "Submit one final piece per challenge to the public gallery. Like, comment, and vote on others' submissions to help choose the daily winner!",
      action: "Visit the Gallery",
      link: "/gallery",
      gradient: "from-green-500 to-purple-600",
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="relative inline-block">
            <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 animate-pulse">
                How It Works
              </span>
            </h1>
            <div className="absolute -inset-4 bg-gradient-to-r from-pink-400/20 to-purple-400/20 blur-2xl rounded-full"></div>
          </div>
          <p className="text-gray-300 text-xl md:text-2xl font-light max-w-2xl mx-auto leading-relaxed">
            Get started with Art Spark Daily in 4 easy steps
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-16 mb-24">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="group relative overflow-hidden">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500`}
                ></div>
                <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:border-white/20">
                  <div className="flex flex-col md:flex-row items-start gap-6">
                    {/* Step Number & Icon */}
                    <div className="flex flex-col items-center gap-4 md:min-w-[120px]">
                      <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white/20 to-white/5">
                        {step.number}
                      </div>

                      <div
                        className={`w-20 h-20 bg-gradient-to-br ${step.gradient} rounded-full flex items-center justify-center shadow-2xl group-hover:shadow-lg transition-all duration-500`}
                      >
                        <FontAwesome
                          icon={step.icon}
                          className="text-2xl text-white drop-shadow-lg"
                        />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h2 className="text-3xl font-bold text-white mb-4">
                        {step.title}
                      </h2>
                      <p className="text-gray-300 text-lg leading-relaxed mb-6">
                        {step.description}
                      </p>

                      {step.action && step.link && (
                        <Link
                          to={step.link}
                          className={`inline-flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r ${step.gradient} hover:opacity-80 text-lg font-semibold transition-all duration-300 group/link`}
                        >
                          {step.action}
                          <FontAwesome
                            icon={faArrowRight}
                            className="group-hover/link:translate-x-1 transition-transform duration-300 text-pink-400"
                          />
                        </Link>
                      )}
                      {step.action && step.onClick && (
                        <button
                          onClick={loginWithGoogle}
                          className={`inline-flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r ${step.gradient} hover:opacity-80 text-lg font-semibold transition-all duration-300 group/link cursor-pointer`}
                        >
                          {step.action}
                          <FontAwesome
                            icon={faArrowRight}
                            className="group-hover/link:translate-x-1 transition-transform duration-300 text-pink-400"
                          />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Arrow Between Steps */}
              {index < steps.length - 1 && (
                <div className="flex justify-center py-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center border border-purple-400/30">
                    <FontAwesome
                      icon={faArrowDown}
                      className="text-purple-400 animate-bounce"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Features Highlight */}
        <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-white/10 rounded-3xl p-8 mb-16">
          <h3 className="text-2xl font-bold text-white text-center mb-8">
            Why Choose Art Spark Daily?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-2">
                100% Free
              </div>
              <div className="text-gray-400">
                No hidden costs or premium features
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mb-2">
                Daily Fresh
              </div>
              <div className="text-gray-400">
                New prompts every 24 hours
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400 mb-2">
                Community
              </div>
              <div className="text-gray-400">
                Connect with fellow artists
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center space-y-6">
          <h3 className="text-3xl font-bold text-white mb-8">
            Ready to Start Your Creative Journey?
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={loginWithGoogle}
              className="group relative overflow-hidden bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-pink-500/50 cursor-pointer"
              aria-label="Start creating with Art Spark Daily"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Creating
                <FontAwesome
                  icon={faArrowRight}
                  className="group-hover:translate-x-1 transition-transform duration-300"
                />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>

            <Link
              to="/faq"
              className="group text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-300 hover:to-purple-300 text-lg font-semibold border-2 border-pink-500/30 hover:border-pink-400/50 px-8 py-4 rounded-2xl transition-all duration-300 flex items-center gap-2"
              aria-label="View frequently asked questions"
            >
              Have Questions? Check Our FAQ
              <FontAwesome
                icon={faArrowRight}
                className="group-hover:translate-x-1 transition-transform duration-300"
              />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default HowItWorks;
