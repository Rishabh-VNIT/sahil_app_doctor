
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
export const firebaseConfig = {
    apiKey: "AIzaSyA8pM6a6uN4EqqP2WsmHJreO33nIn7VQUk",
    authDomain: "sahil-app-doctor.firebaseapp.com",
    projectId: "sahil-app-doctor",
    storageBucket: "sahil-app-doctor.appspot.com",
    messagingSenderId: "853007663641",
    appId: "1:853007663641:android:aa761a74727050efe5e088",
};

// Initialize Firebase app only if it hasn't been initialized already
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app)
// Export Firebase services
export const auth = getAuth(app);
export const firestore = getFirestore(app);

export default app;
