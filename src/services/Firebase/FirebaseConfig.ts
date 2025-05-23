/// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAAjPR754VGv1PnJNrtlSmMGjH-IBWyuZw",
  authDomain: "camisetas-be56b.firebaseapp.com",
  databaseURL: "https://camisetas-be56b.firebaseio.com",
  projectId: "camisetas-be56b",
  storageBucket: "camisetas-be56b.firebasestorage.app",  
  messagingSenderId: "413290343018",
  appId: "1:413290343018:web:446563d9a20a53620cf813",
  measurementId: "G-7KH7J0B38E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Exportar las instancias de Firebase
export { db, auth };