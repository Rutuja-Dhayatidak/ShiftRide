import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    TextInput,
    ScrollView,
    Dimensions,
    PixelRatio,
    Switch,
    Image,
    Animated,
    Alert,
    ActivityIndicator,
    Linking,
} from 'react-native';
import { useNavigation, useFocusEffect, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { BottomNavigation } from '../components/bottomnavigation';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getAllCars } from '../services/Car';
import api, { getCarImageUrl } from '../services/api';
import { initiatePaymentForBooking, verifyPayment } from '../services/payment';
import RazorpayCheckout from 'react-native-razorpay';
import { getActiveOffers } from '../services/mobileOffer';
import { getSessionUser } from '../services/auth';
import { isDarkMode, subscribeThemeChange } from '../services/theme';

const { width, height } = Dimensions.get('window');
const BASE_W = 375;

const wp = (px: number) =>
    Math.round(PixelRatio.roundToNearestPixel((px / BASE_W) * width));

const fs = (px: number) =>
    Math.round(PixelRatio.roundToNearestPixel((px / BASE_W) * width));

// Theme Colors
const NAVY = '#10173A';
const GRAY = '#8A94A6';
const GRAY_LT = '#F4F6F9';
const WHITE = '#FFFFFF';
const BLUE = '#1C69D4';
const BORDER = '#EAEFF5';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const BRANDS_DATA = [
    { id: '1', name: 'Mercedes', icon: 'Ⓜ️' },
    { id: '2', name: 'Tesla', icon: '⚡' },
    { id: '3', name: 'BMW', icon: 'ⓑ' },
    { id: '4', name: 'Toyota', icon: 'Ⓣ' },
    { id: '5', name: 'Volvo', icon: 'Ⓥ' },
    { id: '6', name: 'Honda', icon: 'Ⓗ' },
    { id: '7', name: 'More', icon: '•••' },
];

const POPULAR_CARS = [
    {
        id: '1',
        name: 'BMW 3 Series',
        type: 'Luxury Sedan',
        rating: '4.8',
        trips: '128',
        price: '$68',
        image: require('../assets/images/banner_car.png'),
    },
    {
        id: '2',
        name: 'Tesla Model 3',
        type: 'Electric Sedan',
        rating: '4.9',
        trips: '96',
        price: '$79',
        image: require('../assets/images/banner_car.png'),
    },
];

const ROUTES_DATA = [
    {
        id: '1',
        from: 'Mumbai',
        to: 'Pune',
        distance: '149 km',
        image: require('../assets/images/mumbai_route.png'),
    },
    {
        id: '2',
        from: 'Bangalore',
        to: 'Mysore',
        distance: '143 km',
        image: require('../assets/images/mysore_route.png'),
    },
    {
        id: '3',
        from: 'Chennai',
        to: 'Pondicherry',
        distance: '155 km',
        image: require('../assets/images/chennai_route.png'),
    },
    {
        id: '4',
        from: 'Hyderabad',
        to: 'Warangal',
        distance: '148 km',
        image: require('../assets/images/hyderabad_route.png'),
    },
];

const SearchScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const [fromLoc, setFromLoc] = useState('');
    const [toLoc, setToLoc] = useState('');
    const [fromError, setFromError] = useState(false);
    const [toError, setToError] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [activeBooking, setActiveBooking] = useState<any>(null);
    const [date, setDate] = useState('19, Dec 2022');
    const [dayOfWeek, setDayOfWeek] = useState('Sabtu');
    const [time, setTime] = useState('10:00 AM');
    const [timeZone, setTimeZone] = useState('WIB');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [dateVal, setDateVal] = useState(new Date());
    const [timeVal, setTimeVal] = useState(new Date());
    const [womenSafety, setWomenSafety] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [selectedVehicle, setSelectedVehicle] = useState('Mobil');
    const [popularCars, setPopularCars] = useState<any[]>(POPULAR_CARS);
    const [mobileOffers, setMobileOffers] = useState<any[]>([]);
    const [userProfile, setUserProfile] = useState<any>(null);
    const isFocused = useIsFocused();
    const [isDark, setIsDark] = useState(isDarkMode());
    
    useEffect(() => {
        const unsubscribe = subscribeThemeChange((darkVal) => {
            if (isFocused) {
                setIsDark(darkVal);
            }
        });
        return unsubscribe;
    }, [isFocused]);

    useEffect(() => {
        if (isFocused) {
            const currentDark = isDarkMode();
            if (isDark !== currentDark) {
                setIsDark(currentDark);
            }
        }
    }, [isFocused, isDark]);

    const theme = {
        bg: isDark ? '#0F172A' : '#FAFBFD',
        cardBg: isDark ? '#1E293B' : WHITE,
        textMain: isDark ? WHITE : NAVY,
        textSub: isDark ? '#94A3B8' : GRAY,
        border: isDark ? '#334155' : BORDER,
        divider: isDark ? '#334155' : '#F1F5F9',
        inputBg: isDark ? '#1E293B' : WHITE,
    };

    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const successScale = useRef(new Animated.Value(0)).current;
    const cardOpacity = useRef(new Animated.Value(1)).current;
    const activeBookingRef = useRef<any>(null);

    const [paymentLoading, setPaymentLoading] = useState(false);

    const handlePayNow = async (booking: any) => {
        try {
            setPaymentLoading(true);
            const bookingId = booking.id || booking._id;
            const res = await initiatePaymentForBooking(bookingId);

            if (res && res.razorpayOrderId) {
                const options = {
                    description: `Payment for booking ${bookingId}`,
                    image: 'https://i.imgur.com/3g7nmJC.png',
                    currency: 'INR',
                    key: res.keyId || 'rzp_test_SNw35MkokY8h1y',
                    amount: Math.round(res.pricing.totalAmount * 100),
                    name: 'ShiftRide',
                    order_id: res.razorpayOrderId,
                    prefill: {
                        email: booking.customerInfo?.email || 'customer@shiftride.com',
                        contact: booking.customerInfo?.phone || '9999999999',
                        name: booking.customerInfo?.name || 'Customer'
                    },
                    theme: { color: '#1A6BFF' }
                };

                setPaymentLoading(false);

                RazorpayCheckout.open(options).then(async (data: any) => {
                    try {
                        setPaymentLoading(true);
                        const verifyRes = await verifyPayment({
                            booking_id: bookingId,
                            razorpay_order_id: data.razorpay_order_id,
                            razorpay_payment_id: data.razorpay_payment_id,
                            razorpay_signature: data.razorpay_signature
                        });

                        if (verifyRes) {
                            Alert.alert('Payment Successful', 'Your booking is confirmed!');
                            if (activeBookingRef.current) {
                                activeBookingRef.current = {
                                    ...activeBookingRef.current,
                                    bookingStatus: 'CONFIRMED',
                                    paymentStatus: 'PAID'
                                };
                                setActiveBooking({
                                    ...activeBookingRef.current
                                });
                            }
                        }
                    } catch (verifyErr: any) {
                        const msg = verifyErr.response?.data?.message || verifyErr.message || 'Payment verification failed';
                        Alert.alert('Verification Error', msg);
                    } finally {
                        setPaymentLoading(false);
                    }
                }).catch((checkoutErr: any) => {
                    Alert.alert('Payment Cancelled', `Checkout cancelled or failed.`);
                    setPaymentLoading(false);
                });
            } else {
                throw new Error("Failed to create payment order");
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message || 'Failed to initiate payment';
            Alert.alert('Payment Error', msg);
            setPaymentLoading(false);
        }
    };

    const headerFade = useRef(new Animated.Value(0)).current;
    const headerSlide = useRef(new Animated.Value(-30)).current;
    const contentFade = useRef(new Animated.Value(0)).current;
    const contentSlide = useRef(new Animated.Value(40)).current;

    useEffect(() => {
        Animated.stagger(40, [
            Animated.parallel([
                Animated.timing(headerFade, {
                    toValue: 1,
                    duration: 180,
                    useNativeDriver: true,
                }),
                Animated.timing(headerSlide, {
                    toValue: 0,
                    duration: 220,
                    useNativeDriver: true,
                }),
            ]),
            Animated.parallel([
                Animated.timing(contentFade, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(contentSlide, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    }, []);

    useEffect(() => {
        const fetchPopularCars = async () => {
            try {
                const data = await getAllCars();
                if (data && Array.isArray(data) && data.length > 0) {
                    // Shuffle and select 4 random cars
                    const shuffled = [...data].sort(() => 0.5 - Math.random());
                    const selected = shuffled.slice(0, 4);
                    const mapped = selected.map((car: any) => ({
                        id: car.id || car._id,
                        name: car.model_name || car.name || 'Car',
                        type: `${car.brand || 'Brand'} • ${car.fuel_type || 'Petrol'}`,
                        rating: car.rating ? car.rating.toFixed(1) : '4.8',
                        trips: String(car.trips || Math.floor(Math.random() * 80) + 20),
                        price: `₹${car.price_per_day || 1200}`,
                        image: car.cars_image ? { uri: getCarImageUrl(car.cars_image) } : require('../assets/images/banner_car.png')
                    }));
                    setPopularCars(mapped);
                }
            } catch (err) {
                console.error("Failed to load popular cars:", err);
            }
        };

        const fetchOffers = async () => {
            try {
                const data = await getActiveOffers();
                if (data && Array.isArray(data)) {
                    setMobileOffers(data);
                }
            } catch (err) {
                console.error("Failed to load mobile offers:", err);
            }
        };

        const timer = setTimeout(() => {
            fetchPopularCars();
            fetchOffers();
        }, 400);

        return () => clearTimeout(timer);
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            const checkUserProfile = () => {
                const user = getSessionUser();
                if (user) {
                    setUserProfile(user);
                }
            };
            checkUserProfile();

            const fetchActiveBooking = async () => {
                try {
                    const response = await api.get('/bookings/mybookings');
                    if (response && Array.isArray(response.data) && response.data.length > 0) {
                        const active = response.data.find((b: any) => {
                            const status = String(b.status || '').toUpperCase();
                            const activeStatuses = [
                                'BOOKED', 'CONFIRMED', 'ONGOING', 'IN_PROGRESS', 'STARTED',
                                'DRIVER_ASSIGNED', 'DRIVER_ACCEPTED', 'DRIVER_ARRIVING',
                                'OTP_VERIFIED', 'TRIP_STARTED', 'REQUESTED', 'FORWARDED_TO_DRIVER'
                            ];
                            return activeStatuses.includes(status);
                        });

                        if (active) {
                            const newStatus = String(active.status || '').toUpperCase();
                            const oldStatus = activeBookingRef.current ? String(activeBookingRef.current.status || '').toUpperCase() : '';

                            const isFinished = newStatus === 'OTP_VERIFIED' || newStatus === 'TRIP_STARTED';
                            const wasNotFinished = oldStatus !== 'OTP_VERIFIED' && oldStatus !== 'TRIP_STARTED';

                            if (activeBookingRef.current && isFinished && wasNotFinished) {
                                // Update ref immediately to prevent double triggers
                                activeBookingRef.current = active;

                                setIsOtpVerified(true);
                                Animated.spring(successScale, {
                                    toValue: 1,
                                    useNativeDriver: true,
                                    tension: 50,
                                    friction: 4,
                                }).start(() => {
                                    setTimeout(() => {
                                        Animated.timing(cardOpacity, {
                                            toValue: 0,
                                            duration: 350,
                                            useNativeDriver: true,
                                        }).start(() => {
                                            setActiveBooking(null);
                                            activeBookingRef.current = null;
                                            setIsOtpVerified(false);
                                            successScale.setValue(0);
                                            cardOpacity.setValue(1);
                                        });
                                    }, 1000); // 1 Second timeout as requested by user
                                });
                            } else if (isFinished) {
                                // If already finished, keep it cleared/hidden from search screen
                                setActiveBooking(null);
                                activeBookingRef.current = null;
                            } else {
                                setActiveBooking(active);
                                activeBookingRef.current = active;
                            }
                        } else {
                            setActiveBooking(null);
                            activeBookingRef.current = null;
                        }
                    } else {
                        setActiveBooking(null);
                        activeBookingRef.current = null;
                    }
                } catch (err) {
                    console.error("Failed to fetch active booking for home screen:", err);
                }
            };
            
            let intervalId: any;
            const timer = setTimeout(() => {
                fetchActiveBooking();
                intervalId = setInterval(fetchActiveBooking, 2000);
            }, 350);

            return () => {
                clearTimeout(timer);
                if (intervalId) clearInterval(intervalId);
            };
        }, [successScale, cardOpacity])
    );

    return (
        <View style={[s.screen, { backgroundColor: theme.bg }]}>
            <StatusBar barStyle="light-content" backgroundColor={NAVY} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContainer}>
                {/* ── Dark Navy Header with Background Image ── */}
                <Animated.View style={[s.headerDark, { opacity: headerFade, transform: [{ translateY: headerSlide }] }]}>
                    <Image
                        source={require('../assets/images/banner_car.png')}
                        style={s.headerBgImage}
                        resizeMode="cover"
                    />
                    {/* Dark gradient overlay */}
                    <View style={s.headerOverlay} />

                    {/* Top Row: Back Arrow */}
                    <View style={s.headerTopRow}>
                        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
                            <Text style={s.backArrow}>←</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={s.headerMetaRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={s.userGreeting}>Hello, {userProfile?.name?.split(' ')[0] || 'Guest'} 👋</Text>
                            <Text style={s.userTitle}>Where would you{`\n`}like to go today?</Text>
                            <View style={s.blueHighlightLine} />
                        </View>

                        {/* Right Column: Avatar */}
                        <View style={s.headerRightCol}>
                            {/* Rounded avatar */}
                            <View style={s.avatarContainer}>
                                <View style={s.avatar}>
                                    <Text style={s.avatarTxt}>
                                        {userProfile?.name
                                            ? userProfile.name.split(' ').filter(Boolean).map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                                            : 'RA'
                                        }
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </Animated.View>

                <Animated.View style={{ opacity: contentFade, transform: [{ translateY: contentSlide }] }}>
                    {/* ── Floating Booking Form Card ── */}
                    <View style={s.formContainer}>
                        <View style={[s.bookingCard, { backgroundColor: theme.cardBg, shadowColor: isDark ? '#000' : '#0F172A' }]}>
                            {/* Unified Destination Box */}
                            <View style={[s.destinationBox, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                                {/* Dotted Line Connector */}
                                <View style={s.dottedConnector}>
                                    <Text style={s.dotChar}>┆</Text>
                                </View>

                                {/* From Row */}
                                <View style={s.destinationRow}>
                                    <View style={[s.iconWrapper, { backgroundColor: '#ECE9FE' }]}>
                                        <Text style={[s.iconMarker, { color: '#6C63FF' }]}>📍</Text>
                                    </View>
                                    <View style={s.destTextCol}>
                                        <Text style={[s.destLabel, { color: '#6C63FF' }]}>FROM</Text>
                                        <TextInput
                                            style={[s.destTitle, { padding: 0, color: theme.textMain }]}
                                            value={fromLoc}
                                            onChangeText={(val) => {
                                                setFromLoc(val);
                                                if (val.trim()) {
                                                    setFromError(false);
                                                    if (!toError) setValidationError(null);
                                                }
                                            }}
                                            placeholder="Enter Location"
                                            placeholderTextColor={theme.textSub}
                                        />

                                    </View>
                                </View>

                                {/* Separator Line */}
                                <View style={[s.horizontalDivider, { backgroundColor: theme.divider }]} />

                                {/* To Row */}
                                <View style={s.destinationRow}>
                                    <View style={[s.iconWrapper, { backgroundColor: '#E8FDF0' }]}>
                                        <Text style={[s.iconMarker, { color: '#10B981' }]}>📍</Text>
                                    </View>
                                    <View style={s.destTextCol}>
                                        <Text style={[s.destLabel, { color: '#10B981' }]}>TO</Text>
                                        <TextInput
                                            style={[s.destTitle, { padding: 0, color: theme.textMain }]}
                                            value={toLoc}
                                            onChangeText={(val) => {
                                                setToLoc(val);
                                                if (val.trim()) {
                                                    setToError(false);
                                                    if (!fromError) setValidationError(null);
                                                }
                                            }}
                                            placeholder="Enter destination"
                                            placeholderTextColor={theme.textSub}
                                        />

                                    </View>
                                    <Text style={s.chevronRight}>›</Text>
                                </View>

                                {/* Switch direction button */}
                                <TouchableOpacity
                                    style={s.switchBtn}
                                    activeOpacity={0.85}
                                    onPress={() => {
                                        const temp = fromLoc;
                                        setFromLoc(toLoc);
                                        setToLoc(temp);
                                        if (toLoc.trim()) setFromError(false);
                                        if (temp.trim()) setToError(false);
                                        if (toLoc.trim() && temp.trim()) setValidationError(null);
                                    }}
                                >
                                    <Text style={s.switchIcon}>⇅</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={{ height: wp(14) }} />

                            {/* Date & Time & Return Card */}
                            <View style={s.dateReturnCard}>
                                <TouchableOpacity
                                    style={s.dateCol}
                                    activeOpacity={0.7}
                                    onPress={() => setShowDatePicker(true)}
                                >
                                    <Text style={[s.inputLabel, { color: '#F97316' }]}>DATE</Text>
                                    <View style={s.inputRow}>
                                        <View style={[s.iconWrapper, { backgroundColor: '#FFF7ED' }]}><Text style={s.inputIcon}>📅</Text></View>
                                        <View>
                                            <Text style={[s.dateMainText, { color: theme.textMain }]}>{date}</Text>
                                            <Text style={[s.dateSubText, { color: theme.textSub }]}>{dayOfWeek}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>

                                {/* Vertical divider */}
                                <View style={[s.verticalDivider, { backgroundColor: theme.border }]} />

                                <TouchableOpacity
                                    style={s.dateCol}
                                    activeOpacity={0.7}
                                    onPress={() => setShowTimePicker(true)}
                                >
                                    <Text style={[s.inputLabel, { color: '#6C63FF' }]}>TIME</Text>
                                    <View style={s.inputRow}>
                                        <View style={[s.iconWrapper, { backgroundColor: '#ECE9FE' }]}><Text style={s.inputIcon}>🕒</Text></View>
                                        <View>
                                            <Text style={[s.dateMainText, { color: theme.textMain }]}>{time}</Text>
                                            <Text style={[s.dateSubText, { color: theme.textSub }]}>{timeZone}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>

                                {/* Vertical divider */}
                                <View style={[s.verticalDivider, { backgroundColor: theme.border }]} />

                                <View style={s.toggleContainer}>
                                    <Text style={[s.toggleLabel, { color: theme.textSub }]}>Women Safety?</Text>
                                    <Switch
                                        value={womenSafety}
                                        onValueChange={setWomenSafety}
                                        trackColor={{ false: '#CBD5E1', true: '#EC4899' }}
                                        thumbColor={WHITE}
                                        style={{ marginVertical: wp(2) }}
                                    />
                                </View>
                            </View>

                            {showDatePicker && (
                                <DateTimePicker
                                    value={dateVal}
                                    mode="date"
                                    display="default"
                                    onChange={(event: any, selectedDate?: Date) => {
                                        setShowDatePicker(false);
                                        if (selectedDate) {
                                            setDateVal(selectedDate);
                                            const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
                                            setDate(selectedDate.toLocaleDateString('en-US', options));
                                            const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
                                            setDayOfWeek(days[selectedDate.getDay()]);
                                        }
                                    }}
                                />
                            )}

                            {showTimePicker && (
                                <DateTimePicker
                                    value={timeVal}
                                    mode="time"
                                    display="default"
                                    is24Hour={true}
                                    onChange={(event: any, selectedTime?: Date) => {
                                        setShowTimePicker(false);
                                        if (selectedTime) {
                                            setTimeVal(selectedTime);
                                            const formattedTime = selectedTime.toLocaleTimeString('en-US', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: true,
                                            });
                                            setTime(formattedTime);
                                        }
                                    }}
                                />
                            )}

                            {validationError ? (
                                <View style={s.errorBannerInline}>
                                    <Text style={s.errorIcon}>⚠️</Text>
                                    <Text style={s.errorText}>{validationError}</Text>
                                </View>
                            ) : null}

                            {/* Cari (Search) Button */}
                            <TouchableOpacity
                                style={s.cariBtn}
                                activeOpacity={0.9}
                                onPress={() => {
                                    let hasError = false;
                                    if (!fromLoc.trim()) {
                                        setFromError(true);
                                        hasError = true;
                                    }
                                    if (!toLoc.trim()) {
                                        setToError(true);
                                        hasError = true;
                                    }

                                    if (hasError) {
                                        setValidationError('Please select both pickup and destination locations.');
                                        return;
                                    }

                                    setValidationError(null);
                                    navigation.navigate('CarResults', {
                                        fromLoc: fromLoc,
                                        toLoc: toLoc,
                                        womenSafety: womenSafety,
                                    });
                                }}
                            >
                                <Text style={s.cariText}>Book Now </Text>
                                <Text style={s.cariArrow}> →</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* ── Special Offers ── */}
                    <View style={s.section}>
                        <View style={s.sectionRow}>
                            <Text style={[s.sectionTitle, { color: theme.textMain }]}>Special Offers</Text>
                            <TouchableOpacity><Text style={[s.seeAll, { color: theme.textSub }]}>See All</Text></TouchableOpacity>
                        </View>

                        {mobileOffers.length > 0 ? (
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ gap: wp(12) }}
                            >
                                {mobileOffers.map((offer) => (
                                    <View key={offer._id || offer.id} style={[s.premiumOfferBanner, { width: width - wp(40) }]}>
                                        {/* Background Image */}
                                        <Image
                                            source={offer.backgroundImage ? { uri: offer.backgroundImage } : require('../assets/images/banner_car.png')}
                                            style={s.offerCarBgImage}
                                            resizeMode="cover"
                                        />

                                        {/* Glass Card Container */}
                                        <View style={s.premiumGlassCard}>
                                            {/* Top row badge */}
                                            <View style={s.premiumBadge}>
                                                <Text style={s.premiumBadgeTxt}>🕒 Limited Time</Text>
                                            </View>

                                            {/* Title & description */}
                                            <View style={{ gap: wp(4), paddingRight: wp(15) }}>
                                                <Text style={s.premiumTitle} numberOfLines={2}>{offer.title}</Text>
                                                <Text style={s.premiumDesc} numberOfLines={2}>{offer.description}</Text>
                                            </View>

                                            {/* Code Container */}
                                            {offer.offerCode && (
                                                <View style={s.premiumCodeRow}>
                                                    <Text style={s.premiumCodeIcon}>🎫</Text>
                                                    <Text style={s.premiumCodeTxt}>CODE: {offer.offerCode}</Text>
                                                </View>
                                            )}

                                            {/* Validity row */}
                                            {offer.offerDays && (
                                                <View style={s.premiumValidityRow}>
                                                    <Text style={{ fontSize: fs(10) }}>📅</Text>
                                                    <Text style={s.premiumValidityTxt}>Valid for {offer.offerDays} days</Text>
                                                </View>
                                            )}

                                            {/* Book Now Button */}
                                            <TouchableOpacity
                                                style={s.premiumBtn}
                                                activeOpacity={0.85}
                                                onPress={() => navigation.navigate('CarResults', {
                                                    fromLoc: fromLoc.trim() ? fromLoc : 'Mumbai',
                                                    toLoc: toLoc.trim() ? toLoc : 'Pune',
                                                    womenSafety: womenSafety,
                                                })}
                                            >
                                                <Text style={{ fontSize: fs(11) }}>📅</Text>
                                                <Text style={s.premiumBtnTxt}>Book Now  →</Text>
                                            </TouchableOpacity>

                                            {/* Discount Circle Badge */}
                                            {offer.discountText && (
                                                <View style={s.premiumCircleBadge}>
                                                    <Text style={s.premiumCircleTxtSmall}>Flat</Text>
                                                    <Text style={s.premiumCircleTxtLarge}>
                                                        {offer.discountText.replace(/Flat/gi, '').replace(/Off/gi, '').trim()}
                                                    </Text>
                                                    <Text style={s.premiumCircleTxtSmall}>OFF</Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                ))}
                            </ScrollView>
                        ) : (
                            /* Offer Banner — Premium Hero Style */
                            <View style={s.offerBanner}>
                                {/* Full bleed car photo as background-right */}
                                <Image
                                    source={require('../assets/images/banner_car.png')}
                                    style={s.offerCarBgImage}
                                    resizeMode="cover"
                                />

                                {/* Left: text content */}
                                <View style={s.offerLeft}>
                                    <View style={s.premiumLabel}>
                                        <Text style={s.premiumLabelText}>PREMIUM CAR RENTALS</Text>
                                    </View>
                                    <Text style={s.offerHeadline}>Drive the City</Text>
                                    <Text style={s.offerHeadlineItalic}>in Style</Text>
                                    <Text style={s.offerDesc}>
                                        Curated cars. Unmatched{`\n`}comfort. Anytime, anywhere.
                                    </Text>
                                    <TouchableOpacity style={s.bookNowBtn} activeOpacity={0.85}>
                                        <Text style={s.bookNowText}>Book Now</Text>
                                        <Text style={s.bookNowArrow}> →</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>
                    {/* ── Top Brands ── */}
                    <View style={{ marginBottom: wp(22) }}>
                        <View style={[s.sectionRow, { paddingHorizontal: wp(20) }]}>
                            <Text style={[s.sectionTitle, { color: theme.textMain }]}>Top Brands</Text>
                            <TouchableOpacity><Text style={[s.seeAll, { color: theme.textSub }]}>See All</Text></TouchableOpacity>
                        </View>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={s.brandsHorizontalScroll}
                        >
                            {BRANDS_DATA.map((b, idx) => (
                                <TouchableOpacity key={b.id} style={[s.brandItem, idx === 0 && { marginLeft: wp(20) }]} activeOpacity={0.75}>
                                    <View style={[s.brandIconCircle, isDark && { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                                        <Text style={s.brandIconText}>{b.icon}</Text>
                                    </View>
                                    <Text style={[s.brandNameLabel, { color: theme.textSub }]}>{b.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* ── Popular Cars ── */}
                    <View style={{ marginBottom: wp(30) }}>
                        <View style={[s.sectionRow, { paddingHorizontal: wp(20) }]}>
                            <Text style={[s.sectionTitle, { color: theme.textMain }]}>Popular Cars</Text>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('CarResults', {
                                    fromLoc: fromLoc.trim() ? fromLoc : 'Mumbai',
                                    toLoc: toLoc.trim() ? toLoc : 'Pune',
                                    womenSafety: womenSafety,
                                })}
                                activeOpacity={0.7}
                            >
                                <Text style={[s.seeAll, { color: theme.textSub }]}>See All</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={s.carsHorizontalScroll}
                        >
                            {popularCars.map((car, idx) => (
                                <View key={car.id} style={[s.carCard, { backgroundColor: theme.cardBg, borderColor: theme.border }, idx === 0 && { marginLeft: wp(20) }]}>
                                    {/* Image Wrapper with light background */}
                                    <View style={[s.carImageWrapper, isDark && { backgroundColor: '#334155' }]}>
                                        {/* Heart outline top right */}
                                        <TouchableOpacity style={s.favoriteHeart}>
                                            <Text style={s.heartIconSymbol}>♡</Text>
                                        </TouchableOpacity>

                                        {/* Car Image */}
                                        <Image
                                            source={car.image}
                                            style={s.carCardImage}
                                            resizeMode="contain"
                                        />
                                    </View>

                                    {/* Details */}
                                    <Text style={[s.carCardTitle, { color: theme.textMain }]}>{car.name}</Text>
                                    <Text style={[s.carCardSubtitle, { color: theme.textSub }]}>{car.type}</Text>

                                    {/* Rating Row */}
                                    <View style={s.ratingContainer}>
                                        <Text style={s.ratingText}>⭐ {car.rating}</Text>
                                        <Text style={[s.tripsText, { color: theme.textSub }]}>({car.trips} trips)</Text>
                                    </View>

                                    {/* Price & Book Now Row */}
                                    <View style={s.priceBookRow}>
                                        <Text style={s.carPrice}>
                                            {car.price}
                                            <Text style={[s.carPerDay, { color: theme.textSub }]}> / day</Text>
                                        </Text>
                                        <TouchableOpacity
                                            style={s.cardBookBtn}
                                            activeOpacity={0.8}
                                            onPress={() => (navigation as any).navigate('CarDetails', { carId: car.id })}
                                        >
                                            <Text style={s.cardBookText}>Book Now</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                    </View>

                    {/* ── Top Routes ── */}
                    <View style={{ marginBottom: wp(30) }}>
                        <View style={[s.sectionRow, { paddingHorizontal: wp(20) }]}>
                            <Text style={[s.sectionTitle, { color: theme.textMain }]}>Top Routes</Text>
                            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: wp(4) }}>
                                <Text style={[s.seeAll, { color: BLUE }]}>Explore All</Text>
                                <Text style={{ color: BLUE, fontSize: fs(12), fontWeight: '700' }}> ›</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingRight: wp(20), gap: wp(14), paddingBottom: wp(16), paddingTop: wp(8) }}
                        >
                            {ROUTES_DATA.map((route, idx) => (
                                <TouchableOpacity
                                    key={route.id}
                                    style={[s.routeCard, { backgroundColor: theme.cardBg, borderColor: theme.border }, idx === 0 && { marginLeft: wp(20) }]}
                                    activeOpacity={0.9}
                                    onPress={() => {
                                        setFromLoc(route.from);
                                        setToLoc(route.to);
                                        navigation.navigate('CarResults', {
                                            fromLoc: route.from,
                                            toLoc: route.to,
                                            womenSafety: womenSafety,
                                        });
                                    }}
                                >
                                    <Image
                                        source={route.image}
                                        style={s.routeImage}
                                        resizeMode="cover"
                                    />

                                    {/* Pins with Curved/Dashed Line */}
                                    <View style={s.routePinsRow}>
                                        <Text style={s.routePinIcon}>📍</Text>
                                        <View style={[s.routeDashLine, isDark && { borderColor: '#475569' }]} />
                                        <Text style={s.routePinIcon}>📍</Text>
                                    </View>

                                    {/* Route Names */}
                                    <View style={s.routeNamesRow}>
                                        <Text style={[s.routeName, { color: theme.textMain }]}>{route.from}</Text>
                                        <Text style={[s.routeName, { color: theme.textMain }]}>{route.to}</Text>
                                    </View>

                                    {/* Distance Badge */}
                                    <View style={s.routeDistanceBadge}>
                                        <Text style={s.routeDistanceText}>{route.distance}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* ── Safety Banner ── */}
                    <View style={[s.safetyBanner, isDark && { backgroundColor: '#1E293B' }]}>
                        {/* Left: Premium Check Icon */}
                        <View style={[s.safetyIconCircle, isDark && { backgroundColor: '#334155', borderColor: '#334155' }]}>
                            <View style={s.safetyBlueBadge}>
                                <Text style={s.safetyCheckSymbol}>✓</Text>
                            </View>
                        </View>

                        {/* Middle: Content */}
                        <View style={s.safetyContent}>
                            <Text style={[s.safetyTitle, { color: theme.textMain }]}>Safe. Reliable. Always.</Text>
                            <Text style={[s.safetyDesc, { color: theme.textSub }]}>Well-maintained cars & verified partners for your peace of mind.</Text>
                        </View>

                        {/* Right: Car Image */}
                        <Image
                            source={require('../assets/images/banner_car.png')}
                            style={s.safetyCarImage}
                            resizeMode="contain"
                        />
                    </View>

                    {/* ── Why Choose ShiftRide ── */}
                    <View style={s.whyChooseSection}>
                        <Text style={[s.sectionTitle, { color: theme.textMain, marginBottom: wp(18) }]}>Why Choose ShiftRide?</Text>

                        <View style={s.featuresRow}>
                            <View style={s.featureItem}>
                                <View style={[s.featureIconWrapper, { backgroundColor: isDark ? '#3E341F' : '#FEF3C7' }]}>
                                    <Text style={s.featureIcon}>🎖️</Text>
                                </View>
                                <Text style={[s.featureTitle, { color: theme.textMain }]}>Best Prices</Text>
                                <Text style={[s.featureSubtitle, { color: theme.textSub }]}>Guaranteed</Text>
                            </View>

                            <View style={s.featureItem}>
                                <View style={[s.featureIconWrapper, { backgroundColor: isDark ? '#1F2C3D' : '#E0F2FE' }]}>
                                    <Text style={s.featureIcon}>🚗</Text>
                                </View>
                                <Text style={[s.featureTitle, { color: theme.textMain }]}>Wide Range</Text>
                                <Text style={[s.featureSubtitle, { color: theme.textSub }]}>Of Cars</Text>
                            </View>

                            <View style={s.featureItem}>
                                <View style={[s.featureIconWrapper, { backgroundColor: isDark ? '#1F3B2C' : '#DCFCE7' }]}>
                                    <Text style={s.featureIcon}>🎧</Text>
                                </View>
                                <Text style={[s.featureTitle, { color: theme.textMain }]}>24/7 Support</Text>
                                <Text style={[s.featureSubtitle, { color: theme.textSub }]}>We're here</Text>
                            </View>

                            <View style={s.featureItem}>
                                <View style={[s.featureIconWrapper, { backgroundColor: isDark ? '#3D1F30' : '#FCE7F3' }]}>
                                    <Text style={s.featureIcon}>🛡️</Text>
                                </View>
                                <Text style={[s.featureTitle, { color: theme.textMain }]}>Secure Booking</Text>
                                <Text style={[s.featureSubtitle, { color: theme.textSub }]}>100% Safe</Text>
                            </View>
                        </View>
                    </View>
                </Animated.View>

                <View style={{ height: wp(40) }} />
            </ScrollView>

            {/* Active booking floating notification (Uber style) */}
            {activeBooking ? (
                <Animated.View style={[s.uberActiveBookingCard, { opacity: cardOpacity }]}>
                    {activeBooking.bookingStatus === 'REQUESTED' || activeBooking.bookingStatus === 'FORWARDED_TO_DRIVER' || !activeBooking.driverAssigned || !activeBooking.driverId ? (
                        // ── PENDING / REQUESTED STATUS: SHOW SEARCHING SPINNER ──
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => (navigation as any).navigate('BookingDetails', { bookingId: activeBooking.id || activeBooking._id })}
                            style={s.uberPendingContainer}
                        >
                            <View style={{ flex: 1 }}>
                                <View style={s.uberPendingHeader}>
                                    <ActivityIndicator size="small" color={BLUE} style={{ marginRight: wp(6) }} />
                                    <Text style={s.uberPendingTitle}>
                                        {activeBooking.bookingStatus === 'FORWARDED_TO_DRIVER' ? 'Forwarded to driver...' : 'Finding your driver...'}
                                    </Text>
                                </View>
                                <Text style={s.uberPendingRoute}>{activeBooking.pickup_location} ➔ {activeBooking.drop_location}</Text>
                                <Text style={s.uberPendingCar}>{activeBooking.car_id?.name || 'Your Ride'}</Text>
                            </View>
                            <View style={s.uberPendingArrow}>
                                <Text style={{ color: BLUE, fontSize: fs(18), fontWeight: '700' }}>›</Text>
                            </View>
                        </TouchableOpacity>
                    ) : activeBooking.bookingStatus === 'DRIVER_ACCEPTED' && activeBooking.paymentStatus === 'NOT_PAID' ? (
                        // ── DRIVER ACCEPTED BUT NOT PAID: SHOW PAY NOW BUTTON ──
                        <View style={{ gap: wp(10) }}>
                            {/* Top Row: Car details */}
                            <View style={s.uberTopRow}>
                                <View style={s.uberDriverCol}>
                                    <View style={s.uberAvatarCircle}>
                                        <Text style={s.uberAvatarEmoji}>👤</Text>
                                    </View>
                                    <Text style={s.uberDriverName} numberOfLines={1}>
                                        {activeBooking.driverId.driverName?.split(' ')[0] || 'Driver'}
                                    </Text>
                                </View>

                                <Image
                                    source={activeBooking.car_id?.cars_image
                                        ? { uri: getCarImageUrl(activeBooking.car_id.cars_image) }
                                        : require('../assets/images/banner_car.png')
                                    }
                                    style={s.uberCarImage}
                                    resizeMode="contain"
                                />

                                <View style={s.uberCarCol}>
                                    <Text style={s.uberVehiclePlate}>{activeBooking.car_id?.vehicle_number || '3M53AF2'}</Text>
                                    <Text style={s.uberCarDetailName} numberOfLines={2}>
                                        {activeBooking.car_id?.name || 'Silver Honda Civic'}
                                    </Text>
                                </View>
                            </View>

                            {/* Middle Row: Payment Reminder */}
                            <View style={{ gap: wp(4), paddingVertical: wp(2) }}>
                                <Text style={{ color: NAVY, fontSize: fs(12), fontWeight: '800' }}>
                                    Driver accepted! Please complete your payment.
                                </Text>
                                {activeBooking.otp && (
                                    <View style={{ flexDirection: 'row', marginTop: wp(4) }}>
                                        <View style={s.uberOtpContainer}>
                                            <Text style={s.uberOtpLabel}>RIDE OTP: </Text>
                                            <Text style={s.uberOtpVal}>{activeBooking.otp}</Text>
                                        </View>
                                    </View>
                                )}
                            </View>

                            {/* Bottom Row: Pay Now Button */}
                            <TouchableOpacity
                                style={s.uberPayBtn}
                                activeOpacity={0.85}
                                onPress={() => handlePayNow(activeBooking)}
                                disabled={paymentLoading}
                            >
                                {paymentLoading ? (
                                    <ActivityIndicator color={WHITE} size="small" />
                                ) : (
                                    <Text style={s.uberPayBtnText}>Pay Now (₹{activeBooking.total_amount})</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    ) : (
                        // ── PAID / CONFIRMED / ONGOING: SHOW FULL DRIVER DETAILS & OTP ──
                        <View style={{ gap: wp(10) }}>
                            {/* Top Row: Driver & Car details */}
                            <View style={s.uberTopRow}>
                                {/* Driver Profile Column */}
                                <View style={s.uberDriverCol}>
                                    <View style={s.uberAvatarCircle}>
                                        <Text style={s.uberAvatarEmoji}>👤</Text>
                                    </View>
                                    <View style={s.uberDriverRatingBadge}>
                                        <Text style={s.uberDriverRatingText}>⭐ 4.9</Text>
                                    </View>
                                    <Text style={s.uberDriverName} numberOfLines={1}>
                                        {activeBooking.driverId.driverName?.split(' ')[0] || 'Driver'}
                                    </Text>
                                </View>

                                {/* Car Image */}
                                <Image
                                    source={activeBooking.car_id?.cars_image
                                        ? { uri: getCarImageUrl(activeBooking.car_id.cars_image) }
                                        : require('../assets/images/banner_car.png')
                                    }
                                    style={s.uberCarImage}
                                    resizeMode="contain"
                                />

                                {/* Car Number & Name Column */}
                                <View style={s.uberCarCol}>
                                    <Text style={s.uberVehiclePlate}>{activeBooking.car_id?.vehicle_number || '3M53AF2'}</Text>
                                    <Text style={s.uberCarDetailName} numberOfLines={2}>
                                        {activeBooking.car_id?.name || 'Silver Honda Civic'}
                                    </Text>
                                </View>
                            </View>

                            {/* Middle Row: Tags & OTP */}
                            <View style={s.uberMiddleRow}>
                                <View style={s.uberTagsRow}>
                                    <Text style={s.uberTagText}>⏱️ Top-rated</Text>
                                    <Text style={s.uberTagText}>🛡️ Dashcam</Text>
                                </View>
                                {activeBooking.otp && (
                                    <View style={s.uberOtpContainer}>
                                        <Text style={s.uberOtpLabel}>RIDE OTP: </Text>
                                        <Text style={s.uberOtpVal}>{activeBooking.otp}</Text>
                                    </View>
                                )}
                            </View>

                            {activeBooking.women_safety_mode && (
                                <TouchableOpacity
                                    style={{
                                        backgroundColor: '#FFF0F3',
                                        borderColor: '#FCE7F3',
                                        borderWidth: 1,
                                        borderRadius: wp(10),
                                        padding: wp(8),
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: wp(6),
                                        marginBottom: wp(2)
                                    }}
                                    activeOpacity={0.8}
                                    onPress={() => (navigation as any).navigate('BookingDetails', { bookingId: activeBooking.id || activeBooking._id })}
                                >
                                    <Text style={{ fontSize: fs(12) }}>♀️</Text>
                                    <Text style={{ color: '#DB2777', fontWeight: '800', fontSize: fs(11) }}>
                                        Women Safety Mode Active • Tap for SOS Center
                                    </Text>
                                </TouchableOpacity>
                            )}

                            {/* Bottom Row: Communication Buttons */}
                            <View style={s.uberButtonsRow}>
                                <TouchableOpacity
                                    style={s.uberMsgBtn}
                                    activeOpacity={0.8}
                                    onPress={() => Linking.openURL(`sms:${activeBooking.driverId.phone}`)}
                                >
                                    <Text style={s.uberMsgIcon}>💬</Text>
                                    <Text style={s.uberMsgBtnText}>Send a message</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={s.uberCallBtn}
                                    activeOpacity={0.8}
                                    onPress={() => Linking.openURL(`tel:${activeBooking.driverId.phone}`)}
                                >
                                    <Text style={s.uberCallIcon}>📞</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={s.uberMoreBtn}
                                    activeOpacity={0.8}
                                    onPress={() => (navigation as any).navigate('BookingDetails', { bookingId: activeBooking.id || activeBooking._id })}
                                >
                                    <Text style={s.uberMoreIcon}>•••</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* Success OTP Verification Overlay */}
                    {isOtpVerified ? (
                        <Animated.View style={[s.successOverlay, { transform: [{ scale: successScale }] }]}>
                            <View style={s.successCircle}>
                                <Text style={s.successCheckmark}>✓</Text>
                            </View>
                            <Text style={s.successText}>OTP Verified!</Text>
                            <Text style={s.successSubtext}>Have a safe trip</Text>
                        </Animated.View>
                    ) : null}
                </Animated.View>
            ) : null}

            {/* ── Bottom Nav Component ── */}
            <BottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        </View>
    );
};

const s = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#F3F6FA' },
    scrollContainer: { flexGrow: 1 },
    headerDark: {
        backgroundColor: NAVY,
        paddingTop: wp(12),
        paddingHorizontal: wp(20),
        paddingBottom: wp(95),
        borderBottomLeftRadius: wp(32),
        borderBottomRightRadius: wp(32),
        position: 'relative',
        overflow: 'hidden',
        height: wp(260),
    },
    headerBgImage: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        width: height, // 100vh (viewport height)
        height: width, // 100vw (viewport width)
    },
    headerOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(16,23,58,0.78)',
    },
    headerTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: wp(10),
        marginBottom: wp(6),
        zIndex: 10,
    },
    menuBtn: {
        width: wp(36),
        height: wp(36),
        justifyContent: 'center',
    },
    menuText: { fontSize: fs(24), color: WHITE, fontWeight: '700' },
    backBtn: {
        width: wp(36),
        height: wp(36),
        justifyContent: 'center',
        alignItems: 'flex-end',
        zIndex: 10,
    },
    backArrow: { fontSize: fs(22), color: WHITE, fontWeight: '700' },
    headerMetaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        zIndex: 10,
        marginTop: wp(10),
    },
    userGreeting: { fontSize: fs(13), color: WHITE, fontWeight: '700' },
    userTitle: { fontSize: fs(24), color: WHITE, fontWeight: '900', marginTop: wp(4), lineHeight: fs(30) },
    blueHighlightLine: {
        width: wp(34),
        height: wp(3),
        backgroundColor: BLUE,
        borderRadius: wp(1.5),
        marginTop: wp(6),
        marginBottom: wp(10),
    },
    userSubDescription: {
        fontSize: fs(11),
        color: 'rgba(255, 255, 255, 0.75)',
        fontWeight: '500',
        lineHeight: fs(16),
        maxWidth: wp(200),
    },
    headerRightCol: {
        alignItems: 'flex-end',
    },
    headerGraphicLine1: { width: 0 },
    headerGraphicLine2: { width: 0 },
    headerUserRow: { width: 0 },
    headerGreetingCol: { width: 0 },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: wp(44),
        height: wp(42),
        borderRadius: wp(21),
        backgroundColor: '#E0F2FE',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.75)',
    },
    avatarTxt: {
        fontSize: fs(14),
        fontWeight: '800',
        color: BLUE,
    },
    bellBtn: {
        width: wp(40),
        height: wp(40),
        borderRadius: wp(10),
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    bellIcon: {
        width: wp(18),
        height: wp(18),
        alignItems: 'center',
        justifyContent: 'center',
    },
    bellCap: {
        width: wp(6),
        height: wp(3),
        borderTopLeftRadius: wp(3),
        borderTopRightRadius: wp(3),
        backgroundColor: WHITE,
    },
    bellMain: {
        width: wp(14),
        height: wp(10),
        borderTopLeftRadius: wp(2),
        borderTopRightRadius: wp(2),
        backgroundColor: WHITE,
        marginTop: 1,
    },
    bellRing: {
        width: wp(16),
        height: wp(2),
        borderRadius: wp(1),
        backgroundColor: WHITE,
        marginTop: 1,
    },
    bellDot: {
        position: 'absolute',
        top: wp(8),
        right: wp(8),
        width: wp(8),
        height: wp(8),
        borderRadius: wp(4),
        backgroundColor: '#EF4444',
        borderWidth: 1.5,
        borderColor: NAVY,
    },
    formContainer: {
        paddingHorizontal: wp(12),
        marginTop: -wp(70),
        marginBottom: wp(24),
    },
    bookingCard: {
        backgroundColor: WHITE,
        borderRadius: wp(24),
        padding: wp(14),
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: wp(12) },
        shadowOpacity: 0.08,
        shadowRadius: wp(24),
        elevation: 12,
        position: 'relative',
    },
    destinationBox: {
        backgroundColor: WHITE,
        borderRadius: wp(16),
        borderWidth: 1,
        borderColor: '#E2E8F0',
        padding: wp(14),
        position: 'relative',
        gap: wp(10),
    },
    dottedConnector: {
        position: 'absolute',
        left: wp(30),
        top: wp(38),
        zIndex: 1,
    },
    dotChar: {
        fontSize: fs(18),
        color: '#CBD5E1',
        fontWeight: 'bold',
    },
    destinationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: wp(2),
    },
    iconWrapper: {
        width: wp(36),
        height: wp(36),
        borderRadius: wp(18),
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
    iconMarker: {
        fontSize: fs(15),
        fontWeight: 'bold',
    },
    destTextCol: {
        flex: 1,
        marginLeft: wp(12),
    },
    destLabel: {
        fontSize: fs(8),
        fontWeight: '900',
        letterSpacing: 0.6,
    },
    destTitle: {
        fontSize: fs(13),
        color: NAVY,
        fontWeight: '800',
        marginTop: wp(1),
    },
    destSubtitle: {
        fontSize: fs(10),
        color: GRAY,
        fontWeight: '600',
        marginTop: wp(1),
    },
    chevronRight: {
        fontSize: fs(18),
        color: '#94A3B8',
        fontWeight: '600',
    },
    horizontalDivider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: wp(2),
    },
    switchBtn: {
        position: 'absolute',
        right: wp(16),
        top: '50%',
        marginTop: -wp(22),
        width: wp(40),
        height: wp(40),
        borderRadius: wp(20),
        backgroundColor: '#6C63FF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#6C63FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
        zIndex: 10,
    },
    switchIcon: { fontSize: fs(18), color: WHITE, fontWeight: 'bold' },
    dateReturnCard: {
        backgroundColor: WHITE,
        borderRadius: wp(16),
        borderWidth: 1,
        borderColor: '#E2E8F0',
        padding: wp(14),
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateCol: {
        flex: 1,
        paddingLeft: wp(2),
    },
    inputLabel: {
        fontSize: fs(8),
        fontWeight: '900',
        letterSpacing: 0.6,
        marginBottom: wp(4),
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(6),
    },
    inputIcon: { fontSize: fs(15) },
    dateMainText: {
        fontSize: fs(12),
        fontWeight: '800',
        color: NAVY,
    },
    dateSubText: {
        fontSize: fs(10),
        color: GRAY,
        fontWeight: '600',
        marginTop: wp(1),
    },
    verticalDivider: {
        width: 1,
        height: wp(36),
        backgroundColor: '#E2E8F0',
        marginHorizontal: wp(6),
    },
    toggleContainer: {
        alignItems: 'flex-start',
    },
    toggleLabel: {
        fontSize: fs(8),
        color: GRAY,
        fontWeight: '900',
        letterSpacing: 0.6,
    },
    returnSubText: {
        fontSize: fs(10),
        color: GRAY,
        fontWeight: '600',
    },
    cariBtn: {
        backgroundColor: '#1A6BFF',
        borderRadius: wp(50),
        height: wp(46),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: wp(20),
        shadowColor: '#1A6BFF',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
        gap: wp(8),
    },
    btnSearchIcon: { width: 0 },
    searchIconCircle: { width: 0 },
    searchIconStick: { width: 0 },
    cariText: { fontSize: fs(14), color: WHITE, fontWeight: '800', letterSpacing: 0.5 },
    cariArrow: { fontSize: fs(15), color: WHITE, fontWeight: '800' },

    // Special Offers Styles
    section: { paddingHorizontal: wp(20), marginBottom: wp(24) },
    sectionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: wp(14),
    },
    sectionTitle: { fontSize: fs(16), fontWeight: '800', color: NAVY },
    seeAll: { fontSize: fs(12), fontWeight: '700', color: GRAY },

    // Offer Banner — Premium Hero
    offerBanner: {
        backgroundColor: '#EFF2F8',
        borderRadius: wp(20),
        overflow: 'hidden',
        height: wp(180),
        flexDirection: 'row',
        alignItems: 'flex-end',
        position: 'relative',
    },
    offerCarBgImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
    },
    offerLeft: {
        flex: 1,
        gap: wp(5),
        paddingTop: wp(18),
        paddingLeft: wp(18),
        paddingBottom: wp(18),
        zIndex: 2,
        maxWidth: wp(190),
        backgroundColor: 'rgba(239,242,248,0.65)',
        borderRadius: wp(20),
        margin: wp(10),
    },
    premiumLabel: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(26,107,255,0.12)',
        borderRadius: wp(4),
        paddingHorizontal: wp(8),
        paddingVertical: wp(3),
    },
    premiumLabelText: {
        fontSize: fs(8),
        fontWeight: '800',
        color: BLUE,
        letterSpacing: 0.8,
    },
    offerHeadline: {
        fontSize: fs(22),
        fontWeight: '900',
        color: NAVY,
        lineHeight: fs(26),
    },
    offerHeadlineItalic: {
        fontSize: fs(24),
        fontStyle: 'italic',
        fontWeight: '800',
        color: NAVY,
        marginTop: -wp(5),
        lineHeight: fs(28),
    },
    offerDesc: {
        fontSize: fs(11),
        color: GRAY,
        lineHeight: fs(17),
        fontWeight: '500',
    },
    bookNowBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: '#2ABFA3',
        borderRadius: wp(10),
        paddingHorizontal: wp(18),
        paddingVertical: wp(9),
        marginTop: wp(2),
    },
    bookNowText: {
        color: WHITE,
        fontSize: fs(12),
        fontWeight: '700',
    },
    bookNowArrow: {
        color: WHITE,
        fontSize: fs(13),
        fontWeight: '700',
    },
    // New premium offer styles
    premiumOfferBanner: {
        backgroundColor: '#0F172A',
        borderRadius: wp(20),
        overflow: 'hidden',
        height: wp(230),
        position: 'relative',
    },
    premiumGlassCard: {
        position: 'absolute',
        left: wp(12),
        top: wp(12),
        bottom: wp(12),
        width: '58%',
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.18)',
        borderRadius: wp(18),
        paddingHorizontal: wp(14),
        paddingVertical: wp(12),
        zIndex: 10,
        justifyContent: 'space-between',
    },
    premiumBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(4),
        borderColor: 'rgba(255, 255, 255, 0.35)',
        borderWidth: 1,
        borderRadius: wp(12),
        paddingHorizontal: wp(8),
        paddingVertical: wp(3),
        alignSelf: 'flex-start',
    },
    premiumBadgeTxt: {
        fontSize: fs(9),
        fontWeight: '700',
        color: 'rgba(255, 255, 255, 0.9)',
    },
    premiumTitle: {
        fontSize: fs(18),
        fontWeight: '900',
        color: WHITE,
        lineHeight: fs(22),
    },
    premiumDesc: {
        fontSize: fs(11),
        color: 'rgba(255, 255, 255, 0.85)',
        lineHeight: fs(16),
        fontWeight: '500',
    },
    premiumCodeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(6),
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderWidth: 1.2,
        borderColor: 'rgba(245, 158, 11, 0.45)',
        borderRadius: wp(8),
        paddingHorizontal: wp(8),
        paddingVertical: wp(5),
        alignSelf: 'flex-start',
    },
    premiumCodeIcon: {
        fontSize: fs(13),
        color: '#F59E0B',
    },
    premiumCodeTxt: {
        fontSize: fs(10.5),
        fontWeight: '800',
        color: '#F59E0B',
        letterSpacing: 0.5,
    },
    premiumValidityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(4),
    },
    premiumValidityTxt: {
        fontSize: fs(10),
        color: 'rgba(255, 255, 255, 0.65)',
        fontWeight: '600',
    },
    premiumBtn: {
        backgroundColor: '#F59E0B',
        borderRadius: wp(10),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: wp(9),
        paddingHorizontal: wp(14),
        alignSelf: 'flex-start',
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 5,
        elevation: 3,
        gap: wp(6),
    },
    premiumBtnTxt: {
        color: '#0F172A',
        fontSize: fs(12),
        fontWeight: '800',
    },
    premiumCircleBadge: {
        position: 'absolute',
        right: -wp(18),
        top: -wp(6),
        width: wp(62),
        height: wp(62),
        borderRadius: wp(31),
        backgroundColor: 'rgba(245, 158, 11, 0.28)',
        borderWidth: 1.5,
        borderColor: '#F59E0B',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20,
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 2,
    },
    premiumCircleTxtSmall: {
        fontSize: fs(8),
        fontWeight: '700',
        color: '#FFF',
    },
    premiumCircleTxtLarge: {
        fontSize: fs(15),
        fontWeight: '900',
        color: '#FFF',
        marginVertical: -wp(2),
    },
    brandsHorizontalScroll: {
        paddingRight: wp(20),
        gap: wp(16),
        paddingBottom: wp(16),
        paddingTop: wp(8),
    },
    brandItem: {
        alignItems: 'center',
        gap: wp(6),
    },
    brandIconCircle: {
        width: wp(56),
        height: wp(56),
        borderRadius: wp(28),
        backgroundColor: WHITE,
        borderWidth: 1,
        borderColor: BORDER,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    brandIconText: {
        fontSize: fs(20),
        color: NAVY,
    },
    brandNameLabel: {
        fontSize: fs(11),
        fontWeight: '600',
        color: GRAY,
    },
    carsHorizontalScroll: {
        paddingRight: wp(20),
        gap: wp(14),
        paddingBottom: wp(16),
        paddingTop: wp(8),
    },
    carCard: {
        width: wp(240),
        backgroundColor: WHITE,
        borderRadius: wp(16),
        padding: wp(10),
        borderWidth: 1,
        borderColor: BORDER,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 3,
        position: 'relative',
    },
    carImageWrapper: {
        width: '100%',
        height: wp(140),
        backgroundColor: '#F3F6FA',
        borderRadius: wp(12),
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: wp(8),
    },
    favoriteHeart: {
        position: 'absolute',
        top: wp(8),
        right: wp(8),
        zIndex: 5,
    },
    heartIconSymbol: {
        fontSize: fs(18),
        color: '#6366F1', // Indigo outline color matching the design
        fontWeight: 'bold',
    },
    carCardImage: {
        width: '100%',
        height: '100%',
        transform: [{ scale: 1.60 }],
    },
    carCardTitle: {
        fontSize: fs(13),
        fontWeight: '800',
        color: NAVY,
    },
    carCardSubtitle: {
        fontSize: fs(10),
        color: GRAY,
        marginTop: wp(2),
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(4),
        marginTop: wp(6),
    },
    ratingText: {
        fontSize: fs(10),
        fontWeight: '700',
        color: '#F59E0B',
    },
    tripsText: {
        fontSize: fs(9),
        color: GRAY,
    },
    priceBookRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: wp(12),
    },
    carPrice: {
        fontSize: fs(15),
        fontWeight: '800',
        color: BLUE,
    },
    carPerDay: {
        fontSize: fs(10),
        color: GRAY,
        fontWeight: 'normal',
    },
    cardBookBtn: {
        backgroundColor: '#EEF2FF', // Very light blue background
        borderRadius: wp(20), // Pill-shaped button
        paddingHorizontal: wp(12),
        paddingVertical: wp(6),
    },
    cardBookText: {
        color: BLUE, // Blue text color
        fontSize: fs(9),
        fontWeight: '700',
    },
    routeCard: {
        width: wp(180),
        backgroundColor: WHITE,
        borderRadius: wp(16),
        padding: wp(10),
        paddingBottom: wp(16),
        borderWidth: 1,
        borderColor: BORDER,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 3,
    },
    routeImage: {
        width: '100%',
        height: wp(90),
        borderRadius: wp(12),
    },
    routePinsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: wp(12),
        paddingHorizontal: wp(10),
    },
    routePinIcon: {
        fontSize: fs(12),
        color: NAVY,
    },
    routeDashLine: {
        flex: 1,
        height: 1,
        borderWidth: 1,
        borderColor: '#94A3B8',
        borderStyle: 'dashed',
        borderRadius: 1,
        marginHorizontal: wp(8),
    },
    routeNamesRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: wp(4),
        marginTop: wp(6),
    },
    routeName: {
        fontSize: fs(11),
        fontWeight: '800',
        color: NAVY,
    },
    routeDistanceBadge: {
        backgroundColor: '#EFF6FF',
        borderRadius: wp(12),
        paddingHorizontal: wp(10),
        paddingVertical: wp(4),
        alignSelf: 'center',
        marginTop: wp(10),
    },
    routeDistanceText: {
        fontSize: fs(9),
        fontWeight: '700',
        color: BLUE,
    },
    safetyBanner: {
        backgroundColor: '#E8F1FF',
        borderRadius: wp(16),
        paddingHorizontal: wp(16),
        paddingVertical: wp(14),
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: wp(20),
        marginTop: wp(20),
        marginBottom: wp(26),
        position: 'relative',
        overflow: 'hidden',
    },
    safetyIconCircle: {
        width: wp(48),
        height: wp(48),
        borderRadius: wp(24),
        backgroundColor: WHITE,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#1A6BFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#E6EBF5',
    },
    safetyBlueBadge: {
        width: wp(30),
        height: wp(30),
        borderRadius: wp(15),
        backgroundColor: BLUE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    safetyCheckSymbol: {
        color: WHITE,
        fontSize: fs(14),
        fontWeight: 'bold',
    },
    safetyContent: {
        flex: 1,
        marginLeft: wp(12),
        marginRight: wp(75), // Leave space for the overlapping car image
    },
    safetyTitle: {
        fontSize: fs(13),
        fontWeight: '800',
        color: NAVY,
        marginBottom: wp(2),
    },
    safetyDesc: {
        fontSize: fs(9.5),
        color: GRAY,
        lineHeight: fs(14),
        fontWeight: '600',
    },
    safetyCarImage: {
        position: 'absolute',
        right: -wp(15),
        bottom: -wp(12),
        width: wp(135),
        height: wp(90),
    },
    whyChooseSection: {
        paddingHorizontal: wp(20),
        marginBottom: wp(20),
    },
    featuresRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: wp(12),
    },
    featureItem: {
        alignItems: 'center',
        flex: 1,
    },
    featureIconWrapper: {
        width: wp(54),
        height: wp(54),
        borderRadius: wp(27),
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: wp(8),
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.03)',
    },
    featureIcon: {
        fontSize: fs(22),
    },
    featureTitle: {
        fontSize: fs(10.5),
        fontWeight: '800',
        color: NAVY,
        textAlign: 'center',
        minHeight: wp(28),
    },
    featureSubtitle: {
        fontSize: fs(8.5),
        color: GRAY,
        fontWeight: '600',
        textAlign: 'center',
    },
    errorRowHighlight: {
        borderColor: '#EF4444',
        borderWidth: 1,
        borderRadius: wp(12),
        paddingHorizontal: wp(8),
        backgroundColor: '#FEF2F2',
    },
    errorBannerInline: {
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FCA5A5',
        borderRadius: wp(12),
        paddingHorizontal: wp(14),
        paddingVertical: wp(10),
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: wp(14),
        gap: wp(8),
    },
    errorIcon: {
        fontSize: fs(14),
    },
    errorText: {
        fontSize: fs(11.5),
        fontWeight: '700',
        color: '#DC2626',
        flex: 1,
    },
    uberActiveBookingCard: {
        position: 'absolute',
        bottom: wp(90),
        left: wp(16),
        right: wp(16),
        backgroundColor: WHITE,
        borderRadius: wp(20),
        padding: wp(16),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 10,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        zIndex: 99,
    },
    uberTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    uberDriverCol: {
        alignItems: 'center',
        width: wp(60),
    },
    uberAvatarCircle: {
        width: wp(52),
        height: wp(52),
        borderRadius: wp(26),
        backgroundColor: '#F1F5F9',
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    uberAvatarEmoji: {
        fontSize: fs(24),
    },
    uberDriverRatingBadge: {
        backgroundColor: WHITE,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: wp(8),
        paddingHorizontal: wp(5),
        paddingVertical: wp(2),
        marginTop: -wp(10),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    uberDriverRatingText: {
        fontSize: fs(9),
        fontWeight: '800',
        color: '#0F172A',
    },
    uberDriverName: {
        fontSize: fs(12),
        fontWeight: '800',
        color: '#0F172A',
        marginTop: wp(4),
    },
    uberCarImage: {
        width: wp(120),
        height: wp(70),
        marginHorizontal: wp(6),
    },
    uberCarCol: {
        flex: 1,
        alignItems: 'flex-end',
    },
    uberVehiclePlate: {
        fontSize: fs(16),
        fontWeight: '900',
        color: '#0F172A',
        letterSpacing: 0.5,
    },
    uberCarDetailName: {
        fontSize: fs(11),
        color: GRAY,
        fontWeight: '600',
        textAlign: 'right',
        marginTop: wp(2),
    },
    uberMiddleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#F1F5F9',
        paddingVertical: wp(8),
        marginVertical: wp(4),
    },
    uberTagsRow: {
        flexDirection: 'row',
        gap: wp(10),
    },
    uberTagText: {
        fontSize: fs(10.5),
        color: GRAY,
        fontWeight: '600',
    },
    uberOtpContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0FDF4',
        borderWidth: 1,
        borderColor: '#BBF7D0',
        paddingHorizontal: wp(8),
        paddingVertical: wp(3),
        borderRadius: wp(8),
    },
    uberOtpLabel: {
        fontSize: fs(9),
        fontWeight: '800',
        color: '#16A34A',
    },
    uberOtpVal: {
        fontSize: fs(11.5),
        fontWeight: '900',
        color: '#15803D',
        letterSpacing: 0.5,
    },
    uberButtonsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(8),
        marginTop: wp(2),
    },
    uberMsgBtn: {
        flex: 1,
        height: wp(42),
        backgroundColor: '#F1F5F9',
        borderRadius: wp(12),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: wp(6),
    },
    uberMsgIcon: {
        fontSize: fs(14),
    },
    uberMsgBtnText: {
        fontSize: fs(12),
        fontWeight: '800',
        color: '#0F172A',
    },
    uberCallBtn: {
        width: wp(42),
        height: wp(42),
        backgroundColor: '#F1F5F9',
        borderRadius: wp(12),
        alignItems: 'center',
        justifyContent: 'center',
    },
    uberCallIcon: {
        fontSize: fs(14),
    },
    uberMoreBtn: {
        width: wp(42),
        height: wp(42),
        backgroundColor: '#F1F5F9',
        borderRadius: wp(12),
        alignItems: 'center',
        justifyContent: 'center',
    },
    uberMoreIcon: {
        fontSize: fs(12),
        fontWeight: '800',
        color: '#0F172A',
    },
    uberPendingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    uberPendingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: wp(4),
    },
    uberPendingTitle: {
        fontSize: fs(14),
        fontWeight: '800',
        color: '#0F172A',
    },
    uberPendingRoute: {
        fontSize: fs(11.5),
        color: GRAY,
        fontWeight: '600',
    },
    uberPendingCar: {
        fontSize: fs(11.5),
        color: BLUE,
        fontWeight: '700',
        marginTop: wp(2),
    },
    uberPendingArrow: {
        width: wp(30),
        height: wp(30),
        borderRadius: wp(15),
        backgroundColor: '#EFF6FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    successOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: wp(20),
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
    },
    successCircle: {
        width: wp(56),
        height: wp(56),
        borderRadius: wp(28),
        backgroundColor: '#F0FDF4',
        borderWidth: 3,
        borderColor: '#22C55E',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: wp(6),
    },
    successCheckmark: {
        fontSize: fs(28),
        color: '#22C55E',
        fontWeight: '900',
    },
    successText: {
        fontSize: fs(14.5),
        fontWeight: '900',
        color: '#0F172A',
    },
    successSubtext: {
        fontSize: fs(11),
        color: GRAY,
        fontWeight: '700',
        marginTop: wp(2),
    },
    uberPayBtn: {
        backgroundColor: '#22C55E',
        paddingVertical: wp(12),
        borderRadius: wp(12),
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: wp(6),
    },
    uberPayBtnText: {
        color: WHITE,
        fontSize: fs(14),
        fontWeight: '900',
    },
});

export default SearchScreen;
