// app/layout.tsx
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import ClientProvider from "./ClientProvider";
import { Toaster } from "@/components/ui/toaster";
import Head from "next/head";

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "SI-ITIK",
  description: "Pengelolaan Ternak Itik",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
        ></meta>
      </Head>
      <body className={fontSans.className}>
        <ClientProvider>{children}</ClientProvider>{" "}
        {/* Bungkus dengan ClientProvider */}
        <Toaster />
      </body>
    </html>
  );
}
