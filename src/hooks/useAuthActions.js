import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase-config";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "../firebase-config";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export const useAuthActions = () => {
  const { dispatch } = useAuth();
  const navigate = useNavigate();

  const createUserProfileIfNotExists = async (user, planType = "free") => {
    const userRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        profilePic: user.profilePic,
        bio: "",
        createdAt: new Date().toISOString(),
        plan: planType,
        planStartDate: new Date().toISOString(),
        promptAttempts: planType === "pro" ? 50 : 5,
        dailyAttemptsUsed: 0,
        lastAttemptReset: new Date().toISOString(),
        paddleSubscriptionId: null,
        paddleCustomerId: null,
        subscriptionStatus: planType === "pro" ? "trialing" : "free",
        subscriptionEndDate: null,
        extraPromptAttempts: 0,
        extraPromptAttemptsUsed: 0,
        customFrames: [],
        totalLikes: 0,
        totalComments: 0,
        achievementsCount: 0,
        lastUpdated: new Date().toISOString(),
        ...(planType === "pro" && {
          trialEndsAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          isTrialActive: true,
        }),
      });
      return null;
    }

    return docSnap.data();
  };

  const loginWithGoogle = async () => {
    dispatch({ type: "SET_LOADING" });
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      await createUserProfileIfNotExists(user);

      dispatch({ type: "LOGIN", payload: user });

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        dispatch({ type: "SET_PROFILE", payload: docSnap.data() });
      }

      dispatch({ type: "CLEAR_ERROR" });
      navigate("/");
    } catch (error) {
      if (error.code === "auth/popup-closed-by-user") {
        // User closed popup, do not treat as error but clear loading
        dispatch({ type: "SET_ERROR", payload: "Login popup closed. Please try again." });
      } else {
        dispatch({ type: "SET_ERROR", payload: error.message || "Login failed" });
      }
      dispatch({ type: "LOGOUT" });
      console.error("Google Sign-In Error:", error);
    }
  };

  const signupWithPlan = async (
    planType = "free",
    redirectPath = "/",
    isAnnual = false
  ) => {
    dispatch({ type: "SET_LOADING" });
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const existingUserData = await createUserProfileIfNotExists(user, planType);

      if (existingUserData) {
        dispatch({ type: "LOGIN", payload: { ...user, ...existingUserData } });
        navigate(redirectPath);
      } else {
        dispatch({
          type: "LOGIN",
          payload: { ...user, plan: planType, isAnnual },
        });
        navigate(
          planType === "pro"
            ? `/pricing?plan=pro&trial=true&billing=${isAnnual ? "annual" : "monthly"}`
            : redirectPath
        );
      }
      dispatch({ type: "CLEAR_ERROR" });
    } catch (err) {
      if (err.code === "auth/popup-closed-by-user") {
        dispatch({ type: "SET_ERROR", payload: "Signup popup closed. Please try again." });
      } else {
        dispatch({ type: "SET_ERROR", payload: err.message || "Signup failed" });
      }
      dispatch({ type: "LOGOUT" });
      console.error("Google Sign-Up Error:", err);
    }
  };

  const signupFree = () => signupWithPlan("free", "/");
  const signupPro = (isAnnual = false) => signupWithPlan("pro", "/", isAnnual);

  const logout = async () => {
    dispatch({ type: "SET_LOADING" });
    try {
      await signOut(auth);
      dispatch({ type: "LOGOUT" });
      dispatch({ type: "CLEAR_ERROR" });
      navigate("/");
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: "Logout failed. Please try again." });
      console.error("Logout error:", err);
    }
  };

  return { loginWithGoogle, signupWithPlan, signupFree, signupPro, logout };
};
