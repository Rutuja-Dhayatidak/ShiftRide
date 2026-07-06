import api from './api';

/**
 * Initiate booking and create a Razorpay order in the backend
 */
export const createBookingOrder = async (bookingData: {
  car_id: string;
  pickup_location: string;
  drop_location: string;
  start_date: string;
  end_date: string;
  booking_mode?: string;
  billing_type?: string;
  distance_km?: number;
  women_safety_mode?: boolean;
  name?: string;
  email?: string;
  phone?: string;
  bookingSource?: string;
}) => {
  const response = await api.post('/payments/create-order', { ...bookingData, bookingSource: 'APP' });
  return response.data;
};

/**
 * Verify Razorpay payment signature in the backend
 */
export const verifyPayment = async (verificationData: {
  booking_id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) => {
  const response = await api.post('/payments/verify', verificationData);
  return response.data;
};

/**
 * Initiate Razorpay payment for an existing driver-accepted booking
 */
export const initiatePaymentForBooking = async (bookingId: string) => {
  const response = await api.post(`/payments/initiate/${bookingId}`);
  return response.data;
};
