import { TrafficData } from '../types/traffic';

export class TrafficApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async saveTrafficData(trafficData: Omit<TrafficData, 'trafficId'>): Promise<TrafficData> {
    const response = await fetch(`${this.baseUrl}/traffic`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(trafficData),
    });

    if (!response.ok) {
      throw new Error(`Failed to save traffic data: ${response.statusText}`);
    }

    return response.json();
  }

  async getTrafficDataByTourId(tourId: bigint): Promise<TrafficData[]> {
    const response = await fetch(`${this.baseUrl}/traffic/tour/${tourId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch traffic data: ${response.statusText}`);
    }

    return response.json();
  }
}