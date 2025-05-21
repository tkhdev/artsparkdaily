// src/context/AuthContext.jsx
import { createContext, useReducer, useEffect, useContext } from "react";
import { auth } from "../firebase-config";
import { onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext();

const initialState = {
  user: null,
  loading: true
};

function authReducer(state, action) {
  switch (action.type) {
    case "LOGIN":
      return { ...state, user: action.payload, loading: false };
    case "LOGOUT":
      return { ...state, user: null, loading: false };
    case "SET_LOADING":
      return { ...state, loading: true };
    default:
      return state;
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      dispatch({ type: "LOGIN", payload: user || null });
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
