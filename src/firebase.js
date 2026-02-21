// Firebase Configuration
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// TODO: Replace with your own Firebase config from Firebase Console

const firebaseConfig = {
  apiKey: "AIzaSyCNVVpQBJKibgZWR8guIxyhT5iuoe_64S8",
  authDomain: "retina-eye-care.firebaseapp.com",
  projectId: "retina-eye-care",
  storageBucket: "retina-eye-care.firebasestorage.app",
  messagingSenderId: "1021997910655",
  appId: "1:1021997910655:web:ce695c6039f8f49954cd4a",
  measurementId: "G-RF0988V5LK"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

export default app;