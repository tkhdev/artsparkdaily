import { createContext, useReducer, useEffect, useContext } from "react";
import { auth } from "../firebase-config";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase-config";

const AuthContext = createContext();

const initialState = {
  user: null,
  profile: null,
  loading: true,
  error: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case "LOGIN":
      return { ...state, user: action.payload, loading: false, error: null };
    case "LOGOUT":
      return { ...state, user: null, profile: null, loading: false, error: null };
    case "SET_PROFILE":
      return { ...state, profile: action.payload };
    case "SET_LOADING":
      return { ...state, loading: true, error: null };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        dispatch({ type: "LOGIN", payload: user });
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            dispatch({ type: "SET_PROFILE", payload: docSnap.data() });
          }
        } catch (err) {
          dispatch({ type: "SET_ERROR", payload: "Failed to load profile" });
          console.error("Profile loading error:", err);
        }
      } else {
        dispatch({ type: "LOGOUT" });
      }
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
