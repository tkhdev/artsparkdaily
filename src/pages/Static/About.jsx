import React from "react";
import { FontAwesomeIcon as FontAwesome } from "@fortawesome/react-fontawesome";
import {
  faLightbulb,
  faUsers,
  faPaintBrush,
  faArrowRight
} from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import { useHeroStats } from "../../hooks/useHeroStats";

const AboutPage = () => {
  const { stats, loading } = useHeroStats();
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="relative inline-block">
            <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 animate-pulse">
                Art Spark Daily
              </span>
            </h1>
            <div className="absolute -inset-4 bg-gradient-to-r from-pink-400/20 to-purple-400/20 blur-xl rounded-full"></div>
          </div>
          <p className="text-gray-300 text-xl md:text-2xl font-light max-w-2xl mx-auto leading-relaxed">
            Ignite your creativity with AI-powered art challenges that spark
            imagination
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Mission Card */}
          <div className="group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-pink-500/20 rounded-3xl p-8 hover:border-pink-400/40">
              {/* Full Round Icon */}
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl group-hover:shadow-pink-500/50 transition-all duration-500">
                <FontAwesome
                  icon={faLightbulb}
                  className="text-2xl text-white drop-shadow-lg"
                />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4 text-center">
                Our Mission
              </h2>
              <p className="text-gray-300 text-center leading-relaxed">
                Democratizing artistic expression through AI-powered creativity.
                We inspire artists of all levels to create, share, and connect
                through daily challenges.
              </p>
            </div>
          </div>

          {/* Community Card */}
          <div className="group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-purple-500/20 rounded-3xl p-8 hover:border-purple-400/40">
              {/* Full Round Icon */}
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-cyan-600 rounded-full flex items-center justify-center shadow-2xl group-hover:shadow-purple-500/50 transition-all duration-500">
                <FontAwesome
                  icon={faUsers}
                  className="text-2xl text-white drop-shadow-lg"
                />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4 text-center">
                Our Community
              </h2>
              <p className="text-gray-300 text-center leading-relaxed">
                Join thousands of digital artists and AI enthusiasts worldwide.
                Share your creations, vote for favorites, and earn achievements
                on your creative journey.
              </p>
            </div>
          </div>

          {/* How It Works Card */}
          <div className="group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-pink-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-cyan-500/20 rounded-3xl p-8 hover:border-cyan-400/40">
              {/* Full Round Icon */}
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-cyan-500 to-pink-600 rounded-full flex items-center justify-center shadow-2xl group-hover:shadow-cyan-500/50 transition-all duration-500">
                <FontAwesome
                  icon={faPaintBrush}
                  className="text-2xl text-white drop-shadow-lg"
                />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4 text-center">
                How It Works
              </h2>
              <p className="text-gray-300 text-center leading-relaxed">
                Daily prompts at 00:00 UTC powered by Pollinations API. Create
                up to 5 pieces per challenge and compete for daily winner status
                through community votes.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-white/10 rounded-3xl p-8 mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                {stats.artists.toLocaleString()}+
              </div>
              <div className="text-gray-400 text-sm">Artists</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                {stats.creations.toLocaleString()}+
              </div>
              <div className="text-gray-400 text-sm">Artworks</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400">
                {stats.challenges.toLocaleString()}+
              </div>
              <div className="text-gray-400 text-sm">Daily Prompts</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                24/7
              </div>
              <div className="text-gray-400 text-sm">Creative Flow</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center space-y-6">
          <h3 className="text-3xl font-bold text-white mb-8">
            Ready to Spark Your Creativity?
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate('/pricing')}
              className="group relative overflow-hidden bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-pink-500/50 cursor-pointer"
              aria-label="Sign up for Art Spark Daily"
            >
              <span className="relative z-10 flex items-center gap-2">
                Join the Creative Spark
                <FontAwesome
                  icon={faArrowRight}
                  className="group-hover:translate-x-1 transition-transform duration-300"
                />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>

            <Link
              to="/gallery"
              className="group text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-300 hover:to-purple-300 text-lg font-semibold border-2 border-pink-500/30 hover:border-pink-400/50 px-8 py-4 rounded-2xl transition-all duration-300 flex items-center gap-2"
              aria-label="View the Art Spark Daily gallery"
            >
              Explore the Gallery
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

export default AboutPage;
