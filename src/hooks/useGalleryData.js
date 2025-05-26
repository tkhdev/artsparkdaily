// useGalleryData.js
import { useEffect, useState, useCallback } from "react";
import {
  getDocs,
  query,
  collection,
  orderBy,
  where,
  limit,
  startAfter,
} from "firebase/firestore";
import { db } from "../firebase-config";

const PAGE_SIZE = 12;

export function useGalleryData() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastVisible, setLastVisible] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");

  // Fetch latest 5 challenges for filtering
  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const q = query(
          collection(db, "dailyChallenges"),
          orderBy("date", "desc"),
          limit(5)
        );
        const snapshot = await getDocs(q);
        const items = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title,
            date: data.date?.toDate() || new Date(),
          };
        });
        setChallenges(items);
      } catch (err) {
        console.error("Failed to load challenges", err);
      }
    };
    fetchChallenges();
  }, []);

  const fetchSubmissions = useCallback(
    async (reset = false) => {
      setLoading(true);
      setError(null);

      try {
        const submissionsRef = collection(db, "submissions");
        let q = query(
          submissionsRef,
          ...(selectedChallengeId !== "all"
            ? [where("challengeId", "==", selectedChallengeId)]
            : []),
          orderBy(sortBy, "desc"),
          ...(reset || !lastVisible ? [] : [startAfter(lastVisible)]),
          limit(PAGE_SIZE)
        );

        const snapshot = await getDocs(q);
        const newItems = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            challengeId: data.challengeId,
            createdAt: data.createdAt?.toDate() || new Date(),
            featured: data.featured,
            imageUrl: data.imageUrl,
            originalImageUrl: data.originalImageUrl,
            prompt: data.prompt,
            userDisplayName: data.userDisplayName,
            userId: data.userId,
            userPhotoURL: data.userPhotoURL,
            likesCount: data.likesCount || 0,
            commentsCount: data.commentsCount || 0,
            likes: data.likes || [],
            comments: data.comments || [],
          };
        });

        if (reset) {
          setSubmissions(newItems);
        } else {
          setSubmissions((prev) => [...prev, ...newItems]);
        }

        setLastVisible(snapshot.docs[snapshot.docs.length - 1] || null);
        setHasMore(snapshot.docs.length === PAGE_SIZE);
      } catch (err) {
        console.error(err);
        setError("Failed to load submissions");
      } finally {
        setLoading(false);
      }
    },
    [selectedChallengeId, sortBy, lastVisible]
  );

  useEffect(() => {
    setLastVisible(null);
    setHasMore(true);
    fetchSubmissions(true);
  }, [selectedChallengeId, sortBy]);

  const loadMore = () => {
    if (!loading && hasMore) fetchSubmissions(false);
  };

  return {
    challenges,
    selectedChallengeId,
    setSelectedChallengeId,
    sortBy,
    setSortBy,
    submissions,
    loading,
    error,
    hasMore,
    loadMore,
  };
}
