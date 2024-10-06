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
import { z } from "zod";
import Loader from "@/components/shared/Loader";
import Link from "next/link";
import { useState } from "react";
import { signInWithGoogle, signInWithFacebook } from "@/lib/authProviders"; // Ensure these functions are defined
import { useRouter } from "next/navigation"; // Import useRouter
import "@/app/auth.css";

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof SigninValidation>>({
    resolver: zodResolver(SigninValidation),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof SigninValidation>) => {
    setIsLoading(true);
    const { username, password } = values;

    try {
      // Your login logic here
      console.log("Username:", username);
      console.log("Password:", password);

      // Simulate a successful login
      // await firebaseSignIn(username, password); // Uncomment and implement

      // Redirect to Beranda page directly after successful login
      router.push(`/dashboard?username=${username}`);
    } catch (error) {
      console.error("Error logging in:", error);
      // Handle error: show notification or set form error
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
      <div className="benefit-container flex flex-col relative gap-5 -left-96">
        <img
          src="/assets/logo-si-itik.svg"
          alt="Logo SI_ITIK"
          className="w-20"
        />
        <h1 className="flex flex-col text-5xl font-bold text-white">Keunggulan SI-ITIK</h1>
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
      </div>

      <div className="form-login flex flex-col bg-white p-8 rounded-lg -mr-64 shadow-lg w-1/3 h-2/3">
        <h1 className="font-bold text-3xl">Masuk</h1>
        <h2 className="text-lg mt-5 mb-3">
          Tidak Memiliki Akun ?{" "}
          <Link href="/auth/signup" className="text-orange-500 ml-1">
            Daftar Sekarang
          </Link>
        </h2>
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
        <h3 className="text-center mt-10">OR</h3>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-5 w-full mt-4"
          >
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="shadcn" {...field} />
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
              <Button
                asChild
                className="w-full mr-2 border rounded-lg border-black text-black bg-white hover:bg-gray-100"
              >
                <Link href="/LupaPassword">Lupa Password?</Link>
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
      </div>
    </div>
  );
};

export default LoginPage;
