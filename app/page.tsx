"use client";

import { usePathname } from "next/navigation";
import LandingPage from "./root/pages/LandingPage";
import SignUpPage from "./auth/signup/page";
import LoginPage from "./auth/login/page";
// import UsersPage from "./users";
import Dashboard from "./dashboard/page";
import { UserProvider } from "./context/UserContext"; // Pastikan ini diimpor
import PenetasanPage from "./analisis/penetasan/page";
import ForgetPassPage from "./auth/forgetPass/page";
import GetDataPage from "./analisis/test/page";
import SettingPage from "./user_setting/page";
import { PeriodProvider } from "./context/PeriodeContext";

function Home() {
  const pathname = usePathname(); // Ambil pathname saat ini

  let content;

  switch (pathname) {
    case "/auth/signup":
      content = <SignUpPage />;
      break;
    case "/auth/login":
      content = <LoginPage />;
      break;
    case "/auth/forgetPass":
      content = <ForgetPassPage />;
      break;
    // case "/user":
    //   content = <UsersPage />;
    //   break;
    case "/dashboard":
      content = <Dashboard />;
      break;
    case "/analisis/penetasan":
      content = <PenetasanPage />; // Pastikan ini berada dalam UserProvider
      break;
    case "/user_setting":
      content = <SettingPage />;
    case "/analisis/test":
      content = <GetDataPage />; // Pastikan ini berada dalam UserProvider
      break;
    default:
      content = <LandingPage />;
  }

  return (
    <UserProvider>
      <PeriodProvider>
        {" "}
        {/* UserProvider membungkus seluruh aplikasi */}
        {content}
      </PeriodProvider>
    </UserProvider>
  );
}

export default Home;
