import React from "react";
import { FontAwesomeIcon as FontAwesome } from "@fortawesome/react-fontawesome";
import { faShieldAlt, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

const sections = [
  {
    title: "Data Collection",
    content:
      "We collect data necessary to provide our services, including your Google authentication details (email, name), profile information (display name, bio, profile picture), and user-generated submissions stored securely in Firebase Firestore and Storage.",
    gradient: "from-pink-500 to-purple-600",
  },
  {
    title: "Data Usage",
    content:
      "Your data is used to personalize your experience, display submissions in the gallery, send notifications (e.g., new prompts, likes, achievements), and populate leaderboards. We may also use anonymized data for analytics to improve the platform.",
    gradient: "from-purple-500 to-cyan-600",
  },
  {
    title: "GDPR Compliance",
    content:
      "In compliance with GDPR, you have the right to access, rectify, or delete your data. Contact us to exercise these rights. We implement Firestore security rules and encryption to protect your data from unauthorized access.",
    gradient: "from-cyan-500 to-pink-600",
  },
  {
    title: "Third-Party Integrations",
    content:
      "We use the Pollinations API for AI art generation and Paddle for payment processing. These services may collect data as outlined in their respective privacy policies. We ensure these partners comply with GDPR.",
    gradient: "from-green-500 to-purple-600",
  },
];

const PrivacyPolicy = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 animate-pulse">
              Privacy Policy
            </span>
          </h1>
          <div className="absolute -inset-4 bg-gradient-to-r from-pink-400/20 to-purple-400/20 blur-xl rounded-full"></div>
          <p className="relative text-gray-300 text-xl md:text-2xl font-light max-w-2xl mx-auto leading-relaxed">
            How we protect your data at Art Spark Daily
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-12 mb-16">
          {sections.map(({ title, content, gradient }, idx) => (
            <div key={idx} className="relative group overflow-hidden rounded-3xl">
              <div
                className={`absolute inset-0 bg-gradient-to-br ${gradient}/10 rounded-3xl blur-xl transition-transform duration-300 group-hover:scale-105`}
              ></div>
              <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
                <div className="flex flex-col md:flex-row items-start gap-6 rounded-3xl">
                  {/* Icon */}
                  <div className="flex flex-col items-center gap-4 md:min-w-[120px]">
                    <div
                      className={`w-20 h-20 bg-gradient-to-br ${gradient} rounded-full flex items-center justify-center shadow-2xl`}
                    >
                      <FontAwesome
                        icon={faShieldAlt}
                        className="text-2xl text-white drop-shadow-lg"
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-white mb-4">{title}</h2>
                    <p className="text-gray-300 text-lg leading-relaxed">{content}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center space-y-6">
          <h3 className="text-3xl font-bold text-white mb-8">Questions About Your Data?</h3>
          <Link
            to="/contact"
            className="group relative overflow-hidden bg-gradient-to-r from-pink-600 to-purple-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-xl inline-flex justify-center items-center gap-2 mx-auto"
            aria-label="Contact us for data inquiries"
          >
            <span className="relative z-10 flex items-center gap-2">
              Contact Us for Data Inquiries
              <FontAwesome icon={faArrowRight} />
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default PrivacyPolicy;
