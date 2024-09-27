// /app/dashboard/Beranda.tsx
"use client"; // Make this a Client Component

import { useSession, signOut } from "next-auth/react";

export default function Dashboard() {
  const { data: session } = useSession();

  if (!session) {
    return <p>You need to be signed in to access this page.</p>;
  }

  return (
    <div>
      <h1>Welcome, {session.user?.name}</h1>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
