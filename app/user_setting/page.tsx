"use client";

// Komponen SettingPage
import { useRouter } from "next/navigation";
import { SidebarDemo } from "@/components/Sidebar";
import { Suspense, useEffect, useState } from "react";
import { deleteUser, signOut, updateProfile } from "firebase/auth";
// import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth } from "@/lib/firebase";
import {
  getAuth,
  reauthenticateWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

// import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import UserAvatar from "@/components/ui/avatar";

function Modal({
  isOpen,
  onClose,
  onSave,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-8 w-96">
        {children}
        <div className="flex justify-end space-x-4 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-red-400 transition duration-300"
          >
            Batal
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-[#F58110] text-white hover:bg-orange-600 transition duration-300"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteAccountModal({
  isOpen,
  onClose,
  onDelete,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  children?: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-8 w-96">
        {children}
        <h2 className="text-lg font-bold mb-4">Hapus Akun</h2>
        <p className="mb-2 text-gray-500">
          Apakah Anda yakin ingin menghapus akun? Semua data akan hilang dan
          tidak dapat dipulihkan.
        </p>
        <div className="flex justify-end space-x-4 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#F58110] text-white hover:bg-orange-600 transition duration-300"
          >
            Batal
          </button>
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-700 text-white hover:bg-red-800 transition duration-300"
          >
            Hapus Akun
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SettingPage() {
  // const router = useRouter();
  return (
    <div className="w-full min-h-screen bg-gray-100 flex overflow-y-auto">
      <Suspense fallback={<div>Loading...</div>}>
        <SidebarDemo>
          <div className="flex-1 flex flex-col p-10 overflow-y-auto md:overflow-y-hidden">
            <h1 className="text-start text-3xl font-bold text-black mb-8">
              Pengaturan
            </h1>
            <CardContainer />
          </div>
        </SidebarDemo>
      </Suspense>
    </div>
  );
}

function CardContainer() {
  const { toast } = useToast();
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  // const [showDialog, setShowDialog] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const router = useRouter();
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  // const [photoAdded, setPhotoAdded] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      // Kode ini hanya dijalankan di client-side
      return localStorage.getItem("userName") || null;
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
      setUserEmail(currentUser.email || "");
      setUserName(currentUser.displayName || "");
      setUserPhoto(currentUser.photoURL || null);
    } else {
      // Coba fetch user kembali jika currentUser awalnya null
      auth.onAuthStateChanged((user) => {
        if (user) {
          setUserEmail(user.email || "");
          setUserName(user.displayName || "");
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
        toast({
          title: "Account deleted successfully.",
          description: "Akun berhasil dihapus",
        });
        router.push("/auth/login/"); // Redirect ke halaman login
      } catch (error) {
        console.error("Reauthentication failed:", error);
        toast({
          title: "Reauthentication failed.",
          description: "Silakan coba lagi.",
          variant: "destructive",
        });
      }
    }
  };
  useEffect(() => {
    const savedPhoto = localStorage.getItem("userPhoto");
    if (savedPhoto) {
      setUserPhoto(savedPhoto);
    }
  }, []);

  // Simpan userName ke localStorage setiap kali berubah
  useEffect(() => {
    if (userName !== null) {
      localStorage.setItem("userName", userName);
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

        // Tambahkan toast atau dialog pop-up
        toast({
          title: "Foto Profil Berhasil Diubah",
          description: "Foto profil Anda telah berhasil diperbarui.",
          variant: "default",
        });
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
      setIsConfirmDialogOpen(false);
    } catch (error) {
      console.error("Error removing photo: ", error);
    }
  };

  const handleConfirmRemovePhoto = () => {
    console.log("Opening confirm dialog");
    setIsConfirmDialogOpen(true);
  };

  useEffect(() => {
    const savedPhoto = localStorage.getItem("userPhoto");
    if (savedPhoto) {
      setUserPhoto(savedPhoto);
    }
  }, []);

  // Mengambil huruf pertama dari nama pengguna
  // const getInitials = (name: string | null) => {
  //   if (!name) return "";
  //   return name
  //     .split(" ")
  //     .map((word) => word.charAt(0))
  //     .join("")
  //     .toUpperCase();
  // };

  // const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setUserName(e.target.value);
  // };

  const handleEditClick = () => {
    setTempUserName(userName || "");
    setIsModalOpen(true); // Open modal on Edit click
  };

  const handleSave = async () => {
    try {
      if (!tempUserName.trim()) {
        toast({
          title: "Nama pengguna tidak valid.",
          description: "Nama pengguna tidak boleh kosong.",
          variant: "destructive",
        });
        return;
      }

      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: tempUserName });
        setUserName(tempUserName); // Update username state
        setIsModalOpen(false); // Close the modal

        // Tampilkan notifikasi sukses
        toast({
          title: "Profil diperbarui",
          description: "Nama pengguna berhasil diubah.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({
        title: "Gagal memperbarui profil.",
        description: "Terjadi kesalahan saat mengubah nama pengguna.",
        variant: "destructive",
      });
    }
  };

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true); // Tampilkan modal konfirmasi logout
  };

  const confirmLogout = async () => {
    setIsLogoutModalOpen(false); // Tutup modal
    await signOut(auth); // Logout dari Firebase
    router.push("/auth/login/"); // Redirect ke halaman login
  };

  const cancelLogout = () => {
    setIsLogoutModalOpen(false); // Tutup modal jika batal logout
  };

  return (
    <div className="w-full min-h-screen overflow-y-auto">
      <div className="w-full">
        <div className="max-w-[1500px] mx-auto min-h-[600px] sm:min-h-[800px] md:min-h-[900px]">
          <div className="bg-white rounded-xl sm:rounded-3xl shadow-lg p-4 sm:p-8 relative w-full h-full sm:h-auto sm:w-full overflow-y-auto">
            {/* Background blur effect */}
            <div
              className="absolute inset-0 h-full rounded-xl sm:rounded-3xl bg-white opacity-50 blur-xl -z-10"
              style={{ boxShadow: "0 0 40px 20px rgba(255, 255, 255, 0.5)" }}
            />

            <div className="flex justify-center items-center mb-4">
              <div className="w-40 h-40 rounded-full">
                <UserAvatar photoURL={userPhoto} />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4 mt-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleChangePhoto}
                className="hidden"
                id="file-input"
              />
              <label
                htmlFor="file-input"
                className="px-4 py-2 bg-[#F58110] text-white hover:bg-orange-600 transition duration-300 rounded-md cursor-pointer text-center"
              >
                Ubah Foto Profil
              </label>
              <button
                onClick={() => {
                  console.log("Button clicked!");
                  handleConfirmRemovePhoto();
                }}
                disabled={!userPhoto}
                className={`px-4 py-2 ${
                  userPhoto
                    ? "bg-red-700 hover:bg-red-800"
                    : "bg-gray-300 hover:bg-gray-400"
                } text-white rounded-md transition duration-300`}
              >
                Hapus Foto Profil
              </button>

              {/* Dialog Konfirmasi */}
              {isConfirmDialogOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                    <h2 className="text-lg font-bold mb-4">Konfirmasi</h2>
                    <p className="mb-4">
                      Apakah Anda yakin ingin menghapus foto profil?
                    </p>
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={() => setIsConfirmDialogOpen(false)}
                        className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-black rounded-md"
                      >
                        Batal
                      </button>
                      <button
                        onClick={handleRemovePhoto}
                        className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-md"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4 mt-10">
              <div className="flex flex-col">
                <label className="font-extrabold mb-2">Username</label>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <input
                    className="border border-gray-300 p-2 rounded-md w-full"
                    placeholder="Masukkan Nama"
                    value={userName || ""}
                    readOnly
                  />
                  <button
                    onClick={handleEditClick}
                    className="p-2 bg-[#F58110] text-white hover:bg-orange-600 transition duration-300 rounded-md w-full sm:w-24"
                  >
                    Edit
                  </button>
                </div>
              </div>

              <div className="flex flex-col">
                <label className="font-semibold mb-2">Email</label>
                <input
                  className="border border-gray-300 p-2 rounded-md w-full cursor-not-allowed text-gray-400"
                  placeholder="Email otomatis terisi"
                  value={userEmail || ""}
                  readOnly
                />
              </div>
            </div>

            {/* Modal for editing the username */}
            <Modal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSave={handleSave}
            >
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

            {/* Modal konfirmasi logout */}
            {isLogoutModalOpen && (
              <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50 z-50 p-4">
                <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm">
                  <h3 className="text-xl font-semibold mb-4">
                    Konfirmasi Logout
                  </h3>
                  <p className="mb-4">Apakah Anda yakin ingin keluar?</p>
                  <div className="flex flex-col sm:flex-row justify-between gap-2">
                    <button
                      onClick={confirmLogout}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 w-full"
                    >
                      Ya, Keluar
                    </button>
                    <button
                      onClick={cancelLogout}
                      className="px-4 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400 w-full"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6 mt-8">
              <div className="flex flex-col sm:flex-row justify-between border-t border-b border-gray-300 py-4">
                <div className="space-y-2 mb-4 sm:mb-0">
                  <h1 className="text-xl sm:text-2xl font-semibold">Keluar</h1>
                  <p className="text-sm sm:text-base text-gray-500">
                    Keluar dari akun
                  </p>
                </div>
                <button
                  onClick={handleLogoutClick}
                  className="p-2 bg-[#F58110] text-white hover:bg-orange-600 transition duration-300 rounded-md w-full sm:w-28"
                >
                  Keluar
                </button>
              </div>

              <div className="flex flex-col sm:flex-row justify-between border-t border-b border-gray-300 py-4">
                <div className="space-y-2 mb-4 sm:mb-0">
                  <h1 className="text-xl sm:text-2xl font-semibold">
                    Hapus Akun
                  </h1>
                  <p className="text-sm sm:text-base text-gray-500">
                    Setelah akun dihapus, Anda tidak bisa masuk ke SI-Itik
                    maupun mengakses semua fitur.
                  </p>
                </div>
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="p-2 bg-[#F58110] text-white hover:bg-orange-600 transition duration-300 rounded-md w-full sm:w-28"
                >
                  Hapus Akun
                </button>
              </div>
            </div>

            <div className="text-center mt-8 sm:absolute sm:bottom-0 sm:left-1/2 sm:transform sm:-translate-x-1/2 sm:mb-1">
              <h2 className="text-gray-500">si-itikpolije2024.com</h2>
            </div>

            {/* Delete Account Confirmation Modal */}
            <DeleteAccountModal
              isOpen={isDeleteModalOpen}
              onClose={() => setIsDeleteModalOpen(false)}
              onDelete={handleDeleteAccount}
            ></DeleteAccountModal>

            <div
              className="absolute inset-100 rounded-5xl shadow-5xl"
              style={{ zIndex: -1 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
