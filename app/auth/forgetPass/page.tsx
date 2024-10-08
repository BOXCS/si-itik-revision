"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Validasi form dengan zod
const schema = z.object({
  email: z.string().email("Email tidak valid"),
  otp: z.string().min(6, "OTP minimal 6 karakter"),
});

const ForgetPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      otp: "",
    },
  });

  const onSubmit = async (data: { email: string; otp: string }) => {
    setIsLoading(true);
    try {
      // Logic untuk handle pengiriman data form
      console.log(data);

      // Redirect ke halaman reset password
      router.push("/reset-password");
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundImage: `url('/assets/Auth_bg.svg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      className="px-4 lg:px-16"
    >
      {/* Bagian Kiri - Benefit Container */}
      <div className="benefit-container hidden md:block relative grid gap-5 md:mr-16 lg:mr-24 xl:mr-32">
        <img
          src="/assets/logo-si-itik.svg"
          alt="Logo SI_ITIK"
          className="w-16 md:w-20"
        />
        <h1 className="text-3xl md:text-5xl font-bold text-white">
          Keunggulan SI-ITIK
        </h1>
        <div className="benefit-point grid text-lg md:text-2xl font-semibold gap-3 md:gap-5">
          <h2>
            <img
              src="/assets/point-benefit.svg"
              alt="Point"
              className="inline-block w-6 h-6 md:w-10 md:h-10 mr-2"
            />
            Pengelolaan terintegrasi
          </h2>
          <h2>
            <img
              src="/assets/point-benefit.svg"
              alt="Point"
              className="inline-block w-6 h-6 md:w-10 md:h-10 mr-2"
            />
            User Friendly
          </h2>
          <h2>
            <img
              src="/assets/point-benefit.svg"
              alt="Point"
              className="inline-block w-6 h-6 md:w-10 md:h-10 mr-2"
            />
            Analisis mendalam
          </h2>
          <h2>
            <img
              src="/assets/point-benefit.svg"
              alt="Point"
              className="inline-block w-6 h-6 md:w-10 md:h-10 mr-2"
            />
            Data finansial akurat
          </h2>
          <h2>
            <img
              src="/assets/point-benefit.svg"
              alt="Point"
              className="inline-block w-6 h-6 md:w-10 md:h-10 mr-2"
            />
            Fleksibel
          </h2>
        </div>
      </div>

      {/* Bagian form */}
      <div className="form-login bg-white p-8 rounded-lg shadow-lg w-full max-w-lg md:max-w-md lg:max-w-lg xl:max-w-xl h-auto">
        <div className="flex justify-end">
          <button
            className="text-gray-400 hover:text-gray-600"
            onClick={() => router.push("/auth/login")} // Navigasi ke login saat tombol close ditekan
          >
            ✕
          </button>
        </div>
        <h1 className="text-3xl font-bold mb-8">Lupa Password</h1>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Input Email */}
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Masukkan Email
            </label>
            <Input
              id="email"
              {...form.register("email")}
              type="email"
              placeholder="Masukkan Email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-orange-300 focus:outline-none"
            />
          </div>

          {/* Input OTP */}
          <div className="mb-6">
            <label htmlFor="otp" className="block text-sm font-medium mb-2">
              Verifikasi OTP
            </label>
            <Input
              id="otp"
              {...form.register("otp")}
              type="text"
              placeholder="Verifikasi OTP"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-orange-300 focus:outline-none"
            />
          </div>

          {/* Link Kirim Ulang */}
          <div className="text-right mb-6">
            <Link href="#" className="text-orange-500 hover:underline">
              Tidak menerima OTP? Kirim ulang
            </Link>
          </div>

          {/* Tombol Kirim */}
          <Button
            type="submit"
            className="w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 transition"
            disabled={isLoading}
          >
            {isLoading ? "Mengirim..." : "Kirim"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ForgetPasswordPage;
