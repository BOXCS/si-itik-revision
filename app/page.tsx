"use client";

import { usePathname } from "next/navigation"; // Use this for path checking
import LandingPage from "./root/pages/LandingPage";
import SignUpPage from "./auth/signup/page";
import LoginPage from "./auth/login/page";
import Nav from "@/components/Nav";
import UsersPage from "./users";
import ClientProvider from './ClientProvider'; // Import ClientProvider
import Dashboard from "./dashboard/page";

const Home = () => {
  const pathname = usePathname(); // Get the current pathname

  // Ensure the path matches exactly
  let content;

  switch (pathname) {
    case "/auth/signup":
      content = <SignUpPage />;
      break;
    case "/auth/login":
      content = <LoginPage />;
      break;
    case "/user":
      content = <UsersPage />;
      break;
    case "/dashboard":
      content = <Dashboard />;
      break;
    default:
      content = <LandingPage />;
  }

  return (
    <ClientProvider> {/* Wrap the content with ClientProvider */}
      <Nav />
      {content}
    </ClientProvider>
  );
};

export default Home;
