import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyBOry3NEfqVfP94cepY9p9aRHjlbgzKjyg",
    authDomain: "bakery-shop-ec126.firebaseapp.com",
    projectId: "bakery-shop-ec126",
    storageBucket: "bakery-shop-ec126.firebasestorage.app",
    messagingSenderId: "832319438442",
    appId: "1:832319438442:web:9a8fea2b10ac2593c49413",
    measurementId: "G-WYLLS8Q4NV"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Services (Primary)
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Secondary Auth instance to allow Admin to create users without being signed out
// This works by initializing a secondary Firebase app instance
const secondaryApp = getApps().length > 1 ? getApp("AdminTools") : initializeApp(firebaseConfig, "AdminTools");
export const secondaryAuth = getAuth(secondaryApp);

// Analytics helper
export const initAnalytics = async () => {
    if (typeof window !== "undefined") {
        const supported = await isSupported();
        if (supported) return getAnalytics(app);
    }
    return null;
};

export default app;