// components/SignInPrompt.jsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";

const SignInPrompt = () => (
  <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6 text-center">
    <FontAwesomeIcon
      icon={faExclamationCircle}
      className="text-blue-400 text-2xl mb-4"
    />
    <h3 className="text-lg font-semibold text-white mb-2">Sign In Required</h3>
    <p className="text-gray-300">
      Please sign in to generate art and participate in today's challenge.
    </p>
  </div>
);

export default SignInPrompt;
