// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBlyiITPmNOOfIvInnNUi-uneW-fQJQDDM",
  authDomain: "stich-front.firebaseapp.com",
  projectId: "stich-front",
  storageBucket: "stich-front.firebasestorage.app",
  messagingSenderId: "956963760592",
  appId: "1:956963760592:web:0ea95bb786471f24c271d5",
  measurementId: "G-K5ZT0HSP09"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);