import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    Dimensions,
    PixelRatio,
    FlatList,
    Image,
    Animated,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { BottomNavigation } from '../components/bottomnavigation';
import { searchCars } from '../services/Car';
import { getCarImageUrl } from '../services/api';

const { width } = Dimensions.get('window');
const BASE_W = 375;
const wp = (px: number) => Math.round(PixelRatio.roundToNearestPixel((px / BASE_W) * width));
const fs = (px: number) => Math.round(PixelRatio.roundToNearestPixel((px / BASE_W) * width));

// UI Colors matching the reference mockup
const NAVY = '#0F172A';
const GRAY = '#64748B';
const GRAY_LT = '#F8FAFC';
const WHITE = '#FFFFFF';
const BLUE = '#1A6BFF'; 
const BLUE_LIGHT = '#F0F6FF';
const BORDER = '#E2E8F0';
const GOLD = '#F59E0B';
const GREEN = '#10B981';
const GREEN_BG = '#ECFDF5';
const RED = '#EF4444';
const TEAL = '#0D9488'; // Teal color for title and location marker

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type CarResultsRouteProp = RouteProp<RootStackParamList, 'CarResults'>;

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
    totalPrice: number;
    rating: number;
    features: string[];
    image: any;
    dealBadge?: string;
    location: string;
    ratePerKm: string;
    distance: string;
    duration: string;
    estimatedFare: string;
}

const CARS_DATA: Car[] = [
    {
        id: '1',
        name: 'Swift Dzire',
        brand: 'Maruti Suzuki',
        classType: 'Petrol • Automatic',
        transmission: 'Automatic',
        fuel: 'Petrol',
        seats: 5,
        trips: 128,
        price: 68,
        totalPrice: 1950,
        rating: 4.8,
        features: ['AC', 'Bluetooth', 'GPS', 'Camera'],
        image: require('../assets/images/banner_car.png'),
        dealBadge: '👑 GOLD',
        location: 'Pune',
        ratePerKm: '₹13/km',
        distance: '150 KM',
        duration: '3 hr 0 min',
        estimatedFare: '₹1,950',
    },
    {
        id: '2',
        name: 'Hyundai i20',
        brand: 'Hyundai',
        classType: 'Diesel • Manual',
        transmission: 'Manual',
        fuel: 'Diesel',
        seats: 5,
        trips: 96,
        price: 79,
        totalPrice: 1540,
        rating: 4.7,
        features: ['AC', 'Autopilot', 'GPS', 'Premium Sound'],
        image: require('../assets/images/slide1_car.png'),
        dealBadge: '🔥 HOT',
        location: 'Mumbai',
        ratePerKm: '₹11/km',
        distance: '140 KM',
        duration: '2 hr 45 min',
        estimatedFare: '₹1,540',
    },
    {
        id: '3',
        name: 'Toyota Fortuner',
        brand: 'Toyota',
        classType: 'Diesel • Automatic',
        transmission: 'Automatic',
        fuel: 'Diesel',
        seats: 7,
        trips: 84,
        price: 120,
        totalPrice: 3850,
        rating: 4.9,
        features: ['AC', '4x4', 'GPS', 'Bluetooth'],
        image: require('../assets/images/banner_car.png'),
        dealBadge: '👑 PLATINUM',
        location: 'Pune',
        ratePerKm: '₹22/km',
        distance: '175 KM',
        duration: '3 hr 30 min',
        estimatedFare: '₹3,850',
    },
];

// ─── Custom Vector Drawing Icons ───

// Top Heart Icon (header)
const HeaderHeartIcon = () => (
    <View style={{ width: wp(16), height: wp(16), alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: fs(16), color: NAVY }}>♡</Text>
    </View>
);

// Filter Icon (header)
const HeaderFilterIcon = () => (
    <View style={{ width: wp(18), height: wp(18), justifyContent: 'space-between', paddingVertical: wp(2) }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1, height: 1.8, backgroundColor: NAVY, borderRadius: 1 }} />
            <View style={{ width: wp(5), height: wp(5), borderRadius: wp(2.5), backgroundColor: NAVY, borderWidth: 1, borderColor: WHITE }} />
            <View style={{ flex: 3, height: 1.8, backgroundColor: NAVY, borderRadius: 1 }} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 3, height: 1.8, backgroundColor: NAVY, borderRadius: 1 }} />
            <View style={{ width: wp(5), height: wp(5), borderRadius: wp(2.5), backgroundColor: NAVY, borderWidth: 1, borderColor: WHITE }} />
            <View style={{ flex: 1, height: 1.8, backgroundColor: NAVY, borderRadius: 1 }} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1.5, height: 1.8, backgroundColor: NAVY, borderRadius: 1 }} />
            <View style={{ width: wp(5), height: wp(5), borderRadius: wp(2.5), backgroundColor: NAVY, borderWidth: 1, borderColor: WHITE }} />
            <View style={{ flex: 2.5, height: 1.8, backgroundColor: NAVY, borderRadius: 1 }} />
        </View>
    </View>
);

// Edit Pencil Icon
const PencilIcon = () => (
    <View style={{ width: wp(14), height: wp(14), alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: fs(12), color: BLUE }}>✏️</Text>
    </View>
);

// Swap Icon (Double Arrow)
const SwapIcon = () => (
    <View style={{ width: wp(16), height: wp(16), justifyContent: 'center' }}>
        <Text style={{ fontSize: fs(12), color: BLUE, textAlign: 'center', fontWeight: 'bold' }}>⇄</Text>
    </View>
);

// Category Tab Icons
const CarFrontIcon = ({ active }: { active: boolean }) => {
    const color = active ? BLUE : GRAY;
    return (
        <View style={{ width: wp(16), height: wp(12), alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: wp(14), height: wp(6), backgroundColor: color, borderRadius: wp(1.5), position: 'relative' }}>
                <View style={{ position: 'absolute', top: wp(1), left: wp(2.5), right: wp(2.5), height: wp(2), backgroundColor: WHITE, opacity: 0.8, borderRadius: 0.5 }} />
                <View style={{ position: 'absolute', bottom: wp(0.8), left: wp(1.5), width: wp(2), height: wp(1.2), backgroundColor: GOLD, borderRadius: 0.5 }} />
                <View style={{ position: 'absolute', bottom: wp(0.8), right: wp(1.5), width: wp(2), height: wp(1.2), backgroundColor: GOLD, borderRadius: 0.5 }} />
            </View>
        </View>
    );
};

const SedanIcon = ({ active }: { active: boolean }) => {
    const color = active ? BLUE : GRAY;
    return (
        <View style={{ width: wp(20), height: wp(12), justifyContent: 'flex-end', alignItems: 'center' }}>
            <View style={{ width: wp(10), height: wp(4), borderTopLeftRadius: wp(3), borderTopRightRadius: wp(3), backgroundColor: color, marginBottom: -wp(1) }} />
            <View style={{ width: wp(18), height: wp(5), borderRadius: wp(1), backgroundColor: color }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: wp(12), marginTop: -wp(1.5) }}>
                <View style={{ width: wp(3.5), height: wp(3.5), borderRadius: wp(1.75), backgroundColor: active ? WHITE : NAVY, borderWidth: 1, borderColor: active ? BLUE : WHITE }} />
                <View style={{ width: wp(3.5), height: wp(3.5), borderRadius: wp(1.75), backgroundColor: active ? WHITE : NAVY, borderWidth: 1, borderColor: active ? BLUE : WHITE }} />
            </View>
        </View>
    );
};

const SUVIcon = ({ active }: { active: boolean }) => {
    const color = active ? BLUE : GRAY;
    return (
        <View style={{ width: wp(20), height: wp(12), justifyContent: 'flex-end', alignItems: 'center' }}>
            <View style={{ width: wp(12), height: wp(6), borderTopLeftRadius: wp(2), borderTopRightRadius: wp(2), backgroundColor: color, marginBottom: -wp(1) }} />
            <View style={{ width: wp(18), height: wp(6), borderRadius: wp(1.5), backgroundColor: color }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: wp(12), marginTop: -wp(1.5) }}>
                <View style={{ width: wp(4), height: wp(4), borderRadius: wp(2), backgroundColor: active ? WHITE : NAVY, borderWidth: 1, borderColor: active ? BLUE : WHITE }} />
                <View style={{ width: wp(4), height: wp(4), borderRadius: wp(2), backgroundColor: active ? WHITE : NAVY, borderWidth: 1, borderColor: active ? BLUE : WHITE }} />
            </View>
        </View>
    );
};

const CrownIcon = ({ active }: { active: boolean }) => {
    const color = active ? BLUE : GRAY;
    return (
        <View style={{ width: wp(20), height: wp(12), alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: wp(16), height: wp(10), justifyContent: 'flex-end', position: 'relative' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: wp(7), paddingHorizontal: wp(1) }}>
                    <View style={{ width: wp(2.5), height: wp(4.5), backgroundColor: color, borderTopLeftRadius: wp(1.2), borderTopRightRadius: wp(1.2) }} />
                    <View style={{ width: wp(3), height: wp(7), backgroundColor: color, borderTopLeftRadius: wp(1.5), borderTopRightRadius: wp(1.5) }} />
                    <View style={{ width: wp(2.5), height: wp(4.5), backgroundColor: color, borderTopLeftRadius: wp(1.2), borderTopRightRadius: wp(1.2) }} />
                </View>
                <View style={{ height: wp(2.5), backgroundColor: color, borderRadius: wp(0.6), marginTop: wp(0.8) }} />
            </View>
        </View>
    );
};

const BoltIcon = ({ active }: { active: boolean }) => {
    const color = active ? BLUE : GRAY;
    return (
        <View style={{ width: wp(20), height: wp(12), alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: wp(14), height: wp(12), position: 'relative' }}>
                <View style={{
                    position: 'absolute',
                    top: wp(0.5),
                    left: wp(6),
                    width: wp(3),
                    height: wp(6),
                    backgroundColor: color,
                    transform: [{ skewX: '-30deg' }]
                }} />
                <View style={{
                    position: 'absolute',
                    top: wp(4.5),
                    left: wp(4),
                    width: wp(3.5),
                    height: wp(6.5),
                    backgroundColor: color,
                    transform: [{ skewX: '-30deg' }]
                }} />
            </View>
        </View>
    );
};

const AnimCarCard = ({ children, index, scrollY }: { children: React.ReactNode, index: number, scrollY: Animated.Value }) => {
    const cardHeight = 150;
    // Estimated offset pushed down by summary cards, filters, categories bar etc (~340px)
    const cardTop = 320 + index * cardHeight;

    const opacity = scrollY.interpolate({
        inputRange: [cardTop - 560, cardTop - 360],
        outputRange: [0.3, 1],
        extrapolate: 'clamp',
    });

    const translateY = scrollY.interpolate({
        inputRange: [cardTop - 560, cardTop - 360],
        outputRange: [45, 0],
        extrapolate: 'clamp',
    });

    const scale = scrollY.interpolate({
        inputRange: [cardTop - 560, cardTop - 360],
        outputRange: [0.94, 1],
        extrapolate: 'clamp',
    });

    return (
        <Animated.View style={{ opacity, transform: [{ translateY }, { scale }] }}>
            {children}
        </Animated.View>
    );
};

export default function CarResultsScreen() {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<CarResultsRouteProp>();
    
    const fromLocation = route.params?.fromLoc || 'Mumbai';
    const toLocation = route.params?.toLoc || 'Pune';

    const getFormattedDateRange = () => {
        const start = new Date();
        const end = new Date();
        end.setDate(start.getDate() + 2); // 2 days trip
        
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${start.getDate()} ${months[start.getMonth()]} - ${end.getDate()} ${months[end.getMonth()]}`;
    };

    const scrollY = useRef(new Animated.Value(0)).current;

    const [selectedCategory, setSelectedCategory] = useState('All Cars');
    const [favorites, setFavorites] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState(0); 

    const [loading, setLoading] = useState(true);
    const [searchedCars, setSearchedCars] = useState<Car[]>([]);
    const [distanceKm, setDistanceKm] = useState(150);
    const [duration, setDuration] = useState('3 hr 0 min');

    useEffect(() => {
        const performSearch = async () => {
            try {
                setLoading(true);
                const data = await searchCars(fromLocation, toLocation, '2026-07-04', route.params?.womenSafety || false);

                if (data && data.success) {
                    const mapped = (data.cars || []).map((c: any) => {
                        let imageSource = require('../assets/images/banner_car.png');
                        if (c.cars_image) {
                            const fullUrl = getCarImageUrl(c.cars_image);
                            if (fullUrl) imageSource = { uri: fullUrl };
                        } else if (c.front_image) {
                            const fullUrl = getCarImageUrl(c.front_image);
                            if (fullUrl) imageSource = { uri: fullUrl };
                        } else if (c.image_url) {
                            const fullUrl = getCarImageUrl(c.image_url);
                            if (fullUrl) imageSource = { uri: fullUrl };
                        } else if (c.images && c.images.length > 0) {
                            const fullUrl = getCarImageUrl(c.images[0]);
                            if (fullUrl) imageSource = { uri: fullUrl };
                        }

                        return {
                            id: c.id || c._id,
                            name: c.model || c.name || 'Car',
                            brand: c.brand || 'Brand',
                            classType: `${c.fuel_type || 'Petrol'} • ${c.transmission || 'Automatic'}`,
                            transmission: c.transmission || 'Automatic',
                            fuel: c.fuel_type || 'Petrol',
                            seats: c.seats || 5,
                            trips: c.trips || 128,
                            price: c.price_per_day || 68,
                            totalPrice: c.estimatedFare || 1950,
                            rating: c.rating || 4.8,
                            features: c.features || ['AC', 'Bluetooth', 'GPS'],
                            image: imageSource,
                            dealBadge: c.badge ? `👑 ${c.badge.toUpperCase()}` : undefined,
                            location: c.city || 'Location',
                            ratePerKm: `₹${c.pricePerKm || 13}/km`,
                            distance: `${data.distanceKm || 150} KM`,
                            duration: data.duration || '3 hr 0 min',
                            estimatedFare: `₹${c.estimatedFare || 1950}`,
                        };
                    });
                    setSearchedCars(mapped);
                    setDistanceKm(data.distanceKm || 150);
                    setDuration(data.duration || '3 hr 0 min');
                } else {
                    setSearchedCars([]);
                }
            } catch (err) {
                console.error("Search API Error:", err);
                Alert.alert("Search Failed", "Unable to fetch search results from backend.");
            } finally {
                setLoading(false);
            }
        };

        performSearch();
    }, [fromLocation, toLocation]);

    const toggleFavorite = (id: string) => {
        if (favorites.includes(id)) {
            setFavorites(favorites.filter(favId => favId !== id));
        } else {
            setFavorites([...favorites, id]);
        }
    };

    const filteredCars = searchedCars.filter(car => {
        if (selectedCategory === 'All Cars') return true;
        if (selectedCategory === 'Sedan') return car.classType.toLowerCase().includes('sedan');
        if (selectedCategory === 'SUV') return car.classType.toLowerCase().includes('suv');
        if (selectedCategory === 'Electric') return car.fuel === 'Electric';
        return true;
    });

    const categories = [
        { name: 'All Cars', icon: <CarFrontIcon active={selectedCategory === 'All Cars'} /> },
        { name: 'Sedan', icon: <SedanIcon active={selectedCategory === 'Sedan'} /> },
        { name: 'SUV', icon: <SUVIcon active={selectedCategory === 'SUV'} /> },
        { name: 'Luxury', icon: <CrownIcon active={selectedCategory === 'Luxury'} /> },
        { name: 'Electric', icon: <BoltIcon active={selectedCategory === 'Electric'} /> },
    ];

    return (
        <View style={s.screen}>
            <StatusBar barStyle="dark-content" backgroundColor={WHITE} />

            {/* ── Top Header Bar ── */}
            <View style={s.header}>
                <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
                    <Text style={s.backArrow}>←</Text>
                </TouchableOpacity>
                <View style={s.headerTitleContainer}>
                    <Text style={s.headerTitle}>Search Results</Text>
                    <Text style={s.headerSubtitle}>{getFormattedDateRange()}</Text>
                </View>
                <View style={{ width: wp(36) }} />
            </View>

            {/* ── Categories Scrolling Selector ── */}
            <View style={s.categoriesArea}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.categoriesScroll}>
                    {categories.map((cat) => {
                        const active = selectedCategory === cat.name;
                        return (
                            <TouchableOpacity
                                key={cat.name}
                                style={[s.catCard, active && s.catCardActive]}
                                onPress={() => setSelectedCategory(cat.name)}
                                activeOpacity={0.8}
                            >
                                {cat.icon}
                                <Text style={[s.catText, active && s.catTextActive]}>{cat.name}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            <Animated.ScrollView 
                showsVerticalScrollIndicator={false} 
                contentContainerStyle={s.scrollContainer}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                scrollEventThrottle={1}
                decelerationRate="normal"
                overScrollMode="never"
            >
     {/*--------------- serch card -----------------> */}
                {/* ── Search Summary Criteria Card ──
                <View style={s.summaryCard}>
                    <View style={s.summaryRow}>
                        <View style={s.summaryCol}>
                            <View style={s.bulletLabelRow}>
                                <View style={[s.bullet, { backgroundColor: GREEN }]} />
                                <Text style={s.bulletLabel}>Pick-up</Text>
                            </View>
                            <Text style={s.locationVal} numberOfLines={1} ellipsizeMode="tail">{fromLocation}</Text>
                            <Text style={s.dateTimeVal}>24 May, 10:00 AM</Text>
                        </View>

                        <View style={s.swapCol}>
                            <TouchableOpacity style={s.swapCircleBtn} activeOpacity={0.8}>
                                <SwapIcon />
                            </TouchableOpacity>
                        </View>

                        <View style={s.summaryCol}>
                            <View style={s.bulletLabelRow}>
                                <View style={[s.bullet, { backgroundColor: RED }]} />
                                <Text style={s.bulletLabel}>Drop-off</Text>
                            </View>
                            <Text style={s.locationVal} numberOfLines={1} ellipsizeMode="tail">{toLocation}</Text>
                            <Text style={s.dateTimeVal}>26 May, 10:00 AM</Text>
                        </View>

                        <TouchableOpacity style={s.editSearchBtn} activeOpacity={0.7} onPress={() => navigation.navigate('Search')}>
                            <PencilIcon />
                            <Text style={s.editSearchTxt}>Edit Search</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                ── */}



                <View style={s.resultsMetaRow}>
                    <Text style={s.resultsCount}>{filteredCars.length} Cars Found</Text>
                </View>

                {/* ── Trip Summary Card ── */}
                <View style={s.tripSummaryCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {/* Blue circle road icon */}
                        <View style={s.tripRoadCircle}>
                            <Text style={s.tripRoadIcon}>🛣️</Text>
                        </View>
                        
                        <View style={{ flex: 1, paddingLeft: wp(10) }}>
                            <Text style={s.tripSummaryTitle}>Trip Summary</Text>
                            
                            <View style={s.tripStatsRow}>
                                {/* Distance */}
                                <View style={s.tripStatCol}>
                                    <View style={s.tripLabelRow}>
                                        <Text style={s.tripStatIcon}>📍</Text>
                                        <Text style={s.tripStatLabel}>Distance</Text>
                                    </View>
                                    <Text style={s.tripStatVal}>{distanceKm} KM</Text>
                                </View>
                                
                                <View style={s.tripVerticalDivider} />
                                
                                {/* Duration */}
                                <View style={s.tripStatCol}>
                                    <View style={s.tripLabelRow}>
                                        <Text style={s.tripStatIcon}>🕒</Text>
                                        <Text style={s.tripStatLabel}>Duration</Text>
                                    </View>
                                    <Text style={s.tripStatVal}>{duration}</Text>
                                </View>
                            </View>
                            
                            <Text style={s.tripSubtitle}>One-way trip • Toll & taxes extra</Text>
                        </View>
                    </View>
                </View>

                {/* ── Car Results Cards List (Swift Dzire Design) ── */}
                <View style={s.cardsList}>
                    {loading ? (
                        <View style={{ paddingVertical: wp(40), alignItems: 'center', justifyContent: 'center' }}>
                            <ActivityIndicator size="large" color={BLUE} />
                            <Text style={{ marginTop: wp(10), color: GRAY, fontSize: fs(14), fontWeight: '600' }}>Searching cars...</Text>
                        </View>
                    ) : filteredCars.length === 0 ? (
                        <View style={{ paddingVertical: wp(40), alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontSize: fs(28), color: GRAY, marginBottom: wp(8) }}>🚗💨</Text>
                            <Text style={{ color: NAVY, fontSize: fs(15), fontWeight: '700' }}>No cars found for this route.</Text>
                            <Text style={{ color: GRAY, fontSize: fs(12), marginTop: wp(4) }}>Try changing your pickup or drop locations.</Text>
                        </View>
                    ) : (
                        filteredCars.map((item, idx) => {
                        const isFav = favorites.includes(item.id);
                        return (
                            <AnimCarCard key={item.id} index={idx} scrollY={scrollY}>
                                <TouchableOpacity 
                                    style={s.carCard} 
                                    activeOpacity={0.95}
                                    onPress={() => navigation.navigate('CarDetails', { 
                                        carId: item.id,
                                        distance: item.distance,
                                        duration: item.duration,
                                        estimatedFare: item.totalPrice,
                                        pickup: fromLocation,
                                        drop: toLocation,
                                        womenSafety: route.params?.womenSafety || false,
                                    })}
                                >
                                
                                {/* Left Section: Image Panel */}
                                <View style={s.carLeftSection}>
                                    <Image source={item.image} style={s.carImg} resizeMode="cover" />
                                    {item.dealBadge && (
                                        <View style={s.dealBadge}>
                                            <Text style={s.dealBadgeTxt}>{item.dealBadge}</Text>
                                        </View>
                                    )}
                                    <TouchableOpacity onPress={() => toggleFavorite(item.id)} activeOpacity={0.7} style={s.favCardBtn}>
                                        <Text style={[s.heartCardTxt, isFav && s.heartCardTxtActive]}>
                                            {isFav ? '♥' : '♡'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Right Section: Content & Fare Info */}
                                <View style={s.carRightSection}>
                                    <View style={s.rightTopDetails}>
                                        {/* Top Row: Location & Rating */}
                                        <View style={s.cardTitleFavRow}>
                                            <View style={s.locMarkerRow}>
                                                <Text style={s.locIcon}>📍</Text>
                                                <Text style={s.locText}>{item.location}</Text>
                                            </View>
                                            <View style={s.ratingRow}>
                                                <Text style={s.ratingStar}>★</Text>
                                                <Text style={s.ratingVal}>{item.rating}</Text>
                                                <Text style={s.tripsVal}>({item.trips})</Text>
                                            </View>
                                        </View>

                                        {/* Name & Class info */}
                                        <Text style={s.carTitleText}>{item.name}</Text>
                                        <Text style={s.carSubTitleText}>{item.brand} • {item.classType}</Text>

                                        {/* Spec Badges rounded outline buttons */}
                                        <View style={s.specsRow}>
                                            <View style={s.specBadgeItem}>
                                                <Text style={s.specEmoji}>👥</Text>
                                                <Text style={s.specBadgeText}>{item.seats} Seats</Text>
                                            </View>
                                            <View style={s.specBadgeItem}>
                                                <Text style={s.specEmoji}>⛽</Text>
                                                <Text style={s.specBadgeText}>{item.fuel}</Text>
                                            </View>
                                            <View style={s.specBadgeItem}>
                                                <Text style={s.specEmoji}>⚙️</Text>
                                                <Text style={s.specBadgeText}>{item.transmission}</Text>
                                            </View>
                                            <View style={s.specBadgeItem}>
                                                <Text style={s.specEmoji}>₹</Text>
                                                <Text style={s.specBadgeText}>{item.ratePerKm}</Text>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Divider Line */}
                                    <View style={s.cardDivider} />

                                    {/* Bottom Info Row & Fare Block */}
                                    <View style={s.bottomStatsRow}>
                                        <View style={s.statsGroup}>
                                            <View style={s.statCol}>
                                                <Text style={s.statLabel}>RATE</Text>
                                                <Text style={s.statVal}>{item.ratePerKm}</Text>
                                            </View>
                                        </View>

                                        {/* Vertical separator */}
                                        <View style={s.verticalDivider} />

                                        {/* Fare Block & Action Button */}
                                        <View style={s.fareBlock}>
                                            <Text style={s.fareLabel}>ESTIMATED FARE</Text>
                                            <Text style={s.fareVal}>{item.estimatedFare}</Text>
                                            <TouchableOpacity 
                                                style={s.bookNowBtn} 
                                                activeOpacity={0.8}
                                                onPress={() => navigation.navigate('CarDetails', { 
                                                    carId: item.id,
                                                    distance: item.distance,
                                                    duration: item.duration,
                                                    estimatedFare: item.totalPrice,
                                                    pickup: fromLocation,
                                                    drop: toLocation,
                                                    womenSafety: route.params?.womenSafety || false,
                                                })}
                                            >
                                                <Text style={s.bookNowBtnTxt}>Book Now  &gt;</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                                </TouchableOpacity>
                            </AnimCarCard>
                        );
                    })
                )}
                </View>


            </Animated.ScrollView>

            {/* Bottom Nav bar fixed at bottom */}
            <BottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        </View>
    );
}

const s = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#F3F4F6' },
    scrollContainer: { flexGrow: 1 },
    
    // Header Bar
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: wp(16),
        paddingTop: (StatusBar.currentHeight || wp(16)) + wp(8),
        paddingBottom: wp(12),
        backgroundColor: WHITE,
    },
    backBtn: {
        width: wp(36),
        height: wp(36),
        alignItems: 'center',
        justifyContent: 'center',
    },
    backArrow: {
        fontSize: fs(24),
        color: NAVY,
        fontWeight: 'bold',
    },
    headerTitleContainer: {
        flex: 1,
        paddingLeft: wp(8),
    },
    headerTitle: {
        fontSize: fs(18),
        fontWeight: '800',
        color: NAVY,
    },
    headerSubtitle: {
        fontSize: fs(11),
        color: GRAY,
        fontWeight: '600',
        marginTop: wp(1),
    },
    headerRightActions: {
        flexDirection: 'row',
        gap: wp(8),
    },
    headerActionCircle: {
        width: wp(36),
        height: wp(36),
        borderRadius: wp(18),
        borderWidth: 1,
        borderColor: BORDER,
        backgroundColor: WHITE,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    filterBadge: {
        position: 'absolute',
        top: -wp(4),
        right: -wp(4),
        width: wp(16),
        height: wp(16),
        borderRadius: wp(8),
        backgroundColor: BLUE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterBadgeTxt: {
        fontSize: fs(9),
        fontWeight: '800',
        color: WHITE,
    },

    // Summary Card
    summaryCard: {
        backgroundColor: '#F1F5FD',
        marginHorizontal: wp(6),
        marginVertical: wp(12),
        borderRadius: wp(16),
        paddingVertical: wp(12),
        paddingHorizontal: wp(6),
    },
    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    summaryCol: {
        flex: 2.0,
        gap: wp(2),
        flexShrink: 1,
        overflow: 'hidden',
    },
    bulletLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(4),
    },
    bullet: {
        width: wp(6),
        height: wp(6),
        borderRadius: wp(3),
    },
    bulletLabel: {
        fontSize: fs(10),
        color: GRAY,
        fontWeight: '600',
    },
    locationVal: {
        fontSize: fs(13),
        fontWeight: '800',
        color: NAVY,
        flexShrink: 1,
    },
    dateTimeVal: {
        fontSize: fs(10),
        color: GRAY,
        fontWeight: '500',
    },
    swapCol: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: wp(2),
    },
    swapCircleBtn: {
        width: wp(28),
        height: wp(28),
        borderRadius: wp(14),
        borderWidth: 1,
        borderColor: BORDER,
        backgroundColor: WHITE,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },
    editSearchBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderLeftWidth: 1,
        borderColor: '#CBD5E1',
        paddingLeft: wp(8),
        paddingRight: wp(4),
        gap: wp(4),
        flexShrink: 0,
    },
    editSearchTxt: {
        fontSize: fs(9),
        color: BLUE,
        fontWeight: '700',
    },

    // Categories area
    categoriesArea: {
        backgroundColor: WHITE,
        paddingVertical: wp(12),
        borderBottomWidth: 1,
        borderColor: BORDER,
    },
    categoriesScroll: {
        paddingHorizontal: wp(16),
        gap: wp(10),
    },
    catCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(8),
        paddingHorizontal: wp(14),
        paddingVertical: wp(10),
        borderRadius: wp(12),
        borderWidth: 1,
        borderColor: BORDER,
        backgroundColor: WHITE,
    },
    catCardActive: {
        backgroundColor: BLUE_LIGHT,
        borderColor: BLUE,
    },
    catText: {
        fontSize: fs(12),
        fontWeight: '700',
        color: GRAY,
    },
    catTextActive: {
        color: BLUE,
    },

    // Sort Row
    sortRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingHorizontal: wp(16),
        paddingTop: wp(14),
        gap: wp(6),
    },
    sortByLabel: {
        fontSize: fs(11),
        color: GRAY,
        fontWeight: '600',
    },
    dropdownBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: BORDER,
        borderRadius: wp(10),
        paddingHorizontal: wp(10),
        paddingVertical: wp(6),
        backgroundColor: WHITE,
    },
    dropdownTxt: {
        fontSize: fs(11),
        fontWeight: '700',
        color: NAVY,
    },
    dropdownChevron: {
        fontSize: fs(10),
        color: GRAY,
        fontWeight: 'bold',
    },

    // Results Summary Meta
    resultsMetaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: wp(16),
        paddingTop: wp(12),
        paddingBottom: wp(8),
    },
    resultsCount: {
        fontSize: fs(14),
        fontWeight: '800',
        color: NAVY,
    },
    verifiedRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(4),
    },
    verifiedCheck: {
        fontSize: fs(12),
    },
    verifiedText: {
        fontSize: fs(10.5),
        fontWeight: '700',
        color: GREEN,
    },

    // Cars List
    cardsList: {
        paddingHorizontal: wp(6),
        gap: wp(14),
    },
    carCard: {
        backgroundColor: '#FAF9F6', // Mockup background
        borderRadius: wp(16),
        borderWidth: 1,
        borderColor: BORDER,
        flexDirection: 'row',
        overflow: 'hidden',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: wp(4) },
        shadowOpacity: 0.02,
        shadowRadius: wp(10),
        elevation: 2,
    },
    carLeftSection: {
        width: wp(145),
        height: '100%',
        minHeight: wp(124),
        position: 'relative',
    },
    dealBadge: {
        position: 'absolute',
        top: wp(8),
        left: wp(8),
        backgroundColor: '#F59E0B', // Mockup Gold Badge
        paddingHorizontal: wp(8),
        paddingVertical: wp(4),
        borderRadius: wp(12),
        zIndex: 5,
    },
    dealBadgeTxt: {
        fontSize: fs(9),
        fontWeight: '800',
        color: WHITE,
    },
    carImg: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    favCardBtn: {
        position: 'absolute',
        top: wp(8),
        right: wp(8),
        backgroundColor: '#1E293BCC', // Translucent overlay
        width: wp(28),
        height: wp(28),
        borderRadius: wp(14),
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5,
    },
    heartCardTxt: {
        fontSize: fs(15),
        color: WHITE,
    },
    heartCardTxtActive: {
        color: RED,
    },

    // Right details container
    carRightSection: {
        flex: 1,
        paddingLeft: wp(12),
        paddingVertical: wp(6),
        paddingRight: wp(10),
    },
    rightTopDetails: {
        flex: 1,
    },
    locMarkerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(2),
    },
    locIcon: {
        fontSize: fs(12),
    },
    locText: {
        fontSize: fs(11),
        fontWeight: '700',
        color: TEAL,
    },
    cardTitleFavRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: wp(2),
    },
    carTitleText: {
        fontSize: fs(17),
        fontWeight: '800',
        color: TEAL,
        marginTop: wp(1),
    },
    carSubTitleText: {
        fontSize: fs(11),
        color: GRAY,
        fontWeight: '500',
        marginTop: wp(1),
        marginBottom: wp(6),
    },
    specsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: wp(6),
        marginVertical: wp(2),
    },
    specBadgeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(3),
        backgroundColor: WHITE,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: wp(16),
        paddingHorizontal: wp(8),
        paddingVertical: wp(4),
    },
    specEmoji: {
        fontSize: fs(10),
    },
    specBadgeText: {
        fontSize: fs(9.5),
        color: GRAY,
        fontWeight: '700',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(2),
    },
    ratingStar: {
        fontSize: fs(12),
        color: GOLD,
    },
    ratingVal: {
        fontSize: fs(11.5),
        fontWeight: '800',
        color: NAVY,
    },
    tripsVal: {
        fontSize: fs(10),
        color: GRAY,
        fontWeight: '500',
    },

    // Divider Line
    cardDivider: {
        height: 1,
        backgroundColor: '#E2E8F0',
        marginVertical: wp(4),
    },

    // Bottom Stats & Fare row
    bottomStatsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    statsGroup: {
        flexDirection: 'row',
        flex: 1.6,
        justifyContent: 'space-between',
        paddingRight: wp(4),
    },
    statCol: {
        gap: wp(1),
    },
    statLabel: {
        fontSize: fs(7),
        fontWeight: '800',
        color: GRAY,
    },
    statVal: {
        fontSize: fs(9.5),
        fontWeight: '900',
        color: NAVY,
    },
    verticalDivider: {
        width: 1,
        height: wp(24),
        backgroundColor: '#E2E8F0',
        marginHorizontal: wp(8),
    },
    fareBlock: {
        width: wp(82),
        alignItems: 'center',
        justifyContent: 'center',
    },
    fareLabel: {
        fontSize: fs(7.5),
        fontWeight: '800',
        color: GRAY,
        textAlign: 'center',
    },
    fareVal: {
        fontSize: fs(16),
        fontWeight: '900',
        color: NAVY,
        marginVertical: wp(1),
    },
    bookNowBtn: {
        backgroundColor: BLUE,
        paddingHorizontal: wp(10),
        paddingVertical: wp(5),
        borderRadius: wp(10),
        width: '95%',
        alignItems: 'center',
    },
    bookNowBtnTxt: {
        fontSize: fs(9.5),
        fontWeight: '800',
        color: WHITE,
    },

    // Trust Section
    trustSection: {
        flexDirection: 'row',
        backgroundColor: WHITE,
        marginTop: wp(20),
        paddingVertical: wp(14),
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: BORDER,
    },
    trustItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: wp(3),
    },
    trustIconBg: {
        width: wp(32),
        height: wp(32),
        borderRadius: wp(16),
        backgroundColor: BLUE_LIGHT,
        alignItems: 'center',
        justifyContent: 'center',
    },
    trustIcon: {
        fontSize: fs(14),
    },
    trustTitle: {
        fontSize: fs(10),
        fontWeight: '800',
        color: NAVY,
    },
    trustDesc: {
        fontSize: fs(9),
        color: GRAY,
        fontWeight: '600',
    },
    tripSummaryCard: {
        backgroundColor: WHITE,
        marginHorizontal: wp(6),
        marginTop: wp(4),
        marginBottom: wp(12),
        borderRadius: wp(16),
        borderWidth: 1,
        borderColor: BORDER,
        padding: wp(12),
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 5,
        elevation: 1,
    },
    tripRoadCircle: {
        width: wp(40),
        height: wp(40),
        borderRadius: wp(20),
        backgroundColor: '#EFF6FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tripRoadIcon: {
        fontSize: fs(18),
    },
    tripSummaryTitle: {
        fontSize: fs(12.5),
        fontWeight: '800',
        color: NAVY,
        marginBottom: wp(6),
    },
    tripStatsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: wp(6),
    },
    tripStatCol: {
        flex: 1,
    },
    tripLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(3),
        marginBottom: wp(2),
    },
    tripStatIcon: {
        fontSize: fs(11),
        color: BLUE,
        fontWeight: 'bold',
    },
    tripStatLabel: {
        fontSize: fs(9.5),
        color: GRAY,
        fontWeight: '600',
    },
    tripStatVal: {
        fontSize: fs(11),
        fontWeight: '800',
        color: NAVY,
        paddingLeft: wp(14),
    },
    tripVerticalDivider: {
        width: 1,
        height: wp(24),
        backgroundColor: BORDER,
        marginHorizontal: wp(4),
    },
    tripSubtitle: {
        fontSize: fs(9),
        color: GRAY,
        fontWeight: '500',
    },
});
