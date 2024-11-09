"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth"; 
import { auth } from "@/lib/firebase";

// Generate a random color
function getRandomColor() {
  const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#FFD433', '#33FFF4'];
  return colors[Math.floor(Math.random() * colors.length)];
}

interface UserAvatarProps {
  // Optionally accept photoURL from props (e.g., if you have it from a parent component)
  photoURL?: string | null; // Allow photoURL to be null
}

export default function UserAvatar({ photoURL }: UserAvatarProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true); // Marks that the component has mounted
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user); 
    });
    return () => unsubscribe();
  }, []);

  if (!isMounted) return null; // Prevent SSR mismatches

  // If photoURL is null or undefined, use undefined to avoid passing 'null' to AvatarImage
  const displayPhotoURL: string | undefined = photoURL || user?.photoURL || undefined;

  return (
    <Avatar className="w-24 h-24 rounded-full">
      <AvatarImage 
        src={displayPhotoURL} 
        alt={user?.displayName || "User Avatar"} 
        className="rounded-full w-full h-full object-cover"
      />
      <AvatarFallback 
        className="flex items-center justify-center text-white font-bold rounded-full w-full h-full text-5xl" 
        style={{ backgroundColor: getRandomColor() }}
      >
        {user?.displayName?.[0] || "U"}
      </AvatarFallback>
    </Avatar>
  );
}
