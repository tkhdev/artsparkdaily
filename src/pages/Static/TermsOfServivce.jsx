import React from "react";
import { FontAwesomeIcon as FontAwesome } from "@fortawesome/react-fontawesome";
import { faGavel, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

const TermsOfService = () => {
  const sections = [
    {
      title: "User Conduct",
      content: "Users must submit respectful and appropriate content. Inappropriate submissions or comments, including offensive or copyrighted material, will be removed, and accounts may be suspended.",
      gradient: "from-pink-500 to-purple-600"
    },
    {
      title: "Intellectual Property",
      content: "You retain ownership of your submissions but grant Art Spark Daily a non-exclusive license to display them in the gallery. AI-generated art via the Pollinations API is subject to their terms.",
      gradient: "from-purple-500 to-cyan-600"
    },
    {
      title: "Data Usage",
      content: "We collect and store user data in compliance with GDPR. See our Privacy Policy for details on how your information is used and protected.",
      gradient: "from-cyan-500 to-pink-600"
    },
    {
      title: "Termination",
      content: "We reserve the right to terminate accounts for violations of these terms, including abusive behavior or unauthorized data access attempts.",
      gradient: "from-green-500 to-purple-600"
    }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="relative inline-block">
            <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 animate-pulse">
                Terms of Service
              </span>
            </h1>
            <div className="absolute -inset-4 bg-gradient-to-r from-pink-400/20 to-purple-400/20 blur-xl rounded-full"></div>
          </div>
          <p className="text-gray-300 text-xl md:text-2xl font-light max-w-2xl mx-auto leading-relaxed">
            Understand your responsibilities as a user of Art Spark Daily
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-12 mb-16">
          {sections.map((section, index) => (
            <div key={index} className="relative">
              <div className="group relative overflow-hidden rounded-3xl">
                <div className={`absolute inset-0 bg-gradient-to-br ${section.gradient}/10 rounded-3xl blur-xl`}></div>
                <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
                  <div className="flex flex-col md:flex-row items-start gap-6 rounded-3xl">
                    {/* Icon */}
                    <div className="flex flex-col items-center gap-4 md:min-w-[120px]">
                      <div className={`w-20 h-20 bg-gradient-to-br ${section.gradient} rounded-full flex items-center justify-center shadow-2xl`}>
                        <FontAwesome
                          icon={faGavel}
                          className="text-2xl text-white drop-shadow-lg"
                        />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h2 className="text-3xl font-bold text-white mb-4">{section.title}</h2>
                      <p className="text-gray-300 text-lg leading-relaxed">
                        {section.content}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Important Notice */}
        <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-white/10 rounded-3xl p-8 mb-16">
          <h3 className="text-2xl font-bold text-white text-center mb-8">Important Legal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-2">GDPR Compliant</div>
              <div className="text-gray-400">Your data is protected</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mb-2">Fair Use</div>
              <div className="text-gray-400">Respect intellectual property</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400 mb-2">Community</div>
              <div className="text-gray-400">Keep it respectful</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center space-y-6">
          <h3 className="text-3xl font-bold text-white mb-8">Questions About Our Terms?</h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/contact"
              className="group relative overflow-hidden bg-gradient-to-r from-pink-600 to-purple-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-xl"
              aria-label="Contact us about terms of service"
            >
              <span className="relative z-10 flex items-center gap-2">
                Contact Legal Team
                <FontAwesome icon={faArrowRight} />
              </span>
            </Link>
            
            <Link
              to="/privacy-policy"
              className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 text-lg font-semibold border-2 border-pink-500/30 px-8 py-4 rounded-2xl flex items-center gap-2"
              aria-label="View our privacy policy"
            >
              View Privacy Policy
              <FontAwesome icon={faArrowRight} />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default TermsOfService;