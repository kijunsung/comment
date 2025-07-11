import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  GoogleMap,
  Marker,
  Autocomplete,
  useLoadScript,
} from '@react-google-maps/api';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ko } from 'date-fns/locale';
import { YOUR_GOOGLE_MAPS_API_KEY } from '../_env/env.local';
import { useTravel } from '../context/TravelContext';

const libraries: ('places')[] = ['places'];

interface LocationData {
  lat: number;
  lng: number;
  placeName: string;
  placeAddress: string;
  placeId?: string;
}

interface RouteStep {
  travelMode: string;
  transitDetails?: {
    transitLine: {
      name: string;
      vehicle?: { type: string };
    };
  };
  staticDuration: string;
  distanceMeters: number;
}

interface Route {
  description: string;
  legs: Array<{
    steps: RouteStep[];
  }>;
  totalDuration: number;
  totalPrice: number;
}

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '8px',
  overflow: 'hidden',
};

const initialCenter = {
  lat: 37.5665,
  lng: 126.9780,
};

const IntegratedTravelPlanner: React.FC = () => {
  // Google Maps 로드
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: YOUR_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  // 상태 관리
  const [origin, setOrigin] = useState<LocationData | null>(null);
  const [destination, setDestination] = useState<LocationData | null>(null);
  const [isSelectingOrigin, setIsSelectingOrigin] = useState(true);
  const [departureTime, setDepartureTime] = useState<Date | null>(null);
  const [transitPreference, setTransitPreference] = useState<'LESS_WALKING' | 'FEWER_TRANSFERS'>('LESS_WALKING');
  const [selectedModes, setSelectedModes] = useState<string[]>(['BUS', 'SUBWAY', 'TRAIN']);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<google.maps.LatLngLiteral | null>(null);

  // 검색 입력 ref
  const originAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const destinationAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // 교통수단 옵션
  const transitModes = [
    { value: 'BUS', label: '버스', icon: '🚌' },
    { value: 'SUBWAY', label: '지하철', icon: '🚇' },
    { value: 'TRAIN', label: '기차', icon: '🚄' },
    { value: 'LIGHT_RAIL', label: '경전철', icon: '🚊' },
  ];

  // Autocomplete 로드 핸들러
  const onOriginAutocompleteLoad = (autocomplete: google.maps.places.Autocomplete) => {
    originAutocompleteRef.current = autocomplete;
    autocomplete.setComponentRestrictions({ country: 'kr' });
    autocomplete.setTypes(['establishment', 'geocode']);
  };

  const onDestinationAutocompleteLoad = (autocomplete: google.maps.places.Autocomplete) => {
    destinationAutocompleteRef.current = autocomplete;
    autocomplete.setComponentRestrictions({ country: 'kr' });
    autocomplete.setTypes(['establishment', 'geocode']);
  };

  // 장소 선택 핸들러
  const handlePlaceSelect = useCallback((isOrigin: boolean) => {
    const autocomplete = isOrigin ? originAutocompleteRef.current : destinationAutocompleteRef.current;
    const place = autocomplete?.getPlace();
    
    if (!place?.geometry?.location) return;

    const locationData: LocationData = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
      placeName: place.name || '선택된 장소',
      placeAddress: place.formatted_address || '주소 정보 없음',
      placeId: place.place_id,
    };

    if (isOrigin) {
      setOrigin(locationData);
      setIsSelectingOrigin(false); // 출발지 선택 후 도착지 선택 모드로
    } else {
      setDestination(locationData);
    }

    // 지도 이동
    if (place.geometry.viewport) {
      mapRef?.fitBounds(place.geometry.viewport);
    } else {
      mapRef?.panTo({ lat: locationData.lat, lng: locationData.lng });
      mapRef?.setZoom(15);
    }

    setSelectedLocation({ lat: locationData.lat, lng: locationData.lng });
  }, [mapRef]);

  // 지도 클릭 핸들러
  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;

    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    const location = { lat, lng };

    setSelectedLocation(location);

    // Geocoding을 통해 주소 정보 가져오기
    if (mapRef) {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location }, (results, status) => {
        if (status === 'OK' && results?.[0]) {
          const locationData: LocationData = {
            lat,
            lng,
            placeName: results[0].formatted_address.split(',')[0] || '선택된 위치',
            placeAddress: results[0].formatted_address,
          };

          if (isSelectingOrigin) {
            setOrigin(locationData);
            setIsSelectingOrigin(false);
          } else {
            setDestination(locationData);
          }
        }
      });
    }
  }, [mapRef, isSelectingOrigin]);

  // POI 클릭 핸들러
  const handlePOIClick = useCallback((placeId: string, latLng: google.maps.LatLng) => {
    if (!mapRef) return;

    const service = new google.maps.places.PlacesService(mapRef);
    service.getDetails(
      {
        placeId: placeId,
        fields: ['name', 'formatted_address', 'geometry', 'place_id']
      },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          const locationData: LocationData = {
            lat: latLng.lat(),
            lng: latLng.lng(),
            placeName: place.name || '선택된 장소',
            placeAddress: place.formatted_address || '주소 정보 없음',
            placeId: place.place_id,
          };

          if (isSelectingOrigin) {
            setOrigin(locationData);
            setIsSelectingOrigin(false);
          } else {
            setDestination(locationData);
          }

          setSelectedLocation({ lat: latLng.lat(), lng: latLng.lng() });
        }
      }
    );
  }, [mapRef, isSelectingOrigin]);

  // 교통수단 토글
  const handleModeToggle = (mode: string) => {
    setSelectedModes(prev => 
      prev.includes(mode) 
        ? prev.filter(m => m !== mode)
        : [...prev, mode]
    );
  };

  // 위치 초기화
  const clearLocations = () => {
    setOrigin(null);
    setDestination(null);
    setSelectedLocation(null);
    setIsSelectingOrigin(true);
    setRoutes([]);
  };

  // 출발지/도착지 교체
  const swapLocations = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
    // 현재 선택 위치도 업데이트
    if (destination) {
      setSelectedLocation({ lat: destination.lat, lng: destination.lng });
    }
  };

  // 선택 모드 변경
  const setSelectionMode = (isOrigin: boolean) => {
    setIsSelectingOrigin(isOrigin);
  };

  // 경로 검색
  const searchRoutes = async () => {
    if (!origin || !destination) {
      alert('출발지와 도착지를 모두 선택해주세요.');
      return;
    }

    setLoading(true);
    try {
      // 실제로는 Google Routes API 또는 대중교통 API 호출
      // 여기서는 목업 데이터로 대체
      const mockRoutes: Route[] = [
        {
          description: `${origin.placeName} → ${destination.placeName}`,
          legs: [{
            steps: [
              {
                travelMode: 'TRANSIT',
                transitDetails: {
                  transitLine: {
                    name: '2호선',
                    vehicle: { type: 'SUBWAY' }
                  }
                },
                staticDuration: '25분',
                distanceMeters: 8500
              },
              {
                travelMode: 'TRANSIT',
                transitDetails: {
                  transitLine: {
                    name: '472번',
                    vehicle: { type: 'BUS' }
                  }
                },
                staticDuration: '15분',
                distanceMeters: 3200
              }
            ]
          }],
          totalDuration: 40,
          totalPrice: 2650
        },
        {
          description: `${origin.placeName} → ${destination.placeName}`,
          legs: [{
            steps: [
              {
                travelMode: 'TRANSIT',
                transitDetails: {
                  transitLine: {
                    name: '153번',
                    vehicle: { type: 'BUS' }
                  }
                },
                staticDuration: '45분',
                distanceMeters: 12800
              }
            ]
          }],
          totalDuration: 45,
          totalPrice: 2000
        },
        {
          description: `${origin.placeName} → ${destination.placeName}`,
          legs: [{
            steps: [
              {
                travelMode: 'TRANSIT',
                transitDetails: {
                  transitLine: {
                    name: '9호선',
                    vehicle: { type: 'SUBWAY' }
                  }
                },
                staticDuration: '35분',
                distanceMeters: 11200
              }
            ]
          }],
          totalDuration: 35,
          totalPrice: 2150
        }
      ];

      // API 호출 시뮬레이션
      setTimeout(() => {
        setRoutes(mockRoutes);
        setLoading(false);
      }, 1500);

    } catch (error) {
      console.error('경로 검색 실패:', error);
      setLoading(false);
    }
  };

  // 요금 계산
  const calculatePrice = (distanceMeters: number, vehicleType?: string): number => {
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

  // Travel Context 사용
  const { routeData, setRouteData, addPlace } = useTravel();

  // 경로 선택 핸들러
  const handleRouteSelect = (route: Route) => {
    if (!origin || !destination) return;
    
    const newRouteData = {
      origin,
      destination,
      selectedRoute: {
        description: route.description,
        totalDuration: route.totalDuration,
        totalPrice: route.totalPrice,
        steps: route.legs[0]?.steps || []
      }
    };
    
    setRouteData(newRouteData);
    
    // 선택된 장소들을 여행지 목록에 추가
    addPlace(origin);
    addPlace(destination);
    
    alert(`경로가 선택되었습니다!\n소요시간: ${route.totalDuration}분\n요금: ${route.totalPrice.toLocaleString()}원\n\n이 경로가 여행 계획에 저장되었습니다.`);
  };

  if (loadError) return <div>지도를 불러오는 중 오류 발생</div>;
  if (!isLoaded) return <div>지도를 불러오는 중...</div>;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
          🚇 스마트 여행 교통편 안내
        </Typography>

        <Grid container spacing={3}>
          {/* 왼쪽: 지도 영역 */}
          <Grid item xs={12} lg={8}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                📍 지도에서 장소 선택
              </Typography>
              
              {/* 현재 선택 모드 표시 */}
              <Alert 
                severity={isSelectingOrigin ? "info" : "success"} 
                sx={{ mb: 2 }}
              >
                {isSelectingOrigin 
                  ? "🔵 출발지를 선택해주세요. 지도를 클릭하거나 검색하세요."
                  : "🟢 도착지를 선택해주세요. 지도를 클릭하거나 검색하세요."
                }
              </Alert>

              {/* 지도 위 검색 바 */}
              <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <Autocomplete onLoad={onOriginAutocompleteLoad} onPlaceChanged={() => handlePlaceSelect(true)}>
                  <TextField
                    placeholder="출발지 검색..."
                    size="small"
                    sx={{ minWidth: 200 }}
                    InputProps={{
                      startAdornment: <span style={{ marginRight: 8 }}>🔵</span>
                    }}
                  />
                </Autocomplete>
                
                <Autocomplete onLoad={onDestinationAutocompleteLoad} onPlaceChanged={() => handlePlaceSelect(false)}>
                  <TextField
                    placeholder="도착지 검색..."
                    size="small"
                    sx={{ minWidth: 200 }}
                    InputProps={{
                      startAdornment: <span style={{ marginRight: 8 }}>🟢</span>
                    }}
                  />
                </Autocomplete>

                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={swapLocations}
                  disabled={!origin || !destination}
                >
                  ↕️ 교체
                </Button>
                
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={clearLocations}
                >
                  🗑️ 초기화
                </Button>
              </Box>

              {/* 선택 모드 토글 버튼 */}
              <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                <Button
                  variant={isSelectingOrigin ? "contained" : "outlined"}
                  size="small"
                  onClick={() => setSelectionMode(true)}
                  startIcon={<span>🔵</span>}
                >
                  출발지 선택
                </Button>
                <Button
                  variant={!isSelectingOrigin ? "contained" : "outlined"}
                  size="small"
                  onClick={() => setSelectionMode(false)}
                  startIcon={<span>🟢</span>}
                >
                  도착지 선택
                </Button>
              </Box>

              {/* Google Map */}
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={selectedLocation || initialCenter}
                zoom={selectedLocation ? 15 : 12}
                onLoad={(map) => {
                  setMapRef(map);
                  map.addListener('click', (event: google.maps.MapMouseEvent & { placeId?: string }) => {
                    if (event.placeId) {
                      event.stop();
                      handlePOIClick(event.placeId, event.latLng as google.maps.LatLng);
                    } else {
                      handleMapClick(event);
                    }
                  });
                }}
                options={{
                  clickableIcons: true,
                  disableDefaultUI: false,
                  gestureHandling: 'cooperative',
                }}
              >
                {/* 출발지 마커 */}
                {origin && (
                  <Marker 
                    position={{ lat: origin.lat, lng: origin.lng }}
                    icon={{
                      url: 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234285f4"%3E%3Cpath d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/%3E%3C/svg%3E',
                      scaledSize: new google.maps.Size(40, 40),
                    }}
                    title={`출발지: ${origin.placeName}`}
                  />
                )}
                
                {/* 도착지 마커 */}
                {destination && (
                  <Marker 
                    position={{ lat: destination.lat, lng: destination.lng }}
                    icon={{
                      url: 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2334a853"%3E%3Cpath d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/%3E%3C/svg%3E',
                      scaledSize: new google.maps.Size(40, 40),
                    }}
                    title={`도착지: ${destination.placeName}`}
                  />
                )}
              </GoogleMap>

              {/* 선택된 위치 정보 */}
              <Box sx={{ mt: 2 }}>
                {origin && (
                  <Box sx={{ mb: 1, p: 2, bgcolor: 'primary.50', borderRadius: 1, border: '1px solid', borderColor: 'primary.200' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" color="primary">
                          <strong>🔵 출발지:</strong> {origin.placeName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {origin.placeAddress}
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => addPlace(origin)}
                        sx={{ ml: 1, minWidth: 'auto' }}
                      >
                        ➕ 여행지 추가
                      </Button>
                    </Box>
                  </Box>
                )}
                
                {destination && (
                  <Box sx={{ p: 2, bgcolor: 'success.50', borderRadius: 1, border: '1px solid', borderColor: 'success.200' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" color="success.main">
                          <strong>🟢 도착지:</strong> {destination.placeName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {destination.placeAddress}
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        variant="outlined"
                        color="success"
                        onClick={() => addPlace(destination)}
                        sx={{ ml: 1, minWidth: 'auto' }}
                      >
                        ➕ 여행지 추가
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* 오른쪽: 교통편 검색 및 결과 */}
          <Grid item xs={12} lg={4}>
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                🚌 교통편 옵션
              </Typography>

              {/* 교통수단 선택 */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  이용할 교통수단
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {transitModes.map((mode) => (
                    <Chip
                      key={mode.value}
                      label={`${mode.icon} ${mode.label}`}
                      clickable
                      color={selectedModes.includes(mode.value) ? 'primary' : 'default'}
                      onClick={() => handleModeToggle(mode.value)}
                      size="small"
                    />
                  ))}
                </Stack>
              </Box>

              {/* 출발 시간 */}
              <Box sx={{ mb: 3 }}>
                <DateTimePicker
                  label="출발 시간 (선택사항)"
                  value={departureTime}
                  onChange={setDepartureTime}
                  slotProps={{ 
                    textField: { 
                      size: 'small', 
                      fullWidth: true 
                    } 
                  }}
                />
              </Box>

              {/* 경로 선호도 */}
              <Box sx={{ mb: 3 }}>
                <FormControl size="small" fullWidth>
                  <InputLabel>경로 선호도</InputLabel>
                  <Select
                    value={transitPreference}
                    label="경로 선호도"
                    onChange={(e) => setTransitPreference(e.target.value as 'LESS_WALKING' | 'FEWER_TRANSFERS')}
                  >
                    <MenuItem value="LESS_WALKING">👟 걷기 적게</MenuItem>
                    <MenuItem value="FEWER_TRANSFERS">🔄 환승 적게</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* 검색 버튼 */}
              <Button
                variant="contained"
                size="large"
                onClick={searchRoutes}
                disabled={loading || !origin || !destination || selectedModes.length === 0}
                fullWidth
                sx={{ mb: 3 }}
              >
                {loading ? '검색 중...' : '🔍 교통편 검색'}
              </Button>
            </Paper>

            {/* 현재 선택된 경로 정보 */}
            {routeData && (
              <Paper elevation={3} sx={{ p: 3, mb: 3, bgcolor: 'success.50', border: '1px solid', borderColor: 'success.main' }}>
                <Typography variant="h6" gutterBottom color="success.dark">
                  ✅ 선택된 경로
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>{routeData.origin.placeName}</strong> → <strong>{routeData.destination.placeName}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  소요시간: {routeData.selectedRoute?.totalDuration}분 | 요금: {routeData.selectedRoute?.totalPrice.toLocaleString()}원
                </Typography>
                <Button 
                  size="small" 
                  onClick={() => setRouteData(null)}
                  sx={{ mt: 1 }}
                >
                  🗑️ 선택 해제
                </Button>
              </Paper>
            )}

            {/* 검색 결과 */}
            {routes.length > 0 && (
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  🚇 추천 경로 ({routes.length}개)
                </Typography>
                
                {routes.map((route, index) => (
                  <Card key={index} sx={{ mb: 2 }} variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        경로 {index + 1}
                      </Typography>
                      
                      {route.legs[0]?.steps.map((step, stepIndex) => (
                        <Box key={stepIndex} sx={{ mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <span>
                              {step.transitDetails?.transitLine.vehicle?.type === 'BUS' ? '🚌' :
                                step.transitDetails?.transitLine.vehicle?.type === 'SUBWAY' ? '🚇' :
                                step.transitDetails?.transitLine.vehicle?.type === 'TRAIN' ? '🚄' : '🚊'}
                            </span>
                            <Typography variant="body2">
                              <strong>{step.transitDetails?.transitLine.name}</strong>
                            </Typography>
                            <Chip 
                              label={step.staticDuration} 
                              size="small" 
                              color="primary" 
                              variant="outlined"
                            />
                            <Chip 
                              label={`${calculatePrice(step.distanceMeters, step.transitDetails?.transitLine.vehicle?.type)}원`}
                              size="small" 
                              color="success" 
                              variant="outlined"
                            />
                          </Box>
                        </Box>
                      ))}
                      
                      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #eee' }}>
                        <Typography variant="body2" color="text.secondary">
                          총 소요시간: {route.totalDuration}분
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          총 요금: {route.totalPrice.toLocaleString()}원
                        </Typography>
                      </Box>
                      
                      <Button 
                        variant="contained" 
                        size="small" 
                        fullWidth 
                        sx={{ mt: 2 }}
                        onClick={() => handleRouteSelect(route)}
                      >
                        ✅ 이 경로 선택
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </Paper>
            )}

            {/* 로딩 상태 */}
            {loading && (
              <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1">
                  🔍 최적의 경로를 찾고 있습니다...
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Container>
    </LocalizationProvider>
  );
};

export default IntegratedTravelPlanner;