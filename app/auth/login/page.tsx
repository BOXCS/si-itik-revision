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
import { SigninValidation } from "@/lib/validation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, firestore } from "@/lib/firebase";
import { z } from "zod";
import Loader from "@/components/shared/Loader";
import Link from "next/link";
import { useState } from "react";
import { signInWithGoogle } from "@/lib/authProviders"; // Ensure these functions are defined
import { useRouter } from "next/navigation"; // Import useRouter
// import "@/app/auth.css";

const LoginPage = () => {
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

  const getUserFromEmail = async (email: string) => {
    const userRef = doc(firestore, "users", email); // Ganti 'users' dengan nama koleksi yang sesuai
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return userDoc.data(); // Kembalikan data pengguna, termasuk username
    } else {
      throw new Error("User not found"); // Atau tangani error sesuai kebutuhan
    }
  };

  const onSubmit = async (values: z.infer<typeof SigninValidation>) => {
    setIsLoading(true);
    setErrorMessage(""); // Reset pesan error saat submit
    const { username, password } = values;

    try {
      // Proses login dengan Firebase Authentication menggunakan email (username di sini adalah email)
      const userCredential = await signInWithEmailAndPassword(auth, username, password);

      // Dapatkan user yang login dari userCredential
      const user = userCredential.user;

      // Redirect ke dashboard setelah login berhasil
      router.push(`/dashboard?username=${user.displayName || "User"}`);
    } catch (error: any) {
      console.error("Login error:", error);

      // Custom pesan error berdasarkan kode error dari Firebase
      if (error.code) {
        switch (error.code) {
          case "auth/user-not-found":
            setErrorMessage("Akun tidak ditemukan. Mohon periksa kembali email.");
            break;
          case "auth/invalid-credential":
            setErrorMessage("Email atau Password salah. Mohon coba lagi.");
            break;
          case "auth/invalid-email":
            setErrorMessage("Format email tidak valid. Mohon masukkan email yang benar.");
            break;
          case "auth/too-many-requests":
            setErrorMessage("Terlalu banyak percobaan login. Silakan coba lagi nanti.");
            break;
          default:
            setErrorMessage(`Error: ${error.message}`); // Tampilkan pesan error default
        }
      } else {
        setErrorMessage("Terjadi kesalahan. Mohon coba lagi.");
      }
    } finally {
      setIsLoading(false);
    }
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
            <h2 className="text-white">
              <img
                src="/assets/point-benefit.svg"
                alt="Point"
                className="inline-block w-10 h-10 mr-2"
              />
              Pengelolaan terintegrasi
            </h2>
            <h2 className="text-white">
              <img
                src="/assets/point-benefit.svg"
                alt="Point"
                className="inline-block w-10 h-10 mr-2"
              />
              User Friendly
            </h2>
            <h2 className="text-white">
              <img
                src="/assets/point-benefit.svg"
                alt="Point"
                className="inline-block w-10 h-10 mr-2"
              />
              Analisis mendalam
            </h2>
            <h2 className="text-white">
              <img
                src="/assets/point-benefit.svg"
                alt="Point"
                className="inline-block w-10 h-10 mr-2"
              />
              Data finansial akurat
            </h2>
            <h2 className="text-white">
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
            <h1 className="text-6xl text-[#060606] font-bold">Halo!</h1>
            <p className="text-2xl">Masukkan Informasi Akun</p>
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
                        <Input type="password" placeholder="Masukkan Password Anda" {...field} />
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
          <p className="text-sm font-normal text-black">
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
