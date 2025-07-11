import React, { useState, useEffect } from 'react';
import {
  Autocomplete,
  TextField,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { LocationOn } from '@mui/icons-material';

interface LocationSearchProps {
  label: string;
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  apiKey: string;
}

interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export const LocationSearch: React.FC<LocationSearchProps> = ({
  label,
  onLocationSelect,
  apiKey,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (inputValue.length < 2) {
      setPredictions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
            inputValue
          )}&key=${apiKey}&language=ko&components=country:kr`
        );
        const data = await response.json();
        setPredictions(data.predictions || []);
      } catch (error) {
        console.error('장소 검색 오류:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [inputValue, apiKey]);

  const handlePlaceSelect = async (placeId: string, description: string) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}&language=ko`
      );
      const data = await response.json();
      
      if (data.result?.geometry?.location) {
        onLocationSelect({
          lat: data.result.geometry.location.lat,
          lng: data.result.geometry.location.lng,
          address: description,
        });
      }
    } catch (error) {
      console.error('장소 상세 정보 오류:', error);
    }
  };

  return (
    <Autocomplete
      options={predictions}
      getOptionLabel={(option) => option.description}
      loading={loading}
      onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
      onChange={(_, value) => {
        if (value) {
          handlePlaceSelect(value.place_id, value.description);
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          fullWidth
          InputProps={{
            ...params.InputProps,
            startAdornment: <LocationOn color="action" />,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          <LocationOn sx={{ mr: 2, color: 'text.secondary' }} />
          <Box>
            <Typography variant="body1">
              {option.structured_formatting.main_text}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {option.structured_formatting.secondary_text}
            </Typography>
          </Box>
        </Box>
      )}
    />
  );
};