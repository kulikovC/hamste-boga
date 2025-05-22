// Firebase инициализация
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Конфигурация пользователя
const firebaseConfig = {
  apiKey: "AIzaSyAz_hKL1ikmNe8f6XV16uKNcQ-JKVrp3rE",
  authDomain: "projecthamsterka.firebaseapp.com",
  projectId: "projecthamsterka",
  storageBucket: "projecthamsterka.firebasestorage.app",
  messagingSenderId: "13249377735",
  appId: "1:13249377735:web:a03a8f8c58648c580b95e2",
  measurementId: "G-36EPSRGPPV"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };