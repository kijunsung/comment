import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Tabs, 
  Tab, 
  Card, 
  CardContent,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { 
  LocationOn, 
  AccessTime, 
  Edit, 
  Delete, 
  Add,
  Save,
  Visibility,
  PictureAsPdf 
} from '@mui/icons-material';
import { useLocation } from '../../context/LocationContext';
import { useTravel } from '../../context/TravelContext';

// 타입 정의
interface Place {
  id: number;
  time: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

interface PlanDay {
  day: number;
  date: string;
  places: Place[];
}

interface NewPlaceForm {
  time: string;
  name: string;
  address: string;
  lat: number | null;
  lng: number | null;
}

const Plan: React.FC = () => {
  // LocationContext에서 지도 데이터 가져오기
  const { locationData } = useLocation();
  
  // Travel Context에서 여행지 목록과 경로 데이터 가져오기
  const { selectedPlaces, routeData, removePlace, clearPlaces } = useTravel();

  const [PlanData, setPlanData] = useState<PlanDay[]>([]);

  const [currentDay, setCurrentDay] = useState<number>(0);
  const [openAddDialog, setOpenAddDialog] = useState<boolean>(false);
  const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [newPlace, setNewPlace] = useState<NewPlaceForm>({
    time: '',
    name: '',
    address: '',
    lat: null,
    lng: null
  });

  // MapSearch에서 선택한 장소를 일정에 추가
  const addPlaceFromMap = (): void => {
    if (locationData) {
      // 일정이 없으면 먼저 일정을 추가하라고 안내
      if (PlanData.length === 0) {
        alert('먼저 일정을 추가해주세요.');
        return;
      }
      
      setNewPlace({
        time: '', // 사용자가 입력
        name: locationData.placeName || '',
        address: locationData.placeAddress || '',
        lat: locationData.lat,
        lng: locationData.lng
      });
      setOpenAddDialog(true);
    } else {
      alert('먼저 지도에서 장소를 선택해주세요.');
    }
  };

  // 장소 추가 확정
  const confirmAddPlace = (): void => {
    if (!newPlace.name || !newPlace.time) {
      alert('시간과 장소명을 입력해주세요.');
      return;
    }

    if (newPlace.lat === null || newPlace.lng === null) {
      alert('위치 정보가 없습니다.');
      return;
    }

    const updatedPlan: PlanDay[] = [...PlanData];
    const newPlaceWithId: Place = {
      ...newPlace,
      id: Date.now(),
      lat: newPlace.lat,
      lng: newPlace.lng
    };
    
    updatedPlan[currentDay].places.push(newPlaceWithId);
    
    // 시간순으로 정렬
    updatedPlan[currentDay].places.sort((a: Place, b: Place) => 
      a.time.localeCompare(b.time)
    );
    
    setPlanData(updatedPlan);
    setOpenAddDialog(false);
    resetNewPlace();
  };

  // 장소 수정
  const editPlace = (place: Place): void => {
    setSelectedPlace(place);
    setNewPlace({
      time: place.time,
      name: place.name,
      address: place.address,
      lat: place.lat,
      lng: place.lng
    });
    setOpenEditDialog(true);
  };

  // 장소 수정 확정
  const confirmEditPlace = (): void => {
    if (!selectedPlace || !newPlace.name || !newPlace.time) {
      alert('필수 정보를 입력해주세요.');
      return;
    }

    if (newPlace.lat === null || newPlace.lng === null) {
      alert('위치 정보가 없습니다.');
      return;
    }

    const updatedPlan: PlanDay[] = [...PlanData];
    const placeIndex: number = updatedPlan[currentDay].places.findIndex(
      (place: Place) => place.id === selectedPlace.id
    );
    
    if (placeIndex !== -1) {
      updatedPlan[currentDay].places[placeIndex] = {
        ...selectedPlace,
        time: newPlace.time,
        name: newPlace.name,
        address: newPlace.address,
        lat: newPlace.lat,
        lng: newPlace.lng
      };
      
      // 시간순으로 정렬
      updatedPlan[currentDay].places.sort((a: Place, b: Place) => 
        a.time.localeCompare(b.time)
      );
      
      setPlanData(updatedPlan);
    }
    
    setOpenEditDialog(false);
    setSelectedPlace(null);
    resetNewPlace();
  };

  // 장소 삭제
  const deletePlace = (placeId: number): void => {
    const updatedPlan: PlanDay[] = [...PlanData];
    updatedPlan[currentDay].places = updatedPlan[currentDay].places.filter(
      (place: Place) => place.id !== placeId
    );
    setPlanData(updatedPlan);
  };

  // 새로운 날짜 추가
  const addNewDay = (): void => {
    const today = new Date();
    const newDate = new Date(today.getTime() + (PlanData.length * 24 * 60 * 60 * 1000));
    
    const newDay: PlanDay = {
      day: PlanData.length + 1,
      date: newDate.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' }),
      places: []
    };
    
    const newPlanData = [...PlanData, newDay];
    setPlanData(newPlanData);
    
    // 새로 추가된 날짜로 자동 이동
    setCurrentDay(newPlanData.length - 1);
  };

  // 새 장소 폼 초기화
  const resetNewPlace = (): void => {
    setNewPlace({
      time: '',
      name: '',
      address: '',
      lat: null,
      lng: null
    });
  };

  // 탭 변경 핸들러
  const handleTabChange = (_: React.SyntheticEvent, newValue: number): void => {
    setCurrentDay(newValue);
  };

  // 다이얼로그 닫기 핸들러
  const handleCloseAddDialog = (): void => {
    setOpenAddDialog(false);
    resetNewPlace();
  };

  const handleCloseEditDialog = (): void => {
    setOpenEditDialog(false);
    setSelectedPlace(null);
    resetNewPlace();
  };

  // 입력 핸들러들
  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setNewPlace({ ...newPlace, time: event.target.value });
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setNewPlace({ ...newPlace, name: event.target.value });
  };

  const handleAddressChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setNewPlace({ ...newPlace, address: event.target.value });
  };

  const currentPlan: PlanDay | undefined = PlanData[currentDay];

  return (
    <Box sx={{ width: '100%' }}> {/* p: 3 제거 - 부모에서 padding 처리 */}
    {/* 헤더 */}
    <Box sx={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      mb: 3
    }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
        📅 일정 관리
      </Typography>
      <Box sx={{ display: 'flex', gap: 1 }}>
        {selectedPlaces.length > 0 && (
          <Button 
            variant="outlined" 
            color="error"
            startIcon={<Delete />}
            onClick={clearPlaces}
            size="small"
          >
            전체 삭제
          </Button>
        )}
        {PlanData.length > 0 && (
          <Button 
            variant="contained" 
            startIcon={<Add />}
            onClick={addPlaceFromMap}
            sx={{ borderRadius: 2 }}
          >
            장소 추가
          </Button>
        )}
      </Box>
    </Box>

    {/* 선택된 여행지 목록 */}
    {selectedPlaces.length > 0 && (
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          🗺️ 선택된 여행지 ({selectedPlaces.length}개)
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 1,
          p: 2,
          bgcolor: 'grey.50',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'grey.200'
        }}>
          {selectedPlaces.map((place, index) => (
            <Chip
              key={`${place.lat}-${place.lng}-${index}`}
              label={place.placeName}
              onDelete={() => removePlace(index)}
              color="primary"
              variant="outlined"
              sx={{ maxWidth: 200 }}
            />
          ))}
        </Box>
      </Box>
    )}

    {/* 선택된 교통 경로 정보 */}
    {routeData && (
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          🚇 계획된 교통편
        </Typography>
        <Card sx={{ bgcolor: 'success.50', border: '1px solid', borderColor: 'success.200' }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              <strong>{routeData.origin.placeName}</strong> → <strong>{routeData.destination.placeName}</strong>
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Chip 
                label={`${routeData.selectedRoute?.totalDuration}분`} 
                color="primary" 
                size="small" 
              />
              <Chip 
                label={`${routeData.selectedRoute?.totalPrice.toLocaleString()}원`} 
                color="success" 
                size="small" 
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {routeData.selectedRoute?.steps.map((step, index) => (
                <Chip
                  key={index}
                  label={`${step.transitDetails?.transitLine.vehicle?.type === 'BUS' ? '🚌' :
                           step.transitDetails?.transitLine.vehicle?.type === 'SUBWAY' ? '🚇' :
                           step.transitDetails?.transitLine.vehicle?.type === 'TRAIN' ? '🚄' : '🚊'} ${step.transitDetails?.transitLine.name}`}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>
    )}

    {/* 날짜 탭 */}
    {PlanData.length > 0 && (
      <Box sx={{ mb: 3 }}>
        <Tabs 
          value={currentDay} 
          onChange={handleTabChange}
          sx={{ mb: 2 }}
        >
          {PlanData.map((day: PlanDay) => (
            <Tab 
              key={day.day} 
              label={`${day.day}일차 (${day.date})`}
              sx={{ 
                fontWeight: 'bold',
                '&.Mui-selected': {
                  color: '#1976d2'
                }
              }}
            />
          ))}
        </Tabs>
      </Box>
    )}
    
    {/* 일정 추가 버튼 */}
    <Box sx={{ mb: 3 }}>
      <Button 
        variant="outlined" 
        startIcon={<Add />}
        onClick={addNewDay}
        sx={{ 
          borderStyle: 'dashed',
          color: '#1976d2',
          borderColor: '#1976d2'
        }}
      >
        일정 추가
      </Button>
    </Box>

    {/* 일정 내용 - 자연스러운 높이 */}
    {PlanData.length > 0 && (
      <Box sx={{ mb: 4 }}>
        {currentPlan && currentPlan.places.length > 0 ? (
          // 장소가 있는 경우 - 자연스러운 스크롤
          <Box
            sx={{
              // 동적 높이 설정: 3개까지는 자연스럽게, 그 이상은 스크롤
              maxHeight: currentPlan.places.length > 3 ? '350px' : 'auto',
              overflowY: currentPlan.places.length > 3 ? 'auto' : 'visible',
              paddingRight: currentPlan.places.length > 3 ? '8px' : '0',
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: '#f1f1f1',
                borderRadius: '3px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#c1c1c1',
                borderRadius: '3px',
                '&:hover': {
                  backgroundColor: '#a1a1a1',
                },
              },
            }}
          >
            {currentPlan.places.map((place: Place, index: number) => (
              <Card 
                key={place.id} 
                sx={{ 
                  mb: index === currentPlan.places.length - 1 ? 0 : 2, // 마지막 아이템은 mb 없음
                  boxShadow: 1,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: 3,
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                <CardContent sx={{ py: 2 }}> {/* 패딩 조정 */}
                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flex: 1 }}>
                      <Chip 
                        icon={<AccessTime />}
                        label={place.time}
                        color="primary"
                        size="small"
                      />
                      <Box sx={{ flex: 1, minWidth: 0 }}> {/* minWidth: 0으로 텍스트 오버플로우 방지 */}
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                          {place.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {place.address}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                      <IconButton 
                        size="small" 
                        onClick={() => editPlace(place)}
                        sx={{ color: 'primary.main' }}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => deletePlace(place.id)}
                        sx={{ color: 'error.main' }}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          // 현재 날짜에 장소가 없는 경우
          <Card sx={{ 
            textAlign: 'center', 
            py: 4, // 패딩 조정
            backgroundColor: '#f5f5f5',
            border: '2px dashed #ddd'
          }}>
            <CardContent>
              <Typography variant="h2" sx={{ mb: 2, fontSize: '3rem' }}>📍</Typography>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                이 날짜에 장소를 추가해보세요
              </Typography>
              <Typography variant="body2" color="text.secondary">
                지도에서 선택하거나 검색으로 추가할 수 있습니다
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>
    )}

      {/* 액션 버튼 - 일정이 있을 때만 표시 */}
      {PlanData.length > 0 && (
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap'
        }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<Save />}>
              임시저장
            </Button>
            <Button variant="outlined" startIcon={<Visibility />}>
              미리보기
            </Button>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              variant="contained" 
              startIcon={<PictureAsPdf />}
              sx={{ backgroundColor: '#4caf50' }}
            >
              📄 PDF 저장
            </Button>
            <Button variant="contained" color="primary">
              여행 완료
            </Button>
          </Box>
        </Box>
      )}

      {/* 장소 추가 다이얼로그 */}
      <Dialog 
        open={openAddDialog} 
        onClose={handleCloseAddDialog} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>새 장소 추가</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="시간"
              type="time"
              value={newPlace.time}
              onChange={handleTimeChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
            />
            <TextField
              label="장소명"
              value={newPlace.name}
              onChange={handleNameChange}
              fullWidth
              disabled
            />
            <TextField
              label="주소"
              value={newPlace.address}
              onChange={handleAddressChange}
              fullWidth
              multiline
              rows={2}
              disabled
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>취소</Button>
          <Button onClick={confirmAddPlace} variant="contained">추가</Button>
        </DialogActions>
      </Dialog>

      {/* 장소 수정 다이얼로그 */}
      <Dialog 
        open={openEditDialog} 
        onClose={handleCloseEditDialog} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>장소 수정</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="시간"
              type="time"
              value={newPlace.time}
              onChange={handleTimeChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
            />
            <TextField
              label="장소명"
              value={newPlace.name}
              onChange={handleNameChange}
              fullWidth
            />
            <TextField
              label="주소"
              value={newPlace.address}
              onChange={handleAddressChange}
              fullWidth
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>취소</Button>
          <Button onClick={confirmEditPlace} variant="contained">수정</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Plan;