import React from "react";
import { motion } from "framer-motion";

interface HorizontalTimelineProps {
  progress: number; // Define the type of progress as number
}

const HorizontalTimeline: React.FC<HorizontalTimelineProps> = ({ progress }) => {
  const getCircleColor = (index: number) => {
    return progress >= (index + 1) * 50 ? '#F58110' : 'black'; // Change color based on progress
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {/* Label atas */}
      <div className="flex justify-between text-sm w-full max-w-lg mb-2 md:text-xl">
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
        
        {/* Titik Timeline (Donut Shape) */}
        <div className="flex justify-between relative">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="z-10 h-8 w-8 rounded-full border-4 border-transparent"
              style={{
                backgroundColor: getCircleColor(index),
                boxShadow: `inset 0 0 0 4px white`, // Creates the donut effect
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HorizontalTimeline;
