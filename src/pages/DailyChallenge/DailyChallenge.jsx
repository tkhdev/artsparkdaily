import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useDailyChallenge } from "../../hooks/useDailyChallenge";
import usePollinationsImage from "../../hooks/usePollinationsImage";
import { useSubmission } from "../../hooks/useSubmission";
import { useOwnUserProfile } from "../../hooks/useOwnUserProfile";

// Import all the sub-components
import LoadingState from "../../components/LoadingState";
import ErrorState from "../../components/ErrorState";
import NoChallengeState from "../../components/NoChallengeState";
import ChallengeHeader from "../../components/ChallengeHeader";
import AttemptsCounter from "../../components/AttemptsCounter";
import PromptForm from "../../components/PromptForm";
import ImageGallery from "../../components/ImageGallery";
import SignInPrompt from "../../components/SignInPrompt";

export default function DailyChallengePage() {
  const { challenge, loading, error, createTodaysChallenge } = useDailyChallenge();
  const [creating, setCreating] = useState(false);
  const [localExtraAttemptsLeft, setLocalExtraAttemptsLeft] = useState(0);
  const { user } = useAuth();
  const { profile } = useOwnUserProfile();

  const {
    generatedImages,
    loading: imageLoading,
    error: imageError,
    attemptsUsed,
    attemptsLoading,
    canGenerate,
    generateImage,
    fetchAttemptsUsed,
    fetchGeneratedImages
  } = usePollinationsImage(challenge?.id);

  const {
    submitArt,
    loading: submissionLoading,
    error: submissionError,
    userSubmission,
    canSubmit,
    fetchSubmission,
    resetSubmission
  } = useSubmission(challenge?.id, user?.uid);

  // Reset state and refetch data on user or challenge change
  useEffect(() => {
    if (!user) {
      resetSubmission();
    } else if (challenge?.id && user?.uid) {
      fetchAttemptsUsed(challenge.id);
      fetchSubmission();
      fetchGeneratedImages();
    }
  }, [
    user,
    challenge?.id,
    fetchAttemptsUsed,
    fetchSubmission,
    fetchGeneratedImages,
    resetSubmission
  ]);

  useEffect(() => {
    if (profile) {
      const initialExtra = Math.max(
        (profile.extraPromptAttempts || 0) -
          (profile.extraPromptAttemptsUsed || 0),
        0
      );
      setLocalExtraAttemptsLeft(initialExtra);
    }
  }, [profile?.extraPromptAttempts, profile?.extraPromptAttemptsUsed]);

  const handleCreateChallenge = async () => {
    setCreating(true);
    try {
      await createTodaysChallenge();
    } catch (err) {
      console.error("Failed to create challenge:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleGenerateArt = async (prompt) => {
    try {
      await generateImage(prompt, challenge.id);
      // Local decrement after a successful generation
      const maxAttempts = profile?.promptAttempts || 5;
      if (attemptsUsed >= maxAttempts && localExtraAttemptsLeft > 0) {
        setLocalExtraAttemptsLeft((prev) => Math.max(prev - 1, 0));
      }
    } catch (error) {
      console.error("Failed to generate image:", error);
    }
  };

  const handleSubmitArt = async (image) => {
    if (!image.imageUrl) {
      alert("Please select an image first!");
      return;
    }

    if (!canSubmit) {
      alert("You have already submitted to today's challenge!");
      return;
    }

    try {
      await submitArt({
        challengeId: challenge.id,
        prompt: image.prompt,
        imageUrl: image.imageUrl,
        userId: user.uid,
        userDisplayName: profile?.displayName || user.displayName || "Anonymous",
        userPhotoURL: user.photoURL || null
      });
    } catch (error) {
      console.error("Failed to submit art:", error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        <div className="container mx-auto px-4 py-8">
          <LoadingState message="Loading today's challenge..." />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        <div className="container mx-auto px-4 py-8">
          <ErrorState error={error} onRetry={() => window.location.reload()} />
        </div>
      </div>
    );
  }

  // No challenge state
  if (!challenge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        <div className="container mx-auto px-4 py-8">
          <NoChallengeState
            user={user}
            onCreateChallenge={handleCreateChallenge}
            isCreating={creating}
          />
        </div>
      </div>
    );
  }

  const maxAttempts = profile?.promptAttempts || 5;
  const extraAttemptsLeft =
    (profile?.extraPromptAttempts || 0) -
    (profile?.extraPromptAttemptsUsed || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      {/* Page Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Daily AI Art Challenge</h1>
              <p className="text-gray-300">Create, compete, and showcase your AI-generated masterpieces</p>
            </div>
            
            {/* Optional: Add navigation breadcrumbs or back button */}
            <div className="hidden md:block">
              <nav className="text-sm text-gray-400">
                <span>Home</span>
                <span className="mx-2">/</span>
                <span className="text-purple-300">Daily Challenge</span>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Challenge Card */}
          <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-3xl shadow-2xl border border-white/10 mb-8">
            <div className="px-6 py-8 sm:p-10">
              {/* Challenge Header */}
              <ChallengeHeader
                challenge={challenge}
                userSubmission={userSubmission}
              />

              {/* User-specific content */}
              {user && (
                <>
                  {/* Attempts Counter */}
                  <AttemptsCounter
                    attemptsUsed={Math.min(attemptsUsed, maxAttempts)}
                    maxAttempts={maxAttempts}
                    extraAttemptsLeft={localExtraAttemptsLeft}
                    isLoading={attemptsLoading}
                  />

                  {/* Main interaction area */}
                  <div className="space-y-8">
                    {/* Prompt Form - only show if user hasn't submitted */}
                    {!userSubmission && (
                      <PromptForm
                        challenge={challenge}
                        onGenerate={handleGenerateArt}
                        isLoading={imageLoading}
                        canGenerate={canGenerate}
                        error={imageError || submissionError}
                      />
                    )}

                    {/* Image Gallery */}
                    <ImageGallery
                      images={[...generatedImages]}
                      userSubmission={userSubmission}
                      onSubmit={handleSubmitArt}
                      isSubmitting={submissionLoading}
                      challengeTitle={challenge.title}
                    />

                    {/* Submission Success Message */}
                    {userSubmission && (
                      <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-6 text-center">
                        <div className="text-green-400 text-4xl mb-4">🎉</div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                          Submission Complete!
                        </h3>
                        <p className="text-gray-300 mb-4">
                          Your artwork has been submitted to today's challenge. 
                          Check back later to see how you compare with other participants!
                        </p>
                        <div className="bg-black/20 rounded-lg p-4 max-w-md mx-auto">
                          <p className="text-sm text-gray-400 mb-1">Your submission:</p>
                          <p className="text-white font-medium">"{userSubmission.prompt}"</p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Sign In Prompt for non-authenticated users */}
              {!user && <SignInPrompt />}
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Challenge Rules */}
            <div className="bg-black/20 backdrop-blur rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Challenge Rules</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>• Create AI art based on today's theme</li>
                <li>• Maximum 500 characters per prompt</li>
                <li>• Limited generation attempts per day</li>
                <li>• Submit your best creation</li>
                <li>• One submission per challenge</li>
              </ul>
            </div>

            {/* Tips & Tricks */}
            <div className="bg-black/20 backdrop-blur rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Pro Tips</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>• Be specific with your descriptions</li>
                <li>• Include art styles (e.g., "watercolor", "digital art")</li>
                <li>• Mention lighting and mood</li>
                <li>• Try different artistic movements</li>
                <li>• Use the random inspiration feature</li>
              </ul>
            </div>

            {/* Challenge Stats */}
            <div className="bg-black/20 backdrop-blur rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Today's Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Your Attempts:</span>
                  <span className="text-white font-mono">
                    {user ? `${Math.min(attemptsUsed, maxAttempts)}/${maxAttempts}` : 'Sign in to see'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Submission Status:</span>
                  <span className={`font-medium ${
                    userSubmission ? 'text-green-400' : user ? 'text-yellow-400' : 'text-gray-400'
                  }`}>
                    {userSubmission ? 'Submitted' : user ? 'Pending' : 'Not signed in'}
                  </span>
                </div>
                {user && localExtraAttemptsLeft > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Extra Attempts:</span>
                    <span className="text-amber-400 font-mono">{localExtraAttemptsLeft}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}