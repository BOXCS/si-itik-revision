"use client";

import { SidebarDemo } from "@/components/Sidebar";
import React, { Suspense, useEffect, useState } from "react";
import "@/app/analisis.css";
import HorizontalTimeline from "@/components/HorizontalTimeline";
import { useToast } from "@/hooks/use-toast";
import {
  doc,
  addDoc,
  collection,
  DocumentReference,
  Timestamp,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { useUser } from "@/app/context/UserContext";
import { IconX } from "@tabler/icons-react";

// interface TabSelectionProps

const LayerPage = () => {
  const initialPeriods = JSON.parse(
    (typeof window !== "undefined" && localStorage.getItem("layer_periods")) ||
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

  const [currentForm, setCurrentForm] = useState("Penerimaan");

  // States untuk Penerimaan form
  const [jumlahTelurDihasilkan, setJumlahTelurDihasilkan] = useState<number>(0);
  const [jumlahItikAwal, setJumlahItikAwal] = useState<number>(0);
  const [persentase, setPersentase] = useState<number>(0);
  const [persentaseBertelur, setPersentaseBertelur] = useState<number>(0);
  const [produksiTelurHarian, setProduksiTelurHarian] = useState<number>(0);
  const [satuPeriode, setSatuPeriode] = useState<number>(0);
  const [jumlahSatuPeriode, setJumlahSatuPeriode] = useState<number>(0);
  const [hargaTelur, setHargaTelur] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);

  const [jumlahTelurMenetas, setJumlahTelurMenetas] = useState<number>(0);

  // States untuk Pengeluaran form
  const [sewaKandang, setSewaKandang] = useState<number>(0);
  const [penyusutanItik, setPenyusutanItik] = useState<number>(0);
  const [totalBiaya, setTotalBiaya] = useState<number>(0);
  const [jumlahHari, setJumlahHari] = useState(0);
  const [totalFixedCost, setTotalFixedCost] = useState<number>(0);

  const [biayaTenagaKerja, setBiayaTenagaKerja] = useState<number>(0);
  const [biayaListrik, setBiayaListrik] = useState<number>(0);
  const [biayaOvk, setBiayaOvk] = useState<number>(0);
  const [biayaOperasional, setBiayaOperasional] = useState<number>(0);
  const [totalBiayaOperasional, setTotalBiayaOperasional] = useState<number>(0);

  const [standardPakanGram, setstandardPakanGram] = useState(0);
  // const [jumlahItik, setJumlahItik] = useState(0);
  const [jumlahPakanKilogram, setjumlahPakanKilogram] = useState(0);
  const [totalBiayaPakan, setTotalBiayaPakan] = useState<number>(0);
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
    if (periods.length >= 2) {
      toast({
        title: "Batas Maksimum Tercapai",
        description: "Anda hanya dapat menambahkan hingga 2 periode.",
        variant: "destructive",
      });
      return;
    }

    const newPeriod = `Periode ${periods.length + 1}`;
    const updatedPeriods = [...periods, newPeriod];
    setPeriods(updatedPeriods);
    setSelectedPeriod(newPeriod);
    setPeriode(newPeriod);

    if (typeof window !== "undefined") {
      localStorage.setItem("layer_periods", JSON.stringify(updatedPeriods));
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
      const newPeriod = `Periode 1`;

      const docRef = await addDoc(collection(firestore, "detail_layer"), {
        userId: user.email || user.username,
        created_at: Timestamp.now(),
      });

      setNewAnalysisDocRef(docRef); // Simpan referensi dokumen
      localStorage.setItem("activeDocRef", docRef.id); // Simpan ID dokumen ke localStorage
      setIsNewAnalysis(true);

      setIsNewAnalysis(true);

      setPeriode(newPeriod);
      setSelectedPeriod(newPeriod);

      setPeriods([newPeriod]);

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
      const periodeData = {
        periode: selectedPeriod,
        penerimaan: {
          jumlahTelurDihasilkan,
          jumlahItikAwal,
          persentase: persentase.toFixed(2),
          persentaseBertelur,
          produksiTelurHarian,
          satuPeriode,
          jumlahSatuPeriode,
          hargaTelur,
        },
        pengeluaran: {
          sewaKandang,
          penyusutanItik,
          totalBiaya,
          jumlahHari,
          totalFixedCost,
          biayaTenagaKerja,
          biayaListrik,
          biayaOvk,
          biayaOperasional,
          totalBiayaOperasional,
          standardPakanGram,
          jumlahItikAwal,
          jumlahPakanKilogram,
          totalBiayaPakan,
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

      // Call setPersentaseBertelur to avoid unused variable warning
      setPersentaseBertelur(persentaseBertelur);
      setSatuPeriode(satuPeriode);
      setJumlahTelurMenetas(jumlahTelurMenetas);
      setJumlahHari(jumlahHari);

      // Jika isNewAnalysis adalah true, simpan ke dokumen baru
      if (newAnalysisDocRef) {
        await addDoc(
          collection(newAnalysisDocRef, "analisis_periode"),
          periodeData
        );
      } else {
        // Buat dokumen baru jika tidak ada referensi sebelumnya
        const docRef = await addDoc(collection(firestore, "detail_layer"), {
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
      localStorage.setItem("layer_periods", JSON.stringify(periods));
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
    // Simpan periode ke local storage khusus untuk layer
    localStorage.setItem("layer_periods", JSON.stringify(periods));
  }, [periods]);

  useEffect(() => {
    const storedDocRef = localStorage.getItem("activeDocRef");
    if (storedDocRef) {
      const docRef = doc(firestore, "detail_layer", storedDocRef);
      setNewAnalysisDocRef(docRef);
    }
  }, []);

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

  // Fungsi untuk format angka ke Rupiah
  const formatNumber = (number: number) => {
    return new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 0, // Menghilangkan desimal
    }).format(number);
  };

  const handleInputChange =
    (setter: React.Dispatch<React.SetStateAction<number>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/[^0-9]/g, ""); // Menghapus karakter non-angka
      setter(value ? parseFloat(value) : 0); // Jika nilai ada, set sebagai angka
    };

  // Rumus Penerimaan
  useEffect(() => {
    if (jumlahTelurDihasilkan > 0 && jumlahItikAwal > 0) {
      setPersentase((jumlahTelurDihasilkan * 100) / jumlahItikAwal);
    } else {
      setPersentase(0);
    }
  }, [jumlahTelurDihasilkan, jumlahItikAwal]);

  useEffect(() => {
    const produksiTelurHarian = jumlahItikAwal * (persentase / 100);
    setProduksiTelurHarian(produksiTelurHarian);
  }, [jumlahItikAwal, persentase]);

  useEffect(() => {
    const jumlahSatuPeriode = produksiTelurHarian * 180;
    setJumlahSatuPeriode(jumlahSatuPeriode);
  }, [produksiTelurHarian]);

  useEffect(() => {
    const total = jumlahSatuPeriode * hargaTelur;
    setTotalRevenue(total); // Hitung total revenue
  }, [jumlahSatuPeriode, hargaTelur]);

  // Rumus Pengeluaran
  useEffect(() => {
    const totalBiaya = sewaKandang + penyusutanItik;
    setTotalBiaya(totalBiaya);
  }, [sewaKandang, penyusutanItik]);

  useEffect(() => {
    const totalFixedCost = totalBiaya * 180;
    setTotalFixedCost(totalFixedCost);
  }, [totalBiaya]);

  useEffect(() => {
    const biayaOperasional = biayaTenagaKerja + biayaListrik + biayaOvk;
    setBiayaOperasional(biayaOperasional);
  }, [biayaTenagaKerja, biayaListrik, biayaOvk]);

  useEffect(() => {
    const totalBiayaOperasional = biayaOperasional * 180;
    setTotalBiayaOperasional(totalBiayaOperasional);
  }, [biayaOperasional]);

  useEffect(() => {
    const jumlahPakanKilogram =
      (standardPakanGram * 180 * jumlahItikAwal) / 1000;
    setjumlahPakanKilogram(jumlahPakanKilogram);
  }, [standardPakanGram, jumlahItikAwal]);

  useEffect(() => {
    const totalBiayaPakan = jumlahPakanKilogram * 180;
    setTotalBiayaPakan(totalBiayaPakan);
  }, [totalBiayaPakan, jumlahPakanKilogram]);

  useEffect(() => {
    const totalVariableCost = totalBiayaOperasional + totalBiayaPakan;
    setTotalVariableCost(totalVariableCost);
  }, [totalBiayaOperasional, totalBiayaPakan]);

  useEffect(() => {
    const totalCost = totalFixedCost + totalVariableCost;
    setTotalCost(totalCost);
  }, [totalCost, totalFixedCost, totalVariableCost]);

  //Rumus Hasil Analisis
  useEffect(() => {
    const bepHasil =
      totalFixedCost / (hargaTelur - totalVariableCost / jumlahSatuPeriode);
    setBepHasil(bepHasil);
  }, [
    totalFixedCost,
    totalVariableCost,
    hargaTelur,
    jumlahSatuPeriode,
  ]);

  useEffect(() => {
    const bepHarga =
      totalFixedCost / (1 - totalVariableCost / totalVariableCost / hargaTelur);
    setBepHarga(bepHarga);
  }, [totalFixedCost, totalVariableCost, hargaTelur]);

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

  const handleToggle = () => {
    setIsOpen(!isOpen); // Mengubah state open/close
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 flex">
      <Suspense fallback={<div>Loading...</div>}>
      {/* Sidebar */}
      <SidebarDemo>
        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center p-10">
          {/* Header */}
          <h1 className="text-3xl font-bold text-black mb-8">Analisis Layer</h1>

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
          <div className="form-container bg-white overflow-scroll p-8 shadow-lg rounded-lg w-full max-w-7xl mr-14">
            <HorizontalTimeline progress={jumlahTelurMenetas > 0 ? 100 : 0} />
            {currentForm === "Penerimaan" && (
              <div>
                <h2 className="text-xl font-extrabold mb-6">Data Penerimaan</h2>
                {/* Penerimaan Form */}
                <div className="flex items-center justify-center">
                  <span className="mx-5 mt-5 flex items-center justify-center font-semibold text-2xl">
                    (
                  </span>
                  <div className="flex flex-col">
                    <label className="font-semibold">
                      Jumlah Telur yang Dihasilkan
                    </label>
                    <input
                      type="number"
                      value={formatNumber(jumlahTelurDihasilkan)}
                      onChange={(e) =>
                        setJumlahTelurDihasilkan(parseFloat(e.target.value))
                      }
                      className="border border-gray-300 p-2 rounded-md"
                    />
                  </div>
                  <span className="mx-5 mt-5 flex items-center justify-center font-semibold text-2xl">
                    /
                  </span>
                  <div className="flex flex-col">
                    <label className="font-semibold">
                      Jumlah Itik Awal (Ekor)
                    </label>
                    <input
                      type="number"
                      value={formatNumber(jumlahItikAwal)}
                      onChange={(e) =>
                        setJumlahItikAwal(parseFloat(e.target.value))
                      }
                      className="border border-gray-300 p-2 rounded-md"
                    />
                  </div>
                  <span className="mx-5 mt-5 flex items-center justify-center font-semibold text-2xl">
                    )
                  </span>
                  <span className="mx-5 flex items-center justify-center font-semibold text-2xl">
                    ×
                  </span>
                  <div className="flex flex-col">
                    <label className="font-semibold">Persentase</label>
                    <input
                      type="text"
                      value={`100%`}
                      readOnly
                      className="border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <span className="mx-5 flex items-center justify-center font-semibold text-2xl">
                    =
                  </span>
                  <div className="flex flex-col">
                    <label className="font-semibold">Persentase Bertelur</label>
                    <input
                      type="text"
                      value={`${persentase.toFixed(0)}%`}
                      readOnly
                      className="border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Perhitungan mencari Jumlah produksi telur harian */}
                <div className="flex items-center mt-10 justify-center">
                  <div className="flex flex-col">
                    <label className="font-semibold">Jumlah Itik</label>
                    <input
                      type="number"
                      value={formatNumber(jumlahItikAwal)}
                      readOnly
                      className="border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <span className="mx-5 flex items-center justify-center font-semibold text-2xl">
                    ×
                  </span>
                  <div className="flex flex-col">
                    <label className="font-semibold">Persentase Bertelur</label>
                    <input
                      type="text"
                      value={`${persentase.toFixed(0)}%`}
                      readOnly
                      className="border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <span className="mx-5 flex items-center justify-center font-semibold text-2xl">
                    =
                  </span>
                  <div className="flex flex-col">
                    <label className="font-semibold">
                      Produksi telur harian
                    </label>
                    <input
                      type="text"
                      value={formatNumber(produksiTelurHarian)}
                      readOnly
                      className="border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Perhitungan mencari Jumlah telur 1 periode */}
                <div className="flex items-center mt-10 justify-center">
                  <div className="flex flex-col">
                    <label className="font-semibold">
                      Produksi telur harian
                    </label>
                    <input
                      type="text"
                      value={formatNumber(produksiTelurHarian)}
                      readOnly
                      className="border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <span className="mx-5 flex items-center justify-center font-semibold text-2xl">
                    ×
                  </span>

                  <div className="flex flex-col">
                    <label className="font-semibold">
                      Satu periode (180 hari)
                    </label>
                    <input
                      type="text"
                      value={`${(180).toFixed()} hari`}
                      readOnly
                      className="border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <span className="mx-5 flex items-center justify-center font-semibold text-2xl">
                    =
                  </span>

                  <div className="flex flex-col">
                    <label className="font-semibold">
                      Jumlah Telur (1 Periode)
                    </label>
                    <input
                      type="text"
                      value={formatNumber(jumlahSatuPeriode)}
                      readOnly
                      className="border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Perhitungan mencari Total Revenue */}
                <div className="flex items-center mt-10 justify-center">
                  <div className="flex flex-col">
                    <label className="font-semibold">
                      Jumlah Telur (1 Periode)
                    </label>
                    <input
                      type="text"
                      value={formatNumber(jumlahSatuPeriode)}
                      readOnly
                      className="border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <span className="mx-5 flex items-center justify-center font-semibold text-2xl">
                    ×
                  </span>
                  <div className="flex flex-col">
                    <label className="font-semibold">Harga Telur</label>
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <span className="p-2 bg-gray-100">Rp.</span>
                      <input
                        type="number"
                        value={hargaTelur ? formatNumber(hargaTelur) : ""} // Gunakan nilai asli tanpa formatNumber
                        onChange={(e) =>
                          setHargaTelur(parseFloat(e.target.value) || 0)
                        } // Tetap terima input sebagai angka
                        onBlur={(e) =>
                          setHargaTelur(
                            parseFloat(e.target.value.replace(/[^0-9]/g, "")) ||
                              0
                          )
                        }
                        className="border-0 p-2 rounded-md flex-1"
                        placeholder="Masukkan harga Telur"
                      />
                    </div>
                  </div>

                  <span className="mx-5 flex items-center justify-center font-semibold text-2xl">
                    =
                  </span>

                  <div className="flex flex-col">
                    <label className="font-semibold">Total Revenue</label>
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <span className="p-2 bg-orange-200">Rp.</span>
                      <input
                        type="text"
                        value={formatNumber(totalRevenue)} // Format saat menampilkan hasil
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
              // </div>
            )}

            {/* Render Pengeluaran Form */}
            {currentForm === "Pengeluaran" && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Data Pengeluaran</h2>
                {/* Bagian Fixed Cost */}
                <div className="flex justify-center">
                  <h3 className="font-extrabold text-3xl mb-4">Fixed Cost</h3>
                </div>
                <div className="flex items-center justify-center">
                  <div className="flex flex-col">
                    <label className="font-semibold">Sewa Kandang</label>
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <span className="p-2 bg-gray-100">Rp.</span>
                      <input
                        type="text"
                        value={sewaKandang ? formatNumber(sewaKandang) : ""} // Format angka saat render
                        onChange={handleInputChange(setSewaKandang)} // Panggil setter dinamis
                        onBlur={(e) =>
                          setSewaKandang(
                            parseFloat(e.target.value.replace(/[^0-9]/g, "")) ||
                              0
                          )
                        } // Set angka mentah saat blur
                        className="border border-gray-300 p-2 rounded-md"
                        placeholder="Masukkan harga sewa kandang"
                      />
                    </div>
                  </div>
                  <span className="mx-5 mt-5 flex items-center justify-center font-semibold text-2xl">
                    +
                  </span>

                  <div className="flex flex-col">
                    <label className="font-semibold">Penyusutan Itik</label>
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <span className="p-2 bg-gray-100">Rp.</span>
                      <input
                        type="number"
                        value={
                          penyusutanItik ? formatNumber(penyusutanItik) : ""
                        } // Format angka saat render
                        onChange={handleInputChange(setPenyusutanItik)} // Panggil setter dinamis
                        onBlur={(e) =>
                          setPenyusutanItik(
                            parseFloat(e.target.value.replace(/[^0-9]/g, "")) ||
                              0
                          )
                        } // Set angka mentah saat blur
                        className="border border-gray-300 p-2 rounded-md"
                        placeholder="Masukkan jumlah penyusutan itik"
                      />
                    </div>
                  </div>
                  <span className="mx-5 flex items-center justify-center font-semibold text-2xl">
                    =
                  </span>
                  <div className="flex flex-col">
                    <label className="font-semibold">Total Biaya</label>
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <span className="p-2 bg-gray-100">Rp.</span>
                      <input
                        type="number"
                        value={formatNumber(totalBiaya)}
                        readOnly
                        className="border-0 p-2 rounded-md flex-1 cursor-not-allowed bg-gray-100" // border-0 untuk menghapus border input
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-center mt-10">
                    <div className="flex flex-col">
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
                    <span className="mx-5 flex items-center justify-center font-semibold text-2xl">
                      ×
                    </span>
                    <div className="flex flex-col">
                      <label className="font-semibold">Jumlah hari</label>
                      <input
                        type="text"
                        value={"180 Hari"}
                        readOnly
                        className="border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                    <span className="mx-5 flex items-center justify-center font-semibold text-2xl">
                      =
                    </span>
                    <div className="flex flex-col">
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
                <div className="flex justify-center">
                  <h3 className="font-extrabold text-3xl mb-4 mt-10">
                    Jumlah Biaya Operasional
                  </h3>
                </div>
                <div>
                  <div className="flex items-center justify-center">
                    <div className="flex flex-col">
                      <label className="font-semibold">
                        Biaya Tenaga Kerja
                      </label>
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <span className="p-2 bg-gray-100">Rp.</span>
                        <input
                          type="number"
                          value={
                            biayaTenagaKerja
                              ? formatNumber(biayaTenagaKerja)
                              : ""
                          } // Format angka saat render
                          onChange={handleInputChange(setBiayaTenagaKerja)} // Panggil setter dinamis
                          onBlur={(e) =>
                            setBiayaTenagaKerja(
                              parseFloat(
                                e.target.value.replace(/[^0-9]/g, "")
                              ) || 0
                            )
                          } // Set angka mentah saat blur
                          className="border border-gray-300 p-2 rounded-md"
                          placeholder="Masukkan biaya tenaga kerja"
                        />
                      </div>
                    </div>
                    <span className="mx-5 flex items-center justify-center font-semibold text-2xl">
                      +
                    </span>
                    <div className="flex flex-col">
                      <label className="font-semibold">Biaya Listrik</label>
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <span className="p-2 bg-gray-100">Rp.</span>
                        <input
                          type="number"
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
                    <span className="mx-5 flex items-center justify-center font-semibold text-2xl">
                      +
                    </span>
                    <div className="flex flex-col">
                      <label className="font-semibold">Biaya OVK</label>
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <span className="p-2 bg-gray-100">Rp.</span>
                        <input
                          type="number"
                          value={biayaOvk ? formatNumber(biayaOvk) : ""} // Format angka saat render
                          onChange={handleInputChange(setBiayaOvk)} // Panggil setter dinamis
                          onBlur={(e) =>
                            setBiayaOvk(
                              parseFloat(
                                e.target.value.replace(/[^0-9]/g, "")
                              ) || 0
                            )
                          } // Set angka mentah saat blur
                          className="border border-gray-300 p-2 rounded-md"
                          placeholder="Masukkan Biaya OVK"
                        />
                      </div>
                    </div>
                    <span className="mx-5 flex items-center justify-center font-semibold text-2xl">
                      =
                    </span>
                    <div className="flex flex-col">
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
                  <div className="flex items-center justify-center mt-10">
                    <div className="flex flex-col">
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
                    <span className="mx-5 flex items-center justify-center font-semibold text-2xl">
                      ×
                    </span>
                    <div className="flex flex-col">
                      <label className="font-semibold">Jumlah hari</label>
                      <input
                        type="text"
                        value={"180 Hari"}
                        readOnly
                        className="border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                    <span className="mx-5 flex items-center justify-center font-semibold text-2xl">
                      =
                    </span>
                    <div className="flex flex-col">
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

                {/* Bagian jumlah Pembelian pakan */}
                <div className="flex justify-center">
                  <h3 className="font-extrabold text-3xl mb-4 mt-10">
                    Jumlah Pembelian pakan
                  </h3>
                </div>
                <div>
                  <div className="flex items-center justify-center">
                    <div className="flex flex-col">
                      <label className="font-semibold">
                        Standart pakan (Gram)
                      </label>
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <span className="p-0 bg-gray-100"></span>
                        <input
                          type="number"
                          value={
                            standardPakanGram
                              ? formatNumber(standardPakanGram)
                              : ""
                          }
                          onChange={handleInputChange(setstandardPakanGram)}
                          onBlur={(e) =>
                            setstandardPakanGram(
                              parseFloat(
                                e.target.value.replace(/[^0-9]/g, "")
                              ) || 0
                            )
                          }
                          className="border border-gray-300 p-2 rounded-md"
                          placeholder="Masukkan jumlah Standart Pakan"
                        />
                      </div>
                    </div>
                    <span className="mx-5 flex items-center justify-center font-semibold text-2xl">
                      ×
                    </span>
                    <div className="flex flex-col">
                      <label className="font-semibold">Jumlah hari</label>
                      <input
                        type="text"
                        value={"180 Hari"}
                        readOnly
                        className="border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                    <span className="mx-5 flex items-center justify-center font-semibold text-2xl">
                      ×
                    </span>
                    {/* <div className="flex items-center mt-8 justify-center"> */}
                    <div className="flex flex-col">
                      <label className="font-semibold">Jumlah Itik</label>
                      <input
                        type="number"
                        value={formatNumber(jumlahItikAwal)}
                        readOnly
                        className="border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                    {/* </div> */}
                    <span className="mx-5 flex items-center justify-center font-semibold text-2xl">
                      =
                    </span>
                    <div className="flex flex-col">
                      <label className="font-semibold">
                        Jumlah pakan (Kilogram)
                      </label>
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <span className="p-0 bg-gray-100"></span>
                        <input
                          type="text"
                          value={formatNumber(jumlahPakanKilogram)}
                          readOnly
                          className="border-0 p-2 rounded-md flex-1 cursor-not-allowed bg-gray-100"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center mt-10">
                    <div className="flex flex-col">
                      <label className="font-semibold">
                        Jumlah Pakan (Kilogram)
                      </label>
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <span className="p-0 bg-gray-100"></span>
                        <input
                          type="text"
                          value={formatNumber(jumlahPakanKilogram)}
                          readOnly
                          className="border-0 p-2 rounded-md flex-1 cursor-not-allowed bg-gray-100" // border-0 untuk menghapus border input
                        />
                      </div>
                    </div>
                    <span className="mx-5 flex items-center justify-center font-semibold text-2xl">
                      ×
                    </span>
                    <div className="flex flex-col">
                      <label className="font-semibold">Jumlah hari</label>
                      <input
                        type="text"
                        value={"180 Hari"}
                        readOnly
                        className="border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                    <span className="mx-5 flex items-center justify-center font-semibold text-2xl">
                      =
                    </span>
                    <div className="flex flex-col">
                      <label className="font-semibold">Total Biaya Pakan</label>
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <span className="p-2 bg-gray-100">Rp.</span>
                        <input
                          type="text"
                          value={formatNumber(totalBiayaPakan)}
                          readOnly
                          className="border-0 p-2 rounded-md flex-1 cursor-not-allowed bg-gray-100" // border-0 untuk menghapus border input
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center mt-10">
                    <div className="flex flex-col">
                      <label className="font-semibold">
                        Total biaya Operasional
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
                    <span className="mx-5 flex items-center justify-center font-semibold text-2xl">
                      ×
                    </span>
                    <div className="flex flex-col">
                      <label className="font-semibold">Total Biaya Pakan</label>
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <span className="p-2 bg-gray-100">Rp.</span>
                        <input
                          type="text"
                          value={formatNumber(totalBiayaPakan)}
                          readOnly
                          className="border-0 p-2 rounded-md flex-1 cursor-not-allowed bg-gray-100" // border-0 untuk menghapus border input
                        />
                      </div>
                    </div>
                    <span className="mx-5 flex items-center justify-center font-semibold text-2xl">
                      =
                    </span>
                    <div className="flex flex-col">
                      <label className="font-semibold">
                        Total Variable Cost
                      </label>
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
                </div>
                {/* Bagian jumlah Total Cost */}
                <div className="flex justify-center">
                  <h3 className="font-extrabold text-3xl mb-4 mt-10">
                    Total Cost
                  </h3>
                </div>
                {/* masih sampe sini */}
                <div className="flex items-center justify-center mt-2">
                  <div className="flex flex-col">
                    <label className="font-semibold">Total fixed Cost</label>
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
                  <span className="mx-5 flex items-center justify-center font-semibold text-2xl">
                    +
                  </span>
                  <div className="flex flex-col">
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
                  <span className="mx-5 flex items-center justify-center font-semibold text-2xl">
                    =
                  </span>
                  <div className="flex flex-col">
                    <label className="font-semibold">Total Cost</label>
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <span className="p-2 bg-gray-100">Rp.</span>
                      <input
                        type="text"
                        value={formatNumber(totalCost)}
                        readOnly
                        className="border-0 p-2 rounded-md flex-1 cursor-not-allowed bg-gray-100" // border-0 untuk menghapus border input
                      />
                    </div>
                  </div>
                </div>
                <div></div>
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
                      Margin Of Safety(MOS)
                    </label>
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <span className="p-2 bg-orange-200">Rp.</span>
                      <input
                        type="text"
                        value={formatNumber(marginOfSafety)}
                        // readOnly
                        className="border-0 p-2 rounded-md flex-1 bg-orange-100" // border-0 untuk menghapus border input
                      />
                    </div>
                  </div>
                  <div className="flex flex-col mx-5">
                    <label className="font-semibold">R/C Ratio</label>
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <input
                        type="text"
                        value={formatNumber(rcRatio)}
                        // readOnly
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
                        // readOnly
                        className="border-0 p-2 rounded-md flex-1 bg-orange-100" // border-0 untuk menghapus border input
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center mt-10">
                  <div className="flex flex-col mx-5">
                    <label className="font-semibold">BEP Unit</label>
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <span className="p-2 bg-orange-200">Telur</span>
                      <input
                        type="text"
                        value={formatNumber(bepHasil)}
                        // readOnly
                        className="border-0 p-2 rounded-md flex-1 bg-orange-100" // border-0 untuk menghapus border input
                      />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <label className="font-semibold">Laba</label>
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <span className="p-2 bg-orange-200">Rp.</span>
                      <input
                        type="text"
                        value={formatNumber(laba)}
                        // readOnly
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
      </Suspense>
    </div>
  );
};

export default LayerPage;
