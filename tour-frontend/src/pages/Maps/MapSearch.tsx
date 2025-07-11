import React, { useRef, useState, useCallback } from 'react';
import {
  GoogleMap,
  Marker,
  Autocomplete,
  useLoadScript,
} from '@react-google-maps/api';
import { useLocation } from '../../context/LocationContext';
import { YOUR_GOOGLE_MAPS_API_KEY } from '../../_env/env.local'; // 구글 API 키를 config 파일에서 가져옵니다.

const libraries: ('places')[] = ['places'];

const mapContainerStyle = {
  width: '100%',
  height: '500px', // 600px에서 500px로 조정
  borderRadius: '8px',
  overflow: 'hidden',
};

const initialCenter = {
  lat: 37.5665,
  lng: 126.9780,
};

const MapSearch: React.FC = () => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: YOUR_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  // LocationContext 사용
  const { setLocationData } = useLocation();

  const [selectedLocation, setSelectedLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [placeName, setPlaceName] = useState<string>('');
  const [placeAddress, setPlaceAddress] = useState<string>('');
  const [placeDetails, setPlaceDetails] = useState<google.maps.places.PlaceResult | null>(null);
  const [isInfoWindowOpen, setIsInfoWindowOpen] = useState<boolean>(false);
  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const onLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
    
    // 한국 지역으로 검색 결과 제한
    autocomplete.setComponentRestrictions({ country: 'kr' });
    
    // 검색할 장소 유형 설정
    autocomplete.setTypes(['establishment', 'geocode']);
  };

  // 위치 데이터를 Context에 업데이트하는 함수
  const updateLocationContext = useCallback((location: google.maps.LatLngLiteral, name: string, address: string) => {
    setLocationData({
      lat: location.lat,
      lng: location.lng,
      placeName: name,
      placeAddress: address
    });
  }, [setLocationData]);

  // POI 클릭 처리 함수
  const handlePOIClick = useCallback((placeId: string, latLng: google.maps.LatLng) => {
    if (!mapRef) return;
    
    const service = new google.maps.places.PlacesService(mapRef);
    
    service.getDetails(
      {
        placeId: placeId,
        fields: [
          'name', 
          'formatted_address', 
          'geometry', 
          'rating', 
          'user_ratings_total',
          'photos',
          'opening_hours',
          'formatted_phone_number',
          'website',
          'types',
          'price_level'
        ]
      },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          const location = {
            lat: latLng.lat(),
            lng: latLng.lng()
          };
          
          // 모든 InfoWindow 닫기
          closeAllInfoWindows();
          
          const name = place.name || '알 수 없는 장소';
          const address = place.formatted_address || '주소 정보 없음';
          
          setSelectedLocation(location);
          setPlaceName(name);
          setPlaceAddress(address);
          setPlaceDetails(place);
          
          // Context 업데이트
          updateLocationContext(location, name, address);
          
          // 검색 기록 추가
          const searchTerm = place.name || '';
          if (searchTerm && !searchHistory.includes(searchTerm)) {
            setSearchHistory(prev => [searchTerm, ...prev.slice(0, 4)]);
          }
          
          // InfoWindow 열기
          setTimeout(() => setIsInfoWindowOpen(true), 150);
        }
      }
    );
  }, [mapRef, searchHistory, updateLocationContext]);

  const moveToPlace = useCallback((place: google.maps.places.PlaceResult) => {
    if (!place.geometry?.location) {
      return;
    }

    const location = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };

    // 모든 InfoWindow 닫기
    closeAllInfoWindows();

    const name = place.name || '알 수 없는 장소';
    const address = place.formatted_address || '주소 정보 없음';

    setSelectedLocation(location);
    setPlaceName(name);
    setPlaceAddress(address);
    setPlaceDetails(place); // 검색으로 찾은 장소의 상세 정보 설정
    
    // Context 업데이트
    updateLocationContext(location, name, address);
    
    // 검색 기록 추가
    const searchTerm = place.name || place.formatted_address || '';
    if (searchTerm && !searchHistory.includes(searchTerm)) {
      setSearchHistory(prev => [searchTerm, ...prev.slice(0, 4)]);
    }

    // 지도 이동 및 줌
    if (place.geometry.viewport) {
      mapRef?.fitBounds(place.geometry.viewport);
    } else {
      mapRef?.panTo(location);
      mapRef?.setZoom(17);
    }

    // InfoWindow 열기
    setTimeout(() => setIsInfoWindowOpen(true), 150);
  }, [mapRef, searchHistory, updateLocationContext]);

  const onPlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    if (!place) return;
    moveToPlace(place);
  };

  // 엔터 키 처리
  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const input = inputRef.current?.value.trim();
      
      if (!input || !mapRef) return;

      setIsSearching(true);
      
      try {
        const service = new google.maps.places.AutocompleteService();
        
        service.getPlacePredictions(
          { 
            input,
            componentRestrictions: { country: 'kr' },
            types: ['establishment', 'geocode']
          }, 
          (predictions, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && predictions?.length) {
              const placesService = new google.maps.places.PlacesService(mapRef);
              const placeId = predictions[0].place_id;

              placesService.getDetails(
                { 
                  placeId,
                  fields: [
                    'name', 'formatted_address', 'geometry', 'place_id', 'photos', 
                    'rating', 'user_ratings_total', 'opening_hours', 'formatted_phone_number', 
                    'website', 'types', 'price_level'
                  ]
                }, 
                (place, detailStatus) => {
                  if (detailStatus === google.maps.places.PlacesServiceStatus.OK && place) {
                    moveToPlace(place);
                  } else {
                    alert('검색 결과를 가져올 수 없습니다.');
                  }
                  setIsSearching(false);
                }
              );
            } else {
              alert('검색 결과가 없습니다.');
              setIsSearching(false);
            }
          }
        );
      } catch (error) {
        console.error('검색 중 오류:', error);
        alert('검색 중 오류가 발생했습니다.');
        setIsSearching(false);
      }
    }
  };

  // 기본 InfoWindow를 완전히 닫는 함수
  const closeAllInfoWindows = useCallback(() => {
    if (mapRef) {
      const infoWindows = mapRef.get('infoWindows') || [];
      infoWindows.forEach((infoWindow: google.maps.InfoWindow) => {
        infoWindow.close();
      });
      setIsInfoWindowOpen(false);
    }
  }, [mapRef]);

  // 지도 클릭 시 마커 설정 (POI가 아닌 일반 지도 클릭)
  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    
    // POI 클릭인 경우 처리하지 않음
    if ('placeId' in e && e.placeId) {
      return;
    }
    
    // 모든 InfoWindow 닫기
    closeAllInfoWindows();
    
    // 도로명 주소인 경우 InfoWindow를 생성하지 않음
    // 마커나 InfoWindow를 생성하지 않고 그냥 return
    return;
  }, [closeAllInfoWindows]);

  // 현재 위치로 이동
  const goToCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          
          setSelectedLocation(currentLocation);
          setPlaceName('현재 위치');
          setPlaceAddress('내 위치');
          setPlaceDetails(null);
          setIsInfoWindowOpen(true);
          
          // Context 업데이트
          updateLocationContext(currentLocation, '현재 위치', '내 위치');
          
          mapRef?.panTo(currentLocation);
          mapRef?.setZoom(17);
        },
        (error) => {
          console.error('위치 정보를 가져올 수 없습니다:', error);
          alert('위치 정보에 접근할 수 없습니다. 브라우저 설정을 확인해주세요.');
        }
      );
    } else {
      alert('이 브라우저는 위치 서비스를 지원하지 않습니다.');
    }
  };

  // 검색 초기화
  const clearSearch = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    setSelectedLocation(null);
    setIsInfoWindowOpen(false);
    setPlaceName('');
    setPlaceAddress('');
    setPlaceDetails(null);
    
    // Context 초기화
    setLocationData(null);
  };

  // 사진 URL 생성 함수
  const getPhotoUrl = (photo: google.maps.places.PlacePhoto) => {
    return photo.getUrl({ maxWidth: 200, maxHeight: 200 });
  };

  // 가격 레벨 표시 함수
  const getPriceLevelText = (priceLevel: number) => {
    const priceLevels = ['무료', '저렴', '보통', '비싼', '매우 비싼'];
    return priceLevels[priceLevel] || '';
  };

  if (loadError) return <div>지도를 불러오는 중 오류 발생</div>;
  if (!isLoaded) return <div>지도를 불러오는 중...</div>;

  return (
    <div style={{ position: 'relative' }}>
      {/* 검색 컨트롤 영역 */}
      <div style={{ 
        marginBottom: '10px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px',
        flexWrap: 'wrap'
      }}>
        <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
          <input
            ref={inputRef}
            type="text"
            placeholder="장소를 검색하세요..."
            onKeyDown={handleKeyDown}
            disabled={isSearching}
            style={{
              width: '400px',
              height: '40px',
              padding: '0 15px',
              borderRadius: '25px',
              border: '2px solid #ddd',
              fontSize: '16px',
              outline: 'none',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              transition: 'border-color 0.3s',
            }}
            onFocus={(e) => e.target.style.borderColor = '#4285f4'}
            onBlur={(e) => e.target.style.borderColor = '#ddd'}
          />
        </Autocomplete>
        
        <button
          onClick={goToCurrentLocation}
          style={{
            padding: '10px 15px',
            backgroundColor: '#4285f4',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
          title="현재 위치로 이동"
        >
          📍 내 위치
        </button>
        
        <button
          onClick={clearSearch}
          style={{
            padding: '10px 15px',
            backgroundColor: '#f1f3f4',
            color: '#5f6368',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
          title="검색 초기화"
        >
          🗑️초기화
        </button>
      </div>

      {/* 검색 기록 표시 */}
      {searchHistory.length > 0 && (
        <div style={{ 
          marginBottom: '10px',
          fontSize: '14px',
          color: '#5f6368'
        }}>
          <strong>최근 검색:</strong> {searchHistory.join(' • ')}
        </div>
      )}

      {/* 로딩 상태 표시 */}
      {isSearching && (
        <div style={{
          position: 'absolute',
          top: '60px',
          left: '20px',
          backgroundColor: 'white',
          padding: '10px',
          borderRadius: '5px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          zIndex: 1000,
        }}>
          검색 중...
        </div>
      )}

      {/* 지도 좌측 장소 정보 패널 */}
      {selectedLocation && isInfoWindowOpen && (
        <div 
          style={{
            position: 'absolute',
            top: '84px',
            left: '-280px',
            width: '350px',
            maxHeight: '600px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000,
            overflow: 'hidden',
            border: '1px solid #e0e0e0'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 닫기 버튼 */}
          <button
            onClick={() => setIsInfoWindowOpen(false)}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              width: '30px',
              height: '30px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '16px',
              color: '#5f6368',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1001,
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#f1f3f4'}
            onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'}
            title="닫기"
          >
            ✕
          </button>

          <div style={{
            padding: '20px',
            maxHeight: '580px',
            overflowY: 'auto'
          }}>
            {/* 사진 표시 */}
            {placeDetails?.photos && placeDetails.photos.length > 0 && (
              <img 
                src={getPhotoUrl(placeDetails.photos[0])} 
                alt={placeDetails.name}
                style={{ 
                  width: '100%', 
                  height: '200px',
                  objectFit: 'cover',
                  marginBottom: '15px',
                  borderRadius: '6px'
                }}
              />
            )}
            
            {/* 장소명 */}
            <div style={{
              fontWeight: 'bold',
              fontSize: '20px',
              marginBottom: '12px',
              color: '#202124',
              lineHeight: '1.3',
              paddingRight: '30px' // 닫기 버튼 공간 확보
            }}>
              {placeDetails?.name || placeName}
            </div>
            
            {/* 평점 및 리뷰 수 */}
            {placeDetails?.rating && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '12px' 
              }}>
                <span style={{ color: '#fbbc04', fontSize: '16px' }}>⭐</span>
                <span style={{ marginLeft: '6px', fontWeight: '600', fontSize: '16px' }}>
                  {placeDetails.rating}
                </span>
                {placeDetails.user_ratings_total && (
                  <span style={{ marginLeft: '8px', color: '#5f6368', fontSize: '14px' }}>
                    ({placeDetails.user_ratings_total.toLocaleString()}개 리뷰)
                  </span>
                )}
              </div>
            )}
            
            {/* 가격 레벨 */}
            {placeDetails?.price_level !== undefined && (
              <div style={{ 
                fontSize: '15px', 
                color: '#5f6368', 
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center'
              }}>
                <span style={{ marginRight: '8px' }}>💰</span>
                {getPriceLevelText(placeDetails.price_level)}
              </div>
            )}
            
            {/* 영업시간 */}
            {placeDetails?.opening_hours && (
              <div style={{ 
                fontSize: '15px', 
                marginBottom: '12px',
                color: placeDetails.opening_hours.isOpen?.() ? '#137333' : '#d93025',
                display: 'flex',
                alignItems: 'center',
                fontWeight: '500'
              }}>
                <span style={{ marginRight: '8px' }}>🕒</span>
                {placeDetails.opening_hours.isOpen?.() ? '영업 중' : '영업 종료'}
              </div>
            )}
            
            {/* 주소 */}
            <div style={{
              fontSize: '14px',
              color: '#5f6368',
              marginBottom: '12px',
              lineHeight: '1.5',
              display: 'flex',
              alignItems: 'flex-start'
            }}>
              <span style={{ marginRight: '8px', marginTop: '2px' }}>📍</span>
              <span>{placeDetails?.formatted_address || placeAddress}</span>
            </div>
            
            {/* 전화번호 */}
            {placeDetails?.formatted_phone_number && (
              <div style={{ 
                fontSize: '14px', 
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center'
              }}>
                <span style={{ marginRight: '8px' }}>📞</span>
                <a 
                  href={`tel:${placeDetails.formatted_phone_number}`}
                  style={{ color: '#1a73e8', textDecoration: 'none' }}
                >
                  {placeDetails.formatted_phone_number}
                </a>
              </div>
            )}
            
            {/* 웹사이트 */}
            {placeDetails?.website && (
              <div style={{ 
                fontSize: '14px', 
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center'
              }}>
                <span style={{ marginRight: '8px' }}>🌐</span>
                <a 
                  href={placeDetails.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#1a73e8', textDecoration: 'none' }}
                >
                  웹사이트 방문
                </a>
              </div>
            )}
            
            {/* 버튼들 */}
            <div style={{
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  
                  const lat = selectedLocation.lat;
                  const lng = selectedLocation.lng;
                  
                  let url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
                  
                  if (placeName && placeName !== '선택한 위치' && placeName !== '현재 위치') {
                    const encodedPlaceName = encodeURIComponent(placeName);
                    url = `https://www.google.com/maps/dir/?api=1&destination=${encodedPlaceName}`;
                  }
                  
                  window.open(url, '_blank');
                }}
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#4285f4',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  flex: 1,
                  minWidth: '120px'
                }}
              >
                🚗 길찾기
              </button>
              
              {placeDetails?.website && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(placeDetails.website, '_blank');
                  }}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: '#34a853',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    flex: 1,
                    minWidth: '120px'
                  }}
                >
                  🌐 웹사이트
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Google Map */}
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={selectedLocation || initialCenter}
        zoom={selectedLocation ? 15 : 12}
        onLoad={(map) => {
          setMapRef(map);
          
          // POI 클릭 이벤트 리스너 추가
            map.addListener('click', (event: google.maps.MapMouseEvent & { placeId?: string }) => {
            if (event.placeId) {
              // 기본 InfoWindow 방지
              event.stop();
              // POI 정보 가져오기
              handlePOIClick(event.placeId, event.latLng as google.maps.LatLng);
            }
            });
        }}
        onClick={(event) => {
          // 지도의 다른 곳을 클릭하면 패널 닫기
          if (isInfoWindowOpen) {
            setIsInfoWindowOpen(false);
          }
          onMapClick(event);
        }}
        options={{
          mapTypeControl: false,
          mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: google.maps.ControlPosition.TOP_CENTER,
          },
          zoomControl: false,
          zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_CENTER,
          },
          scaleControl: true,
          streetViewControl: false,
          streetViewControlOptions: {
            position: google.maps.ControlPosition.RIGHT_TOP,
          },
          fullscreenControl: true,
          fullscreenControlOptions: {
            position: google.maps.ControlPosition.RIGHT_TOP,
          },
          clickableIcons: true, // POI 클릭 활성화
          disableDefaultUI: false,
          gestureHandling: 'cooperative',
        }}
      >
        {selectedLocation && (
          <Marker 
            position={selectedLocation}
            animation={google.maps.Animation.DROP}
            title=""
            onClick={(e) => {
              if (e?.domEvent) {
                e.domEvent.stopPropagation();
                e.domEvent.preventDefault();
              }
              
              closeAllInfoWindows();
              setIsInfoWindowOpen(!isInfoWindowOpen);
            }}
            options={{
              animation: google.maps.Animation.DROP,
              optimized: false,
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
};

export default MapSearch;