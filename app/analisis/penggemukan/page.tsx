"use client";

import { SidebarDemo } from "@/components/Sidebar";
import React, { useEffect, useState } from "react";
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

// interface TabSelectionProps

const PenggemukanPage = () => {
  const initialPeriods = JSON.parse(
    (typeof window !== "undefined" && localStorage.getItem("penggemukan_periods")) ||
      '["Periode 1"]'
  );

  const { toast } = useToast();
  const [periods, setPeriods] = useState(initialPeriods);
  const [selectedPeriod, setSelectedPeriod] = useState(periods[0]);
  const [periode, setPeriode] = useState(periods[0]);
  const { user } = useUser(); // Pindahkan di sini
  const [disabledPeriods, setDisabledPeriods] = useState<string[]>([]);

  // Tambahkan state untuk mengatur status analisis baru
  const [isNewAnalysis, setIsNewAnalysis] = useState(false);
  const [newAnalysisDocRef, setNewAnalysisDocRef] =
    useState<DocumentReference | null>(null);

  const [currentForm, setCurrentForm] = useState("Penerimaan");

  // States untuk Penerimaan Form
  const [jumlahItikMati, setJumlahItikMati] = useState<number>(0);
  const [jumlahItikAwal, setJumlahItikAwal] = useState<number>(0);
  const [persentase, setPersentase] = useState<number>(0);
  const [persentaseMortalitas, setPersentaseMortalitas] = useState<number>(0);
  const [jumlahItikSetelahMortalitas, setJumlahItikSetelahMortalitas] =
    useState<number>(0);
  const [hargaItik, setHargaItik] = useState<number>(0);
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
  const [standardPakan, setStandardPakan] = useState<number>(0);
  const [jumlahPakan, setJumlahPakan] = useState<number>(0);
  const [hargaPakan, setHargaPakan] = useState<number>(0);
  const [totalHargaPakan, setTotalHargaPakan] = useState<number>(0);
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
    if (periods.length >= 6) {
      toast({
        title: "Batas Maksimum Tercapai",
        description: "Anda hanya dapat menambahkan hingga 6 periode.",
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
      localStorage.setItem("penggemukan_periods", JSON.stringify(updatedPeriods));
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

      const docRef = await addDoc(collection(firestore, "detail_penggemukan"), {
        userId: user.email || user.username,
        created_at: Timestamp.now(),
      });
  
      setNewAnalysisDocRef(docRef); // Simpan referensi dokumen
      localStorage.setItem("activeDocRef", docRef.id); // Simpan ID dokumen ke localStorage
      setIsNewAnalysis(true);
  
      // Atur periode kembali ke "Periode 1"
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
      // Siapkan data untuk periode
      const periodeData = {
        periode: selectedPeriod,
        penerimaan: {
          jumlahItikMati,
          jumlahItikAwal,
          persentase,
          persentaseMortalitas,
          jumlahItikSetelahMortalitas,
          hargaItik,
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
          standardPakan,
          jumlahPakan,
          hargaPakan,
          totalHargaPakan,
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
      
      // Call setPersentase to avoid unused variable warning
      setPersentase(persentase);

      // Jika isNewAnalysis adalah true, simpan ke dokumen baru
      if (newAnalysisDocRef) {
        await addDoc(
          collection(newAnalysisDocRef, "analisis_periode"),
          periodeData
        );
      } else {
        // Buat dokumen baru jika tidak ada referensi sebelumnya
        const docRef = await addDoc(
          collection(firestore, "detail_penggemukan"),
          {
            userId: user.email || user.username,
            created_at: Timestamp.now(),
          }
        );

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
      localStorage.setItem("penggemukan_periods", JSON.stringify(periods));
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
    // Simpan periode ke local storage khusus untuk penggemukan
    localStorage.setItem("penggemukan_periods", JSON.stringify(periods));
  }, [periods]);

  useEffect(() => {
    const storedDocRef = localStorage.getItem("activeDocRef");
    if (storedDocRef) {
      const docRef = doc(firestore, "detail_penggemukan", storedDocRef);
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
      maximumFractionDigits: 0, // Pastikan tidak ada desimal
    }).format(number);
  };

  const handleInputChange =
    (setter: React.Dispatch<React.SetStateAction<number>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/[^0-9]/g, ""); // Menghapus karakter non-angka
      setter(value ? parseFloat(value) : 0); // Jika nilai ada, set sebagai angka
    };

    useEffect(() => {
      // Simpan periode ke local storage khusus untuk penggemukan
      localStorage.setItem("penggemukan_periods", JSON.stringify(periods));
    }, [periods]);

  // Rumus Penerimaan
  useEffect(() => {
    const persentaseMortalitas = (jumlahItikMati / jumlahItikAwal) * 100;
    setPersentaseMortalitas(persentaseMortalitas);
  }, [jumlahItikMati, jumlahItikAwal]);

  useEffect(() => {
    const jumlahItikSetelahMortalitas =
      jumlahItikAwal * (1 - persentaseMortalitas / 100);
    setJumlahItikSetelahMortalitas(jumlahItikSetelahMortalitas);
  }, [jumlahItikAwal, persentaseMortalitas]);

  useEffect(() => {
    const totalRevenue = jumlahItikSetelahMortalitas * hargaItik;
    setTotalRevenue(totalRevenue);
  }, [jumlahItikSetelahMortalitas, hargaItik]);

  // Rumus Pengeluaran
  useEffect(() => {
    const totalBiaya = sewaKandang + penyusutanPeralatan;
    setTotalBiaya(totalBiaya);
  }, [sewaKandang, penyusutanPeralatan]);

  useEffect(() => {
    const totalFixedCost = totalBiaya * 60;
    setTotalFixedCost(totalFixedCost);
  }, [totalBiaya]);

  useEffect(() => {
    const biayaOperasional = biayaTenagaKerja + biayaListrik + biayaOvk;
    setBiayaOperasional(biayaOperasional);
  }, [biayaTenagaKerja, biayaListrik, biayaOvk]);

  useEffect(() => {
    const totalBiayaOperasional = biayaOperasional * 60;
    setTotalBiayaOperasional(totalBiayaOperasional);
  }, [biayaOperasional]);

  useEffect(() => {
    const jumlahPakan =
      (standardPakan * 60 * jumlahItikSetelahMortalitas) / 1000;
    setJumlahPakan(jumlahPakan);
  }, [standardPakan, jumlahItikSetelahMortalitas]);

  useEffect(() => {
    const totalHargaPakan = jumlahPakan * hargaPakan;
    setTotalHargaPakan(totalHargaPakan);
  }, [jumlahPakan, hargaPakan]);

  useEffect(() => {
    const totalVariableCost = totalBiayaOperasional + totalHargaPakan;
    setTotalVariableCost(totalVariableCost);
  }, [totalBiayaOperasional, totalHargaPakan]);

  useEffect(() => {
    const totalCost = totalVariableCost + totalFixedCost;
    setTotalCost(totalCost);
  }, [totalVariableCost, totalFixedCost]);

  // Rumus Hasil Analisis
  useEffect(() => {
    const bepHasil =
      totalFixedCost /
      (hargaItik - totalVariableCost / jumlahItikSetelahMortalitas);
    setBepHasil(bepHasil);
  }, [totalFixedCost, hargaItik, totalVariableCost, jumlahItikSetelahMortalitas]);

  useEffect(() => {
    const bepHarga =
      totalFixedCost /
      (1 - totalVariableCost / jumlahItikSetelahMortalitas / hargaItik);
    setBepHarga(bepHarga);
  }, [
    totalFixedCost,
    totalVariableCost,
    jumlahItikSetelahMortalitas,
    hargaItik,
  ]);

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

  return (
    <div className="w-full min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <SidebarDemo>
        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center p-10">
          {/* Header */}
          <h1 className="text-3xl font-bold text-black mb-8">
            Analisis Penggemukan
          </h1>

          {/* TabSelection */}
          <div className="flex flex-col items-center mb-10">
            <div className="flex justify-center space-x-4 mb-4">
              {periods.map((period: string, index: number) => (
                <button
                  key={index}
                  onClick={() => {
                    if (!disabledPeriods.includes(period)) {
                      setPeriode(period);
                      setSelectedPeriod(period);
                    }
                  }}
                  className={`px-4 py-2 rounded-full text-black ${
                    selectedPeriod === period
                      ? "bg-orange-500"
                      : disabledPeriods.includes(period)
                      ? "bg-gray-400 cursor-not-allowed"
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

          {/* Kotainer Form */}
          <div className="form-container bg-white overflow-scroll p-8 shadow-lg rounded-lg w-full max-w-7xl mr-14">
            <HorizontalTimeline progress={jumlahItikMati > 0 ? 100 : 0} />
            {currentForm === "Penerimaan" && (
              <div>
                <h2 className="text-xl font-extrabold mb-6">Data Penerimaan</h2>

                {/* Penerimaan Form */}
                <div className="flex items-center justify-center">
                  <span className="mx-5 mt-5 flex items-center justify-center font-semibold text-2xl">
                    (
                  </span>
                  <div className="flex flex-col">
                    <label className="font-semibold">Jumlah Itik Mati</label>
                    <input
                      type="number"
                      value={jumlahItikMati}
                      onChange={(e) =>
                        setJumlahItikMati(parseFloat(e.target.value))
                      }
                      className="border border-gray-300 p-2 rounded-md"
                    />
                  </div>
                  <span className="mx-5 mt-5 flex items-center justify-center font-semibold text-2xl">
                    /
                  </span>
                  <div className="flex flex-col">
                    <label className="font-semibold">Jumlah Itik Awal</label>
                    <input
                      type="number"
                      value={jumlahItikAwal}
                      onChange={(e) =>
                        setJumlahItikAwal(parseFloat(e.target.value))
                      }
                      className="border border-gray-300 p-2 rounded-md"
                    />
                  </div>
                  <span className="mx-5 mt-5 flex items-center justify-center font-semibold text-2xl">
                    )
                  </span>
                  <span className="mx-5 mt-5 flex items-center justify-center font-semibold text-2xl">
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
                  <span className="mx-5 mt-5 flex items-center justify-center font-semibold text-2xl">
                    =
                  </span>
                  <div className="flex flex-col">
                    <label className="font-semibold">
                      Persentase Mortalitas
                    </label>
                    <input
                      type="text"
                      value={`${persentaseMortalitas.toFixed(0)}%`}
                      readOnly
                      className="border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-center mt-10">
                  <div className="flex flex-col">
                    <label className="font-semibold">Jumlah Itik Awal</label>
                    <input
                      type="number"
                      value={jumlahItikAwal}
                      readOnly
                      className="border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <span className="mx-5 mt-5 flex items-center justify-center font-semibold text-2xl">
                    ×
                  </span>
                  <span className="mx-5 mt-5 flex items-center justify-center font-semibold text-2xl">
                    (
                  </span>
                  <div className="flex flex-col">
                    <label className="font-semibold">Persentase</label>
                    <input
                      type="text"
                      value={`1`}
                      readOnly
                      className="border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <span className="mx-5 mt-5 flex items-center justify-center font-semibold text-2xl">
                    -
                  </span>
                  <div className="flex flex-col">
                    <label className="font-semibold">
                      Persentase Mortalitas
                    </label>
                    <input
                      type="text"
                      value={`${persentaseMortalitas.toFixed(0)}%`}
                      readOnly
                      className="border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <span className="mx-5 mt-5 flex items-center justify-center font-semibold text-2xl">
                    )
                  </span>
                  <span className="mx-5 mt-5 flex items-center justify-center font-semibold text-2xl">
                    =
                  </span>
                  <div className="flex flex-col">
                    <label className="font-semibold">
                      Jumlah Itik (Setelah Mortalitas)
                    </label>
                    <input
                      type="text"
                      value={jumlahItikSetelahMortalitas.toFixed(0)}
                      readOnly
                      className="border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-center mt-10">
                  <div className="flex flex-col">
                    <label className="font-semibold">
                      Jumlah Itik (Setelah Mortalitas)
                    </label>
                    <input
                      type="text"
                      value={jumlahItikSetelahMortalitas.toFixed(0)}
                      readOnly
                      className="border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <span className="mx-5 mt-5 flex items-center justify-center font-semibold text-2xl">
                    ×
                  </span>
                  <div className="flex flex-col">
                    <label className="font-semibold">Harga Itik</label>
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <span className="p-2 bg-gray-100">Rp.</span>
                      <input
                        type="text" // Mengubah ke 'text' agar bisa memasukkan angka yang diformat
                        value={formatNumber(hargaItik)} // Tetap tampilkan angka terformat
                        onChange={handleInputChange(setHargaItik)} // Tangani perubahan input
                        onBlur={(e) =>
                          setHargaItik(
                            parseFloat(e.target.value.replace(/[^0-9]/g, ""))
                          )
                        } // Mengembalikan angka asli saat blur
                        className="border-0 p-2 rounded-md flex-1"
                        placeholder="Masukkan harga DOD"
                      />
                    </div>
                  </div>
                  <span className="mx-5 mt-5 flex items-center justify-center font-semibold text-2xl">
                    =
                  </span>
                  <div className="flex flex-col">
                    <label className="font-semibold">Total Revenue</label>
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <span className="p-2 bg-orange-200">Rp.</span>
                      <input
                        type="text"
                        value={formatNumber(totalRevenue)} // Memformat total revenue
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
              <div>
                <h2 className="text-xl font-semibold mb-6">Data Pengeluaran</h2>
                {/* Bagian Fixed Cost */}
                <div className="flex justify-center">
                  <h3 className="font-extrabold text-sm mb-4 md:text-3xl">
                    Fixed Cost
                  </h3>
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
                    <label className="font-semibold">
                      Penyusutan Peralatan
                    </label>
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <span className="p-2 bg-gray-100">Rp.</span>
                      <input
                        type="text"
                        value={
                          penyusutanPeralatan
                            ? formatNumber(penyusutanPeralatan)
                            : ""
                        }
                        onChange={handleInputChange(setPenyusutanPeralatan)}
                        onBlur={(e) =>
                          setPenyusutanPeralatan(
                            parseFloat(e.target.value.replace(/[^0-9]/g, "")) ||
                              0
                          )
                        }
                        className="border border-gray-300 p-2 rounded-md"
                        placeholder="Masukkan Penyusutan Peralatan"
                      />
                    </div>
                  </div>
                  <span className="mx-5 mt-5 flex items-center justify-center font-semibold text-2xl">
                    =
                  </span>
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
                    <span className="mx-5 mt-5 flex items-center justify-center font-semibold text-2xl">
                      ×
                    </span>
                    <div className="flex flex-col">
                      <label className="font-semibold">Jumlah hari</label>
                      <input
                        type="text"
                        value={"60 Hari"}
                        readOnly
                        className="border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                    <span className="mx-5 mt-5 flex items-center justify-center font-semibold text-2xl">
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
                    <span className="mx-5 mt-5 flex items-center justify-center font-semibold text-2xl">
                      +
                    </span>
                    <div className="flex flex-col">
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
                    <span className="mx-5 mt-5 flex items-center justify-center font-semibold text-2xl">
                      +
                    </span>
                    <div className="flex flex-col">
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
                    <span className="mx-5 mt-5 flex items-center justify-center font-semibold text-2xl">
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
                    <span className="mx-5 mt-5 flex items-center justify-center font-semibold text-2xl">
                      ×
                    </span>
                    <div className="flex flex-col">
                      <label className="font-semibold">Jumlah hari</label>
                      <input
                        type="text"
                        value={"60 Hari"}
                        readOnly
                        className="border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                    <span className="mx-5 mt-5 flex items-center justify-center font-semibold text-2xl">
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
                {/* Bagian Jumlah Pembelian Telur */}
                <div className="flex justify-center mt-10">
                  <h3 className="font-extrabold text-3xl mb-4">
                    Jumlah Pembelian Pakan
                  </h3>
                </div>
                <div>
                  <div className="flex items-center justify-center">
                    <div className="flex flex-col">
                      <label className="font-semibold">Standard Pakan</label>
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <input
                          type="text" // Mengubah ke 'text' agar bisa memasukkan angka yang diformat
                          value={formatNumber(standardPakan)} // Tetap tampilkan angka terformat
                          onChange={handleInputChange(setStandardPakan)} // Tangani perubahan input
                          onBlur={(e) =>
                            setStandardPakan(
                              parseFloat(e.target.value.replace(/[^0-9]/g, ""))
                            )
                          } // Mengembalikan angka asli saat blur
                          className="border-0 p-2 rounded-md flex-1"
                          placeholder="Masukkan dalam Gram"
                        />
                        <span className="p-2 bg-gray-100">Gram</span>
                      </div>
                    </div>
                    <span className="mx-5 mt-5 flex items-center justify-center font-semibold text-2xl">
                      ×
                    </span>
                    <div className="flex flex-col">
                      <label className="font-semibold">Jumlah hari</label>
                      <input
                        type="text"
                        value={"60 Hari"}
                        readOnly
                        className="border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                    <span className="mx-5 mt-5 flex items-center justify-center font-semibold text-2xl">
                      ×
                    </span>
                    <div className="flex flex-col">
                      <label className="font-semibold">Jumlah Itik</label>
                      <input
                        type="text"
                        value={formatNumber(jumlahItikSetelahMortalitas)}
                        readOnly
                        className="border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                    <span className="mx-5 mt-5 flex items-center justify-center font-semibold text-2xl">
                      =
                    </span>
                    <div className="flex flex-col">
                      <label className="font-semibold">jumlah Pakan</label>
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <input
                          type="text"
                          value={formatNumber(jumlahPakan)}
                          readOnly
                          className="border-0 p-2 rounded-md flex-1 cursor-not-allowed bg-gray-100" // border-0 untuk menghapus border input
                        />
                        <span className="p-2 bg-gray-100">Kg</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center mt-10">
                    <div className="flex flex-col">
                      <label className="font-semibold">jumlah Pakan</label>
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <input
                          type="text"
                          value={formatNumber(jumlahPakan)}
                          readOnly
                          className="border-0 p-2 rounded-md flex-1 cursor-not-allowed bg-gray-100" // border-0 untuk menghapus border input
                        />
                        <span className="p-2 bg-gray-100">Kg</span>
                      </div>
                    </div>
                    <span className="mx-5 mt-5 flex items-center justify-center font-semibold text-2xl">
                      ×
                    </span>
                    <div className="flex flex-col">
                      <label className="font-semibold">
                        Harga Pakan Per Kg
                      </label>
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <span className="p-2 bg-gray-100">Rp.</span>
                        <input
                          type="text"
                          value={hargaPakan ? formatNumber(hargaPakan) : ""}
                          onChange={handleInputChange(setHargaPakan)}
                          onBlur={(e) =>
                            setHargaPakan(
                              parseFloat(
                                e.target.value.replace(/[^0-9]/g, "")
                              ) || 0
                            )
                          }
                          className="border border-gray-300 p-2 rounded-md"
                          placeholder="Masukkan Harga Telur"
                        />
                      </div>
                    </div>
                    <span className="mx-5 mt-5 flex items-center justify-center font-semibold text-2xl">
                      =
                    </span>
                    <div className="flex flex-col">
                      <label className="font-semibold">Total Biaya Pakan</label>
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <span className="p-2 bg-gray-100">Rp.</span>
                        <input
                          type="text"
                          value={formatNumber(totalHargaPakan)}
                          readOnly
                          className="border-0 p-2 rounded-md flex-1 cursor-not-allowed bg-gray-100" // border-0 untuk menghapus border input
                        />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Biaya Variable Cost */}
                <div className="flex justify-center mt-10">
                  <h3 className="font-extrabold text-3xl mb-4">
                    Variable Cost
                  </h3>
                </div>
                <div className="flex items-center justify-center">
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
                  <span className="mx-5 mt-5 flex items-center justify-center font-semibold text-2xl">
                    +
                  </span>
                  <div className="flex flex-col">
                    <label className="font-semibold">Total Biaya Pakan</label>
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <span className="p-2 bg-gray-100">Rp.</span>
                      <input
                        type="text"
                        value={formatNumber(totalHargaPakan)}
                        readOnly
                        className="border-0 p-2 rounded-md flex-1 cursor-not-allowed bg-gray-100" // border-0 untuk menghapus border input
                      />
                    </div>
                  </div>
                  <span className="mx-5 mt-5 flex items-center justify-center font-semibold text-2xl">
                    =
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
                </div>
                {/* Biaya Cost */}
                <div className="flex justify-center mt-10">
                  <h3 className="font-extrabold text-3xl mb-4">
                    Data Pengeluaran
                  </h3>
                </div>
                <div className="flex items-center justify-center">
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
                  <span className="mx-5 mt-5 flex items-center justify-center font-semibold text-2xl">
                    +
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
                  <span className="mx-5 mt-5 flex items-center justify-center font-semibold text-2xl">
                    =
                  </span>
                  <div className="flex flex-col">
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
                        // readOnly
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
                      <input
                        type="text"
                        value={formatNumber(bepHasil)}
                        // readOnly
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
    </div>
  );
};

export default PenggemukanPage;
