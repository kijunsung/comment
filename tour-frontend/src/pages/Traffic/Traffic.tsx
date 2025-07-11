import React, { useState } from 'react';
import { Container, Typography, Box } from '@mui/material';
import { RouteSearchForm } from '../../components/RouteSearchForm';
import { RouteResults } from '../../components/RouteResults';
import { TrafficSummary } from '../../components/TrafficSummary';
import { RoutesProvider } from '../../context/RoutesContext';
import { Route } from '../../types/routes';
import { TrafficData } from '../../types/traffic';
import { durationToTime, getVehicleDisplayName } from '../../utils/routeUtils';
import { TrafficApiService } from '../../services/trafficApi';
import { YOUR_GOOGLE_MAPS_API_KEY } from '../../_env/env.local';

const GOOGLE_MAPS_API_KEY = YOUR_GOOGLE_MAPS_API_KEY || '';
const API_BASE_URL = 'http://localhost:3001/api';

export const Traffic: React.FC = () => {
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [trafficDataList, setTrafficDataList] = useState<TrafficData[]>([]);
  const [currentTourId] = useState<bigint>(BigInt(1)); // 실제로는 props나 context에서 받아올 값

  const trafficApiService = new TrafficApiService(API_BASE_URL);

  const handleRouteSelect = async (route: Route) => {
    setSelectedRoute(route);
    
    try {
      // 경로의 각 교통수단별로 TrafficData 생성
      const newTrafficDataList: Omit<TrafficData, 'trafficId'>[] = [];
      
      route.legs[0]?.steps.forEach((step) => {
        if (step.travelMode === 'TRANSIT' && step.transitDetails) {
          const trafficData: Omit<TrafficData, 'trafficId'> = {
            tourId: currentTourId,
            vehicle: step.transitDetails.transitLine.name || getVehicleDisplayName(step.travelMode),
            spendTime: durationToTime(step.staticDuration),
            price: calculateEstimatedPrice(step.distanceMeters, step.transitDetails.transitLine.vehicle?.type),
          };
          newTrafficDataList.push(trafficData);
        }
      });

      // 백엔드에 저장
      const savedTrafficData: TrafficData[] = [];
      for (const data of newTrafficDataList) {
        const saved = await trafficApiService.saveTrafficData(data);
        savedTrafficData.push(saved);
      }

      setTrafficDataList(prev => [...prev, ...savedTrafficData]);
      
    } catch (error) {
      console.error('교통 데이터 저장 실패:', error);
    }
  };

  // 간단한 요금 계산 함수 (실제로는 더 복잡한 로직 필요)
  const calculateEstimatedPrice = (distanceMeters: number, vehicleType?: string): number => {
    const distanceKm = distanceMeters / 1000;
    
    switch (vehicleType) {
      case 'BUS':
        return distanceKm < 10 ? 1500 : 2000;
      case 'SUBWAY':
        return distanceKm < 10 ? 1500 : 2150;
      case 'TRAIN':
        return Math.max(2000, Math.round(distanceKm * 150));
      default:
        return 1500;
    }
  };

  return (
    <RoutesProvider apiKey={GOOGLE_MAPS_API_KEY}>
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            여행 계획 도우미
          </Typography>
          
          {/* Flexbox를 사용한 반응형 레이아웃 - Grid 대신 */}
          <Box 
            sx={{ 
              display: 'flex',
              flexDirection: { xs: 'column', lg: 'row' },
              gap: 3,
              mt: 3
            }}
          >
            {/* 왼쪽 컬럼 - 메인 콘텐츠 */}
            <Box 
              sx={{ 
                flex: { xs: '1', lg: '2' }, // lg에서 2/3 차지
                display: 'flex',
                flexDirection: 'column',
                gap: 3
              }}
            >
              <RouteSearchForm />
              <RouteResults onRouteSelect={handleRouteSelect} />
            </Box>
            
            {/* 오른쪽 컬럼 - 사이드바 */}
            <Box 
              sx={{ 
                flex: { xs: '1', lg: '1' }, // lg에서 1/3 차지
                display: 'flex',
                flexDirection: 'column',
                gap: 3
              }}
            >
              {trafficDataList.length > 0 && (
                <TrafficSummary 
                  trafficData={trafficDataList} 
                  tourId={currentTourId}
                />
              )}
              
              {selectedRoute && (
                <Box 
                  sx={{ 
                    p: 2, 
                    bgcolor: 'success.light', 
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'success.main'
                  }}
                >
                  <Typography variant="h6" color="success.dark" gutterBottom>
                    선택된 경로: {selectedRoute.description}
                  </Typography>
                  <Typography variant="body2" color="success.dark">
                    교통비가 자동으로 계산되어 저장되었습니다.
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Container>
    </RoutesProvider>
  );
};