import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDay,
  faClock,
  faCheckCircle
} from "@fortawesome/free-solid-svg-icons";
import { getTypeColor } from "../utils/challengeUtils";
import { formatDate } from "../utils/dateFormatter";

const ChallengeHeader = ({ challenge, timeRemaining, userSubmission }) => (
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
            {challenge.type.charAt(0).toUpperCase() + challenge.type.slice(1)}
          </span>
        )}
        {userSubmission && (
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-300 border border-green-500/30">
            <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
            Submitted
          </span>
        )}
      </div>

      <h2 className="text-3xl font-bold text-white mb-2">{challenge.title}</h2>
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
);

export default ChallengeHeader;
