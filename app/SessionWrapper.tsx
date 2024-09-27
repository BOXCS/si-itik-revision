// /app/SessionWrapper.tsx
"use client"; // Ensure this is a client component

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react"; // Import ReactNode

interface SessionWrapperProps {
  children: ReactNode; // Define children as ReactNode
}

export default function SessionWrapper({ children }: SessionWrapperProps) {
  return <SessionProvider>{children}</SessionProvider>;
}
