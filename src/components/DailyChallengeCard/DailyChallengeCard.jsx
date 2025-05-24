import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagic,
  faDice,
  faSpinner,
  faExclamationTriangle,
  faPlus,
  faCalendarDay,
  faClock,
  faRefresh,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../context/AuthContext";
import GlowButton from "../GlowButton/GlowButton";
import { useDailyChallenge } from "../../hooks/useDailyChallenge";

export default function DailyChallengeCard() {
  const { 
    challenge, 
    loading, 
    error,
  } = useDailyChallenge();

  const [prompt, setPrompt] = useState("");
  const [timeRemaining, setTimeRemaining] = useState("");
  const { user } = useAuth();

  // Update countdown timer
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = tomorrow - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeRemaining(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateChallenge = async () => {
    try {
      await createTodaysChallenge();
    } catch (err) {
      console.error('Failed to create challenge:', err);
    }
  };

  const handleRandomInspiration = () => {
    const inspirations = [
      "A ethereal nebula with crystalline formations floating within",
      "Sleeping figures whose dreams manifest as glowing galaxies around them",
      "A cosmic library where knowledge takes the form of swirling stardust",
      "Dreamcatchers that capture actual pieces of the cosmos",
      "A surreal landscape where gravity flows like water through space",
      "Celestial beings painting aurora across the void of space",
      "A dream sequence where memories become constellations",
      "Floating islands connected by streams of liquid starlight",
      "A cosmic garden where flowers are made of compressed starlight",
      "Portals between dimensions opening in a dreamer's mind"
    ];
    
    const randomInspiration = inspirations[Math.floor(Math.random() * inspirations.length)];
    setPrompt(randomInspiration);
  };

  const handleGenerateArt = () => {
    if (!prompt.trim()) {
      alert("Please enter a prompt first!");
      return;
    }

    alert("Art generation feature coming soon!");
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-3xl shadow-xl border border-white/10 overflow-hidden max-w-4xl mx-auto mb-24">
        <div className="px-6 py-8 sm:p-10 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <FontAwesomeIcon icon={faSpinner} className="text-4xl text-purple-400 animate-spin mb-4" />
            <p className="text-gray-300 text-lg">Loading today's challenge...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-gradient-to-br from-red-900/30 to-pink-900/30 rounded-3xl shadow-xl border border-red-500/20 overflow-hidden max-w-4xl mx-auto mb-24">
        <div className="px-6 py-8 sm:p-10 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-4xl text-red-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Error Loading Challenge</h3>
            <p className="text-gray-300 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <FontAwesomeIcon icon={faRefresh} className="mr-2" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No challenge available state
  if (!challenge) {
    return (
      <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-3xl shadow-xl border border-white/10 overflow-hidden max-w-4xl mx-auto mb-24">
        <div className="px-6 py-8 sm:p-10 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <FontAwesomeIcon icon={faCalendarDay} className="text-4xl text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Challenge Available</h3>
            <p className="text-gray-300 mb-6">
              {user 
                ? "Today's challenge hasn't been created yet. Would you like to create one?"
                : "Please sign in to create today's challenge."
              }
            </p>
            
            {user && (
              <GlowButton
                onClick={handleCreateChallenge}
                disabled={creating}
                className="glow-button bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 px-6 rounded-lg flex justify-center items-center space-x-2 transition-all"
              >
                {creating ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                    <span>Create Today's Challenge</span>
                  </>
                )}
              </GlowButton>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Format the challenge date
  const formatDate = (timestamp) => {
    if (!timestamp) return "Today";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Get challenge type color
  const getTypeColor = (type) => {
    switch (type) {
      case 'special':
        return 'bg-gold-500/20 text-gold-300 border-gold-500/30';
      case 'dynamic':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'curated':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'manual':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default:
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-3xl shadow-xl border border-white/10 overflow-hidden max-w-4xl mx-auto mb-24">
      <div className="px-6 py-8 sm:p-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Today's Challenge
              </span>
              {challenge.type && (
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getTypeColor(challenge.type)}`}>
                  {challenge.type.charAt(0).toUpperCase() + challenge.type.slice(1)}
                </span>
              )}
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-2">
              {challenge.title}
            </h2>
            
            <p className="text-gray-300 mb-2">
              {challenge.task}
            </p>
            
            {challenge.date && (
              <p className="text-gray-400 text-sm">
                <FontAwesomeIcon icon={faCalendarDay} className="mr-1" />
                {formatDate(challenge.date)}
              </p>
            )}
          </div>
          
          <div className="mt-6 md:mt-0 md:ml-6">
            <span className="text-gray-400 text-sm flex items-center">
              <FontAwesomeIcon icon={faClock} className="mr-1" />
              Time remaining
            </span>
            <div className="text-2xl font-mono font-bold text-white mt-1">
              {timeRemaining}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="relative bg-black/30 backdrop-blur rounded-xl p-6 border border-white/10">
            <label
              htmlFor="prompt"
              className="block text-sm font-medium text-gray-400 mb-2"
            >
              Your Prompt
            </label>
            <textarea
              id="prompt"
              rows="3"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder={`Describe your interpretation of "${challenge.title}"...`}
            />

            <div className="mt-4 flex flex-col sm:flex-row gap-4">
              <GlowButton 
                onClick={handleGenerateArt}
                className="glow-button bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 px-6 rounded-lg flex-1 flex justify-center items-center space-x-2 transition-all"
              >
                <FontAwesomeIcon icon={faMagic} className="mr-2" />
                <span>Generate Art</span>
              </GlowButton>
              
              <button 
                onClick={handleRandomInspiration}
                className="border border-purple-500/50 hover:bg-purple-500/20 text-white font-medium py-3 px-6 rounded-lg flex-1 flex justify-center items-center transition-all"
              >
                <FontAwesomeIcon icon={faDice} className="mr-2" />
                <span>Random Inspiration</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}