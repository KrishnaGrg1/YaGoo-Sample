// context/LocationContext.tsx
import React, { createContext, useContext, useState } from 'react';

type SetterType = (value: { address: string; coordinates: any }) => void;

const LocationSetterContext = createContext<{
  setLocationSetter: (setter: SetterType | null) => void;
  locationSetter: SetterType | null;
}>({
  setLocationSetter: () => {},
  locationSetter: null,
});

export const LocationProvider = ({ children }: { children: React.ReactNode }) => {
  const [locationSetter, setLocationSetter] = useState<SetterType | null>(null);

  return (
    <LocationSetterContext.Provider value={{ locationSetter, setLocationSetter }}>
      {children}
    </LocationSetterContext.Provider>
  );
};

export const useLocationSetter = () => useContext(LocationSetterContext);
