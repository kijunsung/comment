import React, { createContext, useContext, useCallback, ReactNode } from 'react';
import { GoogleRoutesApiService } from '../services/routesApi';
import { RouteSearchParams } from '../types/routes';
import { useRoutesStore } from '../store/routesStore';

interface RoutesContextType {
  searchRoutes: (params: RouteSearchParams) => Promise<void>;
}

const RoutesContext = createContext<RoutesContextType | undefined>(undefined);

interface RoutesProviderProps {
  children: ReactNode;
  apiKey: string;
}

export const RoutesProvider: React.FC<RoutesProviderProps> = ({ children, apiKey }) => {
  const { setRoutes, setLoading, setError } = useRoutesStore();
  const routesService = new GoogleRoutesApiService(apiKey);

  const searchRoutes = useCallback(async (params: RouteSearchParams) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await routesService.getTransitRoutes(
        params.origin,
        params.destination,
        {
          departureTime: params.departureTime,
          arrivalTime: params.arrivalTime,
          transitModes: params.transitModes,
          transitRoutePreference: params.transitRoutePreference
        }
      );
      
      setRoutes(response.routes);
    } catch (err) {
      setError(err instanceof Error ? err.message : '경로 검색 중 오류가 발생했습니다.');
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  }, [routesService, setRoutes, setLoading, setError]);

  return (
    <RoutesContext.Provider value={{ searchRoutes }}>
      {children}
    </RoutesContext.Provider>
  );
};

export const useRoutes = () => {
  const context = useContext(RoutesContext);
  if (context === undefined) {
    throw new Error('useRoutes must be used within a RoutesProvider');
  }
  return context;
};