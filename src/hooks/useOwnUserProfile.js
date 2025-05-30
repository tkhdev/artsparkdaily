import { doc, updateDoc } from "firebase/firestore";
import { db, getDoc } from "../firebase-config";
import { useAuth } from "../context/AuthContext";

export const useOwnUserProfile = () => {
  const { user, profile, dispatch } = useAuth();

  const updateProfile = async (updatedFields) => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, updatedFields);

    // Update context
    dispatch({ type: "SET_PROFILE", payload: { ...profile, ...updatedFields } });
  };

  const refetchProfile = async () => {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);
    dispatch({ type: "SET_PROFILE", payload: { ...docSnap.data() } });
  };

  return { updateProfile, profile, refetchProfile };
};
