import React, { useState, useEffect } from 'react';
import { getSessionUser } from '../services/auth';
import Geolocation from '@react-native-community/geolocation';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    TextInput,
    Dimensions,
    PixelRatio,
    Alert,
    PermissionsAndroid,
    Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

const { width } = Dimensions.get('window');
const BASE_W = 375;
const wp = (px: number) => Math.round(PixelRatio.roundToNearestPixel((px / BASE_W) * width));
const fs = (px: number) => Math.round(PixelRatio.roundToNearestPixel((px / BASE_W) * width));

const NAVY = '#0F172A';
const GRAY = '#64748B';
const WHITE = '#FFFFFF';
const BLUE = '#1A6BFF'; // Royal Blue App Theme
const BORDER = '#E2E8F0';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type BillingRouteProp = RouteProp<RootStackParamList, 'Billing'>;

export default function BillingScreen() {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<BillingRouteProp>();
    const carId = route.params?.carId || '1';

    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [country, setCountry] = useState('');
    const [gender, setGender] = useState('');
    const [loadingLoc, setLoadingLoc] = useState(false);

    useEffect(() => {
        const user = getSessionUser();
        if (user) {
            if (user.name) setName(user.name);
            if (user.email) setEmail(user.email);
            if (user.phone) setPhone(user.phone);
            if (user.address) setAddress(user.address);
            if (user.country) setCountry(user.country);
            if (user.gender) setGender(user.gender);
        }
    }, []);

    const requestLocationPermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: 'Location Permission',
                        message: 'ShiftRide needs access to your location to auto-fill your address.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    }
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn(err);
                return false;
            }
        }
        return true;
    };

    const fetchCurrentLocation = async () => {
        setLoadingLoc(true);
        try {
            const hasPermission = await requestLocationPermission();
            if (!hasPermission) {
                console.warn('Location permission denied, using IP fallback');
                await fetchIPLocation();
                return;
            }

            Geolocation.getCurrentPosition(
                async (position: any) => {
                    try {
                        const { latitude, longitude } = position.coords;
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
                            {
                                headers: {
                                    'User-Agent': 'ShiftRide-App'
                                }
                            }
                        );
                        const data = await response.json();
                        if (data && data.display_name) {
                            setAddress(data.display_name);
                            if (data.address && data.address.country) {
                                setCountry(data.address.country);
                            }
                            setLoadingLoc(false);
                            return;
                        }
                    } catch (gpsError) {
                        console.warn('GPS Reverse geocode failed, falling back to IP:', gpsError);
                    }
                    await fetchIPLocation();
                },
                async (error: any) => {
                    console.warn('GPS location failed/denied, falling back to IP:', error);
                    await fetchIPLocation();
                },
                { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 }
            );
        } catch (error) {
            console.warn('Location fetching error, using fallback:', error);
            setAddress('MG Road, Pune, Maharashtra, India');
            setLoadingLoc(false);
        }
    };

    const fetchIPLocation = async () => {
        try {
            const response = await fetch('https://ipwho.is/');
            const text = await response.text();
            if (text.trim().startsWith('{')) {
                const data = JSON.parse(text);
                if (data && data.success && data.city) {
                    const fetchedAddress = `${data.city}, ${data.region}, ${data.country}`;
                    setAddress(fetchedAddress);
                    if (data.country) {
                        setCountry(data.country);
                    }
                } else {
                    const res2 = await fetch('https://ipapi.co/json/');
                    const text2 = await res2.text();
                    if (text2.trim().startsWith('{')) {
                        const data2 = JSON.parse(text2);
                        if (data2 && data2.city) {
                            setAddress(`${data2.city}, ${data2.region}, ${data2.country_name}`);
                            if (data2.country_name) setCountry(data2.country_name);
                            return;
                        }
                    }
                    setAddress('MG Road, Pune, Maharashtra, India');
                }
            } else {
                setAddress('MG Road, Pune, Maharashtra, India');
            }
        } catch (ipError) {
            console.warn('IP location failed:', ipError);
            setAddress('MG Road, Pune, Maharashtra, India');
        } finally {
            setLoadingLoc(false);
        }
    };

    const handleContinue = () => {
        if (!name || !address || !email || !phone) {
            Alert.alert('Required Fields', 'Please fill in Name, Address, Email, and Phone Number.');
            return;
        }
        navigation.navigate('Payment', {
            carId,
            billingData: { name, address, email, phone, country: country || 'India', gender: gender || 'Male' },
            womenSafety: route.params?.womenSafety || false,
        });
    };

    return (
        <View style={s.screen}>
            <StatusBar barStyle="dark-content" backgroundColor={WHITE} />

            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity style={s.circleBtn} onPress={() => navigation.goBack()}>
                    <Text style={s.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={s.headerTitle}>Billing Details</Text>
                <View style={{ width: wp(36) }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
                {/* ── Progress Stepper Bar ── */}
                <View style={s.stepperRow}>
                    <View style={s.stepItem}>
                        <View style={[s.stepDot, s.stepDotActive]}>
                            <Text style={s.stepDotTxt}>1</Text>
                        </View>
                        <Text style={[s.stepTxt, s.stepTxtActive]}>Billing</Text>
                    </View>
                    <View style={s.stepLine} />
                    <View style={s.stepItem}>
                        <View style={s.stepDot}>
                            <Text style={s.stepDotTxtInactive}>2</Text>
                        </View>
                        <Text style={s.stepTxt}>Payment</Text>
                    </View>
                    <View style={s.stepLine} />
                    <View style={s.stepItem}>
                        <View style={s.stepDot}>
                            <Text style={s.stepDotTxtInactive}>3</Text>
                        </View>
                        <Text style={s.stepTxt}>Review</Text>
                    </View>
                </View>

                {/* Form Wrapper Card */}
                <View style={s.formCard}>
                    <Text style={s.fieldLabel}>Name</Text>
                    <View style={s.inputContainer}>
                        <Text style={s.inputIcon}>👤</Text>
                        <TextInput
                            style={s.inputField}
                            placeholder="Enter name"
                            placeholderTextColor="#94A3B8"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <Text style={s.fieldLabel}>Address</Text>
                    <View style={[s.inputContainer, { paddingRight: wp(8) }]}>
                        <Text style={s.inputIcon}>📍</Text>
                        <TextInput
                            style={[s.inputField, { flex: 1 }]}
                            placeholder="Address"
                            placeholderTextColor="#94A3B8"
                            value={address}
                            onChangeText={setAddress}
                        />
                        <TouchableOpacity 
                            style={s.locationButton} 
                            onPress={fetchCurrentLocation}
                            disabled={loadingLoc}
                            activeOpacity={0.7}
                        >
                            <Text style={s.locationBtnTxt}>
                                {loadingLoc ? 'Fetching...' : '🎯 Auto Get'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={s.fieldLabel}>Email Address</Text>
                    <View style={s.inputContainer}>
                        <Text style={s.inputIcon}>✉️</Text>
                        <TextInput
                            style={s.inputField}
                            placeholder="Enter email address"
                            placeholderTextColor="#94A3B8"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>

                    <Text style={s.fieldLabel}>Phone Number</Text>
                    <View style={s.inputContainer}>
                        <Text style={s.inputIcon}>📞</Text>
                        <TextInput
                            style={s.inputField}
                            placeholder="Enter phone number"
                            placeholderTextColor="#94A3B8"
                            keyboardType="phone-pad"
                            value={phone}
                            onChangeText={setPhone}
                        />
                    </View>

                    <Text style={s.fieldLabel}>Country</Text>
                    <TouchableOpacity
                        style={s.dropdownBtn}
                        activeOpacity={0.8}
                        onPress={() => {
                            Alert.alert('Select Country', 'Select country', [
                                { text: 'India', onPress: () => setCountry('India') },
                                { text: 'United States', onPress: () => setCountry('United States') },
                                { text: 'United Kingdom', onPress: () => setCountry('United Kingdom') },
                            ]);
                        }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(8) }}>
                            <Text style={s.inputIcon}>🌍</Text>
                            <Text style={[s.dropdownTxt, !country && s.placeholderTxt]}>
                                {country || 'Select country'}
                            </Text>
                        </View>
                        <Text style={s.chevron}>▾</Text>
                    </TouchableOpacity>

                    <Text style={s.fieldLabel}>Gender</Text>
                    <TouchableOpacity
                        style={s.dropdownBtn}
                        activeOpacity={0.8}
                        onPress={() => {
                            Alert.alert('Select Gender', 'Select gender', [
                                { text: 'Male', onPress: () => setGender('Male') },
                                { text: 'Female', onPress: () => setGender('Female') },
                            ]);
                        }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(8) }}>
                            <Text style={s.inputIcon}>⚧</Text>
                            <Text style={[s.dropdownTxt, !gender && s.placeholderTxt]}>
                                {gender || 'Select gender'}
                            </Text>
                        </View>
                        <Text style={s.chevron}>▾</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: wp(120) }} />
            </ScrollView>

            {/* Bottom Button */}
            <View style={s.bottomContainer}>
                <TouchableOpacity style={s.continueBtn} activeOpacity={0.8} onPress={handleContinue}>
                    <Text style={s.continueBtnTxt}>Continue</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    screen: { flex: 1, backgroundColor: WHITE },
    scrollContent: { paddingHorizontal: wp(16), paddingTop: wp(10) },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: wp(16),
        paddingTop: (StatusBar.currentHeight || wp(16)) + wp(8),
        paddingBottom: wp(12),
        backgroundColor: WHITE,
        borderBottomWidth: 1,
        borderColor: BORDER,
    },
    circleBtn: {
        width: wp(36),
        height: wp(36),
        borderRadius: wp(18),
        borderWidth: 1,
        borderColor: BORDER,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: WHITE,
    },
    backIcon: {
        fontSize: fs(18),
        color: NAVY,
        fontWeight: 'bold',
    },
    headerTitle: {
        fontSize: fs(16),
        fontWeight: '800',
        color: NAVY,
    },
    // Stepper Styling
    stepperRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: wp(16),
        paddingHorizontal: wp(10),
    },
    stepItem: {
        alignItems: 'center',
        gap: wp(4),
    },
    stepDot: {
        width: wp(24),
        height: wp(24),
        borderRadius: wp(12),
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: BORDER,
    },
    stepDotActive: {
        backgroundColor: BLUE,
        borderColor: BLUE,
    },
    stepDotTxt: {
        fontSize: fs(11),
        fontWeight: '800',
        color: WHITE,
    },
    stepDotTxtInactive: {
        fontSize: fs(11),
        fontWeight: '700',
        color: GRAY,
    },
    stepTxt: {
        fontSize: fs(10),
        fontWeight: '700',
        color: GRAY,
    },
    stepTxtActive: {
        color: BLUE,
    },
    stepLine: {
        flex: 1,
        height: 1.5,
        backgroundColor: BORDER,
        marginHorizontal: wp(8),
        marginBottom: wp(12),
    },
    // Form Card Styling
    formCard: {
        backgroundColor: WHITE,
        borderRadius: wp(16),
        padding: wp(16),
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: wp(4) },
        shadowOpacity: 0.02,
        shadowRadius: wp(8),
        elevation: 2,
    },
    fieldLabel: {
        fontSize: fs(12),
        fontWeight: '800',
        color: NAVY,
        marginBottom: wp(6),
        marginTop: wp(12),
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: BORDER,
        borderRadius: wp(12),
        backgroundColor: '#F8FAFC',
        paddingHorizontal: wp(12),
    },
    inputIcon: {
        fontSize: fs(15),
        color: GRAY,
    },
    inputField: {
        flex: 1,
        paddingVertical: wp(11),
        paddingHorizontal: wp(8),
        fontSize: fs(13),
        color: NAVY,
        fontWeight: '600',
    },
    dropdownBtn: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: BORDER,
        borderRadius: wp(12),
        backgroundColor: '#F8FAFC',
        paddingHorizontal: wp(12),
        paddingVertical: wp(12),
    },
    dropdownTxt: {
        fontSize: fs(13),
        color: NAVY,
        fontWeight: '600',
    },
    placeholderTxt: {
        color: '#94A3B8',
    },
    chevron: {
        fontSize: fs(13),
        color: GRAY,
        fontWeight: 'bold',
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: wp(20),
        paddingTop: wp(14),
        paddingBottom: wp(24),
        backgroundColor: WHITE,
        borderTopWidth: 1,
        borderColor: BORDER,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 8,
    },
    continueBtn: {
        backgroundColor: BLUE,
        borderRadius: wp(12),
        paddingVertical: wp(14),
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: BLUE,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
    },
    continueBtnTxt: {
        fontSize: fs(14),
        fontWeight: '800',
        color: WHITE,
    },
    locationButton: {
        backgroundColor: '#EFF6FF',
        paddingHorizontal: wp(10),
        paddingVertical: wp(6),
        borderRadius: wp(8),
        borderWidth: 1,
        borderColor: '#BFDBFE',
    },
    locationBtnTxt: {
        color: BLUE,
        fontSize: fs(10),
        fontWeight: '700',
    },
});
