"use client"; // Add this directive at the top of the file

import { TimelineDemo } from "@/components/Timeline";
import { InfiniteMovingCards } from "@/components/ui/InfiniteMovingCards";
import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { IconArrowUp } from "@tabler/icons-react";

const images = [
  "/assets/penetasan.svg",
  "/assets/Penggemukan.svg",
  "/assets/Layer.svg",
];

const testimonials = [
  {
    quote:
      "SI-ITIK sangat membantu saya dalam mengelola peternakan itik. Fitur-fiturnya mudah digunakan!",
    name: "Indira Priwayanti",
    title: "Peternak Jember",
  },
  {
    quote:
      "Sistem yang efisien dan membantu saya mengelola usaha dengan lebih terstruktur. Sangat bermanfaat!",
    name: "John Doe",
    title: "Peternak Situbondo",
  },
  {
    quote:
      "SI-ITIK memudahkan saya dalam memantau kesehatan dan produktivitas itik saya. Sangat direkomendasikan!",
    name: "Siti Zubaidah",
    title: "Peternak Bondowoso",
  },
];

// type TimelineEntry = {
//   title: "Buat & Masuk Akun";
//   content: "Masuk AKun";
// };

// Teks untuk setiap slide
const headers = ["Penetasan", "Penggemukan", "Layer"];
const descriptions = [
  '"Penetasan merupakan fitur yang dirancang untuk mengoptimalkan proses penetasan telur itik, memastikan kesuksesan menetas maksimal dan kualitas anakan itik yang terbaik.',
  "Penggemukan merupakan fitur yang dirancang untuk membantu peternak itik mengelola fase pertumbuhan dengan efisien.",
  "Layer membantu peternak memantau produktivitas itik petelur, memastikan kesehatan optimal dan hasil produksi telur yang konsisten.",
];

export default function LandingPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // State untuk mengatur card dropdown
  const [isOpen, setIsOpen] = useState<boolean[]>([false, false, false]);

  const handlePrev = () => {
    // Trigger blur-out before changing slide
    const elements = document.querySelectorAll(".info h2, .info h1, .info p");

    elements.forEach((el) => {
      (el as HTMLElement).style.animationName = "blur-out"; // Type assertion
    });

    setTimeout(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === 0 ? images.length - 1 : prevIndex - 1
      );

      // Trigger blur-in after slide changes
      elements.forEach((el) => {
        (el as HTMLElement).style.animationName = "blur-in"; // Type assertion
      });
    }, 600);
  };

  const handleNext = () => {
    // Trigger blur-out before changing slide
    const elements = document.querySelectorAll(".info h2, .info h1, .info p");

    elements.forEach((el) => {
      (el as HTMLElement).style.animationName = "blur-out"; // Type assertion
    });

    setTimeout(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );

      // Trigger blur-in after slide changes
      elements.forEach((el) => {
        (el as HTMLElement).style.animationName = "blur-in"; // Type assertion
      });
    }, 600); // Matches the animation duration
  };

  // Fungsi untuk toggle card dropdown
  const toggleDropdownTami = (index: number) => {
    setIsOpen((prevState) => {
      const newState = [...prevState];
      newState[index] = !newState[index]; // Toggle state pada index card yang dipilih
      return newState;
    });
  };

  // Fungsi untuk toggle dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen); // Toggle dropdown terbuka atau tertutup
  };

  return (
    <div>
      <header className="navbar">
        <div className="logo">
          <Image
            src="/assets/Logo.svg"
            alt="SI-ITIK Logo"
            width={100}
            height={0}
          />
        </div>

        {/* Navbar Default (untuk desktop) */}
        <ul className="nav-links">
          <li className="underline-animation text-gray-800 hover:text-gray-600 font-medium transition duration-300">
            <a href="#tentangKami">Tentang Kami</a>
          </li>
          <li className="underline-animation text-gray-800 hover:text-gray-600 font-medium transition duration-300">
            <a href="#fiturUtama">Fitur Utama</a>
          </li>
          <li className="underline-animation text-gray-800 hover:text-gray-600 font-medium transition duration-300">
            <a href="#testimoniPeternak">Testimoni</a>
          </li>
          <li className="underline-animation text-gray-800 hover:text-gray-600 font-medium transition duration-300">
            <a href="#timelineCaKer">Cara Kerja</a>
          </li>
          <li className="underline-animation text-[#D05805] hover:text-orange-600 font-medium transition duration-300">
            <a
              href="https://drive.google.com/file/d/1_vSzfnenalaA9OLTYwLHLRZms88KEzQe/view?usp=sharing"
              target="_blank" // Menambahkan target="_blank" akan membuka di tab baru
              rel="noopener noreferrer" // Praktik keamanan saat menggunakan target="_blank"
              download
            >
              Unduh Aplikasi Seluler
            </a>
          </li>
        </ul>

        {/* <a href="" className="login-btn border border-[#D05805] text-[#D05805] hover:bg-[#D05805] hover:text-white transition duration-300 px-4 py-2 rounded-lg font-medium">Login</a> */}
        <Link
          href="/auth/login"
          className="login-btn border border-[#D05805] text-[#D05805] hover:bg-[#D05805] hover:text-white transition duration-300 px-4 py-2 rounded-lg font-medium"
        >
          Login
        </Link>

        {/* Dropdown Navbar (untuk mobile/tablet) */}
        <div className="dropdown-menu">
          <button className="dropdown-toggle" onClick={toggleDropdown}>
            &#9776; {/* Ikon burger */}
          </button>
          <ul className={`dropdown-content ${isDropdownOpen ? "show" : ""}`}>
            <li>
              <a href="#tentangKami">Tentang Kami</a>
            </li>
            <li>
              <a href="#fiturUtama">Fitur Utama</a>
            </li>
            <li>
              <a href="#testimoniPeternak">Testimoni</a>
            </li>
            <li>
              <a href="#timelineCaKer">Cara Kerja</a>
            </li>
            <li>
              <a href="#">Unduh Aplikasi Seluler</a>
            </li>
            <li>
              <a href="/auth/login">Login</a>
            </li>
          </ul>
        </div>
      </header>

      {/* Content Layout */}
      <div className="container" id="Home">
        <div className="info">
          <h2 className="text-2xl font-semibold">SI-ITIK</h2>
          <h1 className="text-[#d05805] text-lg font-bold mt-3">
            {headers[currentIndex]}
          </h1>
          <p className="mt-4">{descriptions[currentIndex]}</p>
          <a
            href="/auth/login"
            className="btn-coba bg-[#D05805] text-white px-4 py-2 mt-4 rounded-lg font-medium transition duration-200 hover:bg-[#F68110] hover:text-black border-2 border-transparent hover:border-teal-500"
          >
            Coba Sekarang
          </a>
        </div>

        <div className="slider-container">
          <div className="slider">
            <div
              className="images"
              style={{ transform: `translateX(-${currentIndex * 1}vw)` }}
            >
              {images.map((image, index) => (
                <Image
                  key={index}
                  src={image}
                  alt={`Slide ${index}`}
                  width={2000}
                  height={2000}
                  className={`image ${
                    index === currentIndex ? "active" : "right"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <button className="arrow right" onClick={handleNext}>
          →
        </button>
        <button className="arrow left" onClick={handlePrev}>
          ←
        </button>
      </div>

      {/* Section Tentang Kami */}
      <section className="tentang-kami bg-[#F9C994] py-12" id="tentangKami">
        <div className="tentang-kami-container flex justify-between items-start">
          {/* Left Side: Judul dan Deskripsi */}
          <div className="tentang-kami-info w-full">
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
          <div className="tentang-kami-cards w-full grid grid-cols-1 gap-4">
            {/* Card 1 */}
            <div className="card bg-white p-6 rounded-lg shadow-lg flex items-center justify-between">
              <div className="card-content">
                <h3 className="text-2xl font-semibold">User Friendly</h3>
                <p className={`mt-2 ${isOpen[0] ? "show" : "hidden"}`}>
                  Menggunakan bahasa yang mudah dipahami
                </p>
              </div>
              <button
                className="dropdown-arrow ml-4"
                onClick={() => toggleDropdownTami(0)}
              >
                {isOpen[0] ? "▲" : "▼"}
              </button>
            </div>

            {/* Card 2 */}
            <div className="card bg-white p-6 rounded-lg shadow-lg flex items-center justify-between">
              <div className="card-content">
                <h3 className="text-2xl font-semibold">Menganalisis</h3>
                <p className={`mt-2 ${isOpen[1] ? "show" : "hidden"}`}>
                  Analisis pendapatan dan pengeluaran
                </p>
              </div>
              <button
                className="dropdown-arrow ml-4"
                onClick={() => toggleDropdownTami(1)}
              >
                {isOpen[1] ? "▲" : "▼"}
              </button>
            </div>

            {/* Card 3 */}
            <div className="card bg-white p-6 rounded-lg shadow-lg flex items-center justify-between">
              <div className="card-content">
                <h3 className="text-2xl font-semibold">Mengelola</h3>
                <p className={`mt-2 ${isOpen[2] ? "show" : "hidden"}`}>
                  Kelola ternak dengan melihat saran optimalisasi agar mendapat
                  hasil maksimal
                </p>
              </div>
              <button
                className="dropdown-arrow ml-4"
                onClick={() => toggleDropdownTami(2)}
              >
                {isOpen[2] ? "▲" : "▼"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section Fitur Utama */}
      <section className="fitur-utama" id="fiturUtama">
        <h2 className="fima-heading">
          Fitur <span className="text-[#D05805]">Utama</span>
        </h2>

        <div className="fima-container grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Penetasan */}
          <div className="fima-box">
            <Image
              src="/assets/Penetasan-fima.png"
              alt="Penetasan"
              width={500} // Specify the width (you can adjust this value)
              height={300} // Specify the height (you can adjust this value)
              objectFit="cover" // Ensure the image covers the container proportionally
            />
            <div className="fima-layer">
              <h4>Penetasan</h4>
              <p>Atur dan pantau proses penetasan telur itik dengan mudah.</p>
            </div>
          </div>

          {/* Penggemukan */}
          <div className="fima-box">
            <Image
              src="/assets/Penggemukan-fima.png"
              alt="Penggemukan"
              width={500} // Adjust width as needed
              height={300} // Adjust height as needed
              layout="intrinsic" // Ensures the image is responsive
              className="fima-img" // Add a custom class for styling
            />
            <div className="fima-layer">
              <h4>Penggemukan</h4>
              <p>Atur dan pantau proses penggemukan itik dengan mudah.</p>
            </div>
          </div>

          {/* Layer */}
          <div className="fima-box">
            <Image
              src="/assets/Layer-fima.png"
              alt="Layer"
              width={500} // Adjust width as needed
              height={300} // Adjust height as needed
              layout="intrinsic" // Ensures the image is responsive
              className="fima-img" // Add a custom class for styling
            />
            <div className="fima-layer">
              <h4>Layer</h4>
              <p>Pantau produksi telur itik betina dari layer dengan data</p>
            </div>
          </div>

          {/* Analisis */}
          <div className="fima-box">
            <Image
              src="/assets/Laporan-fima.png"
              alt="Analisis dan Laporan Keuangan"
              width={500} // Adjust width as needed
              height={300} // Adjust height as needed
              layout="intrinsic" // Ensures the image is responsive
              className="fima-img" // Add a custom class for styling
            />
            <div className="fima-layer">
              <h4>Analisis dan Laporan Keuangan</h4>
              <p>Pantau produksi telur itik betina dari layer dengan data</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Testimoni */}
      <section
        className="testimoni py-20 overflow-hidden"
        id="testimoniPeternak"
      >
        <h2>Testimoni</h2>
        <h3>Ulasan Peternak Lain</h3>
        <div className="flex flex-col items-center max-lg:mt-10">
          <div className="h-[50vh] md:h-[30rem] rounded-md flex flex-col antialiased items-center justify-center relative overflow-hidden">
            <InfiniteMovingCards
              items={testimonials}
              direction="left"
              speed="slow"
            />
          </div>
        </div>
      </section>

      <section id="timelineCaKer">
        <div>
          <TimelineDemo />
        </div>
      </section>

      <section className="footer-container flex flex-col items-center gap-10 sm:flex-row sm:items-start justify-between p-5 bg-[#CF5804]">
        <div className="logo-si-itik w-32">
          <Image
            src="/assets/logo-si-itik.svg"
            alt="Logo SI-ITIK"
            width={500} // Adjust width as needed
            height={300} // Adjust height as needed
            layout="intrinsic" // Ensures the image is responsive
            className="fima-img" // Add a custom class for styling
          />
        </div>

        <div className="footer-social flex flex-col items-center sm:items-start gap-5">
          <h2 className="text-white">Social Media</h2>
          <a className="text-white" href="">
            Whatsapp
          </a>
          <a className="text-white" href="https://www.instagram.com/zaboxc/">
            Instagram
          </a>
        </div>

        <div className="footer-location flex flex-col items-center sm:items-start gap-4">
          <h2 className="text-white">Location</h2>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3949.424154373322!2d113.72049301127193!3d-8.15994978172228!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd695b617d8f623%3A0xf6c4437632474338!2sPoliteknik%20Negeri%20Jember!5e0!3m2!1sid!2sid!4v1726996903102!5m2!1sid!2sid"
            width="350"
            height="200"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
          ></iframe>
        </div>

        <div className="footer-update flex flex-col items-center sm:items-start gap-5">
          <p className="text-white">Ingin Update ternak usaha itik ?</p>
          <p className="text-white">Klik berikut</p>
          <button className="px-8 py-2 rounded-md bg-[#FCCD8F] text-black font-bold transition duration-200 hover:bg-white hover:text-black border-2 border-transparent hover:border-[#FCCD8F]">
            Follow it
          </button>
        </div>
      </section>

      <footer className="footer-end bg-[#CF5804] text-white py-6">
        <div className="footer-end-fill max-w-7xl mx-auto px-4">
          <div className="footer-end-inner flex justify-between items-center">
            <div>
              <h3 className="text-sm font-thin">
                Copyright © 2024 si-itikpolije.com. All rights reserved.
              </h3>
            </div>

            <Link
              href="#Home"
              className="px-8 py-2 rounded-md bg-[#FCCD8F] text-black font-bold transition duration-200 hover:bg-white hover:text-black border-2 border-transparent hover:border-[#FCCD8F]"
            >
              <IconArrowUp />
            </Link>

            {/* <div className='footer-iconTop'>
                <a href="#Home"><i className="bx bx-up-arrow-alt">A</i></a>
          </div> */}
          </div>
        </div>
      </footer>
    </div>
  );
}
