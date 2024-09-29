"use client";

import { SidebarDemo } from "@/components/Sidebar";
import React, { useState, useEffect } from "react";
import TabSelection from "@/components/TabSelection";
import HorizontalTimeline from "@/components/HorizontalTimeline";
import "@/app/analisis.css";

const PenetasanPage = () => {
  const periods = [
    "Periode 1",
    "Periode 2",
    "Periode 3",
    "Periode 4",
    "Periode 5",
    "Periode 6",
  ];
  const [selectedPeriod, setSelectedPeriod] = useState(periods[0]);

  const [jumlahTelurMenetas, setJumlahTelurMenetas] = useState<number>(0);
  const [jumlahTelur, setJumlahTelur] = useState<number>(0);
  const [persentase, setPersentase] = useState<number>(0);
  const [hargaDOD, setHargaDOD] = useState<number>(0);
  const [jumlahDOD, setJumlahDOD] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);

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

  return (
    <div className="w-full min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <SidebarDemo>
        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center p-10">
          {/* Header */}
          <h1 className="text-3xl font-bold text-black mb-8">
            Analisis Penetasan
          </h1>

          {/* TabSelection */}
          <div className="flex justify-center space-x-4 mb-10">
            {periods.map((period, index) => (
              <button
                key={index}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-full text-white ${
                  selectedPeriod === period ? "bg-orange-500" : "bg-gray-300"
                } transition-all duration-300 ease-in-out`}
              >
                {period}
              </button>
            ))}
          </div>

          {/* Timeline */}

          {/* Kontainer Form */}
          <div className="form-container bg-white p-8 shadow-lg rounded-lg w-full max-w-7xl mr-14">
            <HorizontalTimeline />
            <h2 className="text-xl font-semibold mb-6">Data Penerimaan</h2>

            {/* Perhitungan mencari persentase */}
            <div className="flex items-center justify-center">
              <div className="flex flex-col">
                <label className="font-semibold">Jumlah Telur Menetas</label>
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
                <label className="font-semibold">Jumlah Telur (Butir)</label>
                <input
                  type="number"
                  value={jumlahTelur}
                  onChange={(e) => setJumlahTelur(parseFloat(e.target.value))}
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
                <label className="font-semibold">Persentase Menetas</label>
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
                <label className="font-semibold">Jumlah Telur (Butir)</label>
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
                <label className="font-semibold">Persentase Menetas</label>
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
                <label className="font-semibold">Jumlah DOD</label>
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
                <label className="font-semibold">Jumlah DOD</label>
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
                <label className="font-semibold">Harga DOD</label>
                <div className="flex items-center border border-gray-300 rounded-md">
                  <span className="p-2 bg-gray-100">Rp.</span>
                  <input
                    type="number"
                    value={hargaDOD}
                    onChange={(e) => setHargaDOD(parseFloat(e.target.value))}
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
                  <span className="p-2 bg-gray-100">Rp.</span>
                  <input
                    type="text"
                    value={totalRevenue.toFixed(2)}
                    readOnly
                    className="border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Tombol Selanjutnya */}
            <div className="flex justify-end mt-16">
              <button className="bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition-all">
                Selanjutnya
              </button>
            </div>
          </div>
        </div>
      </SidebarDemo>
    </div>
  );
};

export default PenetasanPage;
