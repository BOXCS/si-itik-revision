import { NextResponse } from "next/server";
import { auth } from "@/lib/firebase"; // Impor Auth
import { createUserWithEmailAndPassword } from "firebase/auth";
import { firestore } from "@/lib/firebase"; // Impor Firestore yang sudah diinisialisasi
import { doc, setDoc } from "firebase/firestore"; // Impor doc dan setDoc dari Firestore

export async function POST(request: Request) {
  const { username, email, password } = await request.json();

  try {
    // Buat pengguna baru
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Simpan data tambahan ke Firestore (misalnya username)
    const userDocRef = doc(firestore, "users", user.uid);
    await setDoc(userDocRef, {
      username,
      email,
      // Anda tidak perlu menyimpan password di Firestore karena ini tidak aman
    });

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 }
    );
  } catch (error: unknown) {
    // Menggunakan unknown di sini
    if (error instanceof Error) {
      // Sekarang kita bisa mengakses message
      console.error("Error creating user:", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    } else {
      console.error("Unexpected error:", error);
      return NextResponse.json(
        { error: "An unexpected error occurred." },
        { status: 500 }
      );
    }
  }
}
