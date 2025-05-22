import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase-config";
import { useAuth } from "../context/AuthContext";

export const useUserProfile = () => {
  const { user, profile, dispatch } = useAuth();

  const updateProfile = async (updatedFields) => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, updatedFields);

    // Update context
    dispatch({ type: "SET_PROFILE", payload: { ...updatedFields } });
  };

  return { updateProfile, profile };
};
