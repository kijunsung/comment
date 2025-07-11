export class GoogleRoutesApiService {
  private apiKey: string;
  private baseUrl = 'https://routes.googleapis.com/directions/v2:computeRoutes';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getTransitRoutes(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    options?: {
      departureTime?: Date;
      arrivalTime?: Date;
      transitModes?: string[];
      transitRoutePreference?: 'TRANSIT_ROUTE_PREFERENCE_UNSPECIFIED' | 'LESS_WALKING' | 'FEWER_TRANSFERS';
    }
  ): Promise<RoutesApiResponse> {
    const requestBody = {
      origin: {
        location: {
          latLng: {
            latitude: origin.lat,
            longitude: origin.lng
          }
        }
      },
      destination: {
        location: {
          latLng: {
            latitude: destination.lat,
            longitude: destination.lng
          }
        }
      },
      travelMode: 'TRANSIT',
      routingPreference: 'TRAFFIC_AWARE',
      departureTime: options?.departureTime?.toISOString(),
      arrivalTime: options?.arrivalTime?.toISOString(),
      transitPreferences: {
        allowedTravelModes: options?.transitModes || ['BUS', 'SUBWAY', 'TRAIN', 'LIGHT_RAIL'],
        routingPreference: options?.transitRoutePreference || 'TRANSIT_ROUTE_PREFERENCE_UNSPECIFIED'
      },
      languageCode: 'ko',
      units: 'METRIC'
    };

    // 불필요한 필드 제거
    if (!requestBody.departureTime) delete requestBody.departureTime;
    if (!requestBody.arrivalTime) delete requestBody.arrivalTime;

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': this.apiKey,
        'X-Goog-FieldMask': [
          'routes.duration',
          'routes.distanceMeters',
          'routes.polyline.encodedPolyline',
          'routes.legs.duration',
          'routes.legs.distanceMeters',
          'routes.legs.polyline',
          'routes.legs.startLocation',
          'routes.legs.endLocation',
          'routes.legs.steps.distanceMeters',
          'routes.legs.steps.staticDuration',
          'routes.legs.steps.polyline',
          'routes.legs.steps.startLocation',
          'routes.legs.steps.endLocation',
          'routes.legs.steps.transitDetails',
          'routes.legs.steps.travelMode',
          'routes.description',
          'routes.localizedValues'
        ].join(',')
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Routes API Error: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }

    return response.json();
  }
}