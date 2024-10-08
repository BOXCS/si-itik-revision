"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SidebarDemo } from "@/components/Sidebar";
import SidebarHandler from "@/components/SidebarHandler";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase"; // Pastikan path ini sesuai dengan konfigurasi Firebase Anda
import RootLayout from "../layout";

export default function Dashboard() {
  const searchParams = useSearchParams();
  const [username, setUsername] = useState<string>("User");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Jika user memiliki displayName, gunakan itu, jika tidak gunakan email sebagai pengganti
        setUsername(user.displayName || user.email || "User");
      } else {
        // Jika tidak ada user yang login, mungkin Anda ingin mengarahkan ke halaman login atau tetap menampilkan "User"
        setUsername("User");
      }
    });

    // Bersihkan subscription saat komponen unmount
    return () => unsubscribe();
  }, []);

  return (
    <div>
      <SidebarDemo>
        <h1>My Content Dashboard. Halo {username}</h1>
      </SidebarDemo>
    </div>
  );
}
