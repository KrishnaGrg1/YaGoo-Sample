import React, { createContext, useContext, useState } from 'react';

type Setter = (location: { address: string; coordinates: any }) => void;

type SetterContextType = {
  setSetter: (fn: Setter | null) => void;
  setter: Setter | null;
};

const SetterContext = createContext<SetterContextType>({ setSetter: () => {}, setter: null });

export const LocationSetterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [setter, setSetter] = useState<Setter | null>(null);

  return (
    <SetterContext.Provider value={{ setter, setSetter }}>
      {children}
    </SetterContext.Provider>
  );
};

export const useLocationSetter = () => useContext(SetterContext);