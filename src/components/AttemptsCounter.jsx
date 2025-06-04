import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle, faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons'; // Or faMagic, faStar for sparkles if faSparkles isn't available

const AttemptsCounter = ({ 
  attemptsUsed, 
  maxAttempts, 
  isLoading, 
  extraAttemptsLeft = 0 
}) => {
  if (isLoading) return null;

  const isAtLimit = attemptsUsed >= maxAttempts;
  const usagePercentage = (attemptsUsed / maxAttempts) * 100;
  
  return (
    <div className="mb-6 bg-gradient-to-br from-black/30 to-black/10 backdrop-blur-sm rounded-xl p-5 border border-white/10 shadow-lg transition-all duration-300 hover:shadow-purple-500/10">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white/90 font-medium">Generation Capacity</h3>
        {isAtLimit && (
          <span className="px-2 py-1 bg-red-500/20 border border-red-500/30 rounded-md text-red-300 text-xs font-semibold animate-pulse">
            LIMIT REACHED
          </span>
        )}
      </div>
      
      <div className="flex items-end justify-between mb-4">
        <div className="flex flex-col">
          <span className="text-gray-400 text-sm mb-1">Attempts Used</span>
          <span
            className={`font-mono text-xl font-bold ${
              isAtLimit ? "text-red-400" : "text-purple-300"
            }`}
          >
            {attemptsUsed}/{maxAttempts}
          </span>
        </div>

        {extraAttemptsLeft > 0 ? (
          <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 transition-all hover:bg-amber-500/15">
            {/* Sparkles icon from Font Awesome */}
            <FontAwesomeIcon icon={faWandMagicSparkles} className="text-amber-400 h-5 w-5" />

            <div className="flex flex-col">
              <span className="text-amber-200 text-xs">Extra Attempts</span>
              <span className="font-mono font-bold text-amber-300 text-lg">
                {extraAttemptsLeft}
              </span>
            </div>
          </div>
        ) : (
          <Link 
            to="/pricing" 
            className="flex items-center gap-2 bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600/30 rounded-lg px-4 py-2 text-purple-300 font-medium transition-all duration-300 transform hover:scale-105"
          >
            {/* Plus Circle icon from Font Awesome */}
            <FontAwesomeIcon icon={faPlusCircle} className="h-4 w-4" />
            <span>Add More</span>
          </Link>
        )}
      </div>

      <div className="relative">
        <div className="mt-2 bg-gray-800/60 rounded-full h-3 overflow-hidden border border-white/5">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-in-out ${
              isAtLimit 
                ? "bg-gradient-to-r from-red-600 to-red-400" 
                : usagePercentage > 75 
                  ? "bg-gradient-to-r from-amber-600 to-amber-400" 
                  : "bg-gradient-to-r from-purple-700 to-purple-400"
            }`}
            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
          />
        </div>
        
        {/* Progress markers */}
        <div className="flex justify-between px-1 mt-1">
          <span className="text-xs text-gray-500">0</span>
          <span className="text-xs text-gray-500">{maxAttempts/2}</span>
          <span className="text-xs text-gray-500">{maxAttempts}</span>
        </div>
        
        {isAtLimit && extraAttemptsLeft === 0 && (
          <div className="mt-3 text-center">
            <Link 
              to="/pricing"
              className="inline-flex items-center gap-1.5 text-sm text-amber-300 hover:text-amber-200 transition-colors"
            >
              {/* Sparkles icon from Font Awesome */}
              <FontAwesomeIcon icon={faWandMagicSparkles} className="h-3.5 w-3.5" />
              <span>Upgrade for unlimited generations</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttemptsCounter;