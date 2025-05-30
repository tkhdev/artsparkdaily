import { useState, useCallback } from "react";
import { httpsCallable } from "firebase/functions";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc
} from "firebase/firestore";
import { storage, ref, uploadBytes, getDownloadURL } from "../firebase-config";
import { functions, db } from "../firebase-config";
import { useAuth } from "../context/AuthContext";
import { useOwnUserProfile } from "./useOwnUserProfile";

const trackGenerationAttempt = httpsCallable(
  functions,
  "trackGenerationAttempt"
);

export default function usePollinationsImage(challengeId) {
  const [imageUrl, setImageUrl] = useState(null);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [attemptsUsed, setAttemptsUsed] = useState(0);
  const [attemptsLoading, setAttemptsLoading] = useState(false);
  const [extraAttemptsUsed, setExtraAttemptsUsed] = useState(0);
  const { user } = useAuth();
  const { profile, refetchProfile } = useOwnUserProfile();

  const uploadImageToFirebase = useCallback(
    async (imageUrl, prompt) => {
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const filename = `generatedImages/${challengeId}/${
          user.uid
        }_${Date.now()}.jpg`;
        const storageRef = ref(storage, filename);
        const snapshot = await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(snapshot.ref);

        const generatedImageDoc = await addDoc(
          collection(db, "generatedImages"),
          {
            userId: user.uid,
            challengeId,
            prompt,
            imageUrl: downloadURL,
            createdAt: new Date(),
            isSubmitted: false
          }
        );

        return { id: generatedImageDoc.id, imageUrl: downloadURL, prompt, createdAt: generatedImageDoc.createdAt };
      } catch (error) {
        throw new Error(`Failed to upload image: ${error.message}`);
      }
    },
    [challengeId, user?.uid]
  );

  const fetchAttemptsUsed = useCallback(async () => {
    if (!user || !challengeId) {
      setAttemptsUsed(0);
      setExtraAttemptsUsed(0);
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
        const data = userChallengeDoc.data();
        const attempts = data.attemptsUsed || 0;
        const extraUsed = data.extraAttemptsUsed || 0;
        setAttemptsUsed(attempts);
        setExtraAttemptsUsed(extraUsed);
      } else {
        setAttemptsUsed(0);
        setExtraAttemptsUsed(0);
      }
    } catch (err) {
      console.error("Error fetching generation attempts:", err);
      setAttemptsUsed(0);
      setExtraAttemptsUsed(0);
    } finally {
      setAttemptsLoading(false);
    }
  }, [user, challengeId]);

  const fetchGeneratedImages = useCallback(async () => {
    if (!user || !challengeId) {
      setGeneratedImages([]);
      return;
    }

    try {
      const imagesQuery = query(
        collection(db, "generatedImages"),
        where("userId", "==", user.uid),
        where("challengeId", "==", challengeId)
      );
      const snapshot = await getDocs(imagesQuery);
      const images = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setGeneratedImages(images);
    } catch (err) {
      console.error("Error fetching generated images:", err);
      setError(err.message);
    }
  }, [user, challengeId]);

  const generateImage = async (prompt, challengeId) => {
    if (!prompt || !challengeId) {
      setError("Prompt and challenge ID are required");
      return;
    }

    if (!user) {
      setError("Please sign in to generate images");
      return;
    }

    // Calculate total available attempts
    const baseAttempts = profile?.promptAttempts || 5;
    const extraAttempts = profile?.extraPromptAttempts || 0;
    const extraAttemptsUsed = profile?.extraPromptAttemptsUsed || 0;


    if (attemptsUsed >= baseAttempts && extraAttempts - extraAttemptsUsed < 1) {
      setError("You have used all your generation attempts for this challenge (including extra attempts)");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Track the attempt on the backend
      const result = await trackGenerationAttempt({ challengeId });
      
      // Update local state based on backend response
      if (result.data.success) {
        setAttemptsUsed(result.data.attemptsUsed);
        
        // If user used an extra attempt, refresh their profile to get updated extraPromptAttempts
        if (result.data.usedExtraAttempt) {
          await refetchProfile(); // This will update the profile context with new extraPromptAttempts value
        }
      }

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

      const savedImage = await uploadImageToFirebase(pollinationsUrl, prompt);
      setGeneratedImages((prev) => [...prev, savedImage]);
      setImageUrl(pollinationsUrl);
      
    } catch (err) {
      console.error("Error generating image:", err);

      if (err.code === "functions/resource-exhausted") {
        setError(
          "You have used all your generation attempts for this challenge (including extra attempts)"
        );
      } else if (err.code === "functions/unauthenticated") {
        setError("Please sign in to generate images");
      } else {
        setError(err.message || "Failed to generate image");
      }

      // Refresh attempts count after error
      await fetchAttemptsUsed();
    } finally {
      setLoading(false);
    }
  };

  const selectImageForSubmission = (imageUrl) => {
    setImageUrl(imageUrl);
  };

  const resetImage = () => {
    setImageUrl(null);
    setError(null);
  };

  // Calculate if user can generate more images
  const baseAttempts = profile?.promptAttempts || 5;
  const extraAttempts = profile?.extraPromptAttempts || 0;
  const totalAvailableAttempts = baseAttempts + extraAttempts - extraAttemptsUsed;
  const canGenerate = user && attemptsUsed < totalAvailableAttempts;
  console.log('canGenerate', attemptsUsed, totalAvailableAttempts);

  // Helper to determine if next attempt will use extra attempts
  const willUseExtraAttempt = attemptsUsed >= baseAttempts;
  const remainingBaseAttempts = Math.max(0, baseAttempts - attemptsUsed);
  const remainingExtraAttempts = extraAttempts;
  const totalRemainingAttempts = totalAvailableAttempts - attemptsUsed;

  return {
    imageUrl,
    generatedImages,
    loading,
    error,
    attemptsUsed,
    attemptsLoading,
    extraAttemptsUsed,
    canGenerate,
    generateImage,
    resetImage,
    fetchAttemptsUsed,
    fetchGeneratedImages,
    selectImageForSubmission,
    // Additional info for UI
    baseAttempts,
    extraAttempts,
    totalAvailableAttempts,
    willUseExtraAttempt,
    remainingBaseAttempts,
    remainingExtraAttempts,
    totalRemainingAttempts
  };
}