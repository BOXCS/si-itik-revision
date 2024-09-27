"use client";

import React from "react";
import { useSearchParams } from "next/navigation";

const Dashboard = () => {
  const searchParams = useSearchParams();
  const username = searchParams?.get("username") || "User"; // Fallback to 'User' if 'username' is null

  return <div>Selamat Datang {username}</div>;
};

export default Dashboard;
