import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle, faRefresh } from "@fortawesome/free-solid-svg-icons";

const ErrorState = ({ error, onRetry }) => (
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
          onClick={onRetry}
          className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <FontAwesomeIcon icon={faRefresh} className="mr-2" />
          Retry
        </button>
      </div>
    </div>
  </div>
);

export default ErrorState;