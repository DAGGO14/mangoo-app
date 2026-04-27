import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBRh-7FzciUNUKgjgJ9hDFR1e1O2EBB3g4",
  authDomain: "mangoo-716e0.firebaseapp.com",
  projectId: "mangoo-716e0",
  storageBucket: "mangoo-716e0.firebasestorage.app",
  messagingSenderId: "237318356959",
  appId: "1:237318356959:web:4908ff5b8cc87495680e6a",
  measurementId: "G-2X4EM2QCR5"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
