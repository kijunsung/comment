export interface WeatherData {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  clouds: {
    all: number;
  };
  wind: {
    speed: number;
    deg: number;
  };
  visibility?: number;
  pop: number; // 강수 확률
  rain?: {
    '3h': number;
  };
  snow?: {
    '3h': number;
  };
  dt_txt: string;
}

export interface WeatherResponse {
  cod: string;
  message: number;
  cnt: number;
  list: WeatherData[];
  city: {
    id: number;
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

export interface DailyWeather {
  date: string;
  temp_min: number;
  temp_max: number;
  weather: {
    main: string;
    description: string;
    icon: string;
  };
  humidity: number;
  pop: number; // 강수 확률
  wind_speed: number;
}