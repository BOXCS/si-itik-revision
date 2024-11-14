// "use client";

// import { usePathname } from "next/navigation";
// import { SidebarDemo } from "@/components/Sidebar";

// interface SidebarHandlerProps {
//   children: React.ReactNode;
// }

// export default function SidebarHandler({ children }: Readonly<{children:React.ReactNode}>) {
//   const pathname = usePathname(); // Mendapatkan URL

//   // Tentukan halaman di mana Sidebar tidak seharusnya muncul
//   const noSidebarPaths = ["/", "/auth/login/", "/auth/signup/"]; // Tambahkan route lain jika perlu

//   // Tentukan apakah Sidebar akan ditampilkan atau tidak
//   const showSidebar = pathname && !noSidebarPaths.includes(pathname);

//   return (
//     <>
//       {showSidebar && <SidebarDemo />}
//       <main>{children}</main>
//     </>
//   );
// }
