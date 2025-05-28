// hooks/useFeaturedCreations.js
import { useEffect, useState } from "react";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { db } from "../firebase-config";

export function useFeaturedCreations(limitCount = 6) {
  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCreations = async () => {
      try {
        const q = query(
          collection(db, "submissions"),
          orderBy("likes", "desc"),
          limit(limitCount)
        );

        const snap = await getDocs(q);
        const data = snap.docs.map((doc) => {
          const d = doc.data();
          return {
            ...d,
            id: doc.id,
            user: d.userDisplayName || "Unknown",
            userAvatar: d.userPhotoURL || "https://via.placeholder.com/200",
            description: d.description || "",
            imageSrc: d.imageUrl || "",
            createdAt: d.createdAt?.toDate?.() || new Date()
          };
        });

        setCreations(data);
      } catch (err) {
        console.error("Failed to fetch featured creations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCreations();
  }, [limitCount]);

  return { creations, loading };
}
