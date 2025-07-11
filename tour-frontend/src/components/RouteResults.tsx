import React from 'react';
import { Box, Typography, Alert, CircularProgress } from '@mui/material';
import { useRoutesStore } from '../store/routesStore';
import { RouteResultCard } from './RouteResultCard';
import { Route } from '../types/routes';

interface RouteResultsProps {
  onRouteSelect?: (route: Route) => void;
}

export const RouteResults: React.FC<RouteResultsProps> = ({ onRouteSelect }) => {
  const { routes, loading, error } = useRoutesStore();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (routes.length === 0) {
    return null;
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        검색 결과 ({routes.length}개 경로)
      </Typography>
      {routes.map((route, index) => (
        <RouteResultCard
          key={index}
          route={route}
          index={index}
          onSelect={onRouteSelect}
        />
      ))}
    </Box>
  );
};