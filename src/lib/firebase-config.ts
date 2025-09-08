// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration is now read inside getFirebaseApp
// to ensure environment variables are loaded.

// Initialize Firebase
function getFirebaseApp() {
    if (getApps().length > 0) {
        return getApp();
    }

    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
    };

    return initializeApp(firebaseConfig);
}

export const app = getFirebaseApp();

let analytics;
if (typeof window !== 'undefined' && isSupported()) {
    try {
        analytics = getAnalytics(app);
    } catch (error) {
        console.error("Failed to initialize Firebase Analytics", error);
    }
}

export { analytics };
