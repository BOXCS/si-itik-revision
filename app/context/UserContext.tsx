import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

// Definisikan tipe data user
interface User {
  username: string;
  email: string;
  // Tambahkan properti lain yang dibutuhkan
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

// Membuat UserContext
export const UserContext = createContext<UserContextType | undefined>(undefined);

// Custom hook untuk menggunakan UserContext
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser harus digunakan di dalam UserProvider");
  }
  return context;
};

// Membuat Provider untuk UserContext
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Sesuaikan dengan user data yang kamu butuhkan
        const newUser: User = {
          username: firebaseUser.displayName || "",
          email: firebaseUser.email || ""
        };
        setUser(newUser);
      } else {
        setUser(null);
      }
    });

    // Clean up the subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
