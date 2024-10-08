"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { SidebarDemo } from "@/components/Sidebar";
import SidebarHandler from "@/components/SidebarHandler";
import RootLayout from "../layout";

export default function Dashboard() {
  const searchParams = useSearchParams();
  const username = searchParams?.get("username") || "User"; 
  return (
    <div>
      <SidebarDemo>
        <h1>My Content Dashboard. Halo {username}</h1>
      </SidebarDemo>
    </div>
  );
}
