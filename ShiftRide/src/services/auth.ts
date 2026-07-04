import api from './api';

/**
 * Register a new user
 */
export const registerUser = async (data: any) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

/**
 * Login user (sends OTP)
 */
export const loginUser = async (data: any) => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

export const verifyOtp = async (data: any) => {
  const response = await api.post('/auth/verify-otp', data);
  if (response.data && response.data.token) {
    await setSession(response.data.token, response.data.user);
  }
  return response.data;
};

import AsyncStorage from '@react-native-async-storage/async-storage';

let _token: string | null = null;
let _user: any = null;

export const setSession = async (token: string | null, user: any) => {
  _token = token;
  _user = user;
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    try {
      await AsyncStorage.setItem('user_session', JSON.stringify({ token, user }));
    } catch (e) {
      console.error('Failed to save session to storage', e);
    }
  } else {
    delete api.defaults.headers.common['Authorization'];
    try {
      await AsyncStorage.removeItem('user_session');
    } catch (e) {
      console.error('Failed to clear session from storage', e);
    }
  }
};

export const initSession = async () => {
  try {
    const data = await AsyncStorage.getItem('user_session');
    if (data) {
      const { token, user } = JSON.parse(data);
      _token = token;
      _user = user;
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return { token, user };
    }
  } catch (e) {
    console.error('Failed to load session from storage', e);
  }
  return null;
};

export const getSessionUser = () => {
  return _user;
};

export const getSessionToken = () => {
  return _token;
};

