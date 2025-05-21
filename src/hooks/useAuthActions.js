// src/hooks/useAuthActions.js
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "../firebase-config";
import { useAuth } from "../context/AuthContext";

export const useAuthActions = () => {
  const { dispatch } = useAuth();

  const loginWithGoogle = async () => {
    try {
      dispatch({ type: "SET_LOADING" });
      const result = await signInWithPopup(auth, googleProvider);
      dispatch({ type: "LOGIN", payload: result.user });
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
