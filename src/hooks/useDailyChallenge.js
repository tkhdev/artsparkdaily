// hooks/useDailyChallenge.js
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase-config';

export const useDailyChallenge = () => {
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const challengeRef = doc(db, 'dailyChallenges', today);

    const unsubscribe = onSnapshot(
      challengeRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setChallenge({ id: docSnap.id, ...docSnap.data() });
        } else {
          setChallenge(null);
        }
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  return { challenge, loading, error };
};