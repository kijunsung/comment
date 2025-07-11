import { WeatherResponse, DailyWeather } from '../types/weatherTypes';
import { YOUR_OPENWEATHER_API_KEY } from '../_env/env.local';

const API_KEY = YOUR_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export const fetchWeatherForecast = async (lat: number, lng: number): Promise<DailyWeather[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/forecast?lat=${lat}&lon=${lng}&appid=${API_KEY}&units=metric&lang=kr`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: WeatherResponse = await response.json();
    
    // 5일간의 날씨 데이터를 일별로 그룹화
    const dailyForecast = groupForecastByDay(data.list);
    
    return dailyForecast.slice(0, 5); // 5일간만 반환
  } catch (error) {
    console.error('날씨 데이터를 가져오는 중 오류 발생:', error);
    throw error;
  }
};

const groupForecastByDay = (forecastList: WeatherResponse['list']): DailyWeather[] => {
  const dailyData: { [key: string]: WeatherResponse['list'] } = {};
  
  // 날짜별로 데이터 그룹화
  forecastList.forEach(item => {
    const date = item.dt_txt.split(' ')[0]; // YYYY-MM-DD 형태로
    if (!dailyData[date]) {
      dailyData[date] = [];
    }
    dailyData[date].push(item);
  });
  
  // 각 날짜별로 대표값 계산
  return Object.keys(dailyData).map(date => {
    const dayData = dailyData[date];
    
    // 최고/최저 기온 계산
    const temps = dayData.map(item => item.main.temp);
    const temp_min = Math.min(...temps);
    const temp_max = Math.max(...temps);
    
    // 가장 빈번한 날씨 상태 선택 (정오 시간대 우선)
    const noonData = dayData.find(item => item.dt_txt.includes('12:00:00')) || dayData[0];
    
    // 평균 습도 계산
    const humidity = Math.round(
      dayData.reduce((sum, item) => sum + item.main.humidity, 0) / dayData.length
    );
    
    // 최대 강수 확률
    const pop = Math.max(...dayData.map(item => item.pop)) * 100;
    
    // 평균 풍속
    const wind_speed = dayData.reduce((sum, item) => sum + item.wind.speed, 0) / dayData.length;
    
    return {
      date,
      temp_min: Math.round(temp_min),
      temp_max: Math.round(temp_max),
      weather: {
        main: noonData.weather[0].main,
        description: noonData.weather[0].description,
        icon: noonData.weather[0].icon,
      },
      humidity,
      pop: Math.round(pop),
      wind_speed: Math.round(wind_speed * 10) / 10,
    };
  });
};