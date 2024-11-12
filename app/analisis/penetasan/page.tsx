"use client";

import { SidebarDemo } from "@/components/Sidebar";
import { useUser } from "@/app/context/UserContext";
import React, { useState, useEffect } from "react";
import HorizontalTimeline from "@/components/HorizontalTimeline";
import "@/app/analisis.css";
import {
  doc,
  addDoc,
  collection,
  DocumentReference,
  Timestamp,
} from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { IconMenu2, IconX } from "@tabler/icons-react";
import { firestore } from "@/lib/firebase";

interface TabSelectionProps {
  setSelectedPeriod: (period: string) => void; // Mengatur tipe untuk setSelectedPeriod
}

const PenetasanPage = () => {
  const initialPeriods = JSON.parse(
    (typeof window !== "undefined" &&
      localStorage.getItem("penetasan_periods")) ||
      '["Periode 1"]'
  );

  const { toast } = useToast();
  const [periods, setPeriods] = useState(initialPeriods);
  const [selectedPeriod, setSelectedPeriod] = useState(periods[0]);
  const [periode, setPeriode] = useState(periods[0]);
  const { user } = useUser(); // Pindahkan di sini
  const [disabledPeriods, setDisabledPeriods] = useState<string[]>([]);

  // Tambahkan state untuk mengatur status analisis baru
  const [isOpen, setIsOpen] = useState(false);
  const [isNewAnalysis, setIsNewAnalysis] = useState(false);
  const [newAnalysisDocRef, setNewAnalysisDocRef] =
    useState<DocumentReference | null>(null);

  // State untuk form visibility
  const [currentForm, setCurrentForm] = useState("Penerimaan");

  // States untuk Penerimaan form
  const [jumlahTelurMenetas, setJumlahTelurMenetas] = useState<number>(0);
  const [jumlahTelur, setJumlahTelur] = useState<number>(0);
  const [persentase, setPersentase] = useState<number>(0);
  const [hargaDOD, setHargaDOD] = useState<number>(0);
  const [jumlahDOD, setJumlahDOD] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);

  // States untuk Pengeluaran form
  const [sewaKandang, setSewaKandang] = useState<number>(0);
  const [penyusutanPeralatan, setPenyusutanPeralatan] = useState<number>(0);
  const [totalBiaya, setTotalBiaya] = useState<number>(0);
  const [totalFixedCost, setTotalFixedCost] = useState<number>(0);
  const [biayaTenagaKerja, setBiayaTenagaKerja] = useState<number>(0);
  const [biayaListrik, setBiayaListrik] = useState<number>(0);
  const [biayaOvk, setBiayaOvk] = useState<number>(0);
  const [biayaOperasional, setBiayaOperasional] = useState<number>(0);
  const [totalBiayaOperasional, setTotalBiayaOperasional] = useState<number>(0);
  const [hargaTelur, setHargaTelur] = useState<number>(0);
  const [totalBiayaPembelianTelur, setTotalBiayaPembelianTelur] =
    useState<number>(0);
  const [totalVariableCost, setTotalVariableCost] = useState<number>(0);
  const [totalCost, setTotalCost] = useState<number>(0);

  // States untuk Hasil Analisis
  const [marginOfSafety, setMarginOfSafety] = useState<number>(0);
  const [rcRatio, setRcRato] = useState<number>(0);
  const [bepHarga, setBepHarga] = useState<number>(0);
  const [bepHasil, setBepHasil] = useState<number>(0);
  const [laba, setLaba] = useState<number>(0);

  const handleAddPeriod = () => {
    const newPeriod = `Periode ${periods.length + 1}`;
    const updatedPeriods = [...periods, newPeriod];
    setPeriods(updatedPeriods);
    setSelectedPeriod(newPeriod);
    setPeriode(newPeriod);
  };

  const handleNewAnalysis = async () => {
    if (!user) {
      toast({
        title: "Gagal",
        description: "User tidak terautentikasi.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Buat periode baru, tetapi hanya jika belum ada
      const newPeriod = `Periode 1`; // Selalu mulai dengan Periode 1

      // Tambahkan dokumen baru untuk analisis
      const docRef = await addDoc(collection(firestore, "detail_penetasan"), {
        userId: user.email || user.username,
        created_at: Timestamp.now(),
      });

      setNewAnalysisDocRef(docRef); // Simpan referensi dokumen
      localStorage.setItem("activeDocRef", docRef.id); // Simpan ID dokumen ke localStorage

      setIsNewAnalysis(true);

      // Atur periode kembali ke "Periode 1"
      setPeriode(newPeriod);
      setSelectedPeriod(newPeriod);

      // Jika ada data periode sebelumnya, reset atau hapus
      setPeriods([newPeriod]); // Reset periode yang tampil hanya Periode 1

      toast({
        title: "Sukses",
        description: "Analisis baru berhasil dibuat!",
      });
    } catch (error) {
      console.error("Error adding new analysis: ", error);
      toast({
        title: "Gagal",
        description: "Gagal menambahkan analisis baru!",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Gagal",
        description: "User tidak terautentikasi.",
        variant: "destructive",
      });
      return; // Hentikan eksekusi jika user tidak ada
    }

    try {
      // Siapkan data untuk periode
      const periodeData = {
        periode: selectedPeriod,
        penerimaan: {
          jumlahTelurMenetas,
          jumlahTelur,
          persentase: persentase.toFixed(2),
          jumlahDOD,
          hargaDOD,
          totalRevenue: totalRevenue.toFixed(2),
        },
        pengeluaran: {
          sewaKandang,
          penyusutanPeralatan,
          totalBiaya,
          totalFixedCost,
          biayaTenagaKerja,
          biayaListrik,
          biayaOvk,
          biayaOperasional,
          totalBiayaOperasional,
          hargaTelur,
          totalBiayaPembelianTelur,
          totalVariableCost,
          totalCost: totalCost.toFixed(2),
        },
        hasilAnalisis: {
          marginOfSafety,
          rcRatio,
          bepHarga,
          bepHasil,
          laba,
        },
        created_at: Timestamp.now(),
      };

      // Jika isNewAnalysis adalah true, simpan ke dokumen baru
      if (newAnalysisDocRef) {
        await addDoc(
          collection(newAnalysisDocRef, "analisis_periode"),
          periodeData
        );
      } else {
        // Buat dokumen baru jika tidak ada referensi sebelumnya
        const docRef = await addDoc(collection(firestore, "detail_penetasan"), {
          userId: user.email || user.username,
          created_at: Timestamp.now(),
        });

        await addDoc(collection(docRef, "analisis_periode"), periodeData);
        setNewAnalysisDocRef(docRef);
        localStorage.setItem("activeDocRef", docRef.id);
      }

      // Tambahkan periode ke dalam disabledPeriods
      setDisabledPeriods((prev) => [...prev, selectedPeriod]);

      toast({
        title: "Sukses",
        description: "Data berhasil disimpan!",
      });
    } catch (error) {
      console.error("Error adding document: ", error);
      toast({
        title: "Gagal",
        description: "Gagal menambahkan data!",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // Simpan periode ke local storage khusus untuk penetasan
    localStorage.setItem("penetasan_periods", JSON.stringify(periods));
  }, [periods]);

  useEffect(() => {
    const storedDocRef = localStorage.getItem("activeDocRef");
    if (storedDocRef) {
      const docRef = doc(firestore, "detail_penetasan", storedDocRef);
      setNewAnalysisDocRef(docRef);
    }
  }, []);

  // Rumus Penerimaan
  useEffect(() => {
    const persentase = (jumlahTelurMenetas / jumlahTelur) * 100;
    setPersentase(persentase);
  }, [jumlahTelurMenetas, jumlahTelur]);

  useEffect(() => {
    const dod = jumlahTelur * (persentase / 100);
    setJumlahDOD(dod);
  }, [jumlahTelur, persentase]);

  useEffect(() => {
    setTotalRevenue(jumlahDOD * hargaDOD);
  }, [jumlahDOD, hargaDOD]);

  // Rumus Pengeluaran
  useEffect(() => {
    const totalBiaya = sewaKandang + penyusutanPeralatan;
    setTotalBiaya(totalBiaya);
  }, [sewaKandang, penyusutanPeralatan]);

  useEffect(() => {
    const totalFixedCost = totalBiaya * 28;
    setTotalFixedCost(totalFixedCost);
  }, [totalBiaya, jumlahTelur]);

  useEffect(() => {
    const biayaOperasional = biayaTenagaKerja + biayaListrik + biayaOvk;
    setBiayaOperasional(biayaOperasional);
  }, [biayaTenagaKerja, biayaListrik, biayaOvk]);

  useEffect(() => {
    const totalBiayaOperasional = biayaOperasional * 28;
    setTotalBiayaOperasional(totalBiayaOperasional);
  }, [biayaOperasional, jumlahTelur]);

  useEffect(() => {
    const totalBiayaPembelianTelur = jumlahTelur * hargaTelur;
    setTotalBiayaPembelianTelur(totalBiayaPembelianTelur);
  }, [jumlahTelur, hargaTelur]);

  useEffect(() => {
    const totalVariableCost = totalBiayaOperasional + totalBiayaPembelianTelur;
    setTotalVariableCost(totalVariableCost);
  }, [totalBiayaOperasional, totalBiayaPembelianTelur]);

  useEffect(() => {
    const totalCost = totalVariableCost + totalFixedCost;
    setTotalCost(totalCost);
  }, [totalVariableCost, totalFixedCost]);

  // Rumus Hasil Analisis
  useEffect(() => {
    const bepHasil =
      totalFixedCost / (hargaDOD - totalVariableCost / jumlahDOD);
    setBepHasil(bepHasil);
  }, [totalFixedCost, hargaDOD, totalVariableCost]);

  useEffect(() => {
    const bepHarga =
      totalFixedCost / (1 - totalVariableCost / jumlahDOD / hargaDOD);
    setBepHarga(bepHarga);
  }, [totalFixedCost, totalVariableCost, jumlahDOD, hargaDOD]);

  useEffect(() => {
    const marginOfSafety = ((totalRevenue - bepHarga) / totalRevenue) * 100;
    setMarginOfSafety(marginOfSafety);
  }, [totalRevenue, bepHarga]);

  useEffect(() => {
    const rcRatio = totalRevenue / totalCost;
    setRcRato(rcRatio);
  }, [totalRevenue, totalCost]);

  useEffect(() => {
    const laba = totalRevenue - totalCost;
    setLaba(laba);
  }, [totalRevenue, totalCost]);

  // Fungsi untuk format angka ke Rupiah
  const formatNumber = (number: number) => {
    return new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 0, // Menghilangkan desimal
      maximumFractionDigits: 0, // Pastikan tidak ada desimal
    }).format(number);
  };

  const handleInputChange =
    (setter: React.Dispatch<React.SetStateAction<number>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/[^0-9]/g, ""); // Menghapus karakter non-angka
      setter(value ? parseFloat(value) : 0); // Jika nilai ada, set sebagai angka
    };

  const handleNextForm = () => {
    if (currentForm === "Penerimaan") {
      setCurrentForm("Pengeluaran");
    } else if (currentForm === "Pengeluaran") {
      setCurrentForm("HasilAnalisis");
    }
  };

  const handleBackForm = () => {
    if (currentForm === "Pengeluaran") {
      setCurrentForm("Penerimaan");
    } else if (currentForm === "HasilAnalisis") {
      setCurrentForm("Pengeluaran");
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen); // Mengubah state open/close
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <SidebarDemo>
        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center p-10">
          {/* Header */}
          <h1 className="text-3xl font-bold text-black mb-8">
            Analisis Penetasan
          </h1>

          {/* TabSelection for Mobile */}
          <div className="md:hidden flex justify-between items-center mb-4 w-full">
            <button
              onClick={handleToggle}
              className="px-4 py-2 rounded-md bg-blue-500 text-white"
            >
              Pilih Periode
            </button>
            <span className="ml-4 text-black">
              Periode Saat Ini: {selectedPeriod}
            </span>
          </div>

          {/* Modal Dialog for Mobile */}
          {isOpen && (
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 w-80">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold">Pilih Periode</h2>
                  <button onClick={handleToggle}>
                    <IconX size={24} />
                  </button>
                </div>

                {/* Daftar Periode */}
                <div className="flex flex-col space-y-2 mb-4">
                  {periods.map((period: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => {
                        if (!disabledPeriods.includes(period)) {
                          setPeriode(period); // Perbarui periode
                          setSelectedPeriod(period); // Perbarui selectedPeriod
                          setIsOpen(false); // Menutup modal setelah periode dipilih
                        }
                      }}
                      className={`p-2 rounded-md text-left ${
                        disabledPeriods.includes(period)
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : selectedPeriod === period
                          ? "bg-orange-500 text-white"
                          : "bg-gray-200"
                      }`}
                      disabled={disabledPeriods.includes(period)}
                    >
                      {period}
                    </button>
                  ))}
                </div>

                {/* Tombol Tambah Periode */}
                <button
                  onClick={handleAddPeriod}
                  className="w-full px-4 py-2 rounded-md bg-blue-500 text-white mb-2"
                >
                  Tambah Periode
                </button>

                {/* Tombol Analisis Baru */}
                <button
                  onClick={handleNewAnalysis}
                  className="w-full px-4 py-2 rounded-md bg-green-500 text-white"
                >
                  Analisis Baru
                </button>
              </div>
            </div>
          )}

          {/* TabSelection for Desktop */}
          <div className="hidden md:flex flex-col items-center mb-10">
            <div className="flex justify-center space-x-4 mb-4">
              {periods.map((period: string, index: number) => (
                <button
                  key={index}
                  onClick={() => {
                    if (!disabledPeriods.includes(period)) {
                      setPeriode(period); // Perbarui periode
                      setSelectedPeriod(period); // Perbarui selectedPeriod
                    }
                  }}
                  className={`px-4 py-2 rounded-full text-black ${
                    disabledPeriods.includes(period)
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : selectedPeriod === period
                      ? "bg-orange-500"
                      : "bg-white"
                  }`}
                  disabled={disabledPeriods.includes(period)}
                >
                  {period}
                </button>
              ))}

              <button
                onClick={handleAddPeriod}
                className="px-4 py-2 rounded-full bg-blue-500 text-white"
              >
                Tambah Periode
              </button>
            </div>

            <button
              onClick={handleNewAnalysis}
              className="px-4 py-2 rounded-full bg-green-500 text-white"
            >
              Analisis Baru
            </button>
          </div>

          {/* Kontainer Form */}
          <div className="form-container bg-white overflow-y-auto overflow-x-hidden p-8 shadow-lg rounded-lg max-w-7xl w-full h-full sm:h-auto sm:w-full flex flex-col">
            {/* Horizontal Timeline */}
            <div className="w-full flex justify-center mb-6">
              <HorizontalTimeline
                progress={
                  currentForm === "Penerimaan"
                    ? 0
                    : currentForm === "Pengeluaran"
                    ? 50
                    : currentForm === "HasilAnalisis"
                    ? 100
                    : 0
                }
              />
            </div>
            {currentForm === "Penerimaan" && (
              <div className="flex flex-col w-full">
                <h2 className="text-xl font-extrabold mb-6">Data Penerimaan</h2>
                {/* Penerimaan Form */}
                <div className="flex flex-wrap items-center space-x-8 justify-center">
                  <div className="flex items-center font-semibold text-2xl mt-8">
                    {" "}
                    ({" "}
                  </div>

                  <div className="flex flex-col w-full md:w-auto">
                    <label className="font-semibold mb-2">
                      Jumlah Telur Menetas
                    </label>
                    <input
                      type="number"
                      value={jumlahTelurMenetas}
                      onChange={(e) =>
                        setJumlahTelurMenetas(parseFloat(e.target.value))
                      }
                      className="border border-gray-300 p-2 rounded-md"
                    />
                  </div>

                  <div className="flex items-center font-semibold text-2xl mt-8">
                    {" "}
                    /{" "}
                  </div>

                  <div className="flex flex-col w-full md:w-auto">
                    <label className="font-semibold mb-2">
                      Jumlah Telur (Butir)
                    </label>
                    <input
                      type="number"
                      value={jumlahTelur}
                      onChange={(e) =>
                        setJumlahTelur(parseFloat(e.target.value))
                      }
                      className="border border-gray-300 p-2 rounded-md"
                    />
                  </div>

                  <div className="flex items-center font-semibold text-2xl mt-8">
                    {" "}
                    ) ×{" "}
                  </div>

                  <div className="flex flex-col w-full md:w-auto">
                    <label className="font-semibold mb-2">Persentase</label>
                    <input
                      type="text"
                      value="100%"
                      readOnly
                      className="border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div className="flex items-center font-semibold text-2xl mt-8">
                    {" "}
                    ={" "}
                  </div>

                  <div className="flex flex-col w-full md:w-auto">
                    <label className="font-semibold mb-2">
                      Persentase Menetas
                    </label>
                    <input
                      type="text"
                      value={`${persentase.toFixed(0)}%`}
                      readOnly
                      className="border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Perhitungan mencari Jumlah DOD */}
                <div className="flex flex-wrap items-center space-x-8 justify-center mt-10">
                  <div className="flex flex-col w-full md:w-auto">
                    <label className="font-semibold mb-2">
                      Jumlah Telur (Butir)
                    </label>
                    <input
                      type="text"
                      value={jumlahTelur}
                      readOnly
                      className="border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div className="flex items-center font-semibold text-2xl mt-8">
                    {" "}
                    ×{" "}
                  </div>

                  <div className="flex flex-col w-full md:w-auto">
                    <label className="font-semibold mb-2">
                      Persentase Menetas
                    </label>
                    <input
                      type="text"
                      value={`${persentase.toFixed(0)}%`}
                      readOnly
                      className="border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div className="flex items-center font-semibold text-2xl mt-8">
                    {" "}
                    ={" "}
                  </div>

                  <div className="flex flex-col w-full md:w-auto">
                    <label className="font-semibold mb-2">Jumlah DOD</label>
                    <input
                      type="text"
                      value={jumlahDOD.toFixed(0)}
                      readOnly
                      className="border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Perhitungan mencari Total Revenue */}
                <div className="flex flex-wrap items-center space-x-8 justify-center mt-10">
                  <div className="flex flex-col w-full md:w-auto">
                    <label className="font-semibold mb-2">Jumlah DOD</label>
                    <input
                      type="text"
                      value={jumlahDOD.toFixed(0)}
                      readOnly
                      className="border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div className="flex items-center font-semibold text-2xl mt-8">
                    {" "}
                    ×{" "}
                  </div>

                  <div className="flex flex-col w-full md:w-auto">
                    <label className="font-semibold mb-2">Harga DOD</label>
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <span className="p-2 bg-gray-100">Rp.</span>
                      <input
                        type="text"
                        value={formatNumber(hargaDOD)}
                        onChange={handleInputChange(setHargaDOD)}
                        onBlur={(e) =>
                          setHargaDOD(
                            parseFloat(e.target.value.replace(/[^0-9]/g, ""))
                          )
                        }
                        className="border-0 p-2 rounded-md flex-1"
                        placeholder="Masukkan harga DOD"
                      />
                    </div>
                  </div>

                  <div className="flex items-center font-semibold text-2xl mt-8">
                    {" "}
                    ={" "}
                  </div>

                  <div className="flex flex-col w-full md:w-auto">
                    <label className="font-semibold mb-2">Total Revenue</label>
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <span className="p-2 bg-orange-200">Rp.</span>
                      <input
                        type="text"
                        value={formatNumber(totalRevenue)}
                        readOnly
                        className="border-0 p-2 rounded-md flex-1 cursor-not-allowed bg-orange-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Selanjutnya Button */}
                <div className="flex justify-end mt-16">
                  <button
                    onClick={handleNextForm}
                    className="bg-[#F58110] text-white p-2 rounded-full w-52"
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            )}

            {/* Render Pengeluaran Form */}
            {currentForm === "Pengeluaran" && (
              <div className="flex flex-col w-full md:w-auto">
                <h2 className="text-xl font-semibold mb-6">Data Pengeluaran</h2>
                {/* Bagian Fixed Cost */}
                <div className="flex flex-wrap justify-center">
                  <h3 className="font-extrabold justify-center text-3xl mb-4">
                    Fixed Cost
                  </h3>
                </div>
                <div className="flex flex-wrap items-center space-x-8 justify-center">
                  <div className="flex flex-col w-full md:w-auto">
                    <label className="font-semibold mb-2">Sewa Kandang</label>
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <span className="p-2 bg-gray-100">Rp.</span>
                      <input
                        type="text"
                        value={formatNumber(sewaKandang)}
                        onChange={handleInputChange(setSewaKandang)}
                        onBlur={(e) =>
                          setSewaKandang(
                            parseFloat(e.target.value.replace(/[^0-9]/g, ""))
                          )
                        }
                        className="border-0 p-2 rounded-md flex-1"
                        placeholder="Masukkan harga DOD"
                      />
                    </div>
                  </div>
                  <div className="flex items-center font-semibold text-2xl mt-8">
                    {" "}
                    +{" "}
                  </div>
                  <div className="flex flex-col w-full md:w-auto">
                    <label className="font-semibold mb-2">
                      Penyusutan Peralatan
                    </label>
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <span className="p-2 bg-gray-100">Rp.</span>
                      <input
                        type="text"
                        value={formatNumber(penyusutanPeralatan)}
                        onChange={handleInputChange(setPenyusutanPeralatan)}
                        onBlur={(e) =>
                          setPenyusutanPeralatan(
                            parseFloat(e.target.value.replace(/[^0-9]/g, ""))
                          )
                        }
                        className="border-0 p-2 rounded-md flex-1"
                        placeholder="Masukkan Penyusutan Peralatan"
                      />
                    </div>
                  </div>
                  <div className="flex items-center font-semibold text-2xl mt-8">
                    {" "}
                    ={" "}
                  </div>
                  <div className="flex flex-col w-full md:w-auto">
                    <label className="font-semibold">Total Biaya</label>
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <span className="p-2 bg-gray-100">Rp.</span>
                      <input
                        type="text"
                        value={formatNumber(totalBiaya)}
                        readOnly
                        className="border-0 p-2 rounded-md flex-1 cursor-not-allowed bg-gray-100" // border-0 untuk menghapus border input
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex flex-wrap items-center space-x-2 justify-center gap-7 mt-10">
                    <div className="flex flex-col w-full md:w-auto">
                      <label className="font-semibold">Total Biaya</label>
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <span className="p-2 bg-gray-100">Rp.</span>
                        <input
                          type="text"
                          value={formatNumber(totalBiaya)}
                          readOnly
                          className="border-0 p-2 rounded-md flex-1 cursor-not-allowed bg-gray-100" // border-0 untuk menghapus border input
                        />
                      </div>
                    </div>
                    <div className="flex items-center font-semibold text-2xl mt-8">
                      {" "}
                      ×{" "}
                    </div>
                    <div className="flex flex-col w-full md:w-auto">
                      <label className="font-semibold">Jumlah hari</label>
                      <input
                        type="text"
                        value={"28 Hari"}
                        readOnly
                        className="border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                    <div className="flex items-center font-semibold text-2xl mt-8">
                      {" "}
                      ={" "}
                    </div>
                    <div className="flex flex-col w-full md:w-auto">
                      <label className="font-semibold">Total Fixed Cost</label>
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <span className="p-2 bg-gray-100">Rp.</span>
                        <input
                          type="text"
                          value={formatNumber(totalFixedCost)}
                          readOnly
                          className="border-0 p-2 rounded-md flex-1 cursor-not-allowed bg-gray-100" // border-0 untuk menghapus border input
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bagian Biaya Operasional */}
                <div className="flex flex-wrap justify-center space-y-6">
                  <h3 className="font-extrabold text-3xl mb-4 mt-10">
                    Jumlah Biaya Operasional
                  </h3>
                </div>
                <div className="space-y-8">
                  <div className="flex flex-wrap items-center space-x-8 justify-center">
                    <div className="flex flex-col w-full md:w-auto">
                      <label className="font-semibold">
                        Biaya Tenaga Kerja
                      </label>
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <span className="p-2 bg-gray-100">Rp.</span>
                        <input
                          type="text"
                          value={
                            biayaTenagaKerja
                              ? formatNumber(biayaTenagaKerja)
                              : ""
                          }
                          onChange={handleInputChange(setBiayaTenagaKerja)}
                          onBlur={(e) =>
                            setBiayaTenagaKerja(
                              parseFloat(
                                e.target.value.replace(/[^0-9]/g, "")
                              ) || 0
                            )
                          }
                          className="border border-gray-300 p-2 rounded-md"
                          placeholder="Masukkan Biaya Tenaga Kerja"
                        />
                      </div>
                    </div>
                    <div className="flex items-center font-semibold text-2xl mt-8">
                      {" "}
                      +{" "}
                    </div>
                    <div className="flex flex-col w-full md:w-auto">
                      <label className="font-semibold">Biaya Listrik</label>
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <span className="p-2 bg-gray-100">Rp.</span>
                        <input
                          type="text"
                          value={biayaListrik ? formatNumber(biayaListrik) : ""} // Format angka saat render
                          onChange={handleInputChange(setBiayaListrik)} // Panggil setter dinamis
                          onBlur={(e) =>
                            setBiayaListrik(
                              parseFloat(
                                e.target.value.replace(/[^0-9]/g, "")
                              ) || 0
                            )
                          } // Set angka mentah saat blur
                          className="border border-gray-300 p-2 rounded-md"
                          placeholder="Masukkan biaya listrik"
                        />
                      </div>
                    </div>
                    <div className="flex items-center font-semibold text-2xl mt-8">
                      {" "}
                      +{" "}
                    </div>
                    <div className="flex flex-col w-full md:w-auto">
                      <label className="font-semibold">Biaya OVK</label>
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <span className="p-2 bg-gray-100">Rp.</span>
                        <input
                          type="text"
                          value={biayaOvk ? formatNumber(biayaOvk) : ""}
                          onChange={handleInputChange(setBiayaOvk)}
                          onBlur={(e) =>
                            setBiayaOvk(
                              parseFloat(
                                e.target.value.replace(/[^0-9]/g, "")
                              ) || 0
                            )
                          }
                          className="border border-gray-300 p-2 rounded-md"
                          placeholder="Masukkan biaya OVK"
                        />
                      </div>
                    </div>
                    <div className="flex items-center font-semibold text-2xl mt-8">
                      {" "}
                      ={" "}
                    </div>
                    <div className="flex flex-col w-full md:w-auto">
                      <label className="font-semibold">Biaya Operasional</label>
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <span className="p-2 bg-gray-100">Rp.</span>
                        <input
                          type="text"
                          value={formatNumber(biayaOperasional)}
                          readOnly
                          className="border-0 p-2 rounded-md flex-1 cursor-not-allowed bg-gray-100" // border-0 untuk menghapus border input
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center space-x-8 justify-center">
                    <div className="flex flex-col w-full md:w-auto">
                      <label className="font-semibold">Biaya Operasional</label>
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <span className="p-2 bg-gray-100">Rp.</span>
                        <input
                          type="text"
                          value={formatNumber(biayaOperasional)}
                          readOnly
                          className="border-0 p-2 rounded-md flex-1 cursor-not-allowed bg-gray-100" // border-0 untuk menghapus border input
                        />
                      </div>
                    </div>
                    <div className="flex items-center font-semibold text-2xl mt-8">
                      {" "}
                      ×{" "}
                    </div>
                    <div className="flex flex-col w-full md:w-auto">
                      <label className="font-semibold">Jumlah hari</label>
                      <input
                        type="text"
                        value={"28 Hari"}
                        readOnly
                        className="border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                    <div className="flex items-center font-semibold text-2xl mt-8">
                      {" "}
                      ={" "}
                    </div>
                    <div className="flex flex-col w-full md:w-auto">
                      <label className="font-semibold">
                        Total Biaya Operasional
                      </label>
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <span className="p-2 bg-gray-100">Rp.</span>
                        <input
                          type="text"
                          value={formatNumber(totalBiayaOperasional)}
                          readOnly
                          className="border-0 p-2 rounded-md flex-1 cursor-not-allowed bg-gray-100" // border-0 untuk menghapus border input
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bagian Jumlah Pembelian Telur */}
                <div className="flex flex-wrap justify-center mt-10">
                  <h3 className="font-extrabold text-3xl mb-4">
                    Jumlah Pembelian Telur
                  </h3>
                </div>
                <div className="flex flex-wrap items-center space-x-8 justify-center">
                  <div className="flex flex-col w-full md:w-auto">
                    <label className="font-semibold">
                      Jumlah Telur (Butir)
                    </label>
                    <input
                      type="text"
                      value={jumlahTelur}
                      readOnly
                      className="border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div className="flex items-center font-semibold text-2xl mt-8">
                    {" "}
                    ×{" "}
                  </div>
                  <div className="flex flex-col w-full md:w-auto">
                    <label className="font-semibold">Harga Telur</label>
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <span className="p-2 bg-gray-100">Rp.</span>
                      <input
                        type="text"
                        value={hargaTelur ? formatNumber(hargaTelur) : ""}
                        onChange={handleInputChange(setHargaTelur)}
                        onBlur={(e) =>
                          setHargaTelur(
                            parseFloat(e.target.value.replace(/[^0-9]/g, "")) ||
                              0
                          )
                        }
                        className="border border-gray-300 p-2 rounded-md"
                        placeholder="Masukkan Harga Telur"
                      />
                    </div>
                  </div>
                  <div className="flex items-center font-semibold text-2xl mt-8">
                    {" "}
                    ={" "}
                  </div>
                  <div className="flex flex-col w-full md:w-auto">
                    <label className="font-semibold">
                      Total Biaya Pembelian Telur
                    </label>
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <span className="p-2 bg-gray-100">Rp.</span>
                      <input
                        type="text"
                        value={formatNumber(totalBiayaPembelianTelur)}
                        readOnly
                        className="border-0 p-2 rounded-md flex-1 cursor-not-allowed bg-gray-100" // border-0 untuk menghapus border input
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap justify-center mt-10">
                  <h3 className="font-extrabold text-3xl mb-4">
                    Variable Cost
                  </h3>
                </div>
                <div className="flex flex-wrap items-center space-x-8 justify-center">
                  <div className="flex flex-col w-full md:w-auto">
                    <label className="font-semibold">
                      Total Biaya Operasional
                    </label>
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <span className="p-2 bg-gray-100">Rp.</span>
                      <input
                        type="text"
                        value={formatNumber(totalBiayaOperasional)}
                        readOnly
                        className="border-0 p-2 rounded-md flex-1 cursor-not-allowed bg-gray-100" // border-0 untuk menghapus border input
                      />
                    </div>
                  </div>
                  <div className="flex items-center font-semibold text-2xl mt-8">
                    {" "}
                    +{" "}
                  </div>
                  <div className="flex flex-col w-full md:w-auto">
                    <label className="font-semibold">
                      Total Biaya Pembelian Telur
                    </label>
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <span className="p-2 bg-gray-100">Rp.</span>
                      <input
                        type="text"
                        value={formatNumber(totalBiayaPembelianTelur)}
                        readOnly
                        className="border-0 p-2 rounded-md flex-1 cursor-not-allowed bg-gray-100" // border-0 untuk menghapus border input
                      />
                    </div>
                  </div>
                  <div className="flex items-center font-semibold text-2xl mt-8">
                    {" "}
                    ={" "}
                  </div>
                  <div className="flex flex-col w-full md:w-auto">
                    <label className="font-semibold">Total Variable Cost</label>
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <span className="p-2 bg-gray-100">Rp.</span>
                      <input
                        type="text"
                        value={formatNumber(totalVariableCost)}
                        readOnly
                        className="border-0 p-2 rounded-md flex-1 cursor-not-allowed bg-gray-100" // border-0 untuk menghapus border input
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap justify-center mt-10">
                  <h3 className="font-extrabold text-3xl mb-4">
                    Data Pengeluaran
                  </h3>
                </div>
                <div className="flex flex-wrap items-center space-x-8 justify-center">
                  <div className="flex flex-col w-full md:w-auto">
                    <label className="font-semibold">Total Variable Cost</label>
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <span className="p-2 bg-gray-100">Rp.</span>
                      <input
                        type="text"
                        value={formatNumber(totalVariableCost)}
                        readOnly
                        className="border-0 p-2 rounded-md flex-1 cursor-not-allowed bg-gray-100" // border-0 untuk menghapus border input
                      />
                    </div>
                  </div>
                  <div className="flex items-center font-semibold text-2xl mt-8">
                    {" "}
                    +{" "}
                  </div>
                  <div className="flex flex-col w-full md:w-auto">
                    <label className="font-semibold">Total Fixed Cost</label>
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <span className="p-2 bg-gray-100">Rp.</span>
                      <input
                        type="text"
                        value={formatNumber(totalFixedCost)}
                        readOnly
                        className="border-0 p-2 rounded-md flex-1 cursor-not-allowed bg-gray-100" // border-0 untuk menghapus border input
                      />
                    </div>
                  </div>
                  <div className="flex items-center font-semibold text-2xl mt-8">
                    {" "}
                    ={" "}
                  </div>
                  <div className="flex flex-col w-full md:w-auto">
                    <label className="font-semibold">Total Cost</label>
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <span className="p-2 bg-orange-200">Rp.</span>
                      <input
                        type="text"
                        value={formatNumber(totalCost)}
                        readOnly
                        className="border-0 p-2 rounded-md flex-1 cursor-not-allowed bg-orange-100" // border-0 untuk menghapus border input
                      />
                    </div>
                  </div>
                </div>
                {/* Tombol Kembali dan Selanjutnya */}
                <div className="flex justify-between mt-14">
                  <button
                    onClick={handleBackForm}
                    className="bg-gray-500 text-white px-4 py-2 rounded-full hover:bg-gray-600 transition-all"
                  >
                    Kembali
                  </button>
                  <button
                    onClick={handleNextForm}
                    className="bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition-all"
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            )}

            {/* Form Hasil Analisis */}
            {currentForm === "HasilAnalisis" && (
              <div>
                <div>
                  <h2 className="text-xl font-semibold mb-6">Hasil Analisis</h2>
                </div>

                <div className="flex items-center justify-center">
                  <div className="flex flex-col">
                    <label className="font-semibold">
                      Margin Of Safety (MOS)
                    </label>
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <input
                        type="text"
                        value={formatNumber(marginOfSafety)}
                        readOnly
                        className="border-0 p-2 rounded-md flex-1 bg-orange-100" // border-0 untuk menghapus border input
                      />
                      <span className="p-2 bg-orange-200">%</span>
                    </div>
                  </div>
                  <div className="flex flex-col mx-5">
                    <label className="font-semibold">R/C Ratio</label>
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <input
                        type="text"
                        value={rcRatio.toFixed(2)}
                        readOnly
                        className="border-0 p-2 rounded-md flex-1 bg-orange-100" // border-0 untuk menghapus border input
                      />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <label className="font-semibold">BEP Harga</label>
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <span className="p-2 bg-orange-200">Rp.</span>
                      <input
                        type="text"
                        value={formatNumber(bepHarga)}
                        readOnly
                        className="border-0 p-2 rounded-md flex-1 bg-orange-100" // border-0 untuk menghapus border input
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center mt-10">
                  <div className="flex flex-col mx-5">
                    <label className="font-semibold">BEP Unit</label>
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <input
                        type="text"
                        value={formatNumber(bepHasil)}
                        readOnly
                        className="border-0 p-2 rounded-md flex-1 bg-orange-100" // border-0 untuk menghapus border input
                      />
                      <span className="p-2 bg-orange-200">Ekor</span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <label className="font-semibold">Laba</label>
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <span className="p-2 bg-orange-200">Rp.</span>
                      <input
                        type="text"
                        value={formatNumber(laba)}
                        readOnly
                        className="border-0 p-2 rounded-md flex-1 bg-orange-100" // border-0 untuk menghapus border input
                      />
                    </div>
                  </div>
                </div>

                {/* Tombol Kembali untuk kembali ke form pengeluaran */}
                <div className="flex justify-between mt-6">
                  <button
                    onClick={handleBackForm}
                    className="bg-gray-500 text-white px-4 py-2 rounded-full hover:bg-gray-600 transition-all"
                  >
                    Kembali
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition-all"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </SidebarDemo>
    </div>
  );
};

export default PenetasanPage;
