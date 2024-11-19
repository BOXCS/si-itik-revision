// app/components/ClientProvider.tsx
"use client"; // Tambahkan directive ini

import { PeriodProvider } from "./context/PeriodeContext";
import { UserProvider } from "./context/UserContext"; // Sesuaikan path Anda

export default function ClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      {" "}
      <PeriodProvider>{children}</PeriodProvider>
    </UserProvider>
  );
}
