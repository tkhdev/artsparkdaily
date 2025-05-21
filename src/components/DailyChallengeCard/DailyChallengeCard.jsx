import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagic,
  faDice,
} from "@fortawesome/free-solid-svg-icons";
import GlowButton from "../GlowButton/GlowButton";

export default function DailyChallengeCard() {
  return (
    <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-3xl shadow-xl border border-white/10 overflow-hidden max-w-4xl mx-auto mb-24">
      <div className="px-6 py-8 sm:p-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 mb-3">
              Today's Challenge
            </span>
            <h2 className="text-3xl font-bold">Cosmic Dreams</h2>
            <p className="text-gray-300 mt-2">
              Create art that blends cosmic elements with dreamlike imagery
            </p>
          </div>
          <div className="mt-6 md:mt-0">
            <span className="text-gray-400 text-sm">Time remaining</span>
            <div className="text-2xl font-mono font-bold text-white mt-1">
              14:35:22
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
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Describe your cosmic dream scene..."
            ></textarea>

            <div className="mt-4 flex flex-col sm:flex-row gap-4">
              <GlowButton className="glow-button bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 px-6 rounded-lg flex-1 flex justify-center items-center space-x-2 transition-all">
                <FontAwesomeIcon icon={faMagic} className="mr-2" />
                <span>Generate Art</span>
              </GlowButton>
              <button className="border border-purple-500/50 hover:bg-purple-500/20 text-white font-medium py-3 px-6 rounded-lg flex-1 flex justify-center items-center transition-all">
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
