"use client";

// Komponen SettingPage
import { SidebarDemo } from "@/components/Sidebar";
import { useEffect, useState } from "react";
import { updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, storage } from "@/lib/firebase";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import UserAvatar from "@/components/ui/avatar";


export default function SettingPage() {
  return (
    <div className="w-full min-h-screen bg-gray-100 flex">
      <SidebarDemo>
        <div className="flex-1 flex flex-col p-10">
          <h1 className="text-start text-3xl font-bold text-black mb-8">Pengaturan</h1>
          <CardContainer />
        </div>
      </SidebarDemo>
    </div>
  );
}

function CardContainer() {
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [photoAdded, setPhotoAdded] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      // Kode ini hanya dijalankan di client-side
      return localStorage.getItem('userName') || null;
    }
    return null;
  });
  

  // Mengatur email dan nama pengguna saat komponen dimuat
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUserEmail(currentUser.email || '');
      setUserName(currentUser.displayName || '');
      setUserPhoto(currentUser.photoURL || null);
    } else {
      // Coba fetch user kembali jika currentUser awalnya null
      auth.onAuthStateChanged((user) => {
        if (user) {
          setUserEmail(user.email || '');
          setUserName(user.displayName || '');
          setUserPhoto(user.photoURL || null);
        }
      });
    }
  }, []);
  

  // Simpan userName ke localStorage setiap kali berubah
  useEffect(() => {
    if (userName !== null) {
      localStorage.setItem('userName', userName);
    }
  }, [userName]);

  // Fungsi untuk mengubah foto profil
  const handleChangePhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const storageRef = ref(storage, `profile_pictures/${auth.currentUser?.uid}`);
      await uploadBytes(storageRef, file);
      const newPhotoURL = await getDownloadURL(storageRef);
      setUserPhoto(newPhotoURL);
      await updateProfile(auth.currentUser!, { photoURL: newPhotoURL });
      setPhotoAdded(true);
    }
  };

  const handleRemovePhoto = async () => {
    await updateProfile(auth.currentUser!, { photoURL: null });
    setUserPhoto(null);
    setPhotoAdded(false);
  };

  const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value);
  };

  return (
    <div className="w-full p-4">
      <div className="max-w-[1500px] mx-auto h-[800px]">
        <div className="bg-white rounded-3xl shadow-lg p-8 relative w-full h-full">
          <div className="absolute inset-0 rounded-3xl bg-white opacity-50 blur-xl -z-10" style={{ boxShadow: '0 0 40px 20px rgba(255, 255, 255, 0.5)' }} />

          <div className="flex justify-center items-center mb-4">
            <UserAvatar photoURL={userPhoto} />
          </div>

          <div className="flex justify-center space-x-4 mb-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleChangePhoto}
              className="hidden"
              id="file-input"
            />
            <label
              htmlFor="file-input"
              className="px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600"
            >
              Ubah Foto Profil
            </label>
            <button
              onClick={handleRemovePhoto}
              disabled={!photoAdded}
              className={`px-4 py-2 ${photoAdded ? 'bg-red-500' : 'bg-gray-300'} text-white rounded-md hover:${photoAdded ? 'bg-red-600' : 'bg-gray-400'}`}
            >
              Hapus Foto Profil
            </button>
          </div>

          <div className="flex flex-col mb-4">
            <label className="font-semibold">Nama</label>
            <div className="flex items-center border border-gray-300 rounded-md w-full">
              <input
                className="border border-gray-300 p-2 rounded-md flex-grow"
                placeholder="Masukkan Nama"
                value={userName || ''} // Set nilai nama di sini
                onChange={handleChangeName} // Tambahkan handler onChange untuk mengubah
              />
              <button className="p-2 bg-gray-100 flex-shrink-0 rounded-md w-24">Edit</button>
            </div>
          </div>

          <div className="flex flex-col mb-4">
            <label className="font-semibold">Email</label>
            <div className="flex items-center border border-gray-300 rounded-md w-full">
              <input
                className="border border-gray-300 p-2 rounded-md flex-grow"
                placeholder="Email otomatis terisi"
                value={userEmail || ''} // Set nilai email di sini
                readOnly // Buat menjadi read-only jika tidak ingin pengguna mengeditnya
              />
            </div>
          </div>

          <div className="flex flex-col mb-4">
            <label className="font-semibold">Username</label>
            <div className="flex items-center border border-gray-300 rounded-md w-full">
              <input
                className="border border-gray-300 p-2 rounded-md flex-grow"
                placeholder="Masukkan Nama"
                value={userName || ''} // Set nilai nama di sini
                onChange={(e) => setUserName(e.target.value)} // Tambahkan handler onChange jika ingin pengguna dapat mengubah
              />
              <button className="p-2 bg-gray-100 flex-shrink-0 rounded-md w-24">Edit</button>
            </div>
          </div>

          <div className="flex justify-between border-t border-b border-gray-300 my-4 mt-7">
            <div className="flex flex-col gap-3 mb-4">
              <h1 className="text-2xl font-semibold">Ganti Akun</h1>
              <p className="text-base text-gray-500">Maks 3 akun yang dapat ditambahkan dalam 1 device</p>
            </div>
            <button className="p-2 bg-gray-100 flex-shrink-0 rounded-md w-28">Ganti Akun</button>
          </div>

          <div className="flex justify-between border-t border-b border-gray-300 my-4 mt-7">
            <div className="flex flex-col gap-3 mb-4">
              <h1 className="text-2xl font-semibold">Hapus Akun</h1>
              <p className="text-base text-gray-500">Setelah akun dihapus, Anda tidak bisa masuk ke SI-Itik maupun mengakses semua fitur.</p>
            </div>
            <button className="p-2 bg-gray-100 flex-shrink-0 rounded-md w-28 transition duration-300 hover:bg-[#ff1414]">Hapus Akun</button>
          </div>

          <div className="absolute inset-100 rounded-5xl shadow-5xl" style={{ zIndex: -1 }} />
        </div>
      </div>
    </div>
  );
}
