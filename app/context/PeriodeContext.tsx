import React, { createContext, useState, useContext, ReactNode } from "react";

// Define types for the periods state and context value
type PeriodsState = {
  penetasan: string[];
  penggemukan: string[];
  layer: string[];
};

type PeriodContextType = {
  periods: {
    penetasan: string[];
    penggemukan: string[];
    layer: string[];
  };
  setPeriods: (feature: keyof PeriodsState, newPeriods: string[]) => void;
};

// Create the context with the correct type
const PeriodContext = createContext<PeriodContextType | undefined>(undefined);

// Create the PeriodProvider component with proper typing
export const PeriodProvider = ({ children }: { children: ReactNode }) => {
  const [periodsState, setPeriodsState] = useState<PeriodsState>({
    penetasan: ["Periode 1"],
    penggemukan: ["Periode 1"],
    layer: ["Periode 1"],
  });

  // Function to update periods state for a specific feature
  const setPeriods = (feature: keyof PeriodsState, newPeriods: string[]) => {
    setPeriodsState((prevState) => ({
      ...prevState,
      [feature]: newPeriods,
    }));
  };

  // Define the context value with the correct typing
  const contextValue = {
    periods: periodsState,
    setPeriods,
  };

  return (
    <PeriodContext.Provider value={contextValue}>
      {children}
    </PeriodContext.Provider>
  );
};

// Custom hook to use the PeriodContext with proper typing
export const usePeriod = (feature: keyof PeriodsState) => {
  const context = useContext(PeriodContext);
  if (!context) {
    throw new Error("usePeriod must be used within a PeriodProvider");
  }
  return {
    periods: context.periods[feature],
    setPeriods: context.setPeriods,
  };
};
