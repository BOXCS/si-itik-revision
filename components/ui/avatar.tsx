"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth"; 
import { auth } from "@/lib/firebase";

// Fungsi untuk menghasilkan warna random
function getRandomColor() {
  const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#FFD433', '#33FFF4'];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Komponen Avatar
interface UserAvatarProps {
  photoURL?: string | null;
}

export default function UserAvatar({ photoURL }: UserAvatarProps) {
  const [user, setUser] = useState<User | null>(null);

  // Mengambil data pengguna dari Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user); // Simpan data pengguna jika ada
    });
    return () => unsubscribe(); // Bersihkan listener saat unmount
  }, []);

  // Tentukan URL gambar yang digunakan untuk AvatarImage
  const imageUrl = photoURL || user?.photoURL || undefined;

  return (
    <Avatar className="w-24 h-24 rounded-full">
      {imageUrl ? (
        <AvatarImage 
          src={imageUrl} 
          alt={user?.displayName || "User Avatar"} 
          className="rounded-full w-full h-full object-cover" 
        />
      ) : (
        <AvatarFallback 
          className="flex items-center justify-center text-white font-bold rounded-full w-full h-full text-5xl" 
          style={{ backgroundColor: getRandomColor() }}
        >
          {user?.displayName?.[0]?.toUpperCase() || "U"}
        </AvatarFallback>
      )}
    </Avatar>
  );
}
