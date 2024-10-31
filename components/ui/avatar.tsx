"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth"; 
import { auth } from "@/lib/firebase"; // Pastikan path ke firebase.js benar

// Fungsi untuk menghasilkan warna random
function getRandomColor() {
  const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#FFD433', '#33FFF4']; // Kumpulan warna random
  return colors[Math.floor(Math.random() * colors.length)];
}

// Komponen Avatar
interface UserAvatarProps {
  photoURL?: string | null; // Tambahkan prop untuk menerima photoURL
}

export default function UserAvatar({ photoURL }: UserAvatarProps) {
  const [user, setUser] = useState<User | null>(null);

  // Mengambil data pengguna dari Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user); // Simpan data pengguna jika ada
      } else {
        setUser(null); // Jika pengguna tidak login
      }
    });

    return () => unsubscribe(); // Bersihkan listener
  }, []);

  return (
    <Avatar className="w-24 h-24 rounded-full">
      {/* Menampilkan foto profil jika ada, atau default fallback */}
      <AvatarImage 
        src={photoURL || user?.photoURL || undefined} // Gunakan photoURL dari props atau user
        alt={user?.displayName || "User Avatar"} 
        className="rounded-full w-full h-full object-cover" // Sesuaikan ukuran gambar agar bulat sempurna
      />
      {/* Fallback ke huruf pertama dari nama pengguna dengan background warna random */}
      <AvatarFallback 
        className="flex items-center justify-center text-white font-bold rounded-full w-full h-full" 
        style={{ backgroundColor: getRandomColor() }} // Warna background acak
      >
        {user?.displayName?.[0] || "U"}
      </AvatarFallback>
    </Avatar>
  );
}
