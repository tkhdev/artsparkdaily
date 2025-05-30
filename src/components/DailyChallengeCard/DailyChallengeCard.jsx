import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useDailyChallenge } from "../../hooks/useDailyChallenge";
import usePollinationsImage from "../../hooks/usePollinationsImage";
import { useSubmission } from "../../hooks/useSubmission";

import LoadingState from "../LoadingState";
import ErrorState from "../ErrorState";
import NoChallengeState from "../NoChallengeState";
import ChallengeHeader from "../ChallengeHeader";
import AttemptsCounter from "../AttemptsCounter";
import PromptForm from "../PromptForm";
import ImageGallery from "../ImageGallery";
import SignInPrompt from "../SignInPrompt";
import { useOwnUserProfile } from "../../hooks/useOwnUserProfile";

export default function DailyChallengeCard() {
  const { challenge, loading, error } = useDailyChallenge();
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
        userDisplayName: profile.displayName || user.displayName || "Anonymous",
        userPhotoURL: user.photoURL || null
      });
    } catch (error) {
      console.error("Failed to submit art:", error);
    }
  };

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
        onCreateChallenge={handleCreateChallenge}
        isCreating={creating}
      />
    );
  }

  const maxAttempts = profile?.promptAttempts || 5;
  const extraAttemptsLeft =
    (profile?.extraPromptAttempts || 0) -
    (profile?.extraPromptAttemptsUsed || 0);

  return (
    <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-3xl shadow-xl border border-white/10 max-w-4xl mx-auto mb-24">
      <div className="px-6 py-8 sm:p-10">
        <ChallengeHeader
          challenge={challenge}
          userSubmission={userSubmission}
        />

        {user && (
          <AttemptsCounter
            attemptsUsed={Math.min(attemptsUsed, maxAttempts)}
            maxAttempts={maxAttempts}
            extraAttemptsLeft={extraAttemptsLeft}
            isLoading={attemptsLoading}
          />
        )}

        <div className="space-y-8">
          {user && !userSubmission && (
            <PromptForm
              challenge={challenge}
              onGenerate={handleGenerateArt}
              isLoading={imageLoading}
              canGenerate={canGenerate}
              error={imageError || submissionError}
            />
          )}

          {user && (
            <ImageGallery
              images={[...generatedImages]}
              userSubmission={userSubmission}
              onSubmit={handleSubmitArt}
              isSubmitting={submissionLoading}
              challengeTitle={challenge.title}
            />
          )}

          {!user && <SignInPrompt />}
        </div>
      </div>
    </div>
  );
}
