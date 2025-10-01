
'use client';
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// This configuration is public and safe to expose.
// Security is enforced by Firebase Security Rules and App Check.
export const firebaseConfig = {
  apiKey: "AIzaSyC3-8tI_c0aZ3g5l8jY7xKV_q2H1o4",
  authDomain: "latin-store-house.firebaseapp.com",
  projectId: "latin-store-house",
  storageBucket: "latin-store-house.appspot.com",
  messagingSenderId: "1009843657393",
  appId: "1:1009843657393:web:9681c6314f3c4c8b211a3b",
  measurementId: "G-8B41E7B9V0"
};

// Initialize Firebase for SSR
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

let analytics;
if (typeof window !== 'undefined') {
  if (isSupported()) {
    try {
      analytics = getAnalytics(app);
    } catch (error) {
      console.error("Failed to initialize Firebase Analytics", error);
    }
  }
}

export { app, auth, db, analytics };
