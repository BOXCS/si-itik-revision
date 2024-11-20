"use client";

import { SidebarDemo } from "@/components/Sidebar";
import { useUser } from "@/app/context/UserContext";
import React, { useState, useEffect, Suspense } from "react";
import HorizontalTimeline from "@/components/HorizontalTimeline";
import "@/app/analisis.css";
import {
  doc,
  addDoc,
  collection,
  DocumentReference,
  Timestamp,
  getDocs,
} from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { IconX } from "@tabler/icons-react";
import { firestore } from "@/lib/firebase";

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
  const [activeTab, setActiveTab] = useState("info");
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

  useEffect(() => {
    console.log(periode); // Or any other usage of periode
  }, [periode]); // If you want to react to changes in 'periode'

  useEffect(() => {
    console.log(isNewAnalysis); // Or any other usage of periode
  }, [isNewAnalysis]); // If you want to react to changes in 'periode'

  const handleAddPeriod = () => {
    if (periods.length >= 13) {
      toast({
        title: "Batas Maksimum Tercapai",
        description: "Anda hanya dapat menambahkan hingga 13 periode.",
        variant: "destructive",
      });
      return;
    }

    const newPeriod = `Periode ${periods.length + 1}`;
    const updatedPeriods = [...periods, newPeriod];
    setPeriods(updatedPeriods);
    setSelectedPeriod(newPeriod);
    setPeriode(newPeriod);

    // Simpan ke localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("penetasan_periods", JSON.stringify(updatedPeriods));
    }
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
      // Cek apakah data periode sudah ada dalam analisis_periode
      if (newAnalysisDocRef) {
        const periodeSnapshot = await getDocs(
          collection(newAnalysisDocRef, "analisis_periode")
        );
        const existingPeriode = periodeSnapshot.docs.find(
          (doc) => doc.data().periode === selectedPeriod
        );

        if (existingPeriode) {
          toast({
            title: "Data periode sudah ada.",
            description: "Silahkan tambah periode atau buat analisis baru.",
            variant: "destructive",
          });
          return; // Hentikan eksekusi jika periode sudah ada
        }
      }

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
    // Simpan periode dan disabledPeriods ke localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("penetasan_periods", JSON.stringify(periods));
      localStorage.setItem("disabled_periods", JSON.stringify(disabledPeriods));
    }
  }, [periods, disabledPeriods]);

  useEffect(() => {
    // Muat disabledPeriods dari localStorage
    const storedDisabledPeriods = JSON.parse(
      (typeof window !== "undefined" &&
        localStorage.getItem("disabled_periods")) ||
        "[]"
    );
    setDisabledPeriods(storedDisabledPeriods);
  }, []);

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
  }, [totalFixedCost, hargaDOD, totalVariableCost, jumlahDOD]);

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
      <Suspense fallback={<div>Loading...</div>}>
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
              {/* Horizontal Timeline for Desktop */}
              <div className="hidden md:flex w-full justify-center mb-6">
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

              {/* Button for Mobile */}
              <div className="flex md:hidden w-full justify-center mb-6">
                <button
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg shadow hover:bg-orange-600 focus:outline-none"
                  onClick={handleToggle}
                >
                  Lihat Info dan Rumus
                </button>
              </div>

              {/* Dialog */}
              {isOpen && (
                <div
                  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                  onClick={handleToggle}
                >
                  <div
                    className="bg-white w-11/12 max-w-md overflow-y-auto max-h-[90vh] rounded-lg p-6"
                    onClick={(e) => e.stopPropagation()} // Prevent dialog close on content click
                  >
                    <h2 className="text-xl font-semibold mb-4">
                      Info dan Rumus
                    </h2>

                    {/* Sub Buttons */}
                    <div className="flex justify-center gap-4 mb-4">
                      <button
                        className={`px-4 py-2 rounded-lg ${
                          activeTab === "info"
                            ? "bg-orange-500 text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                        onClick={() => setActiveTab("info")}
                      >
                        Info
                      </button>
                      <button
                        className={`px-4 py-2 rounded-lg ${
                          activeTab === "rumus"
                            ? "bg-orange-500 text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                        onClick={() => setActiveTab("rumus")}
                      >
                        Rumus
                      </button>
                    </div>

                    {/* Content */}
                    {activeTab === "info" && (
                      <p className="mb-4">
                        Berikut adalah informasi terkait proses analisis:
                        <ul className="list-disc pl-5 mt-2">
                          <li>Penerimaan (revenue) merupakan total pendapatan yang akan diperoleh dari hasil penjualan dalam 1 periode sebelum dikurangi dengan biaya atau pengeluaran.</li>
                          <br />
                          <li>Pengeluaran (cost) adalah seluruh biaya yang dikeluarkan untuk menjalankan suatu usaha, pada cost dibagi menjadi 2 yaitu fixed cost atau biaya tetap dan variable cost atau biaya variable.</li>
                          <br />
                          <li>(Margin of Safety) adalah analisis lanjutan dari titik impas yang menunjukkan seberapa besar persentase penjualan yang dapat turun sebelum perusahaan mengalami kerugian (Devi, 2023). MOS biasanya dinyatakan dalam bentuk persentase, dan semakin besar nilai MOS, semakin aman posisi keuangan suatu bisnis.</li>
                          <li>R/C Ratio atau Revenue-Cost Ratio adalah perbandingan antara total pendapatan (revenue) yang dihasilkan dari penjualan suatu produk atau layanan dengan total biaya (cost) yang dikeluarkan untuk menghasilkan produk atau layanan tersebut. Rasio ini digunakan untuk mengevaluasi efisiensi dan profitabilitas suatu usaha.</li>
                          <li>Break-Even Point (BEP) adalah titik impas, yaitu kondisi di mana total pendapatan sama dengan total biaya, sehingga tidak ada keuntungan maupun kerugian. Dalam konteks BEP, terdapat dua jenis pengukuran utama:
                            <ul>BEP unit menunjukkan jumlah unit produk yang harus terjual agar perusahaan mencapai titik impas. BEP unit dihitung untuk mengetahui seberapa banyak produk yang perlu dijual untuk menutup seluruh biaya (tetap dan variabel).</ul>
                          </li>
                        </ul>
                      </p>
                    )}
                    {activeTab === "rumus" && (
                      <div className="mb-4">
                        <p>Berikut adalah rumus yang digunakan:</p>
                        <ul className="list-disc pl-5 mt-2">
                          {/* Semua rumus di sini */}
                          <li>
                            Penerimaan
                            <ul className="list-disc pl-5">
                              <li>
                                Persentase Telur Menetas:{" "}
                                <code>
                                  (Jumlah Telur Menetas / Jumlah Telur) × 100
                                </code>
                              </li>
                              <br />
                              <li>
                                Jumlah DOD:{" "}
                                <code>Jumlah Telur × (Persentase / 100)</code>
                              </li>
                              <br />
                              <li>
                                Total Revenue:{" "}
                                <code>Jumlah DOD × Harga DOD</code>
                              </li>
                            </ul>
                          </li>
                          <br />
                          <li>
                            Pengeluaran
                            <ul className="list-disc pl-5">
                              <li>
                                Total Biaya:{" "}
                                <code>Sewa Kandang + Penyusutan Peralatan</code>
                              </li>
                              <br />
                              <li>
                                Total Fixed Cost: <code>Total Biaya × 28</code>
                              </li>
                              <br />
                              <li>
                                Biaya Operasional:{" "}
                                <code>
                                  Biaya Tenaga Kerja + Biaya Listrik × Biaya OVK
                                </code>
                              </li>
                              <br />
                              <li>
                                Total Biaya Operasional:{" "}
                                <code>Biaya Operasional × 28</code>
                              </li>
                              <br />
                              <li>
                                Total Biaya Pembelian Telur:{" "}
                                <code>Jumlah Telur × Harga Telur</code>
                              </li>
                              <br />
                              <li>
                                Total Variable Cost:{" "}
                                <code>
                                  Total Biaya Operasional + Total Biaya
                                  Pembelian Telur
                                </code>
                              </li>
                              <br />
                              <li>
                                Total Cost:{" "}
                                <code>
                                  Total Variable Cost + Total Fixed Cost
                                </code>
                              </li>
                            </ul>
                          </li>
                          <br />
                          <li>
                            Hasil Analisis
                            <ul className="list-disc pl-5">
                              <li>
                                BEP Hasil:{" "}
                                <code>
                                  Total Fixed Cost / (Harga DOD - (Total
                                  Variable Cost / Jumlah DOD))
                                </code>
                              </li>
                              <br />
                              <li>
                                BEP Harga:{" "}
                                <code>
                                  Total Fixed Cost / (1 - (Total Variable Cost /
                                  (Jumlah DOD × Harga DOD)))
                                </code>
                              </li>
                              <br />
                              <li>
                                Margin of Safety:{" "}
                                <code>
                                  ((Total Revenue - BEP Harga) / Total Revenue)
                                  × 100
                                </code>
                              </li>
                              <br />
                              <li>
                                RC Ratio:{" "}
                                <code>Total Revenue / Total Cost</code>
                              </li>
                              <br />
                              <li>
                                Laba: <code>Total Revenue - Total Cost</code>
                              </li>
                            </ul>
                          </li>
                        </ul>
                      </div>
                    )}

                    <button
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg shadow hover:bg-orange-600 focus:outline-none"
                      onClick={handleToggle}
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              )}

              {currentForm === "Penerimaan" && (
                <div className="flex flex-col w-full px-4 md:px-6 py-4">
                  <h2 className="text-lg md:text-xl font-extrabold mb-4 md:mb-6">
                    Data Penerimaan
                  </h2>

                  {/* Penerimaan Form */}
                  <div className="flex flex-col space-y-6 md:space-y-8">
                    {/* First Calculator Section */}
                    <div className="grid grid-cols-1 md:grid-cols-7 gap-2 items-center">
                      <div className="hidden md:flex items-center justify-center font-semibold text-3xl mt-5">
                        (
                      </div>

                      <div className="col-span-1 md:col-span-2">
                        <label className="font-semibold text-sm md:text-base mb-1 block">
                          Jumlah Telur Menetas
                        </label>
                        <input
                          type="number"
                          value={jumlahTelurMenetas}
                          onChange={(e) =>
                            setJumlahTelurMenetas(parseFloat(e.target.value))
                          }
                          className="w-full border border-gray-300 p-2 rounded-md"
                        />
                      </div>

                      <div className="hidden md:flex items-center justify-center font-semibold text-3xl mt-5">
                        /
                      </div>

                      <div className="col-span-1 md:col-span-2">
                        <label className="font-semibold text-sm md:text-base mb-1 block">
                          Jumlah Telur (Butir)
                        </label>
                        <input
                          type="number"
                          value={jumlahTelur}
                          onChange={(e) =>
                            setJumlahTelur(parseFloat(e.target.value))
                          }
                          className="w-full border border-gray-300 p-2 rounded-md"
                        />
                      </div>

                      <div className="hidden md:flex items-center justify-center font-semibold text-3xl mt-5">
                        )
                      </div>

                      <div className="hidden md:flex items-center justify-center font-semibold text-3xl mt-5">
                        ×
                      </div>

                      <div className="col-span-1 md:col-span-2">
                        <label className="font-semibold text-sm md:text-base mb-1 block">
                          Persentase
                        </label>
                        <input
                          type="text"
                          value="100%"
                          readOnly
                          className="w-full border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"
                        />
                      </div>

                      <div className="hidden md:flex items-center justify-center font-semibold text-3xl mt-5">
                        =
                      </div>

                      <div className="col-span-1 md:col-span-2">
                        <label className="font-semibold text-sm md:text-base mb-1 block">
                          Persentase Menetas
                        </label>
                        <input
                          type="text"
                          value={`${persentase.toFixed(0)}%`}
                          readOnly
                          className="w-full border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {/* Second Calculator Section */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                      <div className="col-span-1">
                        <label className="font-semibold text-sm md:text-base mb-1 block">
                          Jumlah Telur (Butir)
                        </label>
                        <input
                          type="text"
                          value={jumlahTelur}
                          readOnly
                          className="w-full border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"
                        />
                      </div>

                      <div className="hidden md:flex items-center justify-center font-semibold text-3xl mt-5">
                        ×
                      </div>

                      <div className="col-span-1">
                        <label className="font-semibold text-sm md:text-base mb-1 block">
                          Persentase Menetas
                        </label>
                        <input
                          type="text"
                          value={`${persentase.toFixed(0)}%`}
                          readOnly
                          className="w-full border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"
                        />
                      </div>

                      <div className="hidden md:flex items-center justify-center font-semibold text-3xl mt-5">
                        =
                      </div>

                      <div className="col-span-1">
                        <label className="font-semibold text-sm md:text-base mb-1 block">
                          Jumlah DOD
                        </label>
                        <input
                          type="text"
                          value={jumlahDOD.toFixed(0)}
                          readOnly
                          className="w-full border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {/* Third Calculator Section */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                      <div className="col-span-1">
                        <label className="font-semibold text-sm md:text-base mb-1 block">
                          Jumlah DOD
                        </label>
                        <input
                          type="text"
                          value={jumlahDOD.toFixed(0)}
                          readOnly
                          className="w-full border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"
                        />
                      </div>

                      <div className="hidden md:flex items-center justify-center font-semibold text-3xl mt-5">
                        ×
                      </div>

                      <div className="col-span-1">
                        <label className="font-semibold text-sm md:text-base mb-1 block">
                          Harga DOD
                        </label>
                        <div className="flex items-center border border-gray-300 rounded-md">
                          <span className="p-2 bg-gray-100">Rp.</span>
                          <input
                            type="number"
                            value={formatNumber(hargaDOD)}
                            onChange={handleInputChange(setHargaDOD)}
                            onBlur={(e) =>
                              setHargaDOD(
                                parseFloat(
                                  e.target.value.replace(/[^0-9]/g, "")
                                )
                              )
                            }
                            className="w-full border-0 p-2 rounded-md"
                            placeholder="Masukkan harga DOD"
                          />
                        </div>
                      </div>

                      <div className="hidden md:flex items-center justify-center font-semibold text-3xl mt-5">
                        =
                      </div>

                      <div className="col-span-1">
                        <label className="font-semibold text-sm md:text-base mb-1 block">
                          Total Revenue
                        </label>
                        <div className="flex items-center border border-gray-300 rounded-md">
                          <span className="p-2 bg-orange-200">Rp.</span>
                          <input
                            type="text"
                            value={formatNumber(totalRevenue)}
                            readOnly
                            className="w-full border-0 p-2 rounded-md cursor-not-allowed bg-orange-100"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Selanjutnya Button */}
                  <div className="flex justify-end mt-8 md:mt-16">
                    <button
                      onClick={handleNextForm}
                      className="bg-[#F58110] text-white p-2 rounded-full w-full md:w-52"
                    >
                      Selanjutnya
                    </button>
                  </div>
                </div>
              )}

              {/* Render Pengeluaran Form */}
              {currentForm === "Pengeluaran" && (
                <div className="flex flex-col w-full px-4 md:px-6 py-4">
                  <h2 className="text-lg md:text-xl font-extrabold mb-4 md:mb-6">
                    Data Pengeluaran
                  </h2>
                  {/* Bagian Fixed Cost */}
                  <div className="flex flex-col space-y-6 md:space-y-8">
                    <div className="w-full px-4">
                      {/* Fixed Cost Header */}
                      <div className="text-center mb-6">
                        <h3 className="font-extrabold text-2xl md:text-3xl">
                          Fixed Cost
                        </h3>
                      </div>

                      {/* First Row - Input Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                        <div className="col-span-1">
                          <label className="font-semibold text-sm md:text-base mb-1 block">
                            Sewa Kandang
                          </label>
                          <div className="flex items-center border border-gray-300 rounded-md">
                            <span className="p-2 bg-gray-100">Rp.</span>
                            <input
                              type="number"
                              value={formatNumber(sewaKandang)}
                              onChange={handleInputChange(setSewaKandang)}
                              onBlur={(e) =>
                                setSewaKandang(
                                  parseFloat(
                                    e.target.value.replace(/[^0-9]/g, "")
                                  )
                                )
                              }
                              className="w-full border border-gray-300 p-2 rounded-md"
                              placeholder="harga sewa kandang"
                            />
                          </div>
                        </div>

                        <div className="hidden md:flex items-center justify-center font-semibold text-3xl mt-5">
                          +
                        </div>

                        <div className="col-span-1">
                          <label className="font-semibold text-sm md:text-base mb-1 block">
                            Penyusutan Peralatan
                          </label>
                          <div className="flex items-center border border-gray-300 rounded-md">
                            <span className="p-2 bg-gray-100">Rp.</span>
                            <input
                              type="number"
                              value={formatNumber(penyusutanPeralatan)}
                              onChange={handleInputChange(
                                setPenyusutanPeralatan
                              )}
                              onBlur={(e) =>
                                setPenyusutanPeralatan(
                                  parseFloat(
                                    e.target.value.replace(/[^0-9]/g, "")
                                  )
                                )
                              }
                              className="w-full border border-gray-300 p-2 rounded-md"
                              placeholder="Masukkan Penyusutan Peralatan"
                            />
                          </div>
                        </div>

                        <div className="hidden md:flex items-center justify-center font-semibold text-3xl mt-5">
                          =
                        </div>

                        <div className="col-span-1">
                          <label className="font-semibold text-sm md:text-base mb-1 block">
                            Total Biaya
                          </label>
                          <div className="flex items-center border border-gray-300 rounded-md">
                            <span className="p-2 bg-gray-100">Rp.</span>
                            <input
                              type="text"
                              value={formatNumber(totalBiaya)}
                              readOnly
                              className="w-full border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Second Row - Calculation */}
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-5 items-center">
                        <div className="col-span-1">
                          <label className="font-semibold text-sm md:text-base mb-1 block">
                            Total Biaya
                          </label>
                          <div className="flex items-center border border-gray-300 rounded-md">
                            <span className="p-2 bg-gray-100">Rp.</span>
                            <input
                              type="text"
                              value={formatNumber(totalBiaya)}
                              readOnly
                              className="w-full border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"
                            />
                          </div>
                        </div>

                        <div className="hidden md:flex items-center justify-center font-semibold text-3xl mt-5">
                          ×
                        </div>

                        <div className="col-span-1">
                          <label className="font-semibold text-sm md:text-base mb-1 block">
                            Jumlah hari
                          </label>
                          <input
                            type="text"
                            value={"28 Hari"}
                            readOnly
                            className="w-full border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"
                          />
                        </div>

                        <div className="hidden md:flex items-center justify-center font-semibold text-3xl mt-5">
                          =
                        </div>

                        <div className="col-span-1">
                          <label className="font-semibold text-sm md:text-base mb-1 block">
                            Total Fixed Cost
                          </label>
                          <div className="flex items-center border border-gray-300 rounded-md">
                            <span className="p-2 bg-gray-100">Rp.</span>
                            <input
                              type="text"
                              value={formatNumber(totalFixedCost)}
                              readOnly
                              className="w-full border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bagian Biaya Operasional */}
                    <div className="w-full px-4">
                      <div className="text-center mb-6 mt-10">
                        <h3 className="font-extrabold text-2xl md:text-3xl">
                          Jumlah Biaya Operasional
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                        <div className="col-span-1">
                          <label className="font-semibold text-sm md:text-base mb-1 block">
                            Biaya Tenaga Kerja
                          </label>
                          <div className="flex items-center border border-gray-300 rounded-md">
                            <span className="p-2 bg-gray-100">Rp.</span>
                            <input
                              type="number"
                              value={formatNumber(biayaTenagaKerja)}
                              onChange={handleInputChange(setBiayaTenagaKerja)}
                              onBlur={(e) =>
                                setBiayaTenagaKerja(
                                  parseFloat(
                                    e.target.value.replace(/[^0-9]/g, "")
                                  )
                                )
                              }
                              className="w-full border border-gray-300 p-2 rounded-md"
                            />
                          </div>
                        </div>

                        <div className="hidden md:flex items-center justify-center font-semibold text-3xl mt-5">
                          +
                        </div>

                        <div className="col-span-1">
                          <label className="font-semibold text-sm md:text-base mb-1 block">
                            Biaya Listrik
                          </label>
                          <div className="flex items-center border border-gray-300 rounded-md">
                            <span className="p-2 bg-gray-100">Rp.</span>
                            <input
                              type="number"
                              value={formatNumber(biayaListrik)}
                              onChange={handleInputChange(setBiayaListrik)}
                              onBlur={(e) =>
                                setBiayaListrik(
                                  parseFloat(
                                    e.target.value.replace(/[^0-9]/g, "")
                                  )
                                )
                              }
                              className="w-full border border-gray-300 p-2 rounded-md"
                            />
                          </div>
                        </div>

                        <div className="hidden md:flex items-center justify-center font-semibold text-3xl mt-5">
                          +
                        </div>

                        <div className="col-span-1">
                          <label className="font-semibold text-sm md:text-base mb-1 block">
                            Biaya OVK
                          </label>
                          <div className="flex items-center border border-gray-300 rounded-md">
                            <span className="p-2 bg-gray-100">Rp.</span>
                            <input
                              type="number"
                              value={formatNumber(biayaOvk)}
                              onChange={handleInputChange(setBiayaOvk)}
                              onBlur={(e) =>
                                setBiayaOvk(
                                  parseFloat(
                                    e.target.value.replace(/[^0-9]/g, "")
                                  )
                                )
                              }
                              className="w-full border border-gray-300 p-2 rounded-md"
                            />
                          </div>
                        </div>

                        <div className="hidden md:flex items-center justify-center font-semibold text-3xl mt-5">
                          =
                        </div>

                        <div className="col-span-1 md:col-span-3">
                          <label className="font-semibold text-sm md:text-base mb-1 block">
                            Biaya Operasional
                          </label>
                          <div className="flex items-center border border-gray-300 rounded-md">
                            <span className="p-2 bg-gray-100">Rp.</span>
                            <input
                              type="text"
                              value={formatNumber(biayaOperasional)}
                              readOnly
                              className="w-full border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-10 items-center">
                        <div className="col-span-1">
                          <label className="font-semibold text-sm md:text-base mb-1 block">
                            Biaya Operasional
                          </label>
                          <div className="flex items-center border border-gray-300 rounded-md">
                            <span className="p-2 bg-gray-100">Rp.</span>
                            <input
                              type="text"
                              value={formatNumber(biayaOperasional)}
                              readOnly
                              className="w-full border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"
                            />
                          </div>
                        </div>

                        <div className="hidden md:flex items-center justify-center font-semibold text-3xl mt-5">
                          ×
                        </div>

                        <div className="col-span-1">
                          <label className="font-semibold text-sm md:text-base mb-1 block">
                            Jumlah hari
                          </label>
                          <input
                            type="text"
                            value={"28 Hari"}
                            readOnly
                            className="w-full border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"
                          />
                        </div>

                        <div className="hidden md:flex items-center justify-center font-semibold text-3xl mt-5">
                          =
                        </div>

                        <div className="col-span-1">
                          <label className="font-semibold text-sm md:text-base mb-1 block">
                            Total Biaya Operasional
                          </label>
                          <div className="flex items-center border border-gray-300 rounded-md">
                            <span className="p-2 bg-gray-100">Rp.</span>
                            <input
                              type="text"
                              value={formatNumber(totalBiayaOperasional)}
                              readOnly
                              className="w-full border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bagian Jumlah Pembelian Telur */}
                    <div className="flex flex-col space-y-6 md:space-y-8">
                      <div className="w-full px-4">
                        <div className="text-center mb-6 mt-10">
                          <h3 className="font-extrabold text-2xl md:text-3xl">
                            Jumlah Pembelian Telur
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                          <div className="col-span-1">
                            <label className="font-semibold text-sm md:text-base mb-1 block">
                              Jumlah Telur (Butir)
                            </label>
                            <input
                              type="text"
                              value={jumlahTelur}
                              readOnly
                              className="w-full border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"
                            />
                          </div>

                          <div className="hidden md:flex items-center justify-center font-semibold text-3xl mt-5">
                            ×
                          </div>

                          <div className="col-span-1">
                            <label className="font-semibold text-sm md:text-base mb-1 block">
                              Harga Telur
                            </label>
                            <div className="flex items-center border border-gray-300 rounded-md">
                              <span className="p-2 bg-gray-100">Rp.</span>
                              <input
                                type="text"
                                value={formatNumber(hargaTelur)}
                                onChange={handleInputChange(setHargaTelur)}
                                onBlur={(e) =>
                                  setHargaTelur(
                                    parseFloat(
                                      e.target.value.replace(/[^0-9]/g, "")
                                    ) || 0
                                  )
                                }
                                className="w-full border border-gray-300 p-2 rounded-md"
                              />
                            </div>
                          </div>

                          <div className="hidden md:flex items-center justify-center font-semibold text-3xl mt-5">
                            =
                          </div>

                          <div className="col-span-1">
                            <label className="font-semibold text-sm md:text-base mb-1 block">
                              Total Biaya Pembelian Telur
                            </label>
                            <div className="flex items-center border border-gray-300 rounded-md">
                              <span className="p-2 bg-gray-100">Rp.</span>
                              <input
                                type="text"
                                value={formatNumber(totalBiayaPembelianTelur)}
                                readOnly
                                className="w-full border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed" // border-0 untuk menghapus border input
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="w-full px-4">
                      <div className="text-center mb-6 mt-10">
                        <h3 className="font-extrabold text-2xl md:text-3xl">
                          Variable Cost
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                        <div className="col-span-1">
                          <label className="font-semibold text-sm md:text-base mb-1 block">
                            Total Biaya Operasional
                          </label>
                          <div className="flex items-center border border-gray-300 rounded-md">
                            <span className="p-2 bg-gray-100">Rp.</span>
                            <input
                              type="text"
                              value={formatNumber(totalBiayaOperasional)}
                              readOnly
                              className="w-full border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed" // border-0 untuk menghapus border input
                            />
                          </div>
                        </div>

                        <div className="hidden md:flex items-center justify-center font-semibold text-3xl mt-5">
                          +
                        </div>

                        <div className="col-span-1">
                          <label className="font-semibold text-sm md:text-base mb-1 block">
                            Total Biaya Pembelian Telur
                          </label>
                          <div className="flex items-center border border-gray-300 rounded-md">
                            <span className="p-2 bg-gray-100">Rp.</span>
                            <input
                              type="text"
                              value={formatNumber(totalBiayaPembelianTelur)}
                              readOnly
                              className="w-full border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed" // border-0 untuk menghapus border input
                            />
                          </div>
                        </div>

                        <div className="hidden md:flex items-center justify-center font-semibold text-3xl mt-5">
                          =
                        </div>

                        <div className="col-span-1">
                          <label className="font-semibold text-sm md:text-base mb-1 block">
                            Total Variable Cost
                          </label>
                          <div className="flex items-center border border-gray-300 rounded-md">
                            <span className="p-2 bg-gray-100">Rp.</span>
                            <input
                              type="text"
                              value={formatNumber(totalVariableCost)}
                              readOnly
                              className="w-full border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed" // border-0 untuk menghapus border input
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="w-full px-4">
                      <div className="text-center mb-6 mt-10">
                        <h3 className="font-extrabold text-2xl md:text-3xl">
                          Data Pengeluaran
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                        <div className="col-span-1">
                          <label className="font-semibold text-sm md:text-base mb-1 block">
                            Total Variable Cost
                          </label>
                          <div className="flex items-center border border-gray-300 rounded-md">
                            <span className="p-2 bg-gray-100">Rp.</span>
                            <input
                              type="text"
                              value={formatNumber(totalVariableCost)}
                              readOnly
                              className="w-full border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed" // border-0 untuk menghapus border input
                            />
                          </div>
                        </div>

                        <div className="hidden md:flex items-center justify-center font-semibold text-3xl mt-5">
                          +
                        </div>

                        <div className="col-span-1">
                          <label className="font-semibold text-sm md:text-base mb-1 block">
                            Total Fixed Cost
                          </label>
                          <div className="flex items-center border border-gray-300 rounded-md">
                            <span className="p-2 bg-gray-100">Rp.</span>
                            <input
                              type="text"
                              value={formatNumber(totalFixedCost)}
                              readOnly
                              className="w-full border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed" // border-0 untuk menghapus border input
                            />
                          </div>
                        </div>

                        <div className="hidden md:flex items-center justify-center font-semibold text-3xl mt-5">
                          =
                        </div>

                        <div className="col-span-1">
                          <label className="font-semibold text-sm md:text-base mb-1 block">
                            Total Cost
                          </label>
                          <div className="flex items-center border border-gray-300 rounded-md">
                            <span className="p-2 bg-orange-200">Rp.</span>
                            <input
                              type="text"
                              value={formatNumber(totalCost)}
                              readOnly
                              className="w-full border-0 p-2 rounded-md cursor-not-allowed bg-orange-100"
                            />
                          </div>
                        </div>
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
                <div className="flex flex-col w-full px-4 md:px-6 py-4">
                  <h2 className="text-lg md:text-xl font-extrabold mb-4 md:mb-6">
                    Hasil Analisis
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center justify-center">
                    <div className="col-span-1">
                      <label className="font-semibold text-sm md:text-base mb-1 block">
                        Margin Of Safety (MOS)
                      </label>
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <input
                          type="text"
                          value={formatNumber(marginOfSafety)}
                          readOnly
                          className="w-full border-0 p-2 rounded-md cursor-not-allowed bg-orange-100"
                        />
                        <span className="p-2 bg-orange-200">%</span>
                      </div>
                    </div>

                    <div className="col-span-1">
                      <label className="font-semibold text-sm md:text-base mb-1 block">
                        R/C Ratio
                      </label>
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <input
                          type="text"
                          value={rcRatio.toFixed(2)}
                          readOnly
                          className="w-full border-0 p-2 rounded-md cursor-not-allowed bg-orange-100"
                        />
                      </div>
                    </div>

                    <div className="col-span-1">
                      <label className="font-semibold text-sm md:text-base mb-1 block">
                        BEP Harga
                      </label>
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <span className="p-2 bg-orange-200">Rp.</span>
                        <input
                          type="text"
                          value={formatNumber(bepHarga)}
                          readOnly
                          className="w-full border-0 p-2 rounded-md cursor-not-allowed bg-orange-100"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 items-center justify-center">
                    <div className="col-span-1">
                      <label className="font-semibold text-sm md:text-base mb-1 block">
                        BEP Unit
                      </label>
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <input
                          type="text"
                          value={formatNumber(bepHasil)}
                          readOnly
                          className="w-full border-0 p-2 rounded-md cursor-not-allowed bg-orange-100"
                        />
                        <span className="p-2 bg-orange-200">Ekor</span>
                      </div>
                    </div>
                    <div className="col-span-1">
                      <label className="font-semibold text-sm md:text-base mb-1 block">
                        Laba
                      </label>
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <span className="p-2 bg-orange-200">Rp.</span>
                        <input
                          type="text"
                          value={formatNumber(laba)}
                          readOnly
                          className="w-full border-0 p-2 rounded-md cursor-not-allowed bg-orange-100"
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
      </Suspense>
    </div>
  );
};

export default PenetasanPage;
