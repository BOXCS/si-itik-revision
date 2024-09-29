"use client";

import { usePathname } from "next/navigation";
import LandingPage from "./root/pages/LandingPage";
import SignUpPage from "./auth/signup/page";
import LoginPage from "./auth/login/page";
import Nav from "@/components/Nav";
import UsersPage from "./users";
import ClientProvider from './ClientProvider'; // Import ClientProvider
import Dashboard from "./dashboard/page";
import { UserProvider } from "./context/UserContext";

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
    <UserProvider>
      {content}
    </UserProvider>
  );
};

export default Home;
