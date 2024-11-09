"use client";
import React, { useState } from "react";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconSettings,
  IconUserBolt,
  IconChevronDown,
  IconAnalyze,
  IconAnalyzeFilled,
  IconHistory,
  IconSettings2,
} from "@tabler/icons-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Sidebar, SidebarBody, SidebarLink } from "./ui/sidebar";
import { useSearchParams } from "next/navigation";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/auth/Log_out/page";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation"; // Import useRouter


export function SidebarDemo({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [open, setOpen] = useState(false);
  const [subMenuOpen, setSubMenuOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const searchParams = useSearchParams();
  const username = searchParams?.get("username") || "User";

  const links = [
    {
      label: "Beranda",
      href: `/dashboard/?username=${username}`, // Beranda dengan username
      icon: <IconBrandTabler className="text-neutral-700 dark:text-neutral-200 h-7 w-7 flex-shrink-0" />,
    },
    {
      label: "Analisis",
      href: "#",
      icon: (
        <div className="flex items-center">
          <IconAnalyzeFilled className="text-neutral-700 dark:text-neutral-200 h-7 w-7 flex-shrink-0" />
          <IconChevronDown
            className={`text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0 ml-2 transition-transform ${
              subMenuOpen ? "rotate-180" : "rotate-0"
            }`}
          />
        </div>
      ),
      subLinks: [
        { label: "Penetasan", href: `/analisis/penetasan?username=${username}`, icon: <IconAnalyzeFilled className="h-7 w-7 ml-3" /> },
        { label: "Penggemukan", href: `/analisis/penggemukan?username=${username}`, icon: <IconAnalyzeFilled className="h-7 w-7 ml-3" /> },
        { label: "Layer", href: `/analisis/layer?username=${username}`, icon: <IconAnalyzeFilled className="h-7 w-7 ml-3" /> },
        { label: "test Data", href: `/analisis/test?username=${username}`, icon: <IconAnalyzeFilled className="h-7 w-7 ml-3" /> },
      ],
    },
    
    {
      label: "Riwayat Analisis",
      href: `/riwayat?username=${username}`, // Tambahkan username ke riwayat
      icon: <IconHistory className="text-neutral-700 dark:text-neutral-200 h-7 w-7 flex-shrink-0" />,
    },
    {
      label: "Pengaturan",
      href: `/user_setting?username=${username}`, // Tambahkan username ke pengaturan
      icon: <IconSettings2 className="text-neutral-700 dark:text-neutral-200 h-7 w-7 flex-shrink-0" />,
    },
  ]; 

  const handleLogout = () => {
    setIsDialogOpen(true); // Open the dialog on logout click
  };

  return (
    <div
    className={cn(
        "rounded-md flex flex-col md:flex-row bg-gradient-to-t from-[#F9AC45] to-white w-full flex-1 max-w-full mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden",
        "h-dvh"
      )}      
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-5">
              {links.map((link, idx) => (
                <div key={idx}>
                  <div
                    onClick={() => {
                      if (link.subLinks) {
                        setSubMenuOpen(!subMenuOpen);
                      }
                    }}
                  >
                    <SidebarLink link={link} />
                  </div>
                  {link.subLinks && subMenuOpen && (
                    <div className="ml-6">
                      {link.subLinks.map((subLink, subIdx) => (
                        <SidebarLink key={subIdx} link={subLink} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div>
            {/* Tombol Keluar yang memicu popup */} 
            <Dialog>
              <DialogTrigger asChild>
            <SidebarLink
              link={{
                label: "Keluar",
                href: "#",
                icon: (
                  <Image
                    src="/assets/sign-out-fill.svg"
                    className="h-7 w-7 flex-shrink-0 rounded-full"
                    width={50}
                    height={50}
                    alt="Avatar"
                  />
                ),
              }}
            />
            </DialogTrigger>
            <DialogContent className="lg:max-w-lg">
            <DialogHeader>
                  <DialogTitle className="text-center">Konfirmasi Logout</DialogTitle>
                  <DialogDescription className="text-center mt-1 text-lg leading-6">
                    Apakah kamu yakin ingin Logout.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-6">
                  <DialogClose asChild>
                    <Button
                      className="mt-2 w-full lg:mt-0 lg:w-fit bg-[#E4E4E4] hover:bg-[#C9C8C8]"
                      variant="secondary"
                      onClick={() => setIsDialogOpen(false)} // Close dialog without logging out
                    >
                      Batal
                    </Button>
                  </DialogClose>
                  <DialogClose asChild>
                  <Link href="/auth/login">
                      <Button className="w-full lg:w-fit bg-orange-500 text-white hover:bg-orange-600">Logout!</Button>
                    </Link>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </SidebarBody>
      </Sidebar>
      {children}
    </div>
  );
}

export const Logo = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre"
      >
        SI-ITIK POLIJE
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    </Link>
  );
};

// Dummy dashboard component with content
const Dashboard = () => {
  return (
    <div className="flex flex-1">
      <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
        <div className="flex gap-2">
          {[...new Array(4)].map((i) => (
            <div
              key={"first-array" + i}
              className="h-20 w-full rounded-lg bg-gray-100 dark:bg-neutral-800 animate-pulse"
            ></div>
          ))}
        </div>
        <div className="flex gap-2 flex-1">
          {[...new Array(2)].map((i) => (
            <div
              key={"second-array" + i}
              className="h-full w-full rounded-lg bg-gray-100 dark:bg-neutral-800 animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};
