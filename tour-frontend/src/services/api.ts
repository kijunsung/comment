import axios from 'axios'; 
// axios 인스턴스를 불러옴. baseURL 설정되어 있음 (예: http://localhost:8080)

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
