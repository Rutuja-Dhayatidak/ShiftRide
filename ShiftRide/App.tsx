/**
 * ShiftRide App
 * @format
 */

import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnboardingScreen from './src/screens/OnboardingScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import SearchScreen from './src/screens/SearchScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import CarResultsScreen from './src/screens/CarResultsScreen';
import CarDetailsScreen from './src/screens/CarDetailsScreen';
import BillingScreen from './src/screens/BillingScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import ReviewSummaryScreen from './src/screens/ReviewSummaryScreen';
import MyBookingsScreen from './src/screens/MyBookingsScreen';
import BookingDetailsScreen from './src/screens/BookingDetailsScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import VerifyAccountScreen from './src/screens/VerifyAccountScreen';
import NewPasswordScreen from './src/screens/NewPasswordScreen';
import { initSession } from './src/services/auth';
import { initTheme } from './src/services/theme';

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Search: undefined;
  Profile: undefined;
  CarResults: { fromLoc?: string; toLoc?: string; womenSafety?: boolean } | undefined;
  CarDetails: { carId: string; distance?: string; duration?: string; estimatedFare?: number; pickup?: string; drop?: string; womenSafety?: boolean };
  Billing: { carId: string; womenSafety?: boolean };
  Payment: { carId: string; billingData: any; womenSafety?: boolean };
  ReviewSummary: { carId: string; billingData: any; paymentMethod: string; womenSafety?: boolean };
  MyBookings: undefined;
  BookingDetails: { bookingId: string };
  ForgotPassword: undefined;        
  VerifyAccount: undefined;
  NewPassword: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  const [loading, setLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList>('Onboarding');

  useEffect(() => {
    const checkSession = async () => {
      try {
        await Promise.all([initSession(), initTheme()]);
      } catch (err) {
        console.error("Session/Theme check failed:", err);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#1A6BFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="CarResults" component={CarResultsScreen} />
        <Stack.Screen name="CarDetails" component={CarDetailsScreen} />
        <Stack.Screen name="Billing" component={BillingScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="ReviewSummary" component={ReviewSummaryScreen} />
        <Stack.Screen name="MyBookings" component={MyBookingsScreen} />
        <Stack.Screen name="BookingDetails" component={BookingDetailsScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="VerifyAccount" component={VerifyAccountScreen} />
        <Stack.Screen name="NewPassword" component={NewPasswordScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
