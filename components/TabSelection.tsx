// components/TabSelection.tsx
import React, { useState } from 'react';
import '@/app/analisis.css';

interface TabSelectionProps {
  periods: string[]; // Array of period strings for the tabs
}

const TabSelection: React.FC<TabSelectionProps> = ({ periods }) => {
  const [selectedPeriod, setSelectedPeriod] = useState(periods[0]); // Set default selected period

  return (
    <div className="tab-container relative flex justify-center align-middle left-1/3 mb-4 mt-5  font-semibold text-sm"> {/* Center the tabs */}
      <div className="relative h-14 w-auto mx-auto"> {/* Added mx-auto to center the tab container */}
        {/* Background for selected tab */}
        <div
          className="absolute rounded-full bg-[#F6810F] transition-all duration-300"
          style={{
            width: `calc(100% / ${periods.length})`, // Adjust width based on number of periods
            left: `${(periods.indexOf(selectedPeriod) * 100) / periods.length}%`, // Position based on selected period
            height: '100%', // Fill the height
            borderRadius: '9999px', // Ensure it's rounded
            border: '2px solid #F6810F', // Keep the border visible
          }}
        />
        <div className="flex items-center rounded-full bg-transparent outline outline-[#F6810F] p-1 h-full"> {/* Added outline here */}
          {periods.map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`flex-1 py-2 mx-3 transition-colors duration-300 whitespace-nowrap rounded-full ${
                selectedPeriod === period ? 'text-white' : 'text-black'
              }`}
              style={{
                zIndex: selectedPeriod === period ? 1 : 0, // Ensure text is above background
              }}
            >
              {period}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TabSelection;
