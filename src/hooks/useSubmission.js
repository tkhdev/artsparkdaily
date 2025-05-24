import { useState, useEffect, useCallback } from 'react';
import { 
  doc, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  increment,
  serverTimestamp,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { storage, ref, uploadBytes, getDownloadURL, db } from "../firebase-config";
import { useAuth } from '../context/AuthContext';

export function useSubmission(challengeId) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userSubmission, setUserSubmission] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !challengeId) return;

    const fetchUserSubmission = async () => {
      try {
        const submissionsQuery = query(
          collection(db, 'submissions'),
          where('challengeId', '==', challengeId),
          where('userId', '==', user.uid)
        );
        const submissionSnapshot = await getDocs(submissionsQuery);
        
        if (!submissionSnapshot.empty) {
          setUserSubmission(submissionSnapshot.docs[0].data());
        }
      } catch (err) {
        console.error('Error fetching user submission data:', err);
        setError(err.message);
      }
    };

    fetchUserSubmission();
  }, [user, challengeId]);

  const uploadImageToFirebase = useCallback(async (imageUrl) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const filename = `submissions/${challengeId}/${user.uid}_${Date.now()}.jpg`;
      const storageRef = ref(storage, filename);
      const snapshot = await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }, [challengeId, user?.uid]);

  const submitArt = useCallback(async ({ challengeId, prompt, imageUrl, userId, userDisplayName, userPhotoURL }) => {
    if (!user) {
      throw new Error('User must be authenticated to submit');
    }
    if (userSubmission) {
      throw new Error('You have already submitted to this challenge');
    }

    setLoading(true);
    setError(null);

    try {
      const firebaseImageUrl = await uploadImageToFirebase(imageUrl);

      const submissionData = {
        challengeId,
        userId,
        userDisplayName,
        userPhotoURL,
        prompt: prompt.trim(),
        imageUrl: firebaseImageUrl,
        originalImageUrl: imageUrl,
        createdAt: serverTimestamp(),
        likes: [],
        likesCount: 0,
        comments: [],
        commentsCount: 0,
        featured: false
      };

      const submissionRef = await addDoc(collection(db, 'submissions'), submissionData);

      // Use setDoc with merge: true here to create or update the challenge doc safely
      const challengeRef = doc(db, 'challenges', challengeId);
      await setDoc(challengeRef, {
        submissionsCount: increment(1),
        lastSubmissionAt: serverTimestamp()
      }, { merge: true });

      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        totalSubmissions: increment(1),
        lastSubmissionAt: serverTimestamp(),
        lastActiveAt: serverTimestamp()
      });

      await checkAndAwardAchievements(userId);

      setUserSubmission({
        ...submissionData,
        id: submissionRef.id,
        createdAt: new Date()
      });

      return submissionRef.id;
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [uploadImageToFirebase, userSubmission, user]);

  const checkAndAwardAchievements = useCallback(async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();

      const achievements = [];

      if (userData.totalSubmissions === 1) {
        achievements.push({
          id: 'first_spark',
          name: 'First Spark',
          description: 'Made your first submission',
          icon: '✨',
          unlockedAt: serverTimestamp()
        });
      }

      const weeklyStreakQuery = query(
        collection(db, 'submissions'),
        where('userId', '==', userId)
      );
      const weeklySubmissions = await getDocs(weeklyStreakQuery);

      if (weeklySubmissions.size >= 7) {
        const submissionDates = weeklySubmissions.docs
          .map(doc => doc.data().createdAt?.toDate())
          .filter(date => date)
          .sort((a, b) => b - a);

        let consecutiveDays = 1;
        for (let i = 1; i < submissionDates.length; i++) {
          const dayDiff = Math.floor((submissionDates[i-1] - submissionDates[i]) / (1000 * 60 * 60 * 24));
          if (dayDiff === 1) {
            consecutiveDays++;
          } else {
            break;
          }
        }

        if (consecutiveDays >= 7) {
          achievements.push({
            id: 'weekly_streak',
            name: 'Weekly Streak',
            description: '7 consecutive days of submissions',
            icon: '🔥',
            unlockedAt: serverTimestamp()
          });
        }
      }

      if (achievements.length > 0) {
        const userAchievementsRef = collection(db, 'users', userId, 'achievements');
        for (const achievement of achievements) {
          const existingAchievement = await getDocs(
            query(userAchievementsRef, where('id', '==', achievement.id))
          );
          if (existingAchievement.empty) {
            await addDoc(userAchievementsRef, achievement);
          }
        }
        await updateDoc(userRef, {
          achievementsCount: increment(achievements.length)
        });
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  }, []);

  const canSubmit = !userSubmission && user;

  return {
    submitArt,
    loading,
    error,
    userSubmission,
    canSubmit
  };
}
