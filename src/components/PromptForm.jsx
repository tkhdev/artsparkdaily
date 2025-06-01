import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagic,
  faDice,
  faSpinner,
  faExclamationCircle,
  faRobot
} from "@fortawesome/free-solid-svg-icons";
import GlowButton from "./GlowButton/GlowButton";

const PromptForm = ({
  challenge,
  onGenerate,
  isLoading,
  canGenerate,
  error
}) => {
  const [prompt, setPrompt] = useState("");
  const [fetchingInspiration, setFetchingInspiration] = useState(false);

  const handleRandomInspiration = async () => {
    if (!challenge?.title) {
      alert("Challenge title is missing.");
      return;
    }

    setFetchingInspiration(true);
    try {
      const basePrompt = encodeURIComponent(
        `You are an imaginative prompt engineer. Your task is to craft a vivid, inspiring, and non-trivial prompt for an AI image generation model. The prompt must be based on the theme: "${
          challenge.title
        }". Your output must be a single, ready-to-use prompt only (max 500 characters). Do not include any metadata, commentary, or echo of the seed: --random-seed-${Date.now()}`
      );

      const response = await fetch(`https://text.pollinations.ai/${basePrompt}`);
      const text = await response.text();

      const cleaned = text
        .replace(/["\n\r]/g, "")
        .trim()
        .slice(0, 500);

      setPrompt(cleaned);
    } catch (err) {
      console.error("Failed to fetch inspiration:", err);
      alert("Could not fetch inspiration. Try again.");
    } finally {
      setFetchingInspiration(false);
    }
  };

  const handleSubmit = () => {
    if (!prompt.trim()) {
      alert("Please enter a prompt first!");
      return;
    }

    if (prompt.length > 500) {
      alert("Prompt must be 500 characters or less!");
      return;
    }

    if (!canGenerate) {
      alert("You've used all your generation attempts for today's challenge!");
      return;
    }

    onGenerate(prompt);
    setPrompt("");
  };

  return (
    <div className="relative bg-black/30 backdrop-blur rounded-xl p-6 border border-white/10">
      <label
        htmlFor="prompt"
        className="block text-sm font-medium text-gray-400 mb-2"
      >
        Your Prompt <span className="text-xs text-gray-500">(max 500 characters)</span>
      </label>
      <textarea
        id="prompt"
        rows="3"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value.slice(0, 500))}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
        placeholder={`Describe your interpretation of "${challenge.title}"...`}
      />
      <p className="text-gray-500 text-sm mt-1">{prompt.length}/500 characters</p>

      <div className="mt-4 flex flex-col sm:flex-row gap-4">
        <GlowButton
          onClick={handleSubmit}
          className="glow-button bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 px-6 rounded-lg flex-1 flex justify-center items-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          disabled={isLoading || !canGenerate}
        >
          {isLoading ? (
            <>
              <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faMagic} className="mr-2" />
              <span>{canGenerate ? "Generate Art" : "Attempts Used Up"}</span>
            </>
          )}
        </GlowButton>

        <button
          onClick={handleRandomInspiration}
          className="relative border border-purple-500/50 hover:bg-purple-500/20 text-white font-medium py-3 px-6 rounded-lg flex-1 flex justify-center items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md hover:shadow-purple-500/30"
          disabled={!canGenerate || fetchingInspiration}
        >
          {fetchingInspiration ? (
            <>
              <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
              <span>Loading Inspiration...</span>
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faDice} className="mr-2" />
              <span>Random Inspiration</span>
            </>
          )}

          <span className="absolute -top-2 -right-2 bg-purple-700 text-xs px-2 py-1 rounded-full flex items-center space-x-1">
            <FontAwesomeIcon icon={faRobot} className="text-white" />
            <span>AI</span>
          </span>
        </button>
      </div>

      <p className="text-xs text-purple-300 mt-2 italic text-center">
        Need a creative spark? Let our AI muse surprise you with a unique prompt!
      </p>

      {!canGenerate && (
        <div className="mt-4 bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center">
            <FontAwesomeIcon
              icon={faExclamationCircle}
              className="text-red-400 mr-2"
            />
            <p className="text-red-300 text-sm">
              You've used all your generation attempts for today's challenge.
            </p>
          </div>
        </div>
      )}

      {error && <p className="text-red-400 mt-4 text-center">Error: {error}</p>}
    </div>
  );
};

export default PromptForm;
