// hooks/useHeroStats.ts
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase-config";

export function useHeroStats() {
  const [stats, setStats] = useState({
    artists: 0,
    creations: 0,
    challenges: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersSnap, challengesSnap, dailyChallengesSnap] = await Promise.all([
          getDocs(collection(db, "users")),
          getDocs(collection(db, "challenges")),
          getDocs(collection(db, "dailyChallenges")),
        ]);

        const artists = usersSnap.size;
        const challenges = dailyChallengesSnap.size;

        let creations = 0;
        challengesSnap.forEach(doc => {
          const data = doc.data();
          creations += data.submissionsCount || 0;
        });

        setStats({ artists, creations, challenges });
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
        console.error("Failed to fetch hero stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
}
