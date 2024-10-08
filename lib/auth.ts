import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { app } from "./firebase"; // Import konfigurasi Firebase yang telah Anda buat

const auth = getAuth(app);

// Fungsi untuk mendaftarkan pengguna baru
export const registerUser = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    console.log("User registered:", user);
  } catch (error) {
    console.error("Error registering user:", error);
  }
};

// Fungsi untuk login pengguna
export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    console.log("User logged in:", user);
  } catch (error) {
    console.error("Error logging in user:", error);
  }
};
