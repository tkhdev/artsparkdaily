import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase-config";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "../firebase-config";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export const useAuthActions = () => {
  const { dispatch } = useAuth();
  const navigate = useNavigate();

  const createUserProfileIfNotExists = async (user, planType = 'free') => {
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
        // Plan details
        plan: planType,
        planStartDate: new Date().toISOString(),
        promptAttempts: planType === 'pro' ? 100 : 5, // Daily attempts
        dailyAttemptsUsed: 0,
        lastAttemptReset: new Date().toISOString(),
        // Pro trial (if applicable)
        ...(planType === 'pro' && {
          trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7-day trial
          isTrialActive: true
        })
      });
    }

    return docSnap.exists() ? docSnap.data() : null;
  };

  // Standard login (for returning users or "Sign In" buttons)
  const loginWithGoogle = async () => {
    try {
      dispatch({ type: "SET_LOADING" });
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      await createUserProfileIfNotExists(user);
      dispatch({ type: "LOGIN", payload: user });
    } catch (err) {
      console.error("Google Sign-In Error:", err);
      dispatch({ type: "SET_ERROR", payload: err.message });
    }
  };

  // Enhanced signup with plan selection
  const signupWithPlan = async (planType = 'free', redirectPath = '/') => {
    try {
      dispatch({ type: "SET_LOADING" });
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user already exists
      const existingUserData = await createUserProfileIfNotExists(user, planType);
      
      if (existingUserData) {
        // Existing user - just log them in
        dispatch({ type: "LOGIN", payload: user });
        navigate("/");
      } else {
        // New user - handle plan setup
        dispatch({ type: "LOGIN", payload: user });
        
        if (planType === 'pro') {
          // For Pro plan, redirect to payment/trial setup
          navigate("/welcome?plan=pro&trial=true");
        } else {
          // For free plan, go to onboarding (home)
          navigate(redirectPath);
        }
      }
    } catch (err) {
      console.error("Google Sign-Up Error:", err);
      dispatch({ type: "SET_ERROR", payload: err.message });
    }
  };

  // Convenience methods for different signup scenarios
  const signupFree = () => signupWithPlan('free', '/');
  const signupPro = () => signupWithPlan('pro', '/');

  const logout = async () => {
    await signOut(auth);
    dispatch({ type: "LOGOUT" });
    navigate("/"); // Redirect to home
  };

  return { 
    loginWithGoogle, 
    signupWithPlan,
    signupFree,
    signupPro,
    logout 
  };
};