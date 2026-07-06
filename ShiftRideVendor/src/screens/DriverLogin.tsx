import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import api from '../services/api';

const DriverLogin = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = await AsyncStorage.getItem('driverToken');
      if (token) {
        navigation.replace('DriverDashboard');
      }
    };
    checkLoggedIn();
  }, [navigation]);

  const onSubmit = async () => {
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setLoading(true);

    try {
      console.log('Sending login request to /driver/login...');
      const res = await api.post('/driver/login', { username, password });
      if (res.data && res.data.token) {
        await AsyncStorage.setItem('driverToken', res.data.token);
        await AsyncStorage.setItem('driver', JSON.stringify(res.data.user));
        navigation.replace('DriverDashboard');
      } else {
        setError('Could not retrieve login token');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Login failed. Please check credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0D1B3E" />
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Soft background glow circles simulated by styled Views */}
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />

        <View style={styles.card}>
          <View style={styles.iconContainer}>
            {/* Simple steering wheel or key icon simulated with text/shapes */}
            <Text style={styles.keyIcon}>🔑</Text>
          </View>
          
          <Text style={styles.title}>Driver Partner</Text>
          <Text style={styles.subtitle}>Enter credentials to access active bookings</Text>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email or Phone Number</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={(text) => {
                setError('');
                setUsername(text);
              }}
              placeholder="e.g. +919876543210"
              placeholderTextColor="#8892B0"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={(text) => {
                  setError('');
                  setPassword(text);
                }}
                placeholder="Password (default is phone number)"
                placeholderTextColor="#8892B0"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <Text style={styles.eyeText}>{showPassword ? '👁️' : '🙈'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={onSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>ACCESS DASHBOARD</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>🔒 Secured Partner Portal — Baaki कार हब</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

import {
  Dimensions,
  PixelRatio,
} from 'react-native';

const { width, height } = Dimensions.get('window');
const BASE_W = 375;
const BASE_H = 812;

const wp = (px: number) => (px / BASE_W) * width;
const hp = (px: number) => (px / BASE_H) * height;
const fs = (px: number) =>
  Math.round(PixelRatio.roundToNearestPixel((px / BASE_W) * width));

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1B3E',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp(20),
  },
  glowTop: {
    position: 'absolute',
    top: hp(50),
    left: wp(20),
    width: wp(200),
    height: wp(200),
    borderRadius: wp(100),
    backgroundColor: 'rgba(26, 107, 255, 0.1)',
  },
  glowBottom: {
    position: 'absolute',
    bottom: hp(50),
    right: wp(20),
    width: wp(200),
    height: wp(200),
    borderRadius: wp(100),
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  card: {
    width: '100%',
    maxWidth: wp(380),
    backgroundColor: '#FFFFFF',
    borderRadius: wp(30),
    padding: wp(24),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    alignItems: 'center',
  },
  iconContainer: {
    width: wp(60),
    height: wp(60),
    borderRadius: wp(18),
    backgroundColor: '#1A6BFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(16),
    shadowColor: '#1A6BFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  keyIcon: {
    fontSize: fs(28),
    color: '#FFF',
  },
  title: {
    fontSize: fs(24),
    fontWeight: 'bold',
    color: '#0D1B3E',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fs(13),
    color: '#5A6880',
    textAlign: 'center',
    marginTop: hp(6),
    marginBottom: hp(20),
  },
  errorContainer: {
    width: '100%',
    backgroundColor: '#FFF2F2',
    borderWidth: 1,
    borderColor: '#FFD1D1',
    borderRadius: wp(12),
    padding: wp(12),
    marginBottom: hp(16),
  },
  errorText: {
    color: '#FF3B30',
    fontSize: fs(12),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  inputGroup: {
    width: '100%',
    marginBottom: hp(16),
  },
  label: {
    fontSize: fs(10),
    fontWeight: 'bold',
    color: '#5A6880',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: hp(6),
  },
  input: {
    width: '100%',
    height: hp(48),
    backgroundColor: '#F4F7FF',
    borderWidth: 1,
    borderColor: '#E0E8FF',
    borderRadius: wp(12),
    paddingHorizontal: wp(16),
    color: '#0D1B3E',
    fontSize: fs(14),
  },
  passwordWrapper: {
    flexDirection: 'row',
    width: '100%',
    height: hp(48),
    backgroundColor: '#F4F7FF',
    borderWidth: 1,
    borderColor: '#E0E8FF',
    borderRadius: wp(12),
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: wp(16),
    color: '#0D1B3E',
    fontSize: fs(14),
  },
  eyeButton: {
    paddingHorizontal: wp(16),
  },
  eyeText: {
    fontSize: fs(18),
  },
  button: {
    width: '100%',
    height: hp(52),
    backgroundColor: '#1A6BFF',
    borderRadius: wp(16),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(10),
    shadowColor: '#1A6BFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: fs(14),
    letterSpacing: 1,
  },
  footerText: {
    marginTop: hp(24),
    color: '#8892B0',
    fontSize: fs(11),
    fontWeight: '600',
  },
});

export default DriverLogin;
