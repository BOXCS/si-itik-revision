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
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { FirebaseError } from "firebase/app";

const SignUpPage = () => {
  const benefits = [
    "Pengelolaan terintegrasi",
    "User Friendly",
    "Analisis mendalam",
    "Data finansial akurat",
    "Fleksible",
  ];

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
    } catch (error: unknown) {
      console.error("Error creating user:", error);

      // Check if the error is a FirebaseError (which includes the 'code' property)
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/email-already-in-use":
            setErrorMessage(
              "Email sudah terdaftar. Silakan gunakan email lain."
            );
            break;
          default:
            setErrorMessage("Terjadi kesalahan. Mohon coba lagi.");
        }
      } else if (error instanceof Error) {
        // Handle generic errors that are not FirebaseError
        setErrorMessage(`Terjadi kesalahan: ${error.message}`);
      } else {
        setErrorMessage("Terjadi kesalahan yang tidak diketahui.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
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

      <div className="w-full h-full bg-[#fff] flex flex-col p-20 justify-between xl:w-2/5">
        <div className="w-full flex flex-col">
          <div className="w-full flex flex-col mb-10 items-center justify-center">
            <h1 className="text-4xl text-[#060606] font-bold md:text-6xl">
              Selamat Datang
            </h1>
            <p className="text-base md:text-2xl">Daftarkan Akunmu Sekarang</p>
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
                        <Input
                          placeholder="Masukkan Username Anda"
                          {...field}
                        />
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
                        <Input
                          type="password"
                          placeholder="Masukkan Password Anda"
                          {...field}
                        />
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
