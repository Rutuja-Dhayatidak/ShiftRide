import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  StatusBar,
  Linking,
  Image,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import api, { getImageUrl } from '../services/api';

const DriverDashboard = () => {
  const navigation = useNavigation<any>();
  const [driver, setDriver] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  // Sliding toggle animation
  const statusAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (driver?.status) {
      Animated.timing(statusAnim, {
        toValue: driver.status === 'AVAILABLE' ? 0 : 1,
        duration: 250,
        useNativeDriver: false,
      }).start();
    }
  }, [driver?.status]);

  const translateX = statusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, wp(80)],
  });

  const activeColor = statusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#4CD964', '#FF9500'],
  });
  const [loading, setLoading] = useState(true);

  const handleUploadPhoto = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, async (response) => {
      if (response.didCancel) return;
      if (response.errorMessage) {
        Alert.alert('Error', response.errorMessage);
        return;
      }
      const asset = response.assets?.[0];
      if (!asset || !asset.uri) return;

      const formData = new FormData();
      formData.append('photo', {
        uri: asset.uri,
        name: asset.fileName || 'profile.jpg',
        type: asset.type || 'image/jpeg',
      } as any);

      try {
        setLoading(true);
        const res = await api.post('/driver/update-photo', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        if (res.data && res.data.success) {
          setDriver(res.data.driver);
          Alert.alert('Success', 'Profile photo updated successfully!');
        }
      } catch (err: any) {
        console.error('Upload photo failed:', err);
        Alert.alert('Error', err?.response?.data?.message || 'Failed to upload photo');
      } finally {
        setLoading(false);
      }
    });
  };
  const [activeTab, setActiveTab] = useState<'assigned' | 'history'>('assigned');
  
  // OTP Verification Modal
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const [otpVerifying, setOtpVerifying] = useState(false);

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const locationIntervalRef = useRef<any>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('driverToken');
      if (!token) {
        navigation.replace('DriverLogin');
        return;
      }

      // Add auth header manually if axios defaults aren't updated yet
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const profileRes = await api.get('/driver/me');
      setDriver(profileRes.data.driver);

      const bookingsRes = await api.get('/driver/bookings/assigned');
      setBookings(bookingsRes.data.bookings || []);

      const historyRes = await api.get('/driver/bookings/history');
      setHistory(historyRes.data.bookings || []);
    } catch (err: any) {
      console.error('Fetch dashboard data failed:', err);
      if (err?.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Location update simulation when active trip exists
  useEffect(() => {
    const hasActiveRide = bookings.some((b) =>
      ['DRIVER_ACCEPTED', 'DRIVER_ARRIVING', 'OTP_VERIFIED', 'TRIP_STARTED'].includes(b.bookingStatus)
    );

    if (hasActiveRide) {
      if (!locationIntervalRef.current) {
        let lat = 18.5204; // Pune coordinates
        let lng = 73.8567;

        const sendLocation = async () => {
          try {
            lat += (Math.random() - 0.5) * 0.002;
            lng += (Math.random() - 0.5) * 0.002;

            await api.post('/driver/location/update', {
              latitude: lat,
              longitude: lng,
            });
            console.log('Mobile location synced:', lat, lng);
          } catch (e) {
            console.error('Failed to sync mobile location:', e);
          }
        };

        sendLocation();
        locationIntervalRef.current = setInterval(sendLocation, 20000);
      }
    } else {
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
        locationIntervalRef.current = null;
      }
    }

    return () => {
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
        locationIntervalRef.current = null;
      }
    };
  }, [bookings]);

  const handleStatusChange = async (newStatus: string) => {
    try {
      const res = await api.patch('/driver/status', { status: newStatus });
      if (res.data && res.data.success) {
        setDriver((prev: any) => ({ ...prev, status: newStatus }));
      }
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to update status');
    }
  };

  const handleAccept = async (bookingId: string) => {
    try {
      setActionLoading(bookingId);
      await api.post(`/driver/bookings/${bookingId}/accept`);
      await fetchData();
      Alert.alert('Success', 'Ride accepted successfully!');
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to accept booking');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (bookingId: string) => {
    Alert.alert('Reject Ride', 'Are you sure you want to REJECT this ride?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: async () => {
          try {
            setActionLoading(bookingId);
            await api.post(`/driver/bookings/${bookingId}/reject`);
            await fetchData();
          } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message || 'Failed to reject booking');
          } finally {
            setActionLoading(null);
          }
        },
      },
    ]);
  };

  const openOtpModal = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setOtpInput('');
    setOtpModalVisible(true);
  };

  const handleVerifyOtp = async () => {
    if (!otpInput || !selectedBookingId) {
      Alert.alert('Validation', 'Please enter OTP');
      return;
    }
    setOtpVerifying(true);
    try {
      // 1. Verify OTP
      await api.post(`/driver/bookings/${selectedBookingId}/verify-otp`, { otp: otpInput });
      // 2. Start Trip immediately
      await api.post(`/driver/bookings/${selectedBookingId}/start-trip`);
      
      setOtpModalVisible(false);
      await fetchData();
      Alert.alert('Success', 'OTP Verified! Trip has started successfully.');
    } catch (err: any) {
      Alert.alert('Verification Failed', err?.response?.data?.message || 'Invalid OTP');
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleStartTrip = async (bookingId: string) => {
    // Open OTP verify first
    openOtpModal(bookingId);
  };

  const handleStartTripConfirmed = async (bookingId: string) => {
    try {
      setActionLoading(bookingId);
      await api.post(`/driver/bookings/${bookingId}/start-trip`);
      await fetchData();
      Alert.alert('Success', 'Trip has started successfully.');
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to start trip');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteTrip = async (bookingId: string) => {
    try {
      setActionLoading(bookingId);
      await api.post(`/driver/bookings/${bookingId}/complete-trip`);
      await fetchData();
      Alert.alert('Completed', 'Trip has been completed. Payment is finalized!');
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to complete trip');
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('driverToken');
    await AsyncStorage.removeItem('driver');
    navigation.replace('DriverLogin');
  };

  const renderBookingCard = ({ item }: { item: any }) => {
    const isHistory = activeTab === 'history';
    return (
      <View style={styles.bookingCard}>
        <View style={styles.bookingHeader}>
          <Text style={styles.carText}>🚗 {item.car_id?.brand} {item.car_id?.model || 'Car Details'}</Text>
          <View style={[styles.badge, (styles as any)[`badge_${item.bookingStatus}`] || styles.badge_default]}>
            <Text style={styles.badgeText}>{item.bookingStatus}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.bookingDetail}>
          <Text style={styles.detailLabel}>👤 CUSTOMER:</Text>
          <Text style={styles.detailValue}>{item.user_id?.name || item.customerInfo?.name || 'N/A'} ({item.user_id?.phone || item.customerInfo?.phone || 'N/A'})</Text>
        </View>

        <View style={styles.bookingDetail}>
          <Text style={styles.detailLabel}>📍 PICKUP:</Text>
          <Text style={styles.detailValue}>{item.pickup_location || 'Not Specified'}</Text>
        </View>

        <View style={styles.bookingDetail}>
          <Text style={styles.detailLabel}>🏁 DROP:</Text>
          <Text style={styles.detailValue}>{item.drop_location || 'Not Specified'}</Text>
        </View>

        <View style={styles.bookingDetail}>
          <Text style={styles.detailLabel}>📅 DATES:</Text>
          <Text style={styles.detailValue}>{item.start_date ? new Date(item.start_date).toLocaleDateString() : ''} - {item.end_date ? new Date(item.end_date).toLocaleDateString() : ''}</Text>
        </View>

        <View style={styles.bookingDetail}>
          <Text style={styles.detailLabel}>💳 AMOUNT:</Text>
          <Text style={styles.priceValue}>₹{item.total_amount}</Text>
        </View>

        {!isHistory && (
          <View style={styles.actionRow}>
            {(item.bookingStatus === 'FORWARDED_TO_DRIVER' || item.bookingStatus === 'DRIVER_ASSIGNED') && (
              <>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.acceptBtn]}
                  onPress={() => handleAccept(item._id)}
                  disabled={actionLoading !== null}
                >
                  <Text style={styles.acceptBtnText}>ACCEPT</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.rejectBtn]}
                  onPress={() => handleReject(item._id)}
                  disabled={actionLoading !== null}
                >
                  <Text style={styles.rejectBtnText}>REJECT</Text>
                </TouchableOpacity>
              </>
            )}

            {item.bookingStatus === 'DRIVER_ACCEPTED' && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.startBtn]}
                onPress={() => handleStartTrip(item._id)}
                disabled={actionLoading !== null}
              >
                <Text style={styles.btnText}>VERIFY OTP & START TRIP</Text>
              </TouchableOpacity>
            )}

            {item.bookingStatus === 'OTP_VERIFIED' && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.startBtn]}
                onPress={() => handleStartTripConfirmed(item._id)}
                disabled={actionLoading !== null}
              >
                <Text style={styles.btnText}>START TRIP</Text>
              </TouchableOpacity>
            )}

            {item.bookingStatus === 'TRIP_STARTED' && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.completeBtn]}
                onPress={() => handleCompleteTrip(item._id)}
                disabled={actionLoading !== null}
              >
                <Text style={styles.btnText}>COMPLETE TRIP</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  if (loading && !driver) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1A6BFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1B3E" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.portalTitle}>DRIVER PORTAL</Text>
            <Text style={styles.portalSubtitle}>कार हब Partners</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutIcon}>🚪</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* DRIVER PROFILE CARD */}
      {driver && (
        <View style={styles.profileCard}>
          <View style={styles.profileRow}>
            <TouchableOpacity onPress={handleUploadPhoto} style={styles.avatarWrapper}>
              {driver.driverPhoto ? (
                <Image source={{ uri: getImageUrl(driver.driverPhoto) || undefined }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{driver.driverName ? driver.driverName.charAt(0).toUpperCase() : 'D'}</Text>
                </View>
              )}
              <View style={styles.cameraBadge}>
                <Text style={styles.cameraIcon}>📷</Text>
              </View>
            </TouchableOpacity>
            <View style={styles.profileInfo}>
              <Text style={styles.driverName}>{driver.driverName || driver.name}</Text>
              <Text style={styles.driverSub}>📞 {driver.phone}</Text>
              <Text style={styles.driverSub}>💼 Exp: {driver.experience || 0} Yrs | 🪪 {driver.licenseNumber}</Text>
            </View>
          </View>

          <View style={styles.statusRatingRow}>
            <View style={styles.statusCol}>
              <Text style={styles.secLabel}>STATUS</Text>
              <View style={styles.statusToggleContainer}>
                <Animated.View
                  style={[
                    styles.slidingHighlight,
                    {
                      transform: [{ translateX }],
                      backgroundColor: activeColor,
                    },
                  ]}
                />
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.statusToggleBtn}
                  onPress={() => handleStatusChange('AVAILABLE')}
                >
                  <Text style={[styles.statusToggleText, driver.status === 'AVAILABLE' && styles.statusToggleTextActive]}>AVAILABLE</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.statusToggleBtn}
                  onPress={() => handleStatusChange('BUSY')}
                >
                  <Text style={[styles.statusToggleText, driver.status === 'BUSY' && styles.statusToggleTextActive]}>BUSY</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.ratingCol}>
              <Text style={styles.secLabel}>RATINGS</Text>
              <Text style={styles.ratingVal}>⭐ {driver.rating || '4.9'}</Text>
            </View>
          </View>
        </View>
      )}

      {/* TABS */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'assigned' && styles.tabActive]}
          onPress={() => setActiveTab('assigned')}
        >
          <Text style={[styles.tabText, activeTab === 'assigned' && styles.tabTextActive]}>
            ASSIGNED BOOKINGS ({bookings.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            TRIP HISTORY ({history.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* LIST OF BOOKINGS */}
      <FlatList
        data={activeTab === 'assigned' ? bookings : history}
        keyExtractor={(item) => item._id}
        renderItem={renderBookingCard}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={fetchData}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>
              {activeTab === 'assigned' ? 'No assigned bookings. Active rides will appear here.' : 'No ride history found.'}
            </Text>
          </View>
        }
      />

      {/* OTP MODAL */}
      <Modal
        visible={otpModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setOtpModalVisible(false)}
      >
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Trip Verification OTP</Text>
            <Text style={styles.modalDesc}>Please ask the customer for the OTP sent to their mobile device to start the trip.</Text>
            
            <TextInput
              style={styles.otpInput}
              placeholder="Enter 4-Digit OTP"
              keyboardType="number-pad"
              maxLength={6}
              value={otpInput}
              onChangeText={setOtpInput}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancelBtn]}
                onPress={() => setOtpModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalConfirmBtn]}
                onPress={handleVerifyOtp}
                disabled={otpVerifying}
              >
                {otpVerifying ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.modalConfirmText}>Verify & Start</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
    backgroundColor: '#F1F3F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F3F6',
  },
  header: {
    backgroundColor: '#0D1B3E',
    paddingTop: hp(16),
    paddingBottom: hp(20),
    paddingHorizontal: wp(20),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  portalTitle: {
    fontSize: fs(20),
    fontWeight: '900',
    color: '#FFF',
  },
  portalSubtitle: {
    fontSize: fs(12),
    color: '#1A6BFF',
    fontWeight: 'bold',
    marginTop: hp(2),
  },
  logoutBtn: {
    padding: wp(10),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: wp(12),
  },
  logoutIcon: {
    fontSize: fs(18),
  },
  profileCard: {
    margin: wp(16),
    backgroundColor: '#FFFFFF',
    borderRadius: wp(24),
    padding: wp(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImage: {
    width: wp(60),
    height: wp(60),
    borderRadius: wp(30),
    borderWidth: 2,
    borderColor: '#1A6BFF',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -wp(2),
    right: -wp(2),
    backgroundColor: '#1A6BFF',
    width: wp(22),
    height: wp(22),
    borderRadius: wp(11),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  cameraIcon: {
    fontSize: fs(10),
    color: '#FFF',
  },
  avatar: {
    width: wp(60),
    height: wp(60),
    borderRadius: wp(30),
    backgroundColor: '#1A6BFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: fs(24),
    color: '#FFF',
    fontWeight: 'bold',
  },
  profileInfo: {
    marginLeft: wp(16),
    flex: 1,
  },
  driverName: {
    fontSize: fs(18),
    fontWeight: 'bold',
    color: '#0D1B3E',
  },
  driverSub: {
    fontSize: fs(12),
    color: '#5A6880',
    marginTop: hp(2),
  },
  statusRatingRow: {
    flexDirection: 'row',
    marginTop: hp(20),
    borderTopWidth: 1,
    borderTopColor: '#F0F4FF',
    paddingTop: hp(16),
  },
  statusCol: {
    flex: 1,
  },
  ratingCol: {
    width: wp(90),
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#F0F4FF',
  },
  secLabel: {
    fontSize: fs(10),
    fontWeight: 'bold',
    color: '#5A6880',
    letterSpacing: 1,
    marginBottom: hp(6),
  },
  statusToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F3F6',
    borderRadius: wp(10),
    padding: wp(3),
    alignSelf: 'flex-start',
    position: 'relative',
    width: wp(80) * 2 + wp(6),
  },
  slidingHighlight: {
    position: 'absolute',
    top: wp(3),
    left: wp(3),
    width: wp(80),
    height: hp(28),
    borderRadius: wp(8),
  },
  statusToggleBtn: {
    width: wp(80),
    height: hp(28),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  statusToggleText: {
    fontSize: fs(11),
    fontWeight: 'bold',
    color: '#5A6880',
  },
  statusToggleTextActive: {
    color: '#FFF',
  },
  ratingVal: {
    fontSize: fs(16),
    fontWeight: 'bold',
    color: '#FF9500',
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E8FF',
  },
  tab: {
    flex: 1,
    paddingVertical: hp(15),
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#1A6BFF',
  },
  tabText: {
    fontSize: fs(11),
    fontWeight: 'bold',
    color: '#5A6880',
  },
  tabTextActive: {
    color: '#1A6BFF',
  },
  listContent: {
    padding: wp(16),
  },
  bookingCard: {
    backgroundColor: '#FFF',
    borderRadius: wp(20),
    padding: wp(16),
    marginBottom: hp(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  carText: {
    fontSize: fs(15),
    fontWeight: 'bold',
    color: '#0D1B3E',
  },
  badge: {
    paddingHorizontal: wp(10),
    paddingVertical: hp(4),
    borderRadius: wp(8),
  },
  badge_default: {
    backgroundColor: '#E0E8FF',
  },
  badgeText: {
    fontSize: fs(10),
    fontWeight: 'bold',
    color: '#0D1B3E',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F4FF',
    marginVertical: hp(12),
  },
  bookingDetail: {
    flexDirection: 'row',
    marginBottom: hp(6),
  },
  detailLabel: {
    width: wp(95),
    fontSize: fs(11),
    fontWeight: 'bold',
    color: '#5A6880',
  },
  detailValue: {
    flex: 1,
    fontSize: fs(12),
    color: '#0D1B3E',
  },
  priceValue: {
    fontSize: fs(15),
    fontWeight: 'bold',
    color: '#1A6BFF',
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: hp(16),
    gap: wp(10),
  },
  actionBtn: {
    flex: 1,
    height: hp(44),
    borderRadius: wp(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptBtn: {
    backgroundColor: '#1A6BFF',
  },
  acceptBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: fs(13),
  },
  rejectBtn: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  rejectBtnText: {
    color: '#FF3B30',
    fontWeight: 'bold',
    fontSize: fs(13),
  },
  startBtn: {
    backgroundColor: '#1A6BFF',
  },
  completeBtn: {
    backgroundColor: '#4CD964',
  },
  btnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: fs(13),
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: hp(50),
  },
  emptyIcon: {
    fontSize: fs(48),
    marginBottom: hp(12),
  },
  emptyText: {
    fontSize: fs(14),
    color: '#5A6880',
    textAlign: 'center',
    paddingHorizontal: wp(30),
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp(20),
  },
  modalContent: {
    width: '100%',
    maxWidth: wp(320),
    backgroundColor: '#FFF',
    borderRadius: wp(24),
    padding: wp(24),
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: fs(18),
    fontWeight: 'bold',
    color: '#0D1B3E',
  },
  modalDesc: {
    fontSize: fs(12),
    color: '#5A6880',
    textAlign: 'center',
    marginTop: hp(8),
    marginBottom: hp(20),
  },
  otpInput: {
    width: '100%',
    height: hp(50),
    backgroundColor: '#F4F7FF',
    borderWidth: 1,
    borderColor: '#E0E8FF',
    borderRadius: wp(12),
    fontSize: fs(18),
    textAlign: 'center',
    letterSpacing: 4,
    color: '#0D1B3E',
    fontWeight: 'bold',
    marginBottom: hp(20),
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: wp(12),
    width: '100%',
  },
  modalBtn: {
    flex: 1,
    height: hp(48),
    borderRadius: wp(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelBtn: {
    backgroundColor: '#F1F3F6',
  },
  modalCancelText: {
    color: '#5A6880',
    fontWeight: 'bold',
  },
  modalConfirmBtn: {
    backgroundColor: '#1A6BFF',
  },
  modalConfirmText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default DriverDashboard;
