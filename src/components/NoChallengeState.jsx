// components/NoChallengeState.jsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDay,
} from "@fortawesome/free-solid-svg-icons";

const NoChallengeState = ({ user }) => (
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
      </div>
    </div>
  </div>
);

export default NoChallengeState;
