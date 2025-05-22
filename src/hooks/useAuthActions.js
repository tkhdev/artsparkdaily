import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase-config";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "../firebase-config";
import { useAuth } from "../context/AuthContext";

export const useAuthActions = () => {
  const { dispatch } = useAuth();

  const createUserProfileIfNotExists = async (user) => {
    const userRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        bio: "",
        createdAt: new Date().toISOString(),
      });
    }
  };

  const loginWithGoogle = async () => {
    try {
      dispatch({ type: "SET_LOADING" });
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      await createUserProfileIfNotExists(user);
      dispatch({ type: "LOGIN", payload: user });
    } catch (err) {
      console.error("Google Sign-In Error:", err);
    }
  };

  const logout = async () => {
    await signOut(auth);
    dispatch({ type: "LOGOUT" });
  };

  return { loginWithGoogle, logout };
};
