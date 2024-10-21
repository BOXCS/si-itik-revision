"use client";

import { SidebarDemo } from "@/components/Sidebar";
import { useUser } from "@/app/context/UserContext";
import React, { useState, useEffect } from "react";
import HorizontalTimeline from "@/components/HorizontalTimeline";
import "@/app/analisis.css";
import { addDoc, collection } from "firebase/firestore";
import { firestore } from "@/lib/firebase";

interface TabSelectionProps {
  setSelectedPeriod: (period: string) => void; // Mengatur tipe untuk setSelectedPeriod
}

const PenetasanPage = () => {
  const periods = [
    "Periode 1",
    "Periode 2",
    "Periode 3",
    "Periode 4",
    "Periode 5",
    "Periode 6",
  ];

  const { user } = useUser(); // Pindahkan di sini
  const [selectedPeriod, setSelectedPeriod] = useState(periods[0]);

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
const [totalFixedCost, setTotalFixedCost] = useState<number>(0);  // Simpan ini hanya sekali
const [biayaTenagaKerja, setBiayaTenagaKerja] = useState<number>(0);
const [biayaListrik, setBiayaListrik] = useState<number>(0);
const [biayaOvk, setBiayaOvk] = useState<number>(0);
const [biayaOperasional, setBiayaOperasional] = useState<number>(0);
const [totalBiayaOperasional, setTotalBiayaOperasional] = useState<number>(0);  // Simpan ini hanya sekali
const [hargaTelur, setHargaTelur] = useState<number>(0);
const [totalBiayaPembelianTelur, setTotalBiayaPembelianTelur] = useState<number>(0);
const [totalVariableCost, setTotalVariableCost] = useState<number>(0);
const [totalCost, setTotalCost] = useState<number>(0);
const [standardPakan, setStandardPakan] = useState(0);
const [jumlahHari, setJumlahHari] = useState(0);
const [jumlahItik, setJumlahItik] = useState(0);
const [hargaPakan, setHargaPakan] = useState(0);


  // const [sewaKandang, setSewaKandang] = useState<number>(0);
  // const [penyusutanPeralatan, setPenyusutanPeralatan] = useState<number>(0);
  // const [totalBiaya, setTotalBiaya] = useState<number>(0);
  // const [totalFixedCost, setTotalFixedCost] = useState<number>(0);
  // const [biayaTenagaKerja, setBiayaTenagaKerja] = useState<number>(0);
  // const [biayaListrik, setBiayaListrik] = useState<number>(0);
  // const [biayaOvk, setBiayaOvk] = useState<number>(0);
  // const [biayaOperasional, setBiayaOperasional] = useState<number>(0);
  // const [totalBiayaOperasional, setTotalBiayaOperasional] = useState<number>(0);
  // const [hargaTelur, setHargaTelur] = useState<number>(0);
  // const [totalBiayaPembelianTelur, setTotalBiayaPembelianTelur] =
  //   useState<number>(0);
  // const [totalVariableCost, setTotalVariableCost] = useState<number>(0);
  // const [totalCost, setTotalCost] = useState<number>(0);
  // const [standardPakan, setStandardPakan] = useState(0);
  // const [jumlahHari, setJumlahHari] = useState(0);
  // const [jumlahItik, setJumlahItik] = useState(0);
  // const [hargaPakan, setHargaPakan] = useState(0);
  // const [totalBiayaOperasional, setTotalBiayaOperasional] = useState(0);
  // const [totalFixedCost, setTotalFixedCost] = useState(0);

  // // Calculating total feed in kilograms
  // const totalPakan = (standardPakan * jumlahHari * jumlahItik) / 1000;

  // // Calculating total feed cost
  // const totalBiayaPembelianPakan = totalPakan * hargaPakan;

  // // Calculating total variable cost
  // const totalVariableCost = totalBiayaOperasional + totalBiayaPembelianPakan;

  // // Total Cost (Variable + Fixed)
  // const totalCost = totalVariableCost + totalFixedCost;

  // States untuk Hasil Analisis
  const [marginOfSafety, setMarginOfSafety] = useState<number>(0);
  const [rcRatio, setRcRato] = useState<number>(0);
  const [bepHarga, setBepHarga] = useState<number>(0);
  const [bepHasil, setBepHasil] = useState<number>(0);
  const [laba, setLaba] = useState<number>(0);

  // States for Submit firestore
  const [periode, setPeriode] = useState("");

  const handleSubmit = async () => {
    if (!user) {
      alert("User tidak terautentikasi.");
      return; // Hentikan eksekusi jika user tidak ada
    }

    try {
      const dataToSubmit = {
        userId: user.email || user.username,
        periode,
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
      };

      await addDoc(collection(firestore, "detail_penetasan"), dataToSubmit);
      alert("Data berhasil disubmit!");
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Gagal menambahkan data!");
    }
  };

  // Rumus Penerimaan
  useEffect(() => {
    if (jumlahTelur > 0) {
      setPersentase((jumlahTelurMenetas * 100) / jumlahTelur);
    } else {
      setPersentase(0);
    }
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
    const totalFixedCost = totalBiaya * jumlahTelur * 60;
    setTotalFixedCost(totalFixedCost);
  }, [totalBiaya, jumlahTelur]);

  useEffect(() => {
    const biayaOperasional = biayaTenagaKerja + biayaListrik + biayaOvk;
    setBiayaOperasional(biayaOperasional);
  }, [biayaTenagaKerja, biayaListrik, biayaOvk]);

  useEffect(() => {
    const totalBiayaOperasional = biayaOperasional * jumlahTelur * 60;
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

  return (
    <div className="w-full min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <SidebarDemo>
        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center p-10">
          {/* Header */}
          <h1 className="text-3xl font-bold text-black mb-8">
            Analisis Layer
          </h1>

          {/* TabSelection */}
          <div className="flex justify-center space-x-4 mb-10">
            {periods.map((period, index) => (
              <button
                key={index}
                onClick={() => {
                  setPeriode(period);
                  setSelectedPeriod(period);
                }}
                className={`px-4 py-2 rounded-full text-white ${
                  selectedPeriod === period ? "bg-orange-500" : "bg-gray-400"
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          {/* Kontainer Form */}
          <div className="form-container bg-white overflow-scroll p-8 shadow-lg rounded-lg w-full max-w-7xl mr-14">
            <HorizontalTimeline progress={jumlahTelurMenetas > 0 ? 100 : 0} />
            {currentForm === "Penerimaan" && (
              <div>
                <h2 className="text-xl font-extrabold mb-6">Data Penerimaan</h2>
                {/* Penerimaan Form */}
                <div className="flex items-center justify-center">
                  <div className="flex flex-col">
                    <label className="font-semibold">
                      Jumlah Telur yang Dihasilkan
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
                  <span className="mx-5 flex items-center justify-center font-semibold text-2xl">
                    /
                  </span>
                  <div className="flex flex-col">
                    <label className="font-semibold">
                      Jumlah Itik Awal (Ekor)
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
                      value={`${persentase.toFixed(2)}%`}
                      readOnly
                      className="border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Perhitungan mencari Jumlah DOD */}
                <div className="flex items-center mt-10 justify-center">
                  <div className="flex flex-col">
                    <label className="font-semibold">
                      Jumlah Itik Awal (Ekor)
                    </label>
                    <input
                      type="text"
                      value={jumlahTelur}
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
                      value={`${persentase.toFixed(2)}%`}
                      readOnly
                      className="border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <span className="mx-5 flex items-center justify-center font-semibold text-2xl">
                    =
                  </span>
                  <div className="flex flex-col">
                    <label className="font-semibold">Jumlah Telur(1 Periode)</label>
                    <input
                      type="text"
                      value={jumlahDOD.toFixed(2)}
                      readOnly
                      className="border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Perhitungan mencari Total Revenue */}
                <div className="flex items-center mt-10 justify-center">
                  <div className="flex flex-col">
                    <label className="font-semibold">Jumlah Telur (1 Periode)</label>
                    <input
                      type="text"
                      value={jumlahDOD}
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
                        value={hargaDOD}
                        onChange={(e) =>
                          setHargaDOD(parseFloat(e.target.value))
                        }
                        className="border-0 p-2 rounded-md flex-1" // border-0 untuk menghapus border input
                        placeholder="Masukkan harga DOD"
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
                        value={totalRevenue.toFixed(2)}
                        readOnly
                        className="border-0 p-2 rounded-md flex-1 cursor-not-allowed bg-orange-100" // border-0 untuk menghapus border input
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
                        type="number"
                        value={sewaKandang}
                        onChange={(e) =>
                          setSewaKandang(parseFloat(e.target.value))
                        }
                        className="border border-gray-300 p-2 rounded-md"
                      />
                    </div>
                  </div>
                  <span className="mx-5 flex items-center justify-center font-semibold text-2xl">
                    +
                  </span>
                  <div className="flex flex-col">
                    <label className="font-semibold">
                      Penyusutan Itik
                    </label>
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <span className="p-2 bg-gray-100">Rp.</span>
                      <input
                        type="number"
                        value={penyusutanPeralatan}
                        onChange={(e) =>
                          setPenyusutanPeralatan(parseFloat(e.target.value))
                        }
                        className="border border-gray-300 p-2 rounded-md"
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
                        type="text"
                        value={totalBiaya.toFixed(2)}
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
                          value={totalBiaya.toFixed(2)}
                          readOnly
                          className="border-0 p-2 rounded-md flex-1 cursor-not-allowed bg-gray-100" // border-0 untuk menghapus border input
                        />
                      </div>
                    </div>
                    <span className="mx-5 flex items-center justify-center font-semibold text-2xl">
                      ×
                    </span>
                    <div className="flex flex-col">
                      <label className="font-semibold">
                        Jumlah Itik
                      </label>
                      <input
                        type="text"
                        value={jumlahTelur}
                        readOnly
                        className="border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                    <span className="mx-5 flex items-center justify-center font-semibold text-2xl">
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
                    <span className="mx-5 flex items-center justify-center font-semibold text-2xl">
                      =
                    </span>
                    <div className="flex flex-col">
                      <label className="font-semibold">Total Fixed Cost</label>
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <span className="p-2 bg-gray-100">Rp.</span>
                        <input
                          type="text"
                          value={totalFixedCost.toFixed(2)}
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
                          value={biayaTenagaKerja}
                          onChange={(e) =>
                            setBiayaTenagaKerja(parseFloat(e.target.value))
                          }
                          className="border border-gray-300 p-2 rounded-md"
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
                          value={biayaListrik}
                          onChange={(e) =>
                            setBiayaListrik(parseFloat(e.target.value))
                          }
                          className="border border-gray-300 p-2 rounded-md"
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
                          value={biayaOvk}
                          onChange={(e) =>
                            setBiayaOvk(parseFloat(e.target.value))
                          }
                          className="border border-gray-300 p-2 rounded-md"
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
                          value={biayaOperasional.toFixed(2)}
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
                          value={biayaOperasional.toFixed(2)}
                          readOnly
                          className="border-0 p-2 rounded-md flex-1 cursor-not-allowed bg-gray-100" // border-0 untuk menghapus border input
                        />
                      </div>
                    </div>
                    <span className="mx-5 flex items-center justify-center font-semibold text-2xl">
                      ×
                    </span>
                    <div className="flex flex-col">
                      <label className="font-semibold">
                        Jumlah Itik
                      </label>
                      <input
                        type="text"
                        value={jumlahTelur}
                        readOnly
                        className="border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                    <span className="mx-5 flex items-center justify-center font-semibold text-2xl">
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
                          value={totalBiayaOperasional.toFixed(2)}
                          readOnly
                          className="border-0 p-2 rounded-md flex-1 cursor-not-allowed bg-gray-100" // border-0 untuk menghapus border input
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bagian Jumlah Pembelian Pakan */}
                <div>
      <div className="flex justify-center mt-10">
        <h3 className="font-extrabold text-3xl mb-4">Jumlah Pembelian Pakan</h3>
      </div>

      <div className="flex items-center justify-center">
        {/* Input Standard Pakan */}
        <div className="flex flex-col">
          <label className="font-semibold">Standard Pakan (Gram)</label>
          <input
            type="number"
            value={standardPakan}
            onChange={(e) => setStandardPakan(parseFloat(e.target.value))}
            className="border border-gray-300 p-2 rounded-md"
          />
        </div>

        <span className="mx-5 flex items-center justify-center font-semibold text-2xl">×</span>

        {/* Input Jumlah Hari */}
        <div className="flex flex-col">
          <label className="font-semibold">Jumlah Hari</label>
          <input
            type="number"
            value={jumlahHari}
            onChange={(e) => setJumlahHari(parseFloat(e.target.value))}
            className="border border-gray-300 p-2 rounded-md"
          />
        </div>

        <span className="mx-5 flex items-center justify-center font-semibold text-2xl">×</span>

        {/* Input Jumlah Itik */}
        <div className="flex flex-col">
          <label className="font-semibold">Jumlah Itik</label>
          <input
            type="number"
            value={jumlahItik}
            onChange={(e) => setJumlahItik(parseFloat(e.target.value))}
            className="border border-gray-300 p-2 rounded-md"
          />
        </div>

        <span className="mx-5 flex items-center justify-center font-semibold text-2xl">=</span>

        {/* Output Jumlah Pakan (KG) */}
        {/* <div className="flex flex-col">
                    <label className="font-semibold">Jumlah Pakan (Kilogram)</label>
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <span className="p-2 bg-gray-100">Rp.</span>
                      <input
                        type="text"
                        value={((standardPakan * jumlahHari * jumlahItik) / 1000).toFixed(2)}
                        readOnly
                        className="border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-center mt-10">
                    <div className="flex flex-col">
                      <label className="font-semibold">Jumlah Pakan (Kilogram)</label>
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <span className="p-2 bg-gray-100">Rp.</span>
                        <input
                          type="text"
                          value={((standardPakan * jumlahHari * jumlahItik) / 1000).toFixed(2)}
                          readOnly
                          className="border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"
                        />
                      </div>
                    </div> */}
        <div className="flex flex-col">
          <label className="font-semibold">Jumlah Pakan (Kilogram)</label>
          <input
            type="text"
            value={((standardPakan * jumlahHari * jumlahItik) / 1000).toFixed(2)}
            readOnly
            className="border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"  
          />
        </div>
      </div>
      <div className="flex flex-col"> 
      <label className="font-semibold">Jumlah Pakan (Kilogram)</label>
          <input
            type="text"
            value={((standardPakan * jumlahHari * jumlahItik) / 1000).toFixed(2)}
            readOnly
            className="border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"
          />
      </div>

      {/* Harga Pakan dan Total Biaya Pakan */}
      <div className="flex items-center justify-center mt-6">
        {/* Input Harga Pakan */}
        <div className="flex flex-col">
          <label className="font-semibold">Harga Pakan (Per Kilogram)</label>
          <input
            type="number"
            value={hargaPakan}
            onChange={(e) => setHargaPakan(parseFloat(e.target.value))}
            className="border border-gray-300 p-2 rounded-md"
          />
        </div>

        <span className="mx-5 flex items-center justify-center font-semibold text-2xl">=</span>

        {/* Output Total Biaya Pakan */}
        <div className="flex flex-col">
          <label className="font-semibold">Total Biaya Pakan</label>
          <input
            type="text"
            value={((standardPakan * jumlahHari * jumlahItik * hargaPakan) / 1000).toFixed(2)}
            readOnly
            className="border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"
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
                      <span className="p-2 bg-gray-100">Rp.</span>
                      <input
                        type="text"
                        value={marginOfSafety.toFixed(2)}
                        // readOnly
                        className="border-0 p-2 rounded-md flex-1 bg-gray-100" // border-0 untuk menghapus border input
                      />
                    </div>
                  </div>
                  <div className="flex flex-col mx-5">
                    <label className="font-semibold">R/C Ratio</label>
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <input
                        type="text"
                        value={rcRatio.toFixed(2)}
                        // readOnly
                        className="border-0 p-2 rounded-md flex-1 bg-gray-100" // border-0 untuk menghapus border input
                      />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <label className="font-semibold">BEP Harga</label>
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <span className="p-2 bg-gray-100">Rp.</span>
                      <input
                        type="text"
                        value={bepHarga.toFixed(2)}
                        // readOnly
                        className="border-0 p-2 rounded-md flex-1 bg-gray-100" // border-0 untuk menghapus border input
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center mt-10">
                  <div className="flex flex-col mx-5">
                    <label className="font-semibold">BEP Hasil</label>
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <span className="p-2 bg-gray-100">Rp.</span>
                      <input
                        type="text"
                        value={bepHasil.toFixed(2)}
                        // readOnly
                        className="border-0 p-2 rounded-md flex-1 bg-gray-100" // border-0 untuk menghapus border input
                      />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <label className="font-semibold">Laba</label>
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <span className="p-2 bg-gray-100">Rp.</span>
                      <input
                        type="text"
                        value={laba.toFixed(2)}
                        // readOnly
                        className="border-0 p-2 rounded-md flex-1 bg-gray-100" // border-0 untuk menghapus border input
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
