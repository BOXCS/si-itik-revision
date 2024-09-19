"use client"; // Add this directive at the top of the file

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const images = [
  "/assets/penetasan.svg",
  "/assets/Penggemukan.svg",
  "/assets/Layer.svg",
];

// Teks untuk setiap slide
const headers = ["Penetasan", "Penggemukan", "Layer"];
const descriptions = [
  '"Penetasan merupakan fitur yang dirancang untuk mengoptimalkan proses penetasan telur itik, memastikan kesuksesan menetas maksimal dan kualitas anakan itik yang terbaik. Manfaatkan fitur ini sekarang untuk meningkatkan hasil penetasan dan mendapatkan anakan itik berkualitas tinggi!',
  "Penggemukan merupakan fitur yang dirancang untuk membantu peternak itik mengelola fase pertumbuhan dengan efisien. Fitur ini menawarkan solusi manajemen hemat biaya untuk pengelolaan pakan, pengobatan, dan perawatan harian, memastikan kesehatan dan pertumbuhan itik yang optimal sambil menjaga biaya terkendali. Gunakan fitur ini untuk memantau kebutuhan pakan dan biaya operasional secara efektif!",
  "Layer membantu peternak memantau produktivitas itik petelur, memastikan kesehatan optimal dan hasil produksi telur yang konsisten.",
];

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // State untuk mengatur card dropdown
  const [isOpen, setIsOpen] = useState<boolean[]>([false, false, false]);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  // Fungsi untuk toggle card dropdown
  const toggleDropdown = (index: number) => {
    setIsOpen((prevState) => {
      const newState = [...prevState];
      newState[index] = !newState[index]; // Toggle state pada index card yang dipilih
      return newState;
    });
  };

  return (
    <div>
      <header className="bg-gray-100 shadow-lg py-4">
        <div className="navbar mx-auto flex justify-between items-center">
          {/* Logo */}
          <div className="logo">
            <Image
              src="/assets/Logo.svg"
              alt="SI-ITIK Logo"
              width={250}
              height={250}
            />
          </div>

          {/* Navigation */}
          <nav className="flex space-x-6">
            <Link
              href="#"
              className="underline-animation text-gray-800 hover:text-gray-600 font-medium transition duration-300"
            >
              Tentang Kami
            </Link>
            <Link
              href="#"
              className="underline-animation text-gray-800 hover:text-gray-600 font-medium transition duration-300"
            >
              Fitur Utama
            </Link>
            <Link
              href="#"
              className="underline-animation text-gray-800 hover:text-gray-600 font-medium transition duration-300"
            >
              Testimoni
            </Link>
            <Link
              href="#"
              className="underline-animation text-gray-800 hover:text-gray-600 font-medium transition duration-300"
            >
              Cara Kerja
            </Link>
            <Link
              href="#"
              className="underline-animation text-[#D05805] hover:text-orange-600 font-medium transition duration-300"
            >
              Unduh Aplikasi Seluler
            </Link>
          </nav>

          {/* Login Button */}
          <div>
            <Link
              href="#"
              className="border border-[#D05805] text-[#D05805] hover:bg-[#D05805] hover:text-white transition duration-300 px-4 py-2 rounded-lg font-medium"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* Content Layout */}
      <div className="container">
        {/* Info Section */}
        <div className="info">
          <h2 className="text-2xl font-semibold">Design Slider</h2>
          <h1 className="text-4xl font-bold mt-2">{headers[currentIndex]}</h1>
          <p className="mt-4">{descriptions[currentIndex]}</p>
          <button className="btn-coba bg-[#D05805] text-white px-4 py-2 mt-4 rounded-lg font-medium hover:bg-[#D05805]">
            Coba Sekarang
          </button>
        </div>

        {/* Image Slider Section */}
        <div className="slider-container">
          <button className="arrow left" onClick={handlePrev}>
            ←
          </button>
          <div className="slider">
            <div
              className="images"
              style={{ transform: `translateX(-${currentIndex * 36}vw)` }}
            >
              {images.map((image, index) => (
                <Image
                  key={index}
                  src={image}
                  alt={`Slide ${index}`}
                  layout="responsive"
                  width={1000}
                  height={1000}
                  className={`image ${
                    index === currentIndex ? "active" : "right"
                  }`}
                />
              ))}
            </div>
          </div>
          <button className="arrow right" onClick={handleNext}>
            →
          </button>
        </div>
      </div>

      {/* Section Tentang Kami */}
      <section className="tentang-kami bg-[#F9C994] py-12">
        <div className="container mx-auto flex justify-between items-start">
          {/* Left Side: Judul dan Deskripsi */}
          <div className="tentang-kami-info w-1/2">
            <h2 className="text-4xl font-bold mb-4">Mengapa Harus SI-ITIK</h2>
            <p className="text-lg">
              Selamat datang di aplikasi SI ITIK, solusi modern yang dirancang
              khusus untuk membantu peternak itik dalam mengelola usaha mereka
              dengan lebih efisien dan efektif. Aplikasi ini menyediakan
              fitur-fitur canggih untuk memantau, menganalisis, dan mengelola
              segala aspek peternakan itik, dari skala kecil hingga besar,
              memastikan produktivitas dan keberlanjutan usaha Anda.
            </p>
          </div>

          {/* Right Side: Card Section */}
          <div className="tentang-kami-cards w-1/2 grid grid-cols-1 gap-4">
            {/* Card 1 */}
            <div className="card bg-white p-6 rounded-lg shadow-lg flex items-center justify-between">
              <div className="card-content">
                <h3 className="text-2xl font-semibold">User Friendly</h3>
                <p className={`mt-2 ${isOpen[0] ? "show" : "hidden"}`}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>
              </div>
              <button
                className="dropdown-arrow ml-4"
                onClick={() => toggleDropdown(0)}
              >
                {isOpen[0] ? "▲" : "▼"}
              </button>
            </div>

            {/* Card 2 */}
            <div className="card bg-white p-6 rounded-lg shadow-lg flex items-center justify-between">
              <div className="card-content">
                <h3 className="text-2xl font-semibold">Menganalisis</h3>
                <p className={`mt-2 ${isOpen[1] ? "show" : "hidden"}`}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>
              </div>
              <button
                className="dropdown-arrow ml-4"
                onClick={() => toggleDropdown(1)}
              >
                {isOpen[1] ? "▲" : "▼"}
              </button>
            </div>

            {/* Card 3 */}
            <div className="card bg-white p-6 rounded-lg shadow-lg flex items-center justify-between">
              <div className="card-content">
                <h3 className="text-2xl font-semibold">Mengelola</h3>
                <p className={`mt-2 ${isOpen[2] ? "show" : "hidden"}`}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>
              </div>
              <button
                className="dropdown-arrow ml-4"
                onClick={() => toggleDropdown(2)}
              >
                {isOpen[2] ? "▲" : "▼"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section Fitur Utama */}
      <section className="fitur-utama">
        <h2 className="fima-heading">
          Fitur <span className="text-[#D05805]">Utama</span>
        </h2>

        <div className="fima-container">
          {/* Penetasan */}
          <div className="fima-box">
            <img src="/assets/Penetasan-fima.png" alt="Penetasan" />
            <div className="fima-layer">
              <h4>Penetasan</h4>
              <p>Atur dan pantau proses penetasan telur itik dengan mudah.</p>
            </div>
          </div>

          {/* Penggemukan */}
          <div className="fima-box">
            <img src="/assets/penggemukan-fima.png" alt="Penggemukan" />
            <div className="fima-layer">
              <h4>Penggemukan</h4>
              <p>Optimalkan pertumbuhan itik jantan dengan pencatatan</p>
            </div>
          </div>

          {/* Layer */}
          <div className="fima-box">
            <img src="/assets/layer-fima.png" alt="Penggemukan" />
            <div className="fima-layer">
              <h4>Layer</h4>
              <p>Pantau produksi telur itik betina dari layer dengan data</p>
            </div>
          </div>

          {/* Analisis */}
          <div className="fima-box">
            <img src="/assets/Laporan-fima.png" alt="Penggemukan" />
            <div className="fima-layer">
              <h4>Penjualan dan Laporan Keuangan</h4>
              <p>Pantau produksi telur itik betina dari layer dengan data</p>
            </div>
          </div>

          {/* Analisis */}
          <div className="fima-box">
            <img src="/assets/analisis-fima.png" alt="Penggemukan" />
            <div className="fima-layer">
              <h4>Analisis Usaha Periode</h4>
              <p>Pantau produksi telur itik betina dari layer dengan data</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Testimoni */}
      <section>
        <div>Section Testimoni</div>
      </section>

      <section>
        <div>Section Cara Kerja</div>
      </section>
    </div>

  );
}
