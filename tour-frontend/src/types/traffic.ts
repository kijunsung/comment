export interface TrafficData {
  trafficId?: bigint;
  tourId: bigint;
  vehicle: string;
  spendTime: string; // TIME format "HH:MM:SS"
  price: number;
}