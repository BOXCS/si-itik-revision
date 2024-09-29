import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const HorizontalTimeline = () => {
  const [progress, setProgress] = useState(0);

  // Animasi progress bar berjalan selama 2 detik
  useEffect(() => {
    const interval = setTimeout(() => {
      setProgress(100); // Mengisi garis sepenuhnya
    }, 500); // Delay awal animasi (dapat diubah jika diinginkan)

    return () => clearTimeout(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {/* Label atas */}
      <div className="flex justify-between w-full max-w-lg mb-2">
        <span>Penerimaan</span>
        <span>Pengeluaran</span>
        <span>Hasil Analisis</span>
      </div>

      {/* Timeline */}
      <div className="relative w-full max-w-lg">
        {/* Garis Horizontal dengan animasi */}
        <motion.div
          className="absolute h-2 bg-[#F58110] top-1/2 -translate-y-1/2"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
        
        {/* Titik Timeline */}
        <div className="flex justify-between relative">
          <div className="z-10 h-5 w-5 bg-[#F58110] rounded-full border border-[#F58110]" />
          <div className="z-10 h-5 w-5 bg-[#F58110] rounded-full border border-[#F58110]" />
          <div className="z-10 h-5 w-5 bg-[#F58110] rounded-full border border-[#F58110]" />
        </div>
      </div>
    </div>
  );
};

export default HorizontalTimeline;
