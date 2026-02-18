import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const prodConfig = {
    apiKey: "AIzaSyBn54iQ5BAWrNVqgnDBJIkrZgvvEOnh2Nw",
    authDomain: "the-great-catch.firebaseapp.com",
    projectId: "the-great-catch",
    storageBucket: "the-great-catch.firebasestorage.app",
    messagingSenderId: "514171240388",
    appId: "1:514171240388:web:a92d79b873c0403cc3ae91",
    measurementId: "G-48HVFF08WC"
};

const testConfig = {
    apiKey: "AIzaSyCvHNaxspVhPkcdfRr265IzT5qzNP9Tqkc",
    authDomain: "the-great-catch-test.firebaseapp.com",
    projectId: "the-great-catch-test",
    storageBucket: "the-great-catch-test.firebasestorage.app",
    messagingSenderId: "992101300478",
    appId: "1:992101300478:web:fc58b92ac49305bc2dcdaf",
    measurementId: "G-ELG68JTML9"
};

// Check if we have a preference in localStorage, default to prod
const isTestEnv = typeof window !== 'undefined' && localStorage.getItem('app_env') === 'test';
const currentConfig = isTestEnv ? testConfig : prodConfig;

console.log(`🔥 Initializing Firebase in ${isTestEnv ? 'TEST' : 'PROD'} mode`);

const app = initializeApp(currentConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export const toggleEnvironment = () => {
    if (typeof window !== 'undefined') {
        const nextEnv = isTestEnv ? 'prod' : 'test';
        localStorage.setItem('app_env', nextEnv);
        window.location.reload();
    }
};
