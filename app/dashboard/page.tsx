"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { SidebarDemo } from "@/components/Sidebar";
import SidebarHandler from "@/components/SidebarHandler";
import RootLayout from "../layout";

export default function Dashboard() {
  const searchParams = useSearchParams();
  const username = searchParams?.get("username") || "User"; 

  // return <div>Selamat Datang {username}</div>;
  // <a href="">analisis penetasan</a>
  return (
    <div>
      <SidebarDemo>
        <h1>Beranda. Halo {username}</h1>
      </SidebarDemo>
    </div>
  );
}
