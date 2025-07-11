import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LocationData {
  lat: number;
  lng: number;
  placeName: string;
  placeAddress: string;
  placeId?: string;
}

interface RouteData {
  origin: LocationData;
  destination: LocationData;
  selectedRoute?: {
    description: string;
    totalDuration: number;
    totalPrice: number;
    steps: Array<{
      travelMode: string;
      transitDetails?: {
        transitLine: {
          name: string;
          vehicle?: { type: string };
        };
      };
      staticDuration: string;
      distanceMeters: number;
    }>;
  };
}

interface TravelContextType {
  // 위치 관련
  locationData: LocationData | null;
  setLocationData: (data: LocationData | null) => void;
  
  // 경로 관련
  routeData: RouteData | null;
  setRouteData: (data: RouteData | null) => void;
  
  // 선택된 장소들 (여행지 목록)
  selectedPlaces: LocationData[];
  addPlace: (place: LocationData) => void;
  removePlace: (index: number) => void;
  clearPlaces: () => void;
}

const TravelContext = createContext<TravelContextType | undefined>(undefined);

interface TravelProviderProps {
  children: ReactNode;
}

export const TravelProvider: React.FC<TravelProviderProps> = ({ children }) => {
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [selectedPlaces, setSelectedPlaces] = useState<LocationData[]>([]);

  const addPlace = (place: LocationData) => {
    setSelectedPlaces(prev => [...prev, place]);
  };

  const removePlace = (index: number) => {
    setSelectedPlaces(prev => prev.filter((_, i) => i !== index));
  };

  const clearPlaces = () => {
    setSelectedPlaces([]);
  };

  const value: TravelContextType = {
    locationData,
    setLocationData,
    routeData,
    setRouteData,
    selectedPlaces,
    addPlace,
    removePlace,
    clearPlaces,
  };

  return (
    <TravelContext.Provider value={value}>
      {children}
    </TravelContext.Provider>
  );
};

export const useTravel = (): TravelContextType => {
  const context = useContext(TravelContext);
  if (context === undefined) {
    throw new Error('useTravel must be used within a TravelProvider');
  }
  return context;
};

// 기존 LocationContext와의 호환성을 위한 래퍼
export const useLocation = () => {
  const { locationData, setLocationData } = useTravel();
  return { locationData, setLocationData };
};