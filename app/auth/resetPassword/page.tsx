"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";

// Validasi form menggunakan zod
const schema = z
  .object({
    newPassword: z.string().min(8, "Password minimal 8 karakter"),
    confirmPassword: z.string().min(8, "Password minimal 8 karakter"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Password dan konfirmasi password tidak sama",
    path: ["confirmPassword"],
  });

const ResetPasswordPage = () => {
  const [oobCode, setOobCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    // Mengambil oobCode dari URL
    const queryParams = new URLSearchParams(window.location.search);
    const code = queryParams.get("oobCode");
    if (code) {
      setOobCode(code);
    }
  }, []);

  const onSubmit = async (data: {
    newPassword: string;
    confirmPassword: string;
  }) => {
    setIsLoading(true);
    try {
      if (!oobCode) {
        alert("Kode reset tidak ditemukan.");
        return;
      }

      // Ganti password menggunakan oobCode
      const response = await fetch(`/api/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          oobCode,
          newPassword: data.newPassword,
        }),
      });

      if (response.ok) {
        alert("Password berhasil diubah!");
        // Redirect ke halaman login atau halaman lain sesuai kebutuhan
        window.location.href = "/login";
      } else {
        alert("Gagal mengubah password.");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col xl:flex-row overflow-hidden">
      {/* Bagian Kiri */}
      <div className="xl:w-1/2 bg-orange-500 flex items-center justify-center p-10">
        <div className="text-white">
          <h1 className="text-5xl font-bold">Keunggulan SI-Itik</h1>
          <ul className="text-2xl font-semibold mt-5 space-y-5">
            <li className="flex items-center">
              <Image
                src="/assets/check-icon.svg"
                alt="Check"
                width={80}
                height={80}
                className="w-6 h-6 mr-2"
              />
              Pengelolaan terintegrasi
            </li>
            <li className="flex items-center">
              <Image
                src="/assets/check-icon.svg"
                alt="Check"
                width={80}
                height={80}
                className="w-6 h-6 mr-2"
              />
              User Friendly
            </li>
            <li className="flex items-center">
              <Image
                src="/assets/check-icon.svg"
                alt="Check"
                width={80}
                height={80}
                className="w-6 h-6 mr-2"
              />
              Analisis mendalam
            </li>
            <li className="flex items-center">
              <Image
                src="/assets/check-icon.svg"
                alt="Check"
                width={80}
                height={80}
                className="w-6 h-6 mr-2"
              />
              Data finansial akurat
            </li>
            <li className="flex items-center">
              <Image
                src="/assets/check-icon.svg"
                alt="Check"
                width={80}
                height={80}
                className="w-6 h-6 mr-2"
              />
              Fleksible
            </li>
          </ul>
        </div>
      </div>

      {/* Bagian Kanan */}
      <div className="xl:w-1/2 flex flex-col justify-center items-center bg-orange-100 p-10">
        <h1 className="text-4xl font-bold text-black mb-8">Ubah Password</h1>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full max-w-md"
        >
          <div className="mb-6">
            <Input
              id="newPassword"
              type="password"
              placeholder="Password Baru"
              {...form.register("newPassword")}
              className="w-full px-4 py-2 border rounded-md"
            />
            {form.formState.errors.newPassword && (
              <p className="text-red-600">
                {form.formState.errors.newPassword.message}
              </p>
            )}
          </div>
          <div className="mb-6">
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Konfirmasi Password"
              {...form.register("confirmPassword")}
              className="w-full px-4 py-2 border rounded-md"
            />
            {form.formState.errors.confirmPassword && (
              <p className="text-red-600">
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

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

export default ResetPasswordPage;
