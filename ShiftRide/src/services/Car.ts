import api from './api';

/**
 * Search cars from backend based on pickup location, drop location and date
 */
export const searchCars = async (pickup: string, drop: string, date: string) => {
  const response = await api.get('/cars/search', {
    params: {
      pickup,
      drop,
      date,
    },
  });
  return response.data;
};

/**
 * Fetch a single car details by ID from the backend
 */
export const getCarById = async (id: string) => {
  const response = await api.get(`/cars/${id}`);
  return response.data;
};

/**
 * Fetch all cars from the backend
 */
export const getAllCars = async () => {
  const response = await api.get('/cars');
  return response.data;
};

