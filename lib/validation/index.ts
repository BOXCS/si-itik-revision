import { z } from "zod";

// Schema untuk validasi form menggunakan Zod
export const SigninValidation = z.object({
    username: z.string().min(2, "Username minimal 2 karakter").max(50, "Username terlalu panjang"),
    password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  })

  export const SignupValidation = z.object({
    username: z.string().min(1, "Username is required"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters"),
  });