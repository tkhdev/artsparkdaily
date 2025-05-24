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
  faUpload,
  faCheckCircle,
  faExclamationCircle
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../context/AuthContext";
import GlowButton from "../GlowButton/GlowButton";
import { useDailyChallenge } from "../../hooks/useDailyChallenge";
import usePollinationsImage from "../../hooks/usePollinationsImage";
import { useSubmission } from "../../hooks/useSubmission";

export default function DailyChallengeCard() {
  const { challenge, loading, error } = useDailyChallenge();
  const [prompt, setPrompt] = useState("");
  const [timeRemaining, setTimeRemaining] = useState("");
  const { user } = useAuth();

  // Use the Pollinations hook (now handles attempts tracking)
  const {
    imageUrl,
    loading: imageLoading,
    error: imageError,
    attemptsUsed,
    attemptsLoading,
    canGenerate,
    generateImage,
    fetchAttemptsUsed
  } = usePollinationsImage();

  // Submission hook (now focused only on submissions)
  const {
    submitArt,
    loading: submissionLoading,
    error: submissionError,
    userSubmission,
    canSubmit
  } = useSubmission(challenge?.id);

  // Fetch attempts when challenge changes
  useEffect(() => {
    if (challenge?.id) {
      fetchAttemptsUsed(challenge.id);
    }
  }, [challenge?.id, fetchAttemptsUsed]);

  // Timer effect remains unchanged
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();

      // Create tomorrow's date at 00:00:00 UTC
      const tomorrowUTC = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate() + 1, // Tomorrow
          0,
          0,
          0,
          0
        )
      );

      const diff = tomorrowUTC - now;

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateChallenge = async () => {
    try {
      await createTodaysChallenge();
    } catch (err) {
      console.error("Failed to create challenge:", err);
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

    const randomInspiration =
      inspirations[Math.floor(Math.random() * inspirations.length)];
    setPrompt(randomInspiration);
  };

  const handleGenerateArt = async () => {
    if (!prompt.trim()) {
      alert("Please enter a prompt first!");
      return;
    }

    if (!canGenerate) {
      alert("You've used all 5 generation attempts for today's challenge!");
      return;
    }

    try {
      await generateImage(prompt, challenge.id);
    } catch (error) {
      console.error("Failed to generate image:", error);
    }
  };

  const handleSubmitArt = async () => {
    if (!imageUrl) {
      alert("Please generate an image first!");
      return;
    }

    if (!canSubmit) {
      alert("You have already submitted to today's challenge!");
      return;
    }

    try {
      await submitArt({
        challengeId: challenge.id,
        prompt: prompt.trim(),
        imageUrl: imageUrl,
        userId: user.uid,
        userDisplayName: user.displayName || "Anonymous",
        userPhotoURL: user.photoURL || null
      });

      // Clear the current image after submission
      setPrompt("");
    } catch (error) {
      console.error("Failed to submit art:", error);
    }
  };

  // Loading, error, no challenge states remain unchanged
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-3xl shadow-xl border border-white/10 overflow-hidden max-w-4xl mx-auto mb-24">
        <div className="px-6 py-8 sm:p-10 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <FontAwesomeIcon
              icon={faSpinner}
              className="text-4xl text-purple-400 animate-spin mb-4"
            />
            <p className="text-gray-300 text-lg">
              Loading today's challenge...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-red-900/30 to-pink-900/30 rounded-3xl shadow-xl border border-red-500/20 overflow-hidden max-w-4xl mx-auto mb-24">
        <div className="px-6 py-8 sm:p-10 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <FontAwesomeIcon
              icon={faExclamationTriangle}
              className="text-4xl text-red-400 mb-4"
            />
            <h3 className="text-xl font-semibold text-white mb-2">
              Error Loading Challenge
            </h3>
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

  if (!challenge) {
    return (
      <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-3xl shadow-xl border border-white/10 overflow-hidden max-w-4xl mx-auto mb-24">
        <div className="px-6 py-8 sm:p-10 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <FontAwesomeIcon
              icon={faCalendarDay}
              className="text-4xl text-gray-400 mb-4"
            />
            <h3 className="text-xl font-semibold text-white mb-2">
              No Challenge Available
            </h3>
            <p className="text-gray-300 mb-6">
              {user
                ? "Today's challenge hasn't been created yet. Would you like to create one?"
                : "Please sign in to create today's challenge."}
            </p>

            {user && (
              <GlowButton
                onClick={handleCreateChallenge}
                disabled={creating}
                className="glow-button bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 px-6 rounded-lg flex justify-center items-center space-x-2 transition-all"
              >
                {creating ? (
                  <>
                    <FontAwesomeIcon
                      icon={faSpinner}
                      className="animate-spin mr-2"
                    />
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

  const formatDate = (timestamp) => {
    if (!timestamp) return "Today";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "special":
        return "bg-gold-500/20 text-gold-300 border-gold-500/30";
      case "dynamic":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "curated":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "manual":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      default:
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
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
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getTypeColor(
                    challenge.type
                  )}`}
                >
                  {challenge.type.charAt(0).toUpperCase() +
                    challenge.type.slice(1)}
                </span>
              )}
              {userSubmission && (
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-300 border border-green-500/30">
                  <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                  Submitted
                </span>
              )}
            </div>

            <h2 className="text-3xl font-bold text-white mb-2">
              {challenge.title}
            </h2>

            <p className="text-gray-300 mb-2">{challenge.task}</p>

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

        {/* Generation Attempts Counter */}
        {user && !attemptsLoading && !userSubmission && (
          <div className="mb-6 bg-black/20 rounded-lg p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">
                Generation Attempts Used:
              </span>
              <span
                className={`font-mono font-bold ${
                  attemptsUsed >= 5 ? "text-red-400" : "text-purple-300"
                }`}
              >
                {attemptsUsed}/5
              </span>
            </div>
            <div className="mt-2 bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  attemptsUsed >= 5 ? "bg-red-500" : "bg-purple-500"
                }`}
                style={{ width: `${(attemptsUsed / 5) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="space-y-8">
          {/* Show existing submission if user has already submitted */}
          {userSubmission && (
            <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className="text-green-400 mr-2"
                />
                <h3 className="text-lg font-semibold text-white">
                  Your Submission
                </h3>
              </div>
              <p className="text-gray-300 mb-4">"{userSubmission.prompt}"</p>
              <img
                src={userSubmission.imageUrl}
                alt="Your submission"
                className="rounded-lg max-w-full max-h-64 border border-white/20 shadow-lg"
              />
              <p className="text-gray-400 text-sm mt-2">
                Submitted at{" "}
                {userSubmission.createdAt?.toDate().toLocaleString()}
              </p>
            </div>
          )}

          {/* Generation Interface - only show if user hasn't submitted */}
          {user && !userSubmission && (
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
                  className="glow-button bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 px-6 rounded-lg flex-1 flex justify-center items-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={imageLoading || !canGenerate}
                >
                  {imageLoading ? (
                    <>
                      <FontAwesomeIcon
                        icon={faSpinner}
                        className="animate-spin mr-2"
                      />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faMagic} className="mr-2" />
                      <span>
                        {canGenerate ? "Generate Art" : "Attempts Used Up"}
                      </span>
                    </>
                  )}
                </GlowButton>

                <button
                  onClick={handleRandomInspiration}
                  className="border border-purple-500/50 hover:bg-purple-500/20 text-white font-medium py-3 px-6 rounded-lg flex-1 flex justify-center items-center transition-all"
                  disabled={!canGenerate}
                >
                  <FontAwesomeIcon icon={faDice} className="mr-2" />
                  <span>Random Inspiration</span>
                </button>
              </div>

              {!canGenerate && user && (
                <div className="mt-4 bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                  <div className="flex items-center">
                    <FontAwesomeIcon
                      icon={faExclamationCircle}
                      className="text-red-400 mr-2"
                    />
                    <p className="text-red-300 text-sm">
                      You've used all 5 generation attempts for today's
                      challenge.
                    </p>
                  </div>
                </div>
              )}

              {(imageError || submissionError) && (
                <p className="text-red-400 mt-4 text-center">
                  Error: {imageError || submissionError}
                </p>
              )}

              {imageUrl && (
                <div className="mt-6">
                  <div className="flex justify-center mb-4">
                    <img
                      src={imageUrl}
                      alt="Generated art"
                      className="rounded-lg max-w-full max-h-96 border border-white/20 shadow-lg"
                    />
                  </div>

                  <div className="flex justify-center">
                    <GlowButton
                      onClick={handleSubmitArt}
                      className="glow-button bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium py-3 px-8 rounded-lg flex justify-center items-center space-x-2 transition-all"
                      disabled={submissionLoading || !canSubmit}
                    >
                      {submissionLoading ? (
                        <>
                          <FontAwesomeIcon
                            icon={faSpinner}
                            className="animate-spin mr-2"
                          />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faUpload} className="mr-2" />
                          <span>Submit to Gallery</span>
                        </>
                      )}
                    </GlowButton>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Show sign-in prompt if user is not authenticated */}
          {!user && (
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6 text-center">
              <FontAwesomeIcon
                icon={faExclamationCircle}
                className="text-blue-400 text-2xl mb-4"
              />
              <h3 className="text-lg font-semibold text-white mb-2">
                Sign In Required
              </h3>
              <p className="text-gray-300">
                Please sign in to generate art and participate in today's
                challenge.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
