"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { getAuth, sendPasswordResetEmail } from "firebase/auth"; // Tambahkan import ini
import { FirebaseError } from "firebase/app";
import Image from "next/image";

interface ToastMessage {
  id: string;
  title: string;
  description: string;
  variant: "default" | "destructive";
}

const ForgetPasswordPage = () => {
  const benefits = [
    "Pengelolaan terintegrasi",
    "User Friendly",
    "Analisis mendalam",
    "Data finansial akurat",
    "Fleksible",
  ];

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [emailError, setEmailError] = useState("");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const auth = getAuth(); // Inisialisasi Firebase Auth

  const showToast = (toast: Omit<ToastMessage, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const validateEmail = (email: string) => {
    const re = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!email) {
      return "Email wajib diisi";
    }
    if (!re.test(email)) {
      return "Format email tidak valid";
    }
    return "";
  };

  // Modifikasi fungsi untuk menggunakan Firebase
  const sendResetPasswordEmail = async (
    email: string,
    isResend: boolean = false
  ) => {
    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);

      setEmailSent(true);
      showToast({
        title: "Berhasil",
        description: `Email reset password telah dikirim ke ${email}. Periksa inbox atau folder spam Anda.`,
        variant: "default",
      });

      if (isResend) {
        startResendTimer();
      }
    } catch (error: unknown) {
      // Use `unknown` type here
      // Handle specific Firebase errors
      let errorMessage =
        "Terjadi kesalahan dalam mengirim email reset password.";

      // Type guard to check if error is a FirebaseError
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/user-not-found":
            errorMessage = "Email tidak terdaftar dalam sistem.";
            break;
          case "auth/invalid-email":
            errorMessage = "Format email tidak valid.";
            break;
          case "auth/too-many-requests":
            errorMessage =
              "Terlalu banyak permintaan. Silakan coba lagi nanti.";
            break;
          // Tambahkan case lain sesuai kebutuhan
        }
      }

      showToast({
        title: "Gagal",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startResendTimer = () => {
    setResendTimer(60);
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateEmail(email);
    if (error) {
      setEmailError(error);
      return;
    }
    setEmailError("");
    await sendResetPasswordEmail(email);
  };

  const handleResend = async () => {
    if (email && !resendTimer) {
      await sendResetPasswordEmail(email, true);
    }
  };

  return (
    <>
      <ToastProvider>
        {toasts.map(({ id, title, description, variant }) => (
          <Toast key={id} variant={variant}>
            <div className="grid gap-1">
              <ToastTitle>{title}</ToastTitle>
              <ToastDescription>{description}</ToastDescription>
            </div>
            <ToastClose />
          </Toast>
        ))}
        <ToastViewport />
      </ToastProvider>

      <div className="w-full h-screen flex flex-1 justify-center items-center overflow-hidden">
        <div className="relative w-2/3 h-full hidden flex-col xl:block">
          <div className="absolute top-1/4 left-[10%] flex flex-col gap-5 max-w-[80%]">
            {/* Logo */}
            <div className="relative w-20 aspect-square">
              <Image
                src="/assets/logo-si-itik.svg"
                alt="Logo SI_ITIK"
                fill
                className="object-contain"
              />
            </div>

            {/* Title */}
            <h1 className="text-[min(5vw,3rem)] font-bold text-white leading-tight">
              Keunggulan SI-ITIK
            </h1>

            {/* Benefits List */}
            <div className="grid gap-5">
              {benefits.map((benefit, index) => (
                <h2
                  key={index}
                  className="text-[min(2vw,1.5rem)] font-semibold text-white flex items-center"
                >
                  <div className="relative w-[min(2.5vw,2.5rem)] aspect-square mr-2">
                    <Image
                      src="/assets/point-benefit.svg"
                      alt="Point"
                      fill
                      className="object-contain"
                    />
                  </div>
                  {benefit}
                </h2>
              ))}
            </div>

            {/* Decorative Elements */}
            <div className="absolute left-[80%] top-[45%]">
              <div className="relative w-[min(47vw,27rem)] aspect-square">
                <Image
                  src="/assets/bebek.svg"
                  alt="Logo SI_ITIK"
                  fill
                  className="hidden xl:block object-contain"
                />
              </div>
            </div>

            <div className="absolute top-[-20%] right-[-90%]">
              <div className="relative w-[min(25vw,200px)] aspect-square">
                <Image
                  src="/assets/elips.svg"
                  alt="elips"
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            <div className="absolute top-[125%] left-[-50%]">
              <div className="relative w-[min(50vw,200px)] aspect-square">
                <Image
                  src="/assets/elips2.svg"
                  alt="elips"
                  fill
                  className="ml-20 object-contain"
                />
              </div>
            </div>
          </div>

          {/* Background */}
          <div className="bg-[#CF5804] w-full h-full" />
        </div>

        {/* Bagian kanan - Form */}
        <div className="w-full h-full bg-white flex flex-col p-20 justify-between xl:w-2/5">
          <div className="w-full flex flex-col max-w-md mx-auto">
            <div className="w-full flex flex-col mb-10 items-center">
              <h1 className="text-4xl md:text-6xl text-[#060606] font-bold">
                Lupa Password
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Masukkan Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError("");
                  }}
                  aria-invalid={emailError ? "true" : "false"}
                  placeholder="Masukkan Email"
                  className="w-full"
                  disabled={isLoading}
                />
                {emailError && (
                  <p className="mt-1 text-sm text-red-600">{emailError}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⊚</span>
                    Mengirim...
                  </span>
                ) : (
                  "Kirim Link Reset Password"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              {emailSent && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Tidak menerima email?</p>
                  {resendTimer > 0 ? (
                    <p className="text-sm text-gray-500">
                      Tunggu {resendTimer} detik untuk kirim ulang
                    </p>
                  ) : (
                    <Button
                      variant="link"
                      onClick={handleResend}
                      className="text-orange-500 hover:text-orange-600"
                      disabled={isLoading || resendTimer > 0}
                    >
                      Kirim Ulang Email
                    </Button>
                  )}
                </div>
              )}
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => window.history.back()}
                className="w-fit p-2 mr-2 border rounded-lg border-black text-black bg-white hover:bg-gray-100"
              >
                Kembali ke Halaman Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgetPasswordPage;
