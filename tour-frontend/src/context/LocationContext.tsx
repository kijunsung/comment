import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LocationData {
  lat: number;
  lng: number;
  placeName?: string;
  placeAddress?: string;
}

interface LocationContextType {
  locationData: LocationData | null;
  setLocationData: (data: LocationData | null) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
  const [locationData, setLocationData] = useState<LocationData | null>(null);

  return (
    <LocationContext.Provider value={{ locationData, setLocationData }}>
      {children}
    </LocationContext.Provider>
  );
};