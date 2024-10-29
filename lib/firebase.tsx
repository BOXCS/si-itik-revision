// lib/firebase.ts

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Ganti ini dengan konfigurasi proyek Firebase Anda
const firebaseConfig = {
  apiKey: "AIzaSyB8SI_HZs_lEyfd84CgN58LOPl0dBkJhuU",
  authDomain: "si-itik-7b3e6.firebaseapp.com",
  projectId: "si-itik-7b3e6",
  storageBucket: "si-itik-7b3e6.appspot.com",
  messagingSenderId: "272944052495",
  appId: "1:272944052495:web:f1ac3bc763ca5c150ca67a",
  measurementId: "G-PLJW19MEPV"
};

// Inisialisasi Firebase
export const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
// Ekspor instance auth dan firestore
export const auth = getAuth(app);
export const firestore = getFirestore(app);