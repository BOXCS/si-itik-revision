import React, { createContext, useState, useContext, ReactNode } from "react";

// Create the context
const PeriodContext = createContext<any>(null);

// Create the PeriodProvider component
export const PeriodProvider = ({ children }: { children: ReactNode }) => {
  const [periodsState, setPeriodsState] = useState<any>({
    penetasan: ["Periode 1"],
    penggemukan: ["Periode 1"],
    layer: ["Periode 1"],
  });

  const setPeriods = (feature: string, newPeriods: string[]) => {
    setPeriodsState((prevState: any) => ({
      ...prevState,
      [feature]: newPeriods,
    }));
  };

  const contextValue = (feature: string) => ({
    periods: periodsState[feature],
    setPeriods: (newPeriods: string[]) => setPeriods(feature, newPeriods),
  });

  return (
    <PeriodContext.Provider value={contextValue}>
      {children}
    </PeriodContext.Provider>
  );
};

// Custom hook to use the PeriodContext
export const usePeriod = (feature: string) => {
  const context = useContext(PeriodContext);
  if (!context) {
    throw new Error("usePeriod must be used within a PeriodProvider");
  }
  return context(feature);
};
