import { doc, updateDoc } from "firebase/firestore";
import { db, getDoc } from "../firebase-config";
import { useAuth } from "../context/AuthContext";

export const useOwnUserProfile = () => {
  const { user, profile, dispatch } = useAuth();

  const updateProfile = async (updatedFields) => {
    if (!user?.uid) {
      console.warn("Cannot update profile: user not authenticated");
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, updatedFields);

      // Update context
      dispatch({ type: "SET_PROFILE", payload: { ...profile, ...updatedFields } });
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  const refetchProfile = async () => {
    if (!user?.uid) {
      console.warn("Cannot refetch profile: user not authenticated");
      return;
    }

    try {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        dispatch({ type: "SET_PROFILE", payload: { ...docSnap.data() } });
      } else {
        console.warn("User profile document does not exist");
      }
    } catch (error) {
      console.error("Error refetching profile:", error);
      throw error;
    }
  };

  return { updateProfile, profile, refetchProfile };
};