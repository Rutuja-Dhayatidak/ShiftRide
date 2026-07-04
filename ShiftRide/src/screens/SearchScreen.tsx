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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { BottomNavigation } from '../components/bottomnavigation';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getAllCars } from '../services/Car';
import { getCarImageUrl } from '../services/api';

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
    const [date, setDate] = useState('19, Dec 2022');
    const [dayOfWeek, setDayOfWeek] = useState('Sabtu');
    const [time, setTime] = useState('10:00 AM');
    const [timeZone, setTimeZone] = useState('WIB');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [dateVal, setDateVal] = useState(new Date());
    const [timeVal, setTimeVal] = useState(new Date());
    const [isReturn, setIsReturn] = useState(false);
    const [activeTab, setActiveTab] = useState(0); // Default to Orders/Search Tab
    const [selectedVehicle, setSelectedVehicle] = useState('Mobil'); // Active vehicle state
    const [popularCars, setPopularCars] = useState<any[]>(POPULAR_CARS);

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
        fetchPopularCars();
    }, []);

    return (
        <View style={s.screen}>
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
                            <Text style={s.userGreeting}>Hello, Rio Ananda 👋</Text>
                            <Text style={s.userTitle}>Mau kemana{`\n`}kamu hari ini?</Text>
                            <View style={s.blueHighlightLine} />
                           
                        </View>

                        {/* Right Column: Avatar */}
                        <View style={s.headerRightCol}>
                            {/* Rounded avatar */}
                            <View style={s.avatarContainer}>
                                <View style={s.avatar}>
                                    <Text style={s.avatarTxt}>RA</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </Animated.View>

                <Animated.View style={{ opacity: contentFade, transform: [{ translateY: contentSlide }] }}>
                    {/* ── Floating Booking Form Card ── */}
                    <View style={s.formContainer}>
                    <View style={s.bookingCard}>
                        {/* Unified Destination Box */}
                        <View style={s.destinationBox}>
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
                                        style={[s.destTitle, { padding: 0 }]}
                                        value={fromLoc}
                                        onChangeText={setFromLoc}
                                        placeholder="Enter Location"
                                        placeholderTextColor={GRAY}
                                    />
                                   
                                </View>
                            </View>

                            {/* Separator Line */}
                            <View style={s.horizontalDivider} />

                            {/* To Row */}
                            <View style={s.destinationRow}>
                                <View style={[s.iconWrapper, { backgroundColor: '#E8FDF0' }]}>
                                    <Text style={[s.iconMarker, { color: '#10B981' }]}>📍</Text>
                                </View>
                                <View style={s.destTextCol}>
                                    <Text style={[s.destLabel, { color: '#10B981' }]}>TO</Text>
                                    <TextInput
                                        style={[s.destTitle, { padding: 0 }]}
                                        value={toLoc}
                                        onChangeText={setToLoc}
                                        placeholder="Enter destination"
                                        placeholderTextColor={GRAY}
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
                                        <Text style={s.dateMainText}>{date}</Text>
                                        <Text style={s.dateSubText}>{dayOfWeek}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>

                            {/* Vertical divider */}
                            <View style={s.verticalDivider} />

                            <TouchableOpacity
                                style={s.dateCol}
                                activeOpacity={0.7}
                                onPress={() => setShowTimePicker(true)}
                            >
                                <Text style={[s.inputLabel, { color: '#6C63FF' }]}>TIME</Text>
                                <View style={s.inputRow}>
                                    <View style={[s.iconWrapper, { backgroundColor: '#ECE9FE' }]}><Text style={s.inputIcon}>🕒</Text></View>
                                    <View>
                                        <Text style={s.dateMainText}>{time}</Text>
                                        <Text style={s.dateSubText}>{timeZone}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>

                            {/* Vertical divider */}
                            <View style={s.verticalDivider} />

                            <View style={s.toggleContainer}>
                                <Text style={s.toggleLabel}>Return?</Text>
                                <Switch
                                    value={isReturn}
                                    onValueChange={setIsReturn}
                                    trackColor={{ false: '#CBD5E1', true: BLUE }}
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

                        {/* Cari (Search) Button */}
                        <TouchableOpacity
                            style={s.cariBtn}
                            activeOpacity={0.9}
                            onPress={() => {
                                navigation.navigate('CarResults', {
                                    fromLoc: fromLoc,
                                    toLoc: toLoc,
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
                        <Text style={s.sectionTitle}>Special Offers</Text>
                        <TouchableOpacity><Text style={s.seeAll}>See All</Text></TouchableOpacity>
                    </View>

                    {/* Offer Banner — Premium Hero Style */}
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
                </View>
                {/* ── Top Brands ── */}
                <View style={{ marginBottom: wp(22) }}>
                    <View style={[s.sectionRow, { paddingHorizontal: wp(20) }]}>
                        <Text style={s.sectionTitle}>Top Brands</Text>
                        <TouchableOpacity><Text style={s.seeAll}>See All</Text></TouchableOpacity>
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={s.brandsHorizontalScroll}
                    >
                        {BRANDS_DATA.map((b, idx) => (
                            <TouchableOpacity key={b.id} style={[s.brandItem, idx === 0 && { marginLeft: wp(20) }]} activeOpacity={0.75}>
                                <View style={s.brandIconCircle}>
                                    <Text style={s.brandIconText}>{b.icon}</Text>
                                </View>
                                <Text style={s.brandNameLabel}>{b.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* ── Popular Cars ── */}
                <View style={{ marginBottom: wp(30) }}>
                    <View style={[s.sectionRow, { paddingHorizontal: wp(20) }]}>
                        <Text style={s.sectionTitle}>Popular Cars</Text>
                        <TouchableOpacity><Text style={s.seeAll}>See All</Text></TouchableOpacity>
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={s.carsHorizontalScroll}
                    >
                        {popularCars.map((car, idx) => (
                            <View key={car.id} style={[s.carCard, idx === 0 && { marginLeft: wp(20) }]}>
                                {/* Image Wrapper with light background */}
                                <View style={s.carImageWrapper}>
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
                                <Text style={s.carCardTitle}>{car.name}</Text>
                                <Text style={s.carCardSubtitle}>{car.type}</Text>

                                {/* Rating Row */}
                                <View style={s.ratingContainer}>
                                    <Text style={s.ratingText}>⭐ {car.rating}</Text>
                                    <Text style={s.tripsText}>({car.trips} trips)</Text>
                                </View>

                                {/* Price & Book Now Row */}
                                <View style={s.priceBookRow}>
                                    <Text style={s.carPrice}>
                                        {car.price}
                                        <Text style={s.carPerDay}> / day</Text>
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
                        <Text style={s.sectionTitle}>Top Routes</Text>
                        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: wp(4) }}>
                            <Text style={[s.seeAll, { color: BLUE }]}>Explore All</Text>
                            <Text style={{ color: BLUE, fontSize: fs(12), fontWeight: '700' }}> ›</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingRight: wp(20), gap: wp(14) }}
                    >
                        {ROUTES_DATA.map((route, idx) => (
                            <View key={route.id} style={[s.routeCard, idx === 0 && { marginLeft: wp(20) }]}>
                                <Image
                                    source={route.image}
                                    style={s.routeImage}
                                    resizeMode="cover"
                                />

                                {/* Pins with Curved/Dashed Line */}
                                <View style={s.routePinsRow}>
                                    <Text style={s.routePinIcon}>📍</Text>
                                    <View style={s.routeDashLine} />
                                    <Text style={s.routePinIcon}>📍</Text>
                                </View>

                                {/* Route Names */}
                                <View style={s.routeNamesRow}>
                                    <Text style={s.routeName}>{route.from}</Text>
                                    <Text style={s.routeName}>{route.to}</Text>
                                </View>

                                {/* Distance Badge */}
                                <View style={s.routeDistanceBadge}>
                                    <Text style={s.routeDistanceText}>{route.distance}</Text>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* ── Safety Banner ── */}
                <View style={s.safetyBanner}>
                    {/* Left: Premium Check Icon */}
                    <View style={s.safetyIconCircle}>
                        <View style={s.safetyBlueBadge}>
                            <Text style={s.safetyCheckSymbol}>✓</Text>
                        </View>
                    </View>

                    {/* Middle: Content */}
                    <View style={s.safetyContent}>
                        <Text style={s.safetyTitle}>Safe. Reliable. Always.</Text>
                        <Text style={s.safetyDesc}>Well-maintained cars & verified partners for your peace of mind.</Text>
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
                    <Text style={[s.sectionTitle, { marginBottom: wp(18) }]}>Why Choose ShiftRide?</Text>

                    <View style={s.featuresRow}>
                        <View style={s.featureItem}>
                            <View style={s.featureIconWrapper}>
                                <Text style={s.featureIcon}>🎖️</Text>
                            </View>
                            <Text style={s.featureTitle}>Best Prices</Text>
                            <Text style={s.featureSubtitle}>Guaranteed</Text>
                        </View>

                        <View style={s.featureItem}>
                            <View style={s.featureIconWrapper}>
                                <Text style={s.featureIcon}>🚗</Text>
                            </View>
                            <Text style={s.featureTitle}>Wide Range</Text>
                            <Text style={s.featureSubtitle}>Of Cars</Text>
                        </View>

                        <View style={s.featureItem}>
                            <View style={s.featureIconWrapper}>
                                <Text style={s.featureIcon}>🎧</Text>
                            </View>
                            <Text style={s.featureTitle}>24/7 Support</Text>
                            <Text style={s.featureSubtitle}>We're here</Text>
                        </View>

                        <View style={s.featureItem}>
                            <View style={s.featureIconWrapper}>
                                <Text style={s.featureIcon}>🛡️</Text>
                            </View>
                            <Text style={s.featureTitle}>Secure Booking</Text>
                            <Text style={s.featureSubtitle}>100% Safe</Text>
                        </View>
                    </View>
                </View>
            </Animated.View>

            <View style={{ height: wp(40) }} />
        </ScrollView>

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
    brandsHorizontalScroll: {
        paddingRight: wp(20),
        gap: wp(16),
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
        width: wp(56),
        height: wp(56),
        borderRadius: wp(18),
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: wp(10),
        backgroundColor: '#EFF6FF',
    },
    featureIcon: {
        fontSize: fs(24),
    },
    featureTitle: {
        fontSize: fs(11),
        fontWeight: '800',
        color: NAVY,
        textAlign: 'center',
    },
    featureSubtitle: {
        fontSize: fs(9),
        color: GRAY,
        fontWeight: '600',
        marginTop: wp(2),
        textAlign: 'center',
    },
});

export default SearchScreen;
