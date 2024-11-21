"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Image from "next/image";
import { Button } from "@/components/ui/button";
// import UserAvatar from "@/components/ui/avatar";
import 'remixicon/fonts/remixicon.css';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SigninValidation } from "@/lib/validation";
import { signInWithEmailAndPassword } from "firebase/auth";
// import { doc, getDoc } from "firebase/firestore";
import { auth } from "@/lib/firebase";
import { z } from "zod";
import Loader from "@/components/shared/Loader";
import Link from "next/link";
import { useState } from "react";
import { signInWithGoogle } from "@/lib/authProviders"; // Ensure these functions are defined
import { useRouter } from "next/navigation"; // Import useRouter
import { FirebaseError } from "firebase/app";

const LoginPage = () => {
  const benefits = [
    "Pengelolaan terintegrasi",
    "User Friendly",
    "Analisis mendalam",
    "Data finansial akurat",
    "Fleksible",
  ];

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // State to store error message
  const router = useRouter();

  const form = useForm<z.infer<typeof SigninValidation>>({
    resolver: zodResolver(SigninValidation),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const handleback = () => {
    router.push(`/`);
  };

  const onSubmit = async (values: z.infer<typeof SigninValidation>) => {
    setIsLoading(true);
    setErrorMessage(""); // Reset pesan error saat submit
    const { username, password } = values;

    try {
      // Proses login dengan Firebase Authentication menggunakan email (username di sini adalah email)
      const userCredential = await signInWithEmailAndPassword(
        auth,
        username,
        password
      );

      // Dapatkan user yang login dari userCredential
      const user = userCredential.user;

      // Redirect ke dashboard setelah login berhasil
      router.push(`/dashboard?username=${user.displayName || "User"}`);
    } catch (error: unknown) {
      console.error("Login error:", error);

      // Type narrowing to ensure `error` is a FirebaseError
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/user-not-found":
            setErrorMessage(
              "Akun tidak ditemukan. Mohon periksa kembali email."
            );
            break;
          case "auth/invalid-credential":
            setErrorMessage("Email atau Password salah. Mohon coba lagi.");
            break;
          case "auth/invalid-email":
            setErrorMessage(
              "Format email tidak valid. Mohon masukkan email yang benar."
            );
            break;
          case "auth/too-many-requests":
            setErrorMessage(
              "Terlalu banyak percobaan login. Silakan coba lagi nanti."
            );
            break;
          default:
            setErrorMessage(`Error: ${error.message}`); // Tampilkan pesan error default
        }
      } else if (error instanceof Error) {
        // Handle generic errors
        setErrorMessage(`Terjadi kesalahan: ${error.message}`);
      } else {
        setErrorMessage("Terjadi kesalahan. Mohon coba lagi.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex flex-1 justify-center items-center overflow-auto md:overflow-hidden">
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
          <button className="flex items-center space-x-2 " onClick={handleback}>
            <i className="ri-arrow-left-line text-2xl "></i>
            <span>Kembali</span>
          </button>

          <div className="w-full flex flex-col mb-10 items-center justify-center">
            <h1 className="text-4xl text-[#060606] font-bold md:text-6xl">
              Halo!
            </h1>
            <p className="text-base md:text-2xl">Masukkan Informasi Akun</p>
          </div>

          <div className="w-full flex flex-col">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-5 w-full mt-4"
              >
                <FormField
                  control={form.control}
                  name="username" // Masih menggunakan 'username' di sini, tapi ini adalah email
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>{" "}
                      {/* Ubah label menjadi lebih jelas */}
                      <FormControl>
                        <Input placeholder="Masukkan Email Anda" {...field} />
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
                  <div className="text-red-500 text-sm mt-2">
                    {errorMessage} {/* Display error message */}
                  </div>
                )}

                <div className="flex justify-between mt-4">
                  <Button
                    asChild
                    className="w-full mr-2 border rounded-lg border-black text-black bg-white hover:bg-gray-100"
                  >
                    <Link href="/auth/forgetPass">Lupa Password?</Link>
                  </Button>
                  <Button
                    type="submit"
                    className="w-full ml-2 bg-orange-500 text-white hover:bg-orange-600"
                  >
                    {isLoading ? (
                      <div className="flex-center gap-2">
                        <Loader /> Loading...
                      </div>
                    ) : (
                      "Masuk"
                    )}
                  </Button>
                </div>
              </form>
            </Form>

            <div className="w-full flex items-center justify-center relative py-2 mt-10">
              <div className="w-full h-[1px] bg-gray-300"></div>
              <p className="absolute text-gray-500/80 bg-[#ffffff]">OR</p>
            </div>

            <div className="flex justify-center mt-7">
              <button
                onClick={async () => {
                  setIsLoading(true);
                  try {
                    const user = await signInWithGoogle(); // Assuming this returns a user object
                    const username = user?.displayName || "GoogleUser"; // Extract username or set a default
                    router.push(`/dashboard?username=${username}`);
                  } catch (error) {
                    console.error("Error logging in with Google:", error);
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="flex items-center justify-center w-fit border border-black text-black bg-white hover:bg-gray-100 rounded-lg py-2 px-4"
              >
                <Image
                  src="/assets/google-logo.svg"
                  alt="Facebook Logo"
                  width={24}
                  height={24}
                  className="mr-2 w-10"
                />
                Masuk dengan Google
              </button>
            </div>
          </div>
        </div>

        <div className="w-full flex items-center justify-center">
          <p className="text-xs font-normal text-black md:text-sm">
            Tidak Punya Akun?{" "}
            <Link href="/auth/signup">
              <span className="font-semibold underline underline-offset-2 cursor-pointer text-orange-500">
                Daftar Sekarang
              </span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
