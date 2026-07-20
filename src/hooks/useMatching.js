import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBtcS9-hBommJFlIEXJv-gWAiSWxII4t5c",
  authDomain: "comrade-to-listen.firebaseapp.com",
  projectId: "comrade-to-listen",
  storageBucket: "comrade-to-listen.firebasestorage.app",
  messagingSenderId: "117917852742",
  appId: "1:117917852742:web:29203921f3ffe891275647",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;