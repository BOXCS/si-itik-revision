// lib/fetchUsers.ts
import { firestore } from "@/lib/firebase"; // Pastikan Anda mengimpor Firestore yang benar
import { collection, getDocs } from "firebase/firestore";

// Fungsi untuk mengambil daftar pengguna dari Firestore
export async function fetchUsers() {
  try {
    // Ambil semua dokumen dari koleksi 'users'
    const querySnapshot = await getDocs(collection(firestore, "users"));
    
    // Peta hasilnya ke dalam format yang lebih mudah digunakan
    const users = querySnapshot.docs.map(doc => ({
      id: doc.id, // Ambil ID dokumen
      ...doc.data(), // Ambil data dokumen lainnya
    }));
    
    console.log("Users fetched:", users); // Log untuk memastikan data yang diambil
    return users; // Kembalikan daftar pengguna
  } catch (error) {
    console.error("Error fetching users:", error); // Log error
    throw error; // Lemparkan error untuk ditangani di tempat lain
  }
}
