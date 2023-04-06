// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from 'firebase/auth'


const firebaseConfig = {
  apiKey: "AIzaSyDovIL5sAI8QmBzM8MLbzLnFWqwNenV6Cs",
  authDomain: "whatsapp-clone-b5e50.firebaseapp.com",
  projectId: "whatsapp-clone-b5e50",
  storageBucket: "whatsapp-clone-b5e50.appspot.com",
  messagingSenderId: "861285190246",
  appId: "1:861285190246:web:b2dcb99285a2e169b7fba7",
  measurementId: "G-P7C98YGM1F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app)