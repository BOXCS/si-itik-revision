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
import { useState } from "react";
import { signInWithGoogle, signInWithFacebook } from "@/lib/authProviders";

const SignUpPage = () => {
  const [isLoading, setIsLoading] = useState(false);

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
    try {
      const { username, email, password } = values;

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      if (!res.ok) {
        const textResponse = await res.text();
        console.error("Error response:", textResponse);
        throw new Error(textResponse);
      }

      const data = await res.json();
      console.log("User created successfully", data);

      // Login menggunakan email dan password setelah signup berhasil
      const signInResponse = await signIn("credentials", {
        email: values.email,
        password: values.password,
        callbackUrl: "/dashboard", // Redirect ke halaman dashboard setelah berhasil
      });

      if (signInResponse?.error) {
        throw new Error("Login failed");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error creating user:", error.message);
        // Tampilkan pesan error di UI
      } else {
        console.error("Unexpected error:", error);
      }
    } finally {
      setIsLoading(false);
    }
  }

  // Fungsi untuk login dengan Google
  const handleGoogleSignup = async () => {
    setIsLoading(true);
    try {
      const user = await signInWithGoogle();
      console.log("Google User:", user);
    } catch (error) {
      console.error("Error signing up with Google:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk login dengan Facebook
  const handleFacebookSignup = async () => {
    setIsLoading(true);
    try {
      const user = await signInWithFacebook();
      console.log("Facebook User:", user);
    } catch (error) {
      console.error("Error signing up with Facebook:", error);
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
        height: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div className="benefit-container relative grid gap-5 -left-1/4">
        <img
          src="/assets/logo-si-itik.svg"
          alt="Logo SI_ITIK"
          className="w-20"
        />
        <h1 className="text-5xl font-bold text-white">Keunggulan SI-ITIK</h1>
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

      <div className="form-login bg-white p-8 rounded-lg -mr-64 shadow-lg w-1/3 h-2/3">
        <h1 className="font-bold text-3xl">Daftar</h1>
        <h2 className="text-lg mt-5 mb-3">
          Sudah Memiliki Akun?
          <Link href="/auth/login" className="text-orange-500 ml-1">
            Masuk Sekarang
          </Link>
        </h2>

        <div className="flex justify-between mt-7">
          <button
            onClick={handleGoogleSignup} // Menggunakan fungsi Google
            className="flex items-center justify-center w-fit h-fit border border-black text-black bg-white hover:bg-gray-100 rounded-lg py-2 px-4"
          >
            <Image
              src="/assets/google-logo.svg"
              alt="Google Logo"
              width={24}
              height={24}
              className="mr-2 w-11"
            />
            Masuk dengan Google
          </button>
          <button
            onClick={handleFacebookSignup} // Menggunakan fungsi Facebook
            className="flex items-center justify-center w-fit h-fit border border-black text-black bg-white hover:bg-gray-100 rounded-lg py-2 px-4"
          >
            <Image
              src="/assets/facebook-logo.svg"
              alt="Facebook Logo"
              width={24}
              height={24}
              className="mr-2 w-11"
            />
            Masuk dengan Facebook
          </button>
        </div>

        <h3 className="text-center mt-10">OR</h3>

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
                    <Input placeholder="email" {...field} />
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
                    <Input placeholder="username" {...field} />
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
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between mt-4">
              <Link
                href="/auth/forgetPass"
                className="w-full mr-2 border rounded-lg border-black text-black bg-white hover:bg-gray-100 py-2 text-center flex items-center justify-center"
              >
                Lupa Password?
              </Link>
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
  );
};

export default SignUpPage;
