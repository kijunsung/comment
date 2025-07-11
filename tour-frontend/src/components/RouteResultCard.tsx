import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Stack,
} from '@mui/material';
import {
  DirectionsBus,
  DirectionsSubway,
  Train,
  DirectionsWalk,
  Schedule,
  Straighten,
} from '@mui/icons-material';
import { Route } from '../types/routes';
import { formatDuration, formatDistance, getVehicleDisplayName } from '../utils/routeUtils';

interface RouteResultCardProps {
  route: Route;
  index: number;
  onSelect?: (route: Route) => void;
}

const getTransportIcon = (travelMode: string) => {
  switch (travelMode) {
    case 'BUS':
      return <DirectionsBus />;
    case 'SUBWAY':
      return <DirectionsSubway />;
    case 'TRAIN':
      return <Train />;
    case 'WALKING':
      return <DirectionsWalk />;
    default:
      return <DirectionsBus />;
  }
};

export const RouteResultCard: React.FC<RouteResultCardProps> = ({ route, index, onSelect }) => {
  return (
    <Card elevation={2} sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              경로 {index + 1}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {route.description}
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Chip
              icon={<Schedule />}
              label={formatDuration(route.duration)}
              color="primary"
              variant="outlined"
            />
            <Chip
              icon={<Straighten />}
              label={formatDistance(route.distanceMeters)}
              color="secondary"
              variant="outlined"
            />
          </Stack>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>
          상세 경로
        </Typography>
        
        <List dense>
          {route.legs[0]?.steps.map((step, stepIndex) => (
            <ListItem key={stepIndex} sx={{ py: 1 }}>
              <ListItemIcon>
                {getTransportIcon(step.travelMode)}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" fontWeight="medium">
                      {getVehicleDisplayName(step.travelMode, step.transitDetails)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDistance(step.distanceMeters)} · {formatDuration(step.staticDuration)}
                    </Typography>
                  </Box>
                }
                secondary={
                  step.transitDetails && (
                    <Box sx={{ mt: 0.5 }}>
                      <Typography variant="caption" display="block">
                        🚌 {step.transitDetails.transitLine.name}
                      </Typography>
                      <Typography variant="caption" display="block">
                        {step.transitDetails.stopDetails.departureStop.name} → {' '}
                        {step.transitDetails.stopDetails.arrivalStop.name}
                      </Typography>
                      <Typography variant="caption" display="block">
                        출발: {step.transitDetails.localizedValues.departureTime.time.text} | {' '}
                        도착: {step.transitDetails.localizedValues.arrivalTime.time.text}
                      </Typography>
                    </Box>
                  )
                }
              />
            </ListItem>
          ))}
        </List>

        {onSelect && (
          <Box sx={{ mt: 2, textAlign: 'right' }}>
            <Button
              variant="contained"
              color="success"
              onClick={() => onSelect(route)}
            >
              이 경로 선택
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};