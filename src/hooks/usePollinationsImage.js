import { useState, useCallback } from "react";
import { httpsCallable } from "firebase/functions";
import { doc, getDoc } from "firebase/firestore";
import { functions, db } from "../firebase-config";
import { useAuth } from "../context/AuthContext";

const trackGenerationAttempt = httpsCallable(
  functions,
  "trackGenerationAttempt"
);

export default function usePollinationsImage(challengeId) {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [attemptsUsed, setAttemptsUsed] = useState(0);
  const [attemptsLoading, setAttemptsLoading] = useState(false);
  const { user } = useAuth();

  // Fetch user's generation attempts for a specific challenge
  const fetchAttemptsUsed = useCallback(async () => {
    if (!user || !challengeId) {
      setAttemptsUsed(0);
      return;
    }

    setAttemptsLoading(true);
    try {
      const userChallengeDocRef = doc(
        db,
        "userChallenges",
        `${user.uid}_${challengeId}`
      );
      const userChallengeDoc = await getDoc(userChallengeDocRef);

      if (userChallengeDoc.exists()) {
        const attempts = userChallengeDoc.data().attemptsUsed || 0;
        setAttemptsUsed(attempts);
      } else {
        setAttemptsUsed(0);
      }
    } catch (err) {
      console.error("Error fetching generation attempts:", err);
      setAttemptsUsed(0);
    } finally {
      setAttemptsLoading(false);
    }
  }, [user, challengeId]);

  const generateImage = async (prompt) => {
    if (!prompt || !challengeId) {
      setError("Prompt and challenge ID are required");
      return;
    }

    if (!user) {
      setError("Please sign in to generate images");
      return;
    }

    if (attemptsUsed >= 5) {
      setError("You have used all your generation attempts for this challenge");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await trackGenerationAttempt({ challengeId });

      setAttemptsUsed((prev) => prev + 1);

      const cleanPrompt = prompt.trim().replace(/[^\w\s,-]/g, "");
      const encodedPrompt = encodeURIComponent(cleanPrompt);
      const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${Date.now()}&nologo=true`;

      const img = new Image();
      img.crossOrigin = "anonymous";

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = pollinationsUrl;
      });

      setImageUrl(pollinationsUrl);
    } catch (err) {
      console.error("Error generating image:", err);

      if (err.code === "functions/resource-exhausted") {
        setError("You have used all your generation attempts for this challenge");
      } else if (err.code === "functions/unauthenticated") {
        setError("Please sign in to generate images");
      } else {
        setError(err.message || "Failed to generate image");
      }

      await fetchAttemptsUsed(); // Ensure sync after error
    } finally {
      setLoading(false);
    }
  };

  const resetImage = () => {
    setImageUrl(null);
    setError(null);
  };

  const canGenerate = user && attemptsUsed < 5;

  return {
    imageUrl,
    loading,
    error,
    attemptsUsed,
    attemptsLoading,
    canGenerate,
    generateImage,
    resetImage,
    fetchAttemptsUsed
  };
}
