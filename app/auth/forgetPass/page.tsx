"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAuth, sendSignInLinkToEmail } from "firebase/auth";

// Validasi form dengan zod
const schema = z.object({
  email: z.string().email("Email tidak valid"),
});

const ForgetPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  // Fungsi untuk mengirim email OTP
  const sendOtpEmail = async (email: string) => {
    const auth = getAuth();

    // Pengaturan actionCodeSettings untuk URL dan data tambahan
    const actionCodeSettings = {
      url: `https://si-itik-7b3e6.firebaseapp.com/__/auth/action?mode=action&oobCode=code`,
      handleCodeInApp: true,
    };

    try {
      // Mengirim email OTP melalui Firebase Authentication
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);

      console.log(`OTP telah dikirim ke ${email}`);
      alert("Email verifikasi telah dikirim. Periksa inbox Anda.");
    } catch (error) {
      console.error("Terjadi kesalahan dalam mengirim OTP:", error);
    }
  };

  const onSubmit = async (data: { email: string }) => {
    await sendOtpEmail(data.email);
  };

  return (
    <div className="w-full h-screen flex flex-1 justify-center items-center overflow-hidden">
      <div className="relative w-2/3 h-full hidden flex-col xl:block">
        <div className="absolute top-[25%] left-[10%] flex flex-col gap-5">
          <img
            src="/assets/logo-si-itik.svg"
            alt="Logo SI_ITIK"
            className="w-20"
          />
          <h1 className="flex flex-col text-5xl font-bold text-white">
            Keunggulan SI-ITIK
          </h1>
          <div className="benefit-point grid text-2xl font-semibold gap-5">
            <h2>
              <img
                src="/assets/point-benefit.svg"
                alt="Point"
                className="inline-block w-10 h-10 mr-2"
              />
              Pengelolaan terintegrasi
            </h2>
            <h2>
              <img
                src="/assets/point-benefit.svg"
                alt="Point"
                className="inline-block w-10 h-10 mr-2"
              />
              User Friendly
            </h2>
            <h2>
              <img
                src="/assets/point-benefit.svg"
                alt="Point"
                className="inline-block w-10 h-10 mr-2"
              />
              Analisis mendalam
            </h2>
            <h2>
              <img
                src="/assets/point-benefit.svg"
                alt="Point"
                className="inline-block w-10 h-10 mr-2"
              />
              Data finansial akurat
            </h2>
            <h2>
              <img
                src="/assets/point-benefit.svg"
                alt="Point"
                className="inline-block w-10 h-10 mr-2"
              />
              Fleksible
            </h2>
          </div>
          <div className="absolute top-[45%] items-end justify-end">
            <img
              src="/assets/itik-cartoon.svg"
              alt="Logo SI_ITIK"
              className="hidden xl:block ml-72"
            />
          </div>
        </div>
        <div className="bg-[#CF5804] w-full h-full object-cover"></div>
      </div>

      {/* Bagian Form */}
      <div className="w-full h-full bg-[#fff] flex flex-col p-20 justify-between xl:w-2/5">
        <div className="w-full flex flex-col">
          <div className="w-full flex flex-col mb-10 items-center justify-center">
            <h1 className="text-6xl text-[#060606] font-bold">Lupa Password</h1>
          </div>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium">
                Masukkan Email
              </label>
              <Input
                id="email"
                {...form.register("email")}
                type="email"
                placeholder="Masukkan Email"
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            {/* Spacer between input and button */}
            <div className="mb-6"></div>
            <Button
              type="submit"
              className="w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 transition"
              disabled={isLoading}
            >
              {isLoading ? "Mengirim..." : "Kirim"}
            </Button>
          </form>
          {/* Spacer between button and link */}
          <div className="mb-6"></div>
          <div className="text-center">
            {otpSent ? (
              <p className="text-green-500">OTP telah dikirim ke email Anda.</p>
            ) : (
              <Link href="#" className="text-orange-500 hover:underline">
                Tidak menerima OTP? Kirim ulang
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgetPasswordPage;
