import { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Adjust import based on your routing library
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCalendarDay, 
  faClock, 
  faCheckCircle, 
  faArrowRight, 
  faSpinner,
  faExclamationTriangle,
  faPlus
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../context/AuthContext";
import { useDailyChallenge } from "../../hooks/useDailyChallenge";
import LoadingState from "../LoadingState";
import ErrorState from "../ErrorState";
import NoChallengeState from "../NoChallengeState";
import { useSubmission } from "../../hooks/useSubmission";
import { useTimer } from '../../hooks/useTimer';
import { getTypeColor } from "../../utils/challengeUtils";
import { formatDate } from "../../utils/dateFormatter";
import GlowButton from "../GlowButton/GlowButton";

export default function DailyChallengePreview() {
  const { challenge, loading, error } = useDailyChallenge();
  const [creating, setCreating] = useState(false);
  const { user } = useAuth();
  const timeRemaining = useTimer();
  
  const {
    userSubmission,
    fetchSubmission,
    resetSubmission
  } = useSubmission(challenge?.id, user?.uid);

  // Reset state and refetch data on user or challenge change
  useEffect(() => {
    if (!user) {
      resetSubmission();
    } else if (challenge?.id && user?.uid) {
      fetchSubmission();
    }
  }, [user, challenge?.id, fetchSubmission, resetSubmission]);


  // Loading state
  if (loading) {
    return <LoadingState message="Loading today's challenge..." />;
  }

  // Error state
  if (error) {
    return (
      <ErrorState error={error} onRetry={() => window.location.reload()} />
    );
  }

  // No challenge state
  if (!challenge) {
    return (
      <NoChallengeState
        user={user}
        isCreating={creating}
      />
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-3xl shadow-xl border border-white/10 max-w-2xl mx-auto mb-8">
      <div className="px-6 py-6">
        {/* Header with badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Today's Challenge
          </span>
          {challenge.type && (
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getTypeColor(
                challenge.type
              )}`}
            >
              {challenge.type.charAt(0).toUpperCase() + challenge.type.slice(1)}
            </span>
          )}
          {user && userSubmission && (
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-300 border border-green-500/30">
              <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
              Submitted
            </span>
          )}
        </div>

        {/* Challenge info */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-white mb-2">
            {challenge.title}
          </h2>
          <p className="text-gray-300 text-sm mb-3 line-clamp-2">
            {challenge.task}
          </p>
          
          <div className="flex items-center justify-between text-sm">
            {challenge.date && (
              <p className="text-gray-400 flex items-center">
                <FontAwesomeIcon icon={faCalendarDay} className="mr-1" />
                {formatDate(challenge.date)}
              </p>
            )}
            
            <div className="text-right">
              <span className="text-gray-400 text-xs block">Time remaining</span>
              <div className="text-lg font-mono font-bold text-white flex items-center">
                <FontAwesomeIcon icon={faClock} className="mr-1 text-xs" />
                {timeRemaining}
              </div>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div className="pt-4 border-t border-white/10">
          <Link 
            to="/daily-challenge" // Adjust this path to match your routing
            className="group w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 px-6 rounded-lg flex justify-center items-center space-x-2 transition-all"
          >
            <span>
              {user && userSubmission 
                ? "View Your Submission" 
                : user 
                  ? "Join Challenge" 
                  : "View Challenge"}
            </span>
            <FontAwesomeIcon 
              icon={faArrowRight} 
              className="ml-2 group-hover:translate-x-1 transition-transform" 
            />
          </Link>
        </div>
      </div>
    </div>
  );
}