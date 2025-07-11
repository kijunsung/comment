import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Grid,
  Paper,
  Chip,
  Stack,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ko } from 'date-fns/locale';
import { useRoutes } from '../context/RoutesContext';
import { useRoutesStore } from '../store/routesStore';

interface RouteSearchFormProps {
  onSearch?: () => void;
}

export const RouteSearchForm: React.FC<RouteSearchFormProps> = ({ onSearch }) => {
  const [origin, setOrigin] = useState({ lat: 37.5665, lng: 126.9780 });
  const [destination, setDestination] = useState({ lat: 37.5563, lng: 126.9723 });
  const [departureTime, setDepartureTime] = useState<Date | null>(null);
  const [transitPreference, setTransitPreference] = useState<'LESS_WALKING' | 'FEWER_TRANSFERS'>('LESS_WALKING');
  const [selectedModes, setSelectedModes] = useState<string[]>(['BUS', 'SUBWAY', 'TRAIN']);

  const { searchRoutes } = useRoutes();
  const { loading } = useRoutesStore();

  const transitModes = [
    { value: 'BUS', label: '버스' },
    { value: 'SUBWAY', label: '지하철' },
    { value: 'TRAIN', label: '기차' },
    { value: 'LIGHT_RAIL', label: '경전철' },
  ];

  const handleModeToggle = (mode: string) => {
    setSelectedModes(prev => 
      prev.includes(mode) 
        ? prev.filter(m => m !== mode)
        : [...prev, mode]
    );
  };

  const handleSearch = async () => {
    await searchRoutes({
      origin,
      destination,
      departureTime: departureTime || undefined,
      transitRoutePreference: transitPreference,
      transitModes: selectedModes,
    });
    onSearch?.();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          대중교통 경로 검색
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              출발지
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                label="위도"
                type="number"
                size="small"
                value={origin.lat}
                onChange={(e) => setOrigin({ ...origin, lat: parseFloat(e.target.value) })}
                inputProps={{ step: 'any' }}
              />
              <TextField
                label="경도"
                type="number"
                size="small"
                value={origin.lng}
                onChange={(e) => setOrigin({ ...origin, lng: parseFloat(e.target.value) })}
                inputProps={{ step: 'any' }}
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              목적지
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                label="위도"
                type="number"
                size="small"
                value={destination.lat}
                onChange={(e) => setDestination({ ...destination, lat: parseFloat(e.target.value) })}
                inputProps={{ step: 'any' }}
              />
              <TextField
                label="경도"
                type="number"
                size="small"
                value={destination.lng}
                onChange={(e) => setDestination({ ...destination, lng: parseFloat(e.target.value) })}
                inputProps={{ step: 'any' }}
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <DateTimePicker
              label="출발 시간 (선택사항)"
              value={departureTime}
              onChange={setDepartureTime}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl size="small" fullWidth>
              <InputLabel>경로 선호도</InputLabel>
              <Select
                value={transitPreference}
                label="경로 선호도"
                onChange={(e) => setTransitPreference(e.target.value as 'LESS_WALKING' | 'FEWER_TRANSFERS')}
              >
                <MenuItem value="LESS_WALKING">걷기 적게</MenuItem>
                <MenuItem value="FEWER_TRANSFERS">환승 적게</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              교통수단 선택
            </Typography>
            <Stack direction="row" spacing={1}>
              {transitModes.map((mode) => (
                <Chip
                  key={mode.value}
                  label={mode.label}
                  clickable
                  color={selectedModes.includes(mode.value) ? 'primary' : 'default'}
                  onClick={() => handleModeToggle(mode.value)}
                />
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              size="large"
              onClick={handleSearch}
              disabled={loading || selectedModes.length === 0}
              fullWidth
            >
              {loading ? '검색 중...' : '경로 검색'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </LocalizationProvider>
  );
};