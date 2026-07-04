import axios from 'axios';
import { API_URL } from '@env';

console.log('[API CONFIG] API_URL loaded from env is:', API_URL);

const api = axios.create({
  baseURL: API_URL || 'http://localhost:5005/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getCarImageUrl = (imagePath: string): string | null => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const base = (API_URL || 'http://localhost:5005/api').replace(/\/$/, '').replace(/\/api$/, '');
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${base}/api${cleanPath}`;
};

export default api;

