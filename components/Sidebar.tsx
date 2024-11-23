"use client";
import React, { useState } from "react";
import {
  // IconArrowLeft,
  IconBrandTabler,
  // IconSettings,
  // IconUserBolt,
  IconChevronDown,
  // IconAnalyze,
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
// import {
//   Dialog,
//   DialogClose,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/app/auth/Log_out/page";
// import { Button } from "./ui/button";
// import { useRouter } from "next/navigation";

export function SidebarDemo({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [open, setOpen] = useState(false);
  const [subMenuOpen, setSubMenuOpen] = useState(false);
  const searchParams = useSearchParams();
  const username = searchParams?.get("username") || "User";

  const createLinkWithUsername = (href: string) =>
    `${href}?username=${username}`;

  const links = [
    {
      label: "Beranda",
      href: createLinkWithUsername(`/dashboard`), // Beranda dengan username
      icon: (
        <IconBrandTabler className="text-neutral-700 dark:text-neutral-200 h-7 w-7 flex-shrink-0" />
      ),
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
        {
          label: "Penetasan",
          href: createLinkWithUsername(`/analisis/penetasan`),
          icon: <IconAnalyzeFilled className="h-7 w-7 ml-3" />,
        },
        {
          label: "Penggemukan",
          href: createLinkWithUsername(`/analisis/penggemukan`),
          icon: <IconAnalyzeFilled className="h-7 w-7 ml-3" />,
        },
        {
          label: "Layer",
          href: createLinkWithUsername(`/analisis/layer`),
          icon: <IconAnalyzeFilled className="h-7 w-7 ml-3" />,
        },
      ],
    },

    {
      label: "Riwayat Analisis",
    href: '/percobaan?username=${username}',
      icon: (
        <IconHistory className="text-neutral-700 dark:text-neutral-200 h-7 w-7 flex-shrink-0" />
      ),
    },
    
    {
      label: "Pengaturan",
      href: createLinkWithUsername(`/user_setting`),
      icon: (
        <IconSettings2 className="text-neutral-700 dark:text-neutral-200 h-7 w-7 flex-shrink-0" />
      ),
    },
  // {
  //   label: "Percobaan",
  //   href: '/percobaan?username=${username}', // Replace '#' with the URL or functionality for "Percobaan" if needed
  //   icon: <IconSettings className="text-neutral-700 dark:text-neutral-200 h-7 w-7 flex-shrink-0" />,
  // },
];


  // const handleLogout = () => {
  //   setIsDialogOpen(true); // Open the dialog on logout click
  // };

  return (
    <div
      className={cn(
        "rounded-md flex flex-col md:flex-row bg-gradient-to-t from-[#F68211] to-[rgba(249, 170, 69, 0.47)] w-full flex-1 max-w-full mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden",
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
      <div className="logo-si-itik w-8">
        <Image
          src="/assets/logo-si-itik.svg"
          alt="Logo SI-ITIK"
          width={32} // Specify the width (8 * 4 = 32px for consistency with your design)
          height={32} // Specify the height (8 * 4 = 32px for consistency with your design)
          layout="intrinsic" // Ensures the image is responsive
        />
      </div>
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
      <div className="logo-si-itik w-8">
        <Image
          src="/assets/logo-si-itik.svg"
          alt="Logo SI-ITIK"
          width={32} // Sesuaikan dengan ukuran yang diinginkan
          height={32} // Sesuaikan dengan ukuran yang diinginkan
        />
      </div>
    </Link>
  );
};