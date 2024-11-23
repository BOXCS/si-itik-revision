// app/api/auth/signup/route.ts
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { firestore } from "@/lib/firebase"; 
import { collection, addDoc } from "firebase/firestore";

// Fungsi untuk mendaftar pengguna
async function signupUser(username: string, email: string, password: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    await addDoc(collection(firestore, "users"), {
      uid,
      username,
      email,
      createdAt: new Date(),
    });
    
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error creating user:", error.message);
      throw new Error(error.message);
    } else {
      console.error("Unexpected error:", error);
      throw new Error("Unexpected error occurred");
    }
  }
}

// Ekspor fungsi untuk menangani POST
export async function POST(req: Request) {
  const { username, email, password } = await req.json(); // Mengambil data dari request body
  try {
    const result = await signupUser(username, email, password);
    return new Response(JSON.stringify(result), { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    } else {
      return new Response(JSON.stringify({ error: "An unexpected error occurred" }), { status: 400 });
    }
  }
}
