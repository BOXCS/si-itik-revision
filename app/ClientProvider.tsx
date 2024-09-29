// app/components/ClientProvider.tsx
"use client"; // Tambahkan directive ini

import { UserProvider } from "./context/UserContext";// Sesuaikan path Anda

export default function ClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UserProvider>{children}</UserProvider>;
}
