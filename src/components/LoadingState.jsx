import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

const LoadingState = ({ message = "Loading..." }) => (
  <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-3xl shadow-xl border border-white/10 overflow-hidden max-w-4xl mx-auto mb-24">
    <div className="px-6 py-8 sm:p-10 flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <FontAwesomeIcon
          icon={faSpinner}
          className="text-4xl text-purple-400 animate-spin mb-4"
        />
        <p className="text-gray-300 text-lg">{message}</p>
      </div>
    </div>
  </div>
);

export default LoadingState;
