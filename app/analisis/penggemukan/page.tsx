"use client";

import { SidebarDemo } from "@/components/Sidebar";
import React, { useEffect, useState } from "react";
import "@/app/analisis.css";
import HorizontalTimeline from "@/components/HorizontalTimeline";

// interface TabSelectionProps

const PenggemukanPage = () => {
  const periods = ["Periode 1", "Periode 2"];

  const [selectedPeriod, setSelectedPeriod] = useState(periods[0]);
  const [periode, setPeriode] = useState(periods[0]);

  const [currentForm, setCurrentForm] = useState("Penerimaan");

  // States untuk Penerimaan Form
  const [jumlahItikMati, setJumlahItikMati] = useState<number>(0);
  const [jumlahItikAwal, setJumlahItikAwal] = useState<number>(0);
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

  return (
    <div className="w-full min-h-screen bg-gray-100 flex">
      <SidebarDemo>
        <div className="flex-1 flex flex-col items-center p-10">
          <h1 className="text-3xl font-bold text-black mb-10">
            Analisis Penggemukan
          </h1>

          {/* Tab Selection */}
          <div className="flex justify-center space-x-4 mb-10">
            {periods.map((period, index) => (
              <button
                key={index}
                onClick={() => {
                  setPeriode(period); // Perbarui periode
                  setSelectedPeriod(period); // Perbarui selectedPeriod
                }}
                className={`px-4 py-2 rounded-full text-white ${
                  selectedPeriod === period ? "bg-orange-500" : "bg-gray-400"
                }`}
              >
                {period}
              </button>
            ))}
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
                    <label className="font-semibold">Harga DOD</label>
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
                        value={"28 Hari"}
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
                          onBlur={(e) => setBiayaOvk(parseFloat(e.target.value.replace(/[^0-9]/g, "")) || 0)}
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
