import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAr-_mDCg5qBU6EX5FF-jJzw0GMe5kan_w",
  projectId: "firebase-hevolved",
  authDomain: "fir-hevolved.web.app",
  storageBucket: "firebase-hevolved.firebasestorage.app",
  appId: "1:575543291353:android:9591c71984d0b836"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);