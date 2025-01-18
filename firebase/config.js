// firebase/config.js

import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
export const firebaseConfig = {
    apiKey: "AIzaSyBrYQimpSpcXcOfBTA9ephHd6G05SM2bYA",
    authDomain: "doctor-app-data-c0eb7.firebaseapp.com",
    projectId: "doctor-app-data-c0eb7",
    storageBucket: "doctor-app-data-c0eb7.appspot.com",
    messagingSenderId: "228452345569",
    appId: "1:228452345569:android:891c815d759b620c8639a0",
};

// Initialize Firebase app only if it hasn't been initialized already
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Export Firebase services
export const auth = getAuth(app);
export const firestore = getFirestore(app);

export default app;
