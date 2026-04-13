
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCLK7hiur5aLmXxI7WqdW9iAWKBADbNzxo",
  authDomain: "vitalguard-database.firebaseapp.com",
  databaseURL: "https://vitalguard-database-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "vitalguard-database",
  storageBucket: "vitalguard-database.firebasestorage.app",
  messagingSenderId: "777270337061",
  appId: "1:777270337061:web:f74cae31b5e6547d00a9cc",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export default app;
