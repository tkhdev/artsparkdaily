import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagic,
  faDice,
  faSpinner,
  faExclamationCircle
} from "@fortawesome/free-solid-svg-icons";
import GlowButton from "./GlowButton/GlowButton";
import { getRandomInspiration } from "../utils/challengeUtils";

const PromptForm = ({
  challenge,
  onGenerate,
  isLoading,
  canGenerate,
  error
}) => {
  const [prompt, setPrompt] = useState("");

  const handleRandomInspiration = () => {
    const inspiration = getRandomInspiration();
    setPrompt(inspiration.slice(0, 500));
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
        Your Prompt (max 500 characters)
      </label>
      <textarea
        id="prompt"
        rows="3"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value.slice(0, 500))}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
        placeholder={`Describe your interpretation of "${challenge.title}"...`}
      />
      <p className="text-gray-500 text-sm mt-1">
        {prompt.length}/500 characters
      </p>

      <div className="mt-4 flex flex-col sm:flex-row gap-4">
        <GlowButton
          onClick={handleSubmit}
          className="glow-button bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 px-6 rounded-lg flex-1 flex justify-center items-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
          className="border border-purple-500/50 hover:bg-purple-500/20 text-white font-medium py-3 px-6 rounded-lg flex-1 flex justify-center items-center transition-all"
          disabled={!canGenerate}
        >
          <FontAwesomeIcon icon={faDice} className="mr-2" />
          <span>Random Inspiration</span>
        </button>
      </div>

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
