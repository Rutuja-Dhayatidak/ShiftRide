import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    Dimensions,
    PixelRatio,
    Image,
    Alert,
    Animated,
    ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { getCarById } from '../services/Car';
import { getCarImageUrl } from '../services/api';
import { getSessionToken } from '../services/auth';

const { width } = Dimensions.get('window');
const BASE_W = 375;
const wp = (px: number) => Math.round(PixelRatio.roundToNearestPixel((px / BASE_W) * width));
const fs = (px: number) => Math.round(PixelRatio.roundToNearestPixel((px / BASE_W) * width));

// Styling Colors
const NAVY = '#0F172A';
const GRAY = '#64748B';
const GRAY_LT = '#F8FAFC';
const WHITE = '#FFFFFF';
const BLUE = '#1A6BFF'; // App Theme Royal Blue
const BLUE_LIGHT = '#EFF6FF';
const GOLD = '#F59E0B';
const BORDER = '#E2E8F0';
const GREEN = '#10B981';
const TEAL = '#0D9488';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type CarDetailsRouteProp = RouteProp<RootStackParamList, 'CarDetails'>;

interface Car {
    id: string;
    name: string;
    brand: string;
    classType: string;
    transmission: 'Automatic' | 'Manual';
    fuel: 'Electric' | 'Petrol' | 'Diesel' | 'Hybrid';
    seats: number;
    trips: number;
    price: number;
    rating: number;
    image: any;
    dealBadge?: string;
    location: string;
    ratePerKm: string;
    distance: string;
    duration: string;
    estimatedFare: string;
    totalPrice?: number;
    features?: string[];
}

const CARS_DATA: Car[] = [
    {
        id: '1',
        name: 'Swift Dzire',
        brand: 'Maruti Suzuki',
        classType: 'Maruti Suzuki • Luxury Sedan',
        transmission: 'Automatic',
        fuel: 'Petrol',
        seats: 5,
        trips: 128,
        price: 13,
        totalPrice: 2496,
        rating: 0.0, // Match mockup 0.0 rating
        features: ['AC', 'Bluetooth', 'GPS', 'Camera'],
        image: require('../assets/images/banner_car.png'),
        dealBadge: '👑 GOLD',
        location: 'Pune',
        ratePerKm: '₹13 / km',
        distance: '150 km',
        duration: '3 hr 0 min',
        estimatedFare: '₹1,950',
    },
    {
        id: '2',
        name: 'Hyundai i20',
        brand: 'Hyundai',
        classType: 'Hyundai • Compact Hatchback',
        transmission: 'Manual',
        fuel: 'Diesel',
        seats: 5,
        trips: 96,
        price: 11,
        totalPrice: 1980,
        rating: 4.7,
        features: ['AC', 'Autopilot', 'GPS', 'Premium Sound'],
        image: require('../assets/images/slide1_car.png'),
        dealBadge: '🔥 HOT',
        location: 'Mumbai',
        ratePerKm: '₹11 / km',
        distance: '140 km',
        duration: '2 hr 45 min',
        estimatedFare: '₹1,540',
    },
    {
        id: '3',
        name: 'Toyota Fortuner',
        brand: 'Toyota',
        classType: 'Toyota • Premium SUV',
        transmission: 'Automatic',
        fuel: 'Diesel',
        seats: 7,
        trips: 84,
        price: 22,
        totalPrice: 4280,
        rating: 4.9,
        features: ['AC', '4x4', 'GPS', 'Bluetooth'],
        image: require('../assets/images/banner_car.png'),
        dealBadge: '👑 PLATINUM',
        location: 'Pune',
        ratePerKm: '₹22 / km',
        distance: '175 km',
        duration: '3 hr 30 min',
        estimatedFare: '₹3,850',
    },
];

const AnimTabContent = ({ children, activeTab }: { children: React.ReactNode, activeTab: string }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(15)).current;

    useEffect(() => {
        fadeAnim.setValue(0);
        slideAnim.setValue(15);
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start();
    }, [activeTab]);

    return (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            {children}
        </Animated.View>
    );
};

export default function CarDetailsScreen() {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<CarDetailsRouteProp>();

    const carId = route.params?.carId || '1';
    const [loading, setLoading] = useState(true);
    const [car, setCar] = useState<Car | null>(null);

    const [activeTab, setActiveTab] = useState<'About' | 'Gallery' | 'Review'>('About');
    const [isFav, setIsFav] = useState(false);
    const [selectedImage, setSelectedImage] = useState<any>(null);
    const scrollViewRef = useRef<ScrollView>(null);

    // Landing Animations
    const carScale = useRef(new Animated.Value(0.4)).current;
    const carOpacity = useRef(new Animated.Value(0)).current;
    const detailsTranslateY = useRef(new Animated.Value(60)).current;
    const detailsOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setLoading(true);
                const data = await getCarById(carId);

                let mainImage = require('../assets/images/banner_car.png');
                if (data.cars_image) {
                    const fullUrl = getCarImageUrl(data.cars_image);
                    if (fullUrl) mainImage = { uri: fullUrl };
                } else if (data.front_image) {
                    const fullUrl = getCarImageUrl(data.front_image);
                    if (fullUrl) mainImage = { uri: fullUrl };
                }

                const mapped: Car = {
                    id: data.id || data._id,
                    name: data.model_name || data.name || 'Car',
                    brand: data.brand || 'Brand',
                    classType: `${data.brand || 'Brand'} • ${data.fuel_type || 'Petrol'} • ${data.transmission || 'Automatic'}`,
                    transmission: data.transmission || 'Automatic',
                    fuel: data.fuel_type || 'Petrol',
                    seats: data.seats || 5,
                    trips: data.trips || 128,
                    price: data.price_per_day || 68,
                    rating: data.rating || 0.0,
                    image: mainImage,
                    dealBadge: data.badge ? `👑 ${data.badge.toUpperCase()}` : undefined,
                    location: route.params?.pickup || data.city || 'Location',
                    ratePerKm: `₹${data.price_per_km || 13} / km`,
                    distance: route.params?.distance || '150 km',
                    duration: route.params?.duration || '3 hr 0 min',
                    estimatedFare: route.params?.estimatedFare ? `₹${route.params.estimatedFare}` : `₹${data.estimatedFare || 1950}`,
                    features: data.features || ['AC', 'Bluetooth', 'GPS'],
                    totalPrice: route.params?.estimatedFare || 1950,
                };

                (mapped as any).front_image = data.front_image;
                (mapped as any).back_image = data.back_image;
                (mapped as any).left_image = data.left_image;
                (mapped as any).right_image = data.right_image;
                (mapped as any).interior_image = data.interior_image;

                setCar(mapped);
                setSelectedImage(null);
            } catch (err) {
                console.error("Fetch Car Details Error:", err);
                Alert.alert("Error", "Failed to load car details from backend.");
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [carId]);

    useEffect(() => {
        if (!loading && car) {
            Animated.stagger(150, [
                Animated.parallel([
                    Animated.spring(carScale, {
                        toValue: 1,
                        friction: 6.5,
                        tension: 38,
                        useNativeDriver: true,
                    }),
                    Animated.timing(carOpacity, {
                        toValue: 1,
                        duration: 350,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.parallel([
                    Animated.timing(detailsTranslateY, {
                        toValue: 0,
                        duration: 450,
                        useNativeDriver: true,
                    }),
                    Animated.timing(detailsOpacity, {
                        toValue: 1,
                        duration: 450,
                        useNativeDriver: true,
                    }),
                ]),
            ]).start();
        }
    }, [loading]);

    if (loading || !car) {
        return (
            <View style={[s.screen, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={BLUE} />
                <Text style={{ marginTop: wp(10), color: GRAY, fontSize: fs(14), fontWeight: '600' }}>Loading car details...</Text>
            </View>
        );
    }

    const baseFareVal = route.params?.estimatedFare || car.totalPrice || 1950;
    const platformFeeVal = Math.round(baseFareVal * 0.1);
    const gstVal = Math.round(baseFareVal * 0.18);
    const totalPayableVal = baseFareVal + platformFeeVal + gstVal;

    const galleryImages = [];
    if ((car as any).front_image) {
        const fullUrl = getCarImageUrl((car as any).front_image);
        if (fullUrl) galleryImages.push({ uri: fullUrl });
    }
    if ((car as any).back_image) {
        const fullUrl = getCarImageUrl((car as any).back_image);
        if (fullUrl) galleryImages.push({ uri: fullUrl });
    }
    if ((car as any).left_image) {
        const fullUrl = getCarImageUrl((car as any).left_image);
        if (fullUrl) galleryImages.push({ uri: fullUrl });
    }
    if ((car as any).right_image) {
        const fullUrl = getCarImageUrl((car as any).right_image);
        if (fullUrl) galleryImages.push({ uri: fullUrl });
    }
    if ((car as any).interior_image) {
        const fullUrl = getCarImageUrl((car as any).interior_image);
        if (fullUrl) galleryImages.push({ uri: fullUrl });
    }

    // Fallback to main image if no gallery images are present in DB
    if (galleryImages.length === 0) {
        galleryImages.push(car.image);
    }

    return (
        <View style={s.screen}>
            <StatusBar barStyle="dark-content" backgroundColor={WHITE} />

            {/* ── Header ── */}
            <View style={s.header}>
                <TouchableOpacity style={s.circleBtn} onPress={() => navigation.goBack()}>
                    <Text style={s.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={s.headerTitle}>Car Details</Text>
                <TouchableOpacity style={s.circleBtn} onPress={() => setIsFav(!isFav)}>
                    <Text style={[s.heartIcon, isFav && s.heartActive]}>{isFav ? '❤️' : '♡'}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
                {/* ── Curved Car Display (Animated) ── */}
                <Animated.View style={{ opacity: carOpacity, transform: [{ scale: carScale }] }}>
                    <View style={s.carDisplayContainer}>
                        <View style={s.orangeArc} />
                        <Image source={selectedImage ?? car.image} style={s.carImg} resizeMode="cover" />
                        <View style={s.badge360}>
                            <Text style={s.text360}>360</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* ── Details Block (Animated Slide-up) ── */}
                <Animated.View style={{ opacity: detailsOpacity, transform: [{ translateY: detailsTranslateY }] }}>

                    {/* ── Title & Rating ── */}
                    <View style={s.titleRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={s.carName}>{car.name}</Text>
                            <Text style={s.carSub}>{car.classType}</Text>
                        </View>
                        <View style={s.ratingBlock}>
                            <View style={s.starRatingRow}>
                                <Text style={s.ratingVal}>{car.rating.toFixed(1)}</Text>
                                <Text style={s.ratingStar}>★</Text>
                            </View>
                            <Text style={s.reviewCountText}>1 review</Text>
                        </View>
                    </View>

                    {/* ── Sub-tabs Navigator ── */}
                    <View style={s.tabsRow}>
                        {(['About', 'Gallery', 'Review'] as const).map(tab => {
                            const active = activeTab === tab;
                            return (
                                <TouchableOpacity
                                    key={tab}
                                    style={[s.tabItem, active && s.tabItemActive]}
                                    onPress={() => setActiveTab(tab)}
                                >
                                    <Text style={[s.tabText, active && s.tabTextActive]}>{tab}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* ── Tab Contents ── */}
                    <AnimTabContent activeTab={activeTab}>
                        {activeTab === 'About' && (
                            <View style={s.tabContent}>
                                {/* Trip Summary Card */}
                                <View style={s.tripSummaryBox}>
                                    <View style={s.tripSummaryHeader}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(6) }}>
                                            <Text style={s.cardTitleIcon}>🚙</Text>
                                            <Text style={s.cardTitleText}>Trip Summary</Text>
                                        </View>
                                        <View style={s.availableBadge}>
                                            <Text style={s.availableBadgeTxt}>• Available</Text>
                                        </View>
                                    </View>

                                    {/* 3x3 Stats Grid */}
                                    <View style={s.statsGrid}>
                                        <View style={s.gridRow}>
                                            <View style={s.gridCell}>
                                                <Text style={s.gridIconLabel}>📍 Pickup</Text>
                                                <Text style={s.gridValText}>{car.location}</Text>
                                            </View>
                                            <View style={s.gridColDivider} />
                                            <View style={s.gridCell}>
                                                <Text style={s.gridIconLabel}>📍 Drop</Text>
                                                <Text style={s.gridValText}>Mumbai</Text>
                                            </View>
                                            <View style={s.gridColDivider} />
                                            <View style={s.gridCell}>
                                                <Text style={s.gridIconLabel}>📄 Billing</Text>
                                                <Text style={s.gridValText}>Per KM</Text>
                                            </View>
                                        </View>

                                        <View style={s.gridRowDivider} />

                                        <View style={s.gridRow}>
                                            <View style={s.gridCell}>
                                                <Text style={s.gridIconLabel}>🛣️ Mode</Text>
                                                <Text style={s.gridValText}>Transfer</Text>
                                            </View>
                                            <View style={s.gridColDivider} />
                                            <View style={s.gridCell}>
                                                <Text style={s.gridIconLabel}>🕒 Distance</Text>
                                                <Text style={s.gridValText}>{car.distance}</Text>
                                            </View>
                                            <View style={s.gridColDivider} />
                                            <View style={s.gridCell}>
                                                <Text style={s.gridIconLabel}>📅 Trip Days</Text>
                                                <Text style={s.gridValText}>1</Text>
                                            </View>
                                        </View>

                                        <View style={s.gridRowDivider} />

                                        <View style={s.gridRow}>
                                            <View style={s.gridCell}>
                                                <Text style={s.gridIconLabel}>₹ Rate</Text>
                                                <Text style={s.gridValText}>{car.ratePerKm}</Text>
                                            </View>
                                            <View style={s.gridColDivider} />
                                            <View style={s.gridCell}>
                                                <Text style={s.gridIconLabel}>📅 Start Date</Text>
                                                <Text style={s.gridValText}>26/07/2026</Text>
                                            </View>
                                            <View style={s.gridColDivider} />
                                            <View style={s.gridCell}>
                                                <Text style={s.gridIconLabel}>📅 End Date</Text>
                                                <Text style={s.gridValText}>26/07/2026</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>

                                {/* Rent Partner */}
                                <Text style={s.sectionTitle}>Rent Partner</Text>
                                <View style={s.partnerCard}>
                                    <View style={s.partnerAvatarContainer}>
                                        <Text style={{ fontSize: fs(18), color: WHITE }}>🚙</Text>
                                    </View>
                                    <View style={{ flex: 1, paddingLeft: wp(12) }}>
                                        <Text style={s.partnerName}>ShiftRide Partner</Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(3), marginTop: wp(2) }}>
                                            <Text style={s.verifiedText}>Verified</Text>
                                            <Text style={{ fontSize: fs(10) }}>🟢</Text>
                                        </View>
                                    </View>
                                    <View style={s.partnerActions}>
                                        <TouchableOpacity style={s.actionCircle}>
                                            <Text style={{ fontSize: fs(14) }}>💬</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={s.actionCircle}>
                                            <Text style={{ fontSize: fs(14) }}>📞</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Description */}
                                <Text style={s.sectionTitle}>Description</Text>
                                <Text style={s.descText}>
                                    Travel in comfort with the {car.name}, a luxury sedan perfect for transfer trips from {car.location} to Mumbai. This 2022 model offers 5 spacious seats, petrol engine, automatic transmission, and AC for a smooth and relaxed ride. Transparent per-km pricing with a detailed fare breakdown.
                                </Text>

                                {/* Fare Breakdown Card */}
                                <View style={s.fareBreakdownBox}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(6), marginBottom: wp(12) }}>
                                        <Text style={s.cardTitleIcon}>📋</Text>
                                        <Text style={s.cardTitleText}>Fare Breakdown</Text>
                                    </View>
                                    <View style={s.fareRow}>
                                        <Text style={s.fareLabelTxt}>Base Fare</Text>
                                        <Text style={s.fareValTxt}>₹{baseFareVal.toLocaleString('en-IN')}</Text>
                                    </View>
                                    <View style={s.fareRow}>
                                        <Text style={s.fareLabelTxt}>Platform Fee (10%)</Text>
                                        <Text style={s.fareValTxt}>₹{platformFeeVal.toLocaleString('en-IN')}</Text>
                                    </View>
                                    <View style={s.fareRow}>
                                        <Text style={s.fareLabelTxt}>GST (18%)</Text>
                                        <Text style={s.fareValTxt}>₹{gstVal.toLocaleString('en-IN')}</Text>
                                    </View>
                                    <View style={s.dashedLine} />
                                    <View style={[s.fareRow, { marginTop: wp(8) }]}>
                                        <Text style={s.totalPayableLabel}>Total Payable</Text>
                                        <Text style={s.totalPayableVal}>₹{totalPayableVal.toLocaleString('en-IN')}</Text>
                                    </View>
                                </View>
                            </View>
                        )}

                        {activeTab === 'Gallery' && (
                            <View style={s.tabContent}>
                                <Text style={s.sectionTitle}>Gallery</Text>
                                <View style={s.galleryGrid}>
                                    {galleryImages.map((img, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            activeOpacity={0.8}
                                            onPress={() => {
                                                setSelectedImage(img);
                                                scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                                            }}
                                        >
                                            <Image source={img} style={s.galleryImg} resizeMode="cover" />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        {activeTab === 'Review' && (
                            <View style={s.tabContent}>
                                <Text style={s.sectionTitle}>Reviews</Text>

                                {/* Review 1 */}
                                <View style={s.reviewCard}>
                                    <View style={s.reviewHeader}>
                                        <Image
                                            source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100' }}
                                            style={s.reviewAvatar}
                                        />
                                        <View style={{ flex: 1, paddingLeft: wp(8) }}>
                                            <Text style={s.reviewerName}>Max Halvart</Text>
                                            <Text style={s.reviewerRole}>CEO at Car Station</Text>
                                        </View>
                                        <Text style={s.reviewDate}>09 March 2026</Text>
                                    </View>
                                    <View style={s.reviewStarsRow}>
                                        <Text style={s.goldStars}>★★★★☆</Text>
                                    </View>
                                    <Text style={s.reviewBody}>
                                        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text.
                                    </Text>
                                </View>
                            </View>
                        )}
                    </AnimTabContent>

                </Animated.View>

                <View style={{ height: wp(100) }} />
            </ScrollView>

            {/* ── Bottom Booking Action Bar ── */}
            <View style={s.bottomActionBar}>
                <View style={{ flex: 1 }}>
                    <Text style={s.priceVal}>{car.ratePerKm}</Text>
                    <Text style={s.totalPriceBottom}>Total ₹{totalPayableVal.toLocaleString('en-IN')}</Text>
                </View>
                <View style={s.bottomDivider} />
                <TouchableOpacity
                    style={s.rentNowBtn}
                    activeOpacity={0.8}
                    onPress={() => {
                        const token = getSessionToken();
                        if (!token) {
                            Alert.alert(
                                'Authentication Required',
                                'Please register or login first to book a car.',
                                [
                                    { text: 'Cancel', style: 'cancel' },
                                    { text: 'Login', onPress: () => navigation.navigate('Login') }
                                ]
                            );
                        } else {
                            navigation.navigate('Billing', { 
                                carId: car.id,
                                womenSafety: route.params?.womenSafety || false
                            });
                        }
                    }}
                >
                    <Text style={s.rentNowTxt}>Rent Now</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    screen: { flex: 1, backgroundColor: WHITE },
    scrollContent: { flexGrow: 1 },

    // Header
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
    heartIcon: {
        fontSize: fs(16),
        color: GRAY,
    },
    heartActive: {
        color: 'red',
    },

    // Curved Car Display
    carDisplayContainer: {
        height: wp(260),
        alignItems: 'center',
        justifyContent: 'flex-start',
        position: 'relative',
        overflow: 'hidden',
        marginVertical: wp(10),
    },
    orangeArc: {
        width: wp(600),
        height: wp(600),
        borderRadius: wp(300),
        borderWidth: 1.5,
        borderColor: BLUE,
        position: 'absolute',
        top: -wp(370),
        alignSelf: 'center',
        zIndex: 3,
    },
    carImg: {
        width: width,
        height: wp(260),
        zIndex: 2,
    },
    badge360: {
        position: 'absolute',
        bottom: wp(16),
        backgroundColor: BLUE,
        paddingHorizontal: wp(14),
        paddingVertical: wp(6),
        borderRadius: wp(16),
        zIndex: 5,
    },
    text360: {
        fontSize: fs(11),
        fontWeight: '800',
        color: WHITE,
    },

    // Title Row
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: wp(16),
        marginTop: wp(10),
        marginBottom: wp(16),
    },
    carName: {
        fontSize: fs(20),
        fontWeight: '800',
        color: NAVY,
    },
    carSub: {
        fontSize: fs(12),
        color: GRAY,
        fontWeight: '600',
        marginTop: wp(2),
    },
    ratingBlock: {
        alignItems: 'flex-end',
        gap: wp(2),
    },
    starRatingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(3),
    },
    ratingVal: {
        fontSize: fs(14),
        fontWeight: '800',
        color: GRAY,
    },
    ratingStar: {
        fontSize: fs(14),
        color: GOLD,
    },
    reviewCountText: {
        fontSize: fs(10.5),
        fontWeight: '600',
        color: GRAY,
    },

    // Tabs
    tabsRow: {
        flexDirection: 'row',
        backgroundColor: '#F1F5F9',
        borderRadius: wp(14),
        padding: wp(4),
        marginHorizontal: wp(16),
        marginBottom: wp(20),
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: wp(8),
        borderRadius: wp(10),
    },
    tabItemActive: {
        backgroundColor: WHITE,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    tabText: {
        fontSize: fs(13),
        fontWeight: '700',
        color: GRAY,
    },
    tabTextActive: {
        color: BLUE,
    },

    // Tab Contents
    tabContent: {
        paddingHorizontal: wp(16),
    },
    sectionTitle: {
        fontSize: fs(14),
        fontWeight: '800',
        color: NAVY,
        marginBottom: wp(10),
        marginTop: wp(16),
    },

    // Trip Summary Card layout
    tripSummaryBox: {
        borderWidth: 1,
        borderColor: '#F1F5F9',
        borderRadius: wp(16),
        backgroundColor: WHITE,
        padding: wp(14),
        marginBottom: wp(12),
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: wp(4) },
        shadowOpacity: 0.02,
        shadowRadius: wp(8),
        elevation: 1,
    },
    tripSummaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: '#F1F5F9',
        paddingBottom: wp(10),
        marginBottom: wp(12),
    },
    cardTitleIcon: {
        fontSize: fs(15),
    },
    cardTitleText: {
        fontSize: fs(13.5),
        fontWeight: '800',
        color: NAVY,
    },
    availableBadge: {
        backgroundColor: '#ECFDF5',
        paddingHorizontal: wp(8),
        paddingVertical: wp(4),
        borderRadius: wp(8),
    },
    availableBadgeTxt: {
        fontSize: fs(9.5),
        fontWeight: '800',
        color: GREEN,
    },
    statsGrid: {
        marginTop: wp(4),
    },
    gridRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: wp(8),
    },
    gridCell: {
        flex: 1,
        paddingLeft: wp(4),
        gap: wp(3),
    },
    gridIconLabel: {
        fontSize: fs(9),
        fontWeight: '600',
        color: GRAY,
    },
    gridValText: {
        fontSize: fs(11),
        fontWeight: '800',
        color: NAVY,
    },
    gridColDivider: {
        width: 1,
        height: wp(24),
        backgroundColor: '#E2E8F0',
        marginHorizontal: wp(6),
    },
    gridRowDivider: {
        height: 1,
        backgroundColor: '#E2E8F0',
        width: '100%',
    },

    // Rent Partner Card
    partnerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        borderRadius: wp(16),
        padding: wp(10),
        backgroundColor: WHITE,
        marginBottom: wp(16),
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: wp(4) },
        shadowOpacity: 0.02,
        shadowRadius: wp(8),
        elevation: 1,
    },
    partnerAvatarContainer: {
        width: wp(36),
        height: wp(36),
        borderRadius: wp(18),
        backgroundColor: TEAL,
        alignItems: 'center',
        justifyContent: 'center',
    },
    partnerName: {
        fontSize: fs(12.5),
        fontWeight: '800',
        color: NAVY,
    },
    verifiedText: {
        fontSize: fs(10),
        color: GREEN,
        fontWeight: '800',
    },
    partnerActions: {
        flexDirection: 'row',
        gap: wp(8),
    },
    actionCircle: {
        width: wp(34),
        height: wp(34),
        borderRadius: wp(17),
        backgroundColor: '#EFF6FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    descText: {
        fontSize: fs(12),
        color: GRAY,
        lineHeight: wp(18),
        fontWeight: '500',
    },

    // Fare Breakdown Card layout
    fareBreakdownBox: {
        borderWidth: 1,
        borderColor: '#F1F5F9',
        borderRadius: wp(16),
        backgroundColor: WHITE,
        padding: wp(14),
        marginTop: wp(16),
        marginBottom: wp(20),
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: wp(4) },
        shadowOpacity: 0.02,
        shadowRadius: wp(8),
        elevation: 1,
    },
    fareRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: wp(4),
    },
    fareLabelTxt: {
        fontSize: fs(11),
        fontWeight: '600',
        color: GRAY,
    },
    fareValTxt: {
        fontSize: fs(11.5),
        fontWeight: '700',
        color: NAVY,
    },
    dashedLine: {
        borderWidth: 0.8,
        borderColor: '#CBD5E1',
        borderStyle: 'dashed',
        marginVertical: wp(10),
        borderRadius: 1,
    },
    totalPayableLabel: {
        fontSize: fs(13),
        fontWeight: '800',
        color: NAVY,
    },
    totalPayableVal: {
        fontSize: fs(18),
        fontWeight: '900',
        color: BLUE,
    },

    // Gallery
    galleryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: wp(10),
    },
    galleryImg: {
        width: (width - wp(42)) / 2,
        height: wp(90),
        borderRadius: wp(12),
        backgroundColor: GRAY_LT,
        borderWidth: 1,
        borderColor: BORDER,
    },

    // Reviews
    reviewCard: {
        borderWidth: 1,
        borderColor: BORDER,
        borderRadius: wp(16),
        padding: wp(12),
        backgroundColor: WHITE,
        marginBottom: wp(12),
    },
    reviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: wp(6),
    },
    reviewAvatar: {
        width: wp(32),
        height: wp(32),
        borderRadius: wp(16),
    },
    reviewerName: {
        fontSize: fs(12),
        fontWeight: '800',
        color: NAVY,
    },
    reviewerRole: {
        fontSize: fs(10),
        color: GRAY,
        fontWeight: '500',
    },
    reviewDate: {
        fontSize: fs(9),
        color: GRAY,
        fontWeight: '500',
    },
    reviewStarsRow: {
        marginBottom: wp(6),
    },
    goldStars: {
        fontSize: fs(11),
        color: GOLD,
    },
    reviewBody: {
        fontSize: fs(11),
        color: GRAY,
        lineHeight: wp(16),
        fontWeight: '500',
    },

    // Bottom Action Bar
    bottomActionBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: WHITE,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: wp(20),
        paddingTop: wp(14),
        paddingBottom: wp(22),
        borderTopWidth: 1,
        borderColor: BORDER,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 8,
    },
    priceVal: {
        fontSize: fs(18),
        fontWeight: '900',
        color: NAVY,
    },
    totalPriceBottom: {
        fontSize: fs(11.5),
        color: GRAY,
        fontWeight: '600',
        marginTop: wp(2),
    },
    bottomDivider: {
        width: 1,
        height: wp(30),
        backgroundColor: '#E2E8F0',
        marginHorizontal: wp(12),
    },
    rentNowBtn: {
        backgroundColor: BLUE,
        paddingHorizontal: wp(36),
        paddingVertical: wp(12),
        borderRadius: wp(12),
        shadowColor: BLUE,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
    },
    rentNowTxt: {
        fontSize: fs(13.5),
        fontWeight: '800',
        color: WHITE,
    },
});
