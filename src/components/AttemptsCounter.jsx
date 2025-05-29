const AttemptsCounter = ({ attemptsUsed, maxAttempts, isLoading }) => {
  if (isLoading) return null;

  const isAtLimit = attemptsUsed >= maxAttempts;

  return (
    <div className="mb-6 bg-black/20 rounded-lg p-4 border border-white/10">
      <div className="flex items-center justify-between">
        <span className="text-gray-300 text-sm">Generation Attempts Used:</span>
        <span
          className={`font-mono font-bold ${
            isAtLimit ? "text-red-400" : "text-purple-300"
          }`}
        >
          {attemptsUsed}/{maxAttempts}
        </span>
      </div>
      <div className="mt-2 bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${
            isAtLimit ? "bg-red-500" : "bg-purple-500"
          }`}
          style={{ width: `${(attemptsUsed / maxAttempts) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default AttemptsCounter;
