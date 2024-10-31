"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SignupValidation } from "@/lib/validation";
import { z } from "zod";
import Loader from "@/components/shared/Loader";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useState } from "react";
import { useRouter } from "next/navigation";

const SignUpPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // State untuk pesan error
  const router = useRouter();

  const form = useForm<z.infer<typeof SignupValidation>>({
    resolver: zodResolver(SignupValidation),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  // Fungsi untuk menangani form submit
  async function onSubmit(values: z.infer<typeof SignupValidation>) {
    setIsLoading(true);
    setErrorMessage(null); // Reset pesan error sebelum mulai

    try {
      const { username, email, password } = values;

      // Buat akun dengan email dan password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Perbarui profile pengguna dengan displayName
      await updateProfile(user, {
        displayName: username,
      });

      console.log("User created successfully", user);

      // Arahkan pengguna ke halaman login setelah berhasil signup
      router.push("/auth/login");
    } catch (error: any) {
      console.error("Error creating user:", error.message);

      // Tangani error berdasarkan kode dari Firebase
      if (error.code === "auth/email-already-in-use") {
        setErrorMessage("Email sudah terdaftar. Silakan gunakan email lain.");
      } else {
        setErrorMessage("Terjadi kesalahan. Mohon coba lagi.");
      }
    } finally {
      setIsLoading(false);
    }
  }


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

      <div className="w-full h-full bg-[#fff] flex flex-col p-20 justify-between xl:w-2/5">
        <div className="w-full flex flex-col">
          <div className="w-full flex flex-col mb-10 items-center justify-center">
            <h1 className="text-6xl text-[#060606] font-bold">
              Selamat Datang
            </h1>
            <p className="text-2xl">Daftarkan Akunmu Sekarang</p>
          </div>

          <div className="w-full flex flex-col">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-5 w-full mt-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="shad-form_label">Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan Email Anda" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan Username Anda" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Masukkan Password Anda" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />


                {errorMessage && (
                  <div className="text-red-500 mb-4">{errorMessage}</div> // Menampilkan pesan error
                )}

                <div className="flex justify-center mt-4">
                  <Button
                    type="submit"
                    className="w-full ml-2 bg-orange-500 text-white hover:bg-orange-600"
                  >
                    {isLoading ? (
                      <div className="flex-center gap-2">
                        <Loader /> Loading...
                      </div>
                    ) : (
                      "Daftar"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>

        <div className="w-full flex items-center justify-center">
          <p className="text-sm font-normal text-black">
            Sudah Punya Akun?{" "}
            <Link href="/auth/login">
              <span className="font-semibold underline underline-offset-2 cursor-pointer text-orange-500">
                Masuk Sekarang
              </span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
