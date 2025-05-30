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
        plan: planType,
        planStartDate: new Date().toISOString(),
        promptAttempts: planType === 'pro' ? 100 : 5,
        dailyAttemptsUsed: 0,
        lastAttemptReset: new Date().toISOString(),
        paddleSubscriptionId: null,
        paddleCustomerId: null,
        subscriptionStatus: planType === 'pro' ? 'trialing' : 'free',
        subscriptionEndDate: null,
        extraPromptAttempts: 0,
        customFrames: [],
        ...(planType === 'pro' && {
          trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          isTrialActive: true,
        }),
      });
    }

    return docSnap.exists() ? docSnap.data() : null;
  };

  const loginWithGoogle = async () => {
    try {
      dispatch({ type: "SET_LOADING" });
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const userData = await createUserProfileIfNotExists(user);

      dispatch({ type: "LOGIN", payload: { ...user, ...userData } });
      navigate("/");
    } catch (err) {
      console.error("Google Sign-In Error:", err);
      dispatch({ type: "SET_ERROR", payload: err.message });
    }
  };

  const signupWithPlan = async (planType = 'free', redirectPath = '/', isAnnual = false) => {
    try {
      dispatch({ type: "SET_LOADING" });
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const existingUserData = await createUserProfileIfNotExists(user, planType);

      if (existingUserData) {
        dispatch({ type: "LOGIN", payload: { ...user, ...existingUserData } });
        navigate("/");
      } else {
        dispatch({ type: "LOGIN", payload: { ...user, plan: planType, isAnnual } });
        navigate(planType === 'pro' ? `/pricing?plan=pro&trial=true&billing=${isAnnual ? 'annual' : 'monthly'}` : redirectPath);
      }
    } catch (err) {
      console.error("Google Sign-Up Error:", err);
      dispatch({ type: "SET_ERROR", payload: err.message });
    }
  };

  const signupFree = () => signupWithPlan('free', '/');
  const signupPro = (isAnnual = false) => signupWithPlan('pro', '/', isAnnual);

  const logout = async () => {
    await signOut(auth);
    dispatch({ type: "LOGOUT" });
    navigate("/");
  };

  return { loginWithGoogle, signupWithPlan, signupFree, signupPro, logout };
};