"use client";

// Komponen SettingPage
import { useRouter } from "next/navigation";
import { SidebarDemo } from "@/components/Sidebar";
import UserAvatar from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { deleteUser, updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Impor fungsi untuk Firebase Storage
import { auth, storage } from "@/lib/firebase";
import { getAuth, reauthenticateWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useToast } from "@/hooks/use-toast";

function Modal({ isOpen, onClose, onSave, children }: { isOpen: boolean; onClose: () => void; onSave: () => void; children: React.ReactNode }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-8 w-96">
        {children}
        <div className="flex justify-end space-x-4 mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-red-400 transition duration-300">Batal</button>
          <button onClick={onSave} className="px-4 py-2 bg-[#F58110] text-white hover:bg-orange-600 transition duration-300">Simpan</button>
        </div>
      </div>
    </div>
  );
}

function DeleteAccountModal({ isOpen, onClose, onDelete, children }: { isOpen: boolean; onClose: () => void; onDelete: () => void; children?: React.ReactNode }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-8 w-96">
        {children}
        <h2 className="text-lg font-bold mb-4">Hapus Akun</h2>
        <p className="mb-2 text-gray-500">Apakah Anda yakin ingin menghapus akun? Semua data akan hilang dan tidak dapat dipulihkan.</p>
        <div className="flex justify-end space-x-4 mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-[#F58110] text-white hover:bg-orange-600 transition duration-300">Batal</button>
          <button onClick={onDelete} className="px-4 py-2 bg-red-700 text-white hover:bg-red-800 transition duration-300">Hapus Akun</button>
        </div>
      </div>
    </div>
  );
}

export default function SettingPage() {
  const router = useRouter();
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
  const { toast } = useToast();
  const router = useRouter();
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tempUserName, setTempUserName] = useState<string>("");


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

  const handleDeleteAccount = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      try {
        // Menyusun provider untuk Google
        const provider = new GoogleAuthProvider();

        // Melakukan reautentikasi
        await reauthenticateWithPopup(user, provider);

        // Setelah berhasil reautentikasi, lakukan penghapusan akun
        await deleteUser(user);
        toast({ title: "Account deleted successfully.", description: "Akun berhasil dihapus" });
        router.push("/auth/login/"); // Redirect ke halaman login
      } catch (error) {
        console.error("Reauthentication failed:", error);
        toast({ title: "Reauthentication failed.", description: "Silakan coba lagi.", variant: "destructive" });
      }
    }
  };



  // Simpan userName ke localStorage setiap kali berubah
  useEffect(() => {
    if (userName !== null) {
      localStorage.setItem('userName', userName);
    }
  }, [userName]);

  // Fungsi untuk mengubah foto profil
  const handleChangePhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setUserPhoto(base64String);
        localStorage.setItem("userPhoto", base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      // Setel URL gambar menjadi null di Firebase Auth
      await updateProfile(auth.currentUser!, { photoURL: null });

      // Hapus URL gambar dari state komponen dan local storage
      setUserPhoto(null);
      localStorage.removeItem("userPhoto");
    } catch (error) {
      console.error("Error removing photo: ", error);
    }
  };

  useEffect(() => {
    const savedPhoto = localStorage.getItem("userPhoto");
    if (savedPhoto) {
      setUserPhoto(savedPhoto);
    }
  }, []);

  // Mengambil huruf pertama dari nama pengguna
  const getInitials = (name: string | null) => {
    if (!name) return "";
    return name.split(" ").map(word => word.charAt(0)).join("").toUpperCase();
  };

  const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value);
  };

  const handleEditClick = () => {
    setTempUserName(userName || "");
    setIsModalOpen(true); // Open modal on Edit click
  };

  const handleSave = async () => {
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: tempUserName });
        setUserName(tempUserName); // Update username state
        setIsModalOpen(false); // Close the modal
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };


  return (
    <div className="w-full p-4">
      <div className="max-w-[1500px] mx-auto h-[800px]">
        <div className="bg-white rounded-3xl shadow-lg p-8 relative w-full h-full">
          <div className="absolute inset-0 rounded-3xl bg-white opacity-50 blur-xl -z-10" style={{ boxShadow: '0 0 40px 20px rgba(255, 255, 255, 0.5)' }} />

          <div className="flex justify-center items-center mb-4">
            {userPhoto ? (
              <img src={userPhoto} alt="User Avatar" className="rounded-full w-40 h-40" />
            ) : (
              <div className="bg-blue-500 rounded-full w-40 h-40 flex items-center justify-center text-white text-5xl">
                {getInitials(userName) || "U"} {/* Tampilkan huruf depan dari nama */}
              </div>
            )}
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
              className="px-4 py-2 bg-[#F58110] text-white hover:bg-orange-600 transition duration-300 rounded-md cursor-pointer"
            >
              Ubah Foto Profil
            </label>
            <button
              onClick={handleRemovePhoto}
              disabled={!userPhoto}
              className={`px-4 py-2 ${userPhoto ? "bg-red-700 hover:bg-red-800" : "bg-gray-300 hover:bg-gray-400"} text-white rounded-md transition duration-300`}
            >
              Hapus Foto Profil
            </button>

          </div>

          <div className="flex flex-col mb-4">
            <label className="font-extrabold">Username</label>
            <div className="flex items-center border border-gray-300 rounded-md w-full">
              <input
                className="border border-gray-300 p-2 rounded-md flex-grow"
                placeholder="Masukkan Nama"
                value={userName || ""}
                readOnly
              />
              <button onClick={handleEditClick} className="p-2 bg-[#F58110] text-white hover:bg-orange-600 transition duration-300 flex-shrink-0 rounded-md w-24">Edit</button>
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

          {/* Modal for editing the username */}
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave}>
            <h2 className="text-lg font-bold mb-4">Edit Profile</h2>
            <p className="mb-2 text-gray-500">Ingin ubah nama?</p>
            <h4 className="text-base font-bold mb-2">Ubah Nama</h4>
            <input
              type="text"
              className="border border-gray-300 p-2 rounded-md w-full"
              placeholder="Masukkan Nama Baru"
              value={tempUserName}
              onChange={(e) => setTempUserName(e.target.value)}
            />
          </Modal>

          <div className="flex justify-between border-t border-b border-gray-300 my-4 mt-7">
            <div className="flex flex-col gap-3 mb-4">
              <h1 className="text-2xl font-semibold">Ganti Akun</h1>
              <p className="text-base text-gray-500">Maks 3 akun yang dapat ditambahkan dalam 1 device</p>
            </div>
            <button className="p-2 bg-[#F58110] text-white hover:bg-orange-600 transition duration-300 flex-shrink-0 rounded-md w-28">Ganti Akun</button>
          </div>

          <div className="flex justify-between border-t border-b border-gray-300 my-4 mt-7">
            <div className="flex flex-col gap-3 mb-4">
              <h1 className="text-2xl font-semibold">Hapus Akun</h1>
              <p className="text-base text-gray-500">Setelah akun dihapus, Anda tidak bisa masuk ke SI-Itik maupun mengakses semua fitur.</p>
            </div>
            <button
              onClick={() => setIsDeleteModalOpen(true)} // Open the delete confirmation modal
              className="p-2 bg-[#F58110] text-white hover:bg-orange-600 transition duration-300 flex-shrink-0 rounded-md w-28"
            >
              Hapus Akun
            </button>
          </div>

          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-4">
            <h2 className="text-center text-gray-500">
              si-itikpolije2024.com
            </h2>
          </div>



          {/* Delete Account Confirmation Modal */}
          <DeleteAccountModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onDelete={handleDeleteAccount}>


          </DeleteAccountModal>


          <div className="absolute inset-100 rounded-5xl shadow-5xl" style={{ zIndex: -1 }} />

          <div className="flex justify-center items-end w-full h-full">
            <div className="flex flex-col mb-4 text-center">
              <h1 className="text-sm font-semibold">polije_MBKMsiitik2024.com</h1>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
}
