import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase-config";

export const useUserProfile = (uid) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!uid) return;

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        } else {
          setProfile(null);
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [uid]);

  return { profile, loading, error };
};
