import React, { createContext, useContext, useState, useEffect } from 'react';

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
const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser harus digunakan di dalam UserProvider');
  }
  return context;
};

// Membuat Provider untuk UserContext
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Fungsi untuk memeriksa dan memparse user dari localStorage
  const loadUserFromStorage = () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser); // Pastikan data yang diparse valid JSON
      }
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      // Jika terjadi error saat parsing, hapus data yang tidak valid
      localStorage.removeItem('user');
    }
  };

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  // Simpan user ke localStorage jika user berubah
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
