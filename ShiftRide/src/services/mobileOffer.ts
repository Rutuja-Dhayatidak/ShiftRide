import api from './api';

export const getActiveOffers = async () => {
  const response = await api.get('/mobile-offers');
  return response.data;
};
