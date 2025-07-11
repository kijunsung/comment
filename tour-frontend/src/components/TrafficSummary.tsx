import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Box,
  Divider,
} from '@mui/material';
import {
  AttachMoney,
  Schedule,
  DirectionsBus,
  TrendingUp,
} from '@mui/icons-material';
import { TrafficData } from '../types/traffic';

interface TrafficSummaryProps {
  trafficData: TrafficData[];
  tourId: bigint;
}

export const TrafficSummary: React.FC<TrafficSummaryProps> = ({ trafficData, tourId }) => {
  const totalPrice = trafficData.reduce((sum, data) => sum + data.price, 0);
  const totalTimeInMinutes = trafficData.reduce((sum, data) => {
    const [hours, minutes, seconds] = data.spendTime.split(':').map(Number);
    return sum + hours * 60 + minutes + Math.round(seconds / 60);
  }, 0);

  const formatTotalTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0 ? `${hours}시간 ${remainingMinutes}분` : `${remainingMinutes}분`;
  };

  const vehicleCount = trafficData.reduce((acc, data) => {
    acc[data.vehicle] = (acc[data.vehicle] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          교통비 요약
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <AttachMoney color="primary" />
              <Typography variant="h6" color="primary">
                {totalPrice.toLocaleString()}원
              </Typography>
              <Typography variant="caption" color="text.secondary">
                총 교통비
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Schedule color="secondary" />
              <Typography variant="h6" color="secondary">
                {formatTotalTime(totalTimeInMinutes)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                총 소요시간
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <DirectionsBus color="info" />
              <Typography variant="h6" color="info.main">
                {trafficData.length}개
              </Typography>
              <Typography variant="caption" color="text.secondary">
                이용 구간
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <TrendingUp color="success" />
              <Typography variant="h6" color="success.main">
                {Math.round(totalPrice / totalTimeInMinutes)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                분당 비용
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>
          이용한 교통수단
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {Object.entries(vehicleCount).map(([vehicle, count]) => (
            <Chip
              key={vehicle}
              label={`${vehicle} (${count}회)`}
              size="small"
              variant="outlined"
            />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};