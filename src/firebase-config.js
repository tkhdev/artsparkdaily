import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app);

export {
  app,
  analytics,
  logEvent,
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  db,
  storage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
};
