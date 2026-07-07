import React, { useRef, useEffect, useState } from 'react';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { BottomNavigation } from '../components/bottomnavigation';
import { isDarkMode, subscribeThemeChange } from '../services/theme';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Image,
    Animated,
    PixelRatio,
    Dimensions,
    TextInput,
    FlatList,
} from 'react-native';

// ─── Responsive Helpers ─────────────────────────────────────────────────────
const { width } = Dimensions.get('window');
const BASE_W = 375;
const wp = (px: number) => (px / BASE_W) * width;
const fs = (px: number) =>
    Math.round(PixelRatio.roundToNearestPixel((px / BASE_W) * width));

// ─── Theme ──────────────────────────────────────────────────────────────────
const NAVY = '#12183D';
const BLUE = '#1A6BFF';
const GRAY = '#8A94A6';
const GRAY_LT = '#F2F4F8';
const WHITE = '#FFFFFF';
const BORDER = '#EAEDF4';
const BG = '#FAFBFF';
const CHIP_BG = '#F0F2F8';

// ─── Brands ─────────────────────────────────────────────────────────────────
const BRANDS = [
    { id: '1', name: 'Mercedes', abbr: 'M', },
    { id: '2', name: 'Tesla', abbr: 'T', },
    { id: '3', name: 'BMW', abbr: 'BMW', },
    { id: '4', name: 'Toyota', abbr: 'TY', },
    { id: '5', name: 'Volvo', abbr: 'V', },
    { id: '6', name: 'Bugatti', abbr: 'BG', },
    { id: '7', name: 'Honda', abbr: 'H', },
    { id: '8', name: 'More', abbr: '···', },
];

const FILTERS = ['All', 'Mercedes', 'Tesla', 'BMW', 'Audi'];

const TOP_DEALS = [
    {
        id: '1', name: 'BMW M5 Competition', brand: 'BMW',
        price: '$95', rating: '4.9', reviews: '246+',
        seats: '5', trans: 'Auto', fuel: 'Petrol',
        tag: 'HOT DEAL', tagColor: '#FF5A5A',
        image: require('../assets/images/banner_car.png'),
    },
    {
        id: '2', name: 'Tesla Model S', brand: 'Tesla',
        price: '$110', rating: '4.8', reviews: '198+',
        seats: '5', trans: 'Auto', fuel: 'Electric',
        tag: 'NEW', tagColor: '#00C48C',
        image: require('../assets/images/banner_car.png'),
    },
    {
        id: '3', name: 'Mercedes C-Class', brand: 'Mercedes',
        price: '$85', rating: '4.7', reviews: '164+',
        seats: '4', trans: 'Auto', fuel: 'Petrol',
        tag: 'BEST PRICE', tagColor: '#6C63FF',
        image: require('../assets/images/banner_car.png'),
    },
];

const REVIEWS = [
    {
        id: '1',
        name: 'Sarah Connor',
        avatar: 'SC',
        rating: '5.0',
        comment: 'Amazing experience! The BMW M5 was in pristine condition. Highly recommended!',
        date: '2 days ago',
    },
    {
        id: '2',
        name: 'John Doe',
        avatar: 'JD',
        rating: '4.8',
        comment: 'Very easy pickup and dropoff. The Tesla Model S was absolute bliss to drive.',
        date: '1 week ago',
    },
    {
        id: '3',
        name: 'Michael Scott',
        avatar: 'MS',
        rating: '5.0',
        comment: 'Best rental service ever. Smooth booking, pristine cars, and great prices!',
        date: '2 weeks ago',
    },
];

// ─── HomeScreen ─────────────────────────────────────────────────────────────
const HomeScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [search, setSearch] = useState('');
    const [activeFilter, setFilter] = useState(0);
    const [activeTab, setActiveTab] = useState(1);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(16)).current;
    const isFocused = useIsFocused();
    const [isDark, setIsDark] = useState(isDarkMode());

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 150, friction: 15, useNativeDriver: true }),
        ]).start();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

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



    return (
        <View style={[s.screen, { backgroundColor: theme.bg }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={theme.bg} />

            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={s.bodyContent}
                style={[s.body, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
            >
                {/* ── Header ── */}
                <View style={s.header}>
                    <View style={s.greetRow}>
                        {/* Avatar */}
                        <View style={s.avatar}>
                            <Text style={s.avatarTxt}>AA</Text>
                        </View>
                        <View style={s.greetText}>
                            <Text style={[s.greetSub, { color: theme.textSub }]}>Good Morning  🌤</Text>
                            <Text style={[s.greetName, { color: theme.textMain }]}>Andrew Ainsley</Text>
                        </View>
                    </View>
                    <View style={s.headerActions}>
                        <TouchableOpacity style={[s.iconBtn, isDark && { borderColor: theme.border, backgroundColor: theme.cardBg }]} activeOpacity={0.75}>
                            {/* Bell */}
                            <View style={s.bellWrap}>
                                <View style={[s.bellTop, isDark && { backgroundColor: WHITE }]} />
                                <View style={[s.bellMid, isDark && { backgroundColor: WHITE }]} />
                                <View style={[s.bellBot, isDark && { backgroundColor: WHITE }]} />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={[s.iconBtn, isDark && { borderColor: theme.border, backgroundColor: theme.cardBg }]} activeOpacity={0.75}>
                            {/* Heart outline */}
                            <Text style={[s.heartOutline, { color: theme.textMain }]}>♡</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ── Search ── */}
                <View style={s.searchRow}>
                    <View style={[s.searchBox, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
                        {/* magnify icon */}
                        <View style={s.magnify}>
                            <View style={[s.magnifyRing, isDark && { borderColor: WHITE }]} />
                            <View style={[s.magnifyHandle, isDark && { backgroundColor: WHITE }]} />
                        </View>
                        <TextInput
                            style={[s.searchInput, { color: theme.textMain }]}
                            placeholder="Search"
                            placeholderTextColor={theme.textSub}
                            value={search}
                            onChangeText={setSearch}
                            onFocus={() => {
                                navigation.navigate('Search');
                            }}
                        />
                    </View>
                    <TouchableOpacity style={[s.filterIcon, isDark && { backgroundColor: '#334155', borderColor: '#334155' }]} activeOpacity={0.8}>
                        <View style={s.filterLines}>
                            <View style={[s.fLine, isDark && { backgroundColor: WHITE }]} />
                            <View style={[s.fLine, { width: wp(12) }, isDark && { backgroundColor: WHITE }]} />
                            <View style={[s.fLine, { width: wp(8) }, isDark && { backgroundColor: WHITE }]} />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* ── Special Offers ── */}
                <View style={s.section}>
                    <View style={s.sectionRow}>
                        <Text style={[s.sectionTitle, { color: theme.textMain }]}>Special Offers</Text>
                        <TouchableOpacity><Text style={[s.seeAll, { color: theme.textSub }]}>See All</Text></TouchableOpacity>
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

                {/* ── Brands Grid ── */}
                <View style={s.section}>
                    <View style={s.brandsGrid}>
                        {BRANDS.map(b => (
                            <TouchableOpacity key={b.id} style={s.brandCell} activeOpacity={0.75}>
                                <View style={[s.brandCircle, isDark && { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                                    <Text style={[s.brandAbbr, { color: theme.textMain }]}>{b.abbr}</Text>
                                </View>
                                <Text style={[s.brandName, { color: theme.textSub }]}>{b.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* ── Top Deals ── */}
                <View style={s.section}>
                    <View style={s.sectionRow}>
                        <Text style={[s.sectionTitle, { color: theme.textMain }]}>Top Deals</Text>
                        <TouchableOpacity><Text style={[s.seeAll, { color: theme.textSub }]}>See All</Text></TouchableOpacity>
                    </View>

                    {/* Filter Chips */}
                    <FlatList
                        data={FILTERS}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(_, i) => String(i)}
                        contentContainerStyle={s.filtersRow}
                        renderItem={({ item, index }) => (
                            <TouchableOpacity
                                style={[s.chip, { backgroundColor: isDark ? '#334155' : CHIP_BG }, activeFilter === index && s.chipActive]}
                                onPress={() => setFilter(index)}
                                activeOpacity={0.8}
                            >
                                <Text style={[s.chipTxt, { color: theme.textSub }, activeFilter === index && s.chipTxtActive]}>
                                    {item}
                                </Text>
                            </TouchableOpacity>
                        )}
                    />

                    {/* Deal Cards — horizontal scroll photo cards */}
                    <FlatList
                        data={TOP_DEALS}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={d => d.id}
                        contentContainerStyle={s.dealScrollRow}
                        renderItem={({ item: deal }) => (
                            <TouchableOpacity style={[s.dealCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]} activeOpacity={0.92}>
                                {/* Background photo */}
                                <Image
                                    source={deal.image}
                                    style={s.dealCardBg}
                                    resizeMode="cover"
                                />
                                {/* Dark gradient overlay */}
                                <View style={s.dealCardOverlay} />

                                {/* Tag badge top-left */}
                                <View style={[s.dealTag, { backgroundColor: deal.tagColor }]}>
                                    <Text style={s.dealTagTxt}>{deal.tag}</Text>
                                </View>

                                {/* Heart top-right */}
                                <TouchableOpacity style={s.dealHeart}>
                                    <Text style={s.dealHeartIcon}>♡</Text>
                                </TouchableOpacity>

                                {/* Bottom content */}
                                <View style={s.dealBottom}>
                                    <Text style={[s.dealName, { color: theme.textMain }]} numberOfLines={1}>{deal.name}</Text>

                                    {/* Specs row */}
                                    <View style={s.dealSpecsRow}>
                                        <Text style={[s.dealSpec, { color: theme.textSub }]}>⭐ {deal.rating} ({deal.reviews})</Text>
                                        <Text style={s.dealSpecDot}> · </Text>
                                        <Text style={[s.dealSpec, { color: theme.textSub }]}>💺 {deal.seats}</Text>
                                        <Text style={s.dealSpecDot}> · </Text>
                                        <Text style={[s.dealSpec, { color: theme.textSub }]}>⚙ {deal.trans}</Text>
                                        <Text style={s.dealSpecDot}> · </Text>
                                        <Text style={[s.dealSpec, { color: theme.textSub }]}>⛽ {deal.fuel}</Text>
                                    </View>

                                    {/* Price + View Details */}
                                    <View style={s.dealPriceRow}>
                                        <View>
                                            <Text style={[s.dealPrice, { color: theme.textMain }]}>{deal.price}<Text style={[s.dealPer, { color: theme.textSub }]}>/day</Text></Text>
                                        </View>
                                        <TouchableOpacity style={s.viewDetailsBtn}>
                                            <Text style={s.viewDetailsTxt}>View Details</Text>
                                            <View style={s.viewDetailsArrow}>
                                                <Text style={s.viewDetailsArrowTxt}>›</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                </View>

                {/* ── Customer Reviews Section ── */}
                <View style={s.section}>
                    <View style={s.sectionRow}>
                        <Text style={[s.sectionTitle, { color: theme.textMain }]}>What Our Customers Say ⭐</Text>
                    </View>
                    <FlatList
                        data={REVIEWS}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={item => item.id}
                        contentContainerStyle={s.reviewsScroll}
                        renderItem={({ item }) => (
                            <View style={[s.reviewCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                                <View style={s.reviewHeader}>
                                    <View style={s.reviewUser}>
                                        <View style={s.reviewAvatar}>
                                            <Text style={s.reviewAvatarTxt}>{item.avatar}</Text>
                                        </View>
                                        <View>
                                            <Text style={[s.reviewName, { color: theme.textMain }]}>{item.name}</Text>
                                            <Text style={[s.reviewDate, { color: theme.textSub }]}>{item.date}</Text>
                                        </View>
                                    </View>
                                    <View style={s.reviewRatingContainer}>
                                        <Text style={s.reviewRatingTxt}>⭐ {item.rating}</Text>
                                    </View>
                                </View>
                                <Text style={[s.reviewComment, { color: theme.textSub }]} numberOfLines={3}>
                                    "{item.comment}"
                                </Text>
                            </View>
                        )}
                    />
                </View>

                <View style={{ height: wp(24) }} />
            </Animated.ScrollView>

            {/* ── Bottom Nav Component ── */}
            <BottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        </View>
    );
};

// ─── Luxury Car Silhouette ─────────────────────────────────────────────────
const LuxuryCarSilhouette = () => {
    const CAR_COLOR = '#1A1C2A';
    const GLASS = 'rgba(160,200,240,0.55)';
    const CHROME = '#9BB0C8';
    const WHEEL_D = '#222230';
    const HUB = '#BBC8D8';
    const LIGHT_F = '#E8F4FF';
    const LIGHT_R = '#FF6060';
    return (
        <View style={{ width: wp(155), height: wp(90), position: 'relative', justifyContent: 'flex-end' }}>
            {/* Ground shadow */}
            <View style={{ position: 'absolute', bottom: -wp(2), left: wp(10), right: wp(10), height: wp(8), borderRadius: wp(40), backgroundColor: 'rgba(0,0,0,0.12)' }} />

            {/* ── Car body lower (main hull) ── */}
            <View style={{
                position: 'absolute', bottom: wp(12), left: wp(4), right: wp(4),
                height: wp(34), borderRadius: wp(6),
                backgroundColor: CAR_COLOR,
            }} />

            {/* ── Car body upper (cabin) ── */}
            <View style={{
                position: 'absolute', bottom: wp(38), left: wp(26), right: wp(22),
                height: wp(26),
                borderTopLeftRadius: wp(12), borderTopRightRadius: wp(18),
                backgroundColor: CAR_COLOR,
            }} />

            {/* ── Windshield ── */}
            <View style={{
                position: 'absolute', bottom: wp(39), left: wp(28), width: wp(28), height: wp(21),
                borderTopLeftRadius: wp(10), borderTopRightRadius: wp(4),
                backgroundColor: GLASS,
            }} />

            {/* ── Rear window ── */}
            <View style={{
                position: 'absolute', bottom: wp(39), right: wp(25), width: wp(22), height: wp(19),
                borderTopRightRadius: wp(14), borderTopLeftRadius: wp(2),
                backgroundColor: GLASS,
            }} />

            {/* ── Side window strip ── */}
            <View style={{
                position: 'absolute', bottom: wp(43), left: wp(56), right: wp(47),
                height: wp(9),
                backgroundColor: GLASS,
            }} />

            {/* ── Front bumper / hood accent ── */}
            <View style={{
                position: 'absolute', bottom: wp(37), left: wp(4), width: wp(30), height: wp(9),
                borderTopLeftRadius: wp(4), borderBottomLeftRadius: wp(2),
                backgroundColor: '#252738',
            }} />

            {/* ── Rear bumper accent ── */}
            <View style={{
                position: 'absolute', bottom: wp(37), right: wp(4), width: wp(26), height: wp(9),
                borderTopRightRadius: wp(6), borderBottomRightRadius: wp(2),
                backgroundColor: '#252738',
            }} />

            {/* ── Headlight (front) ── */}
            <View style={{
                position: 'absolute', bottom: wp(22), left: wp(4), width: wp(18), height: wp(5),
                borderRadius: wp(2), backgroundColor: LIGHT_F,
                shadowColor: LIGHT_F, shadowRadius: 4, shadowOpacity: 0.9,
            }} />
            <View style={{
                position: 'absolute', bottom: wp(17), left: wp(4), width: wp(10), height: wp(3),
                borderRadius: wp(1.5), backgroundColor: CHROME,
            }} />

            {/* ── Tail light (rear) ── */}
            <View style={{
                position: 'absolute', bottom: wp(22), right: wp(4), width: wp(14), height: wp(5),
                borderRadius: wp(2), backgroundColor: LIGHT_R,
                shadowColor: LIGHT_R, shadowRadius: 3, shadowOpacity: 0.8,
            }} />

            {/* ── Door seam line ── */}
            <View style={{
                position: 'absolute', bottom: wp(28), left: wp(36), right: wp(36),
                height: wp(1), backgroundColor: 'rgba(255,255,255,0.15)',
            }} />

            {/* ── Chrome side strip ── */}
            <View style={{
                position: 'absolute', bottom: wp(23), left: wp(14), right: wp(14),
                height: wp(2), backgroundColor: CHROME, opacity: 0.6,
                borderRadius: wp(1),
            }} />

            {/* ── Front Wheel ── */}
            <View style={{
                position: 'absolute', bottom: wp(4), left: wp(18),
                width: wp(26), height: wp(26), borderRadius: wp(13),
                backgroundColor: WHEEL_D,
                borderWidth: 2.5, borderColor: CHROME,
                alignItems: 'center', justifyContent: 'center',
            }}>
                <View style={{ width: wp(12), height: wp(12), borderRadius: wp(6), backgroundColor: HUB }} />
                {/* Spokes */}
                {[0, 60, 120, 180, 240, 300].map(deg => (
                    <View key={deg} style={{
                        position: 'absolute', width: wp(10), height: wp(2),
                        backgroundColor: HUB, borderRadius: 1, opacity: 0.7,
                        transform: [{ rotate: `${deg}deg` }],
                    }} />
                ))}
            </View>

            {/* ── Rear Wheel ── */}
            <View style={{
                position: 'absolute', bottom: wp(4), right: wp(18),
                width: wp(26), height: wp(26), borderRadius: wp(13),
                backgroundColor: WHEEL_D,
                borderWidth: 2.5, borderColor: CHROME,
                alignItems: 'center', justifyContent: 'center',
            }}>
                <View style={{ width: wp(12), height: wp(12), borderRadius: wp(6), backgroundColor: HUB }} />
                {[0, 60, 120, 180, 240, 300].map(deg => (
                    <View key={deg} style={{
                        position: 'absolute', width: wp(10), height: wp(2),
                        backgroundColor: HUB, borderRadius: 1, opacity: 0.7,
                        transform: [{ rotate: `${deg}deg` }],
                    }} />
                ))}
            </View>

            {/* ── Roof glare highlight ── */}
            <View style={{
                position: 'absolute', bottom: wp(58), left: wp(36), width: wp(28), height: wp(5),
                borderRadius: wp(3), backgroundColor: 'rgba(255,255,255,0.1)',
                transform: [{ rotate: '-5deg' }],
            }} />
        </View>
    );
};

// ─── Nav Icons Helper ───────────────────────────────────────────────────────
const ic = (active?: boolean) => active ? NAVY : GRAY;

export default HomeScreen;

// ─── Styles ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    screen: { flex: 1, backgroundColor: BG },
    body: { flex: 1 },
    bodyContent: { paddingTop: wp(52) },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: wp(18),
        marginBottom: wp(16),
    },
    greetRow: { flexDirection: 'row', alignItems: 'center', gap: wp(12) },
    avatar: {
        width: wp(44),
        height: wp(44),
        borderRadius: wp(22),
        backgroundColor: '#C8D8FF',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#A0B8F0',
    },
    avatarTxt: { fontSize: fs(13), fontWeight: '900', color: NAVY },
    greetText: { gap: wp(2) },
    greetSub: { fontSize: fs(12), color: GRAY, fontWeight: '500' },
    greetName: { fontSize: fs(17), fontWeight: '800', color: NAVY },
    headerActions: { flexDirection: 'row', gap: wp(8) },
    iconBtn: {
        width: wp(40),
        height: wp(40),
        borderRadius: wp(20),
        borderWidth: 1.5,
        borderColor: BORDER,
        backgroundColor: WHITE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bellWrap: { alignItems: 'center', gap: wp(1) },
    bellTop: {
        width: wp(14),
        height: wp(12),
        borderTopLeftRadius: wp(7),
        borderTopRightRadius: wp(7),
        borderWidth: 2,
        borderColor: NAVY,
        borderBottomWidth: 0,
    },
    bellMid: { width: wp(18), height: wp(3), backgroundColor: NAVY, borderRadius: wp(1) },
    bellBot: { width: wp(7), height: wp(3), borderRadius: wp(2), backgroundColor: NAVY },
    heartOutline: { fontSize: fs(20), color: NAVY, lineHeight: fs(22) },

    // Search
    searchRow: {
        flexDirection: 'row',
        paddingHorizontal: wp(20),
        gap: wp(10),
        marginBottom: wp(22),
        alignItems: 'center',
    },
    searchBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: GRAY_LT,
        borderRadius: wp(14),
        paddingHorizontal: wp(14),
        height: wp(48),
        gap: wp(10),
    },
    magnify: { width: wp(18), height: wp(18), position: 'relative' },
    magnifyRing: {
        width: wp(12),
        height: wp(12),
        borderRadius: wp(6),
        borderWidth: 2,
        borderColor: GRAY,
        position: 'absolute',
        top: 0,
        left: 0,
    },
    magnifyHandle: {
        width: wp(6),
        height: wp(2),
        backgroundColor: GRAY,
        borderRadius: wp(1),
        position: 'absolute',
        bottom: wp(1),
        right: 0,
        transform: [{ rotate: '45deg' }],
    },
    searchInput: { flex: 1, fontSize: fs(14), color: NAVY, paddingVertical: 0 },
    filterIcon: {
        width: wp(48),
        height: wp(48),
        borderRadius: wp(14),
        borderWidth: 1.5,
        borderColor: BORDER,
        backgroundColor: WHITE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterLines: { gap: wp(3.5), alignItems: 'center' },
    fLine: { width: wp(18), height: wp(2), backgroundColor: NAVY, borderRadius: wp(1) },

    // Section
    section: { paddingHorizontal: wp(20), marginBottom: wp(22) },
    sectionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: wp(14),
    },
    sectionTitle: { fontSize: fs(17), fontWeight: '800', color: NAVY },
    seeAll: { fontSize: fs(13), fontWeight: '700', color: GRAY },

    // Offer Banner — Premium Hero
    offerBanner: {
        backgroundColor: '#EFF2F8',
        borderRadius: wp(20),
        overflow: 'hidden',
        height: wp(180),
        flexDirection: 'row',
        alignItems: 'flex-end',
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
    offerCarWrap: { width: 0, height: 0 },
    offerCarImage: { width: 0, height: 0 },
    // legacy unused banner pieces removed
    skylineContainer: { width: 0, height: 0 },
    building: { width: 0, height: 0 },

    // Brands Grid
    brandsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: wp(0),
        justifyContent: 'space-between',
        rowGap: wp(16),
    },
    brandCell: { width: wp(75), alignItems: 'center', gap: wp(7) },
    brandCircle: {
        width: wp(56),
        height: wp(56),
        borderRadius: wp(28),
        backgroundColor: GRAY_LT,
        borderWidth: 1,
        borderColor: BORDER,
        alignItems: 'center',
        justifyContent: 'center',
    },
    brandAbbr: { fontSize: fs(12), fontWeight: '900', color: NAVY, letterSpacing: 0.5 },
    brandName: { fontSize: fs(11), fontWeight: '600', color: NAVY },

    // Filters
    filtersRow: { gap: wp(8), paddingBottom: wp(14) },
    chip: {
        paddingHorizontal: wp(16),
        paddingVertical: wp(8),
        borderRadius: wp(50),
        backgroundColor: CHIP_BG,
        borderWidth: 1,
        borderColor: BORDER,
    },
    chipActive: { backgroundColor: NAVY, borderColor: NAVY },
    chipTxt: { fontSize: fs(13), fontWeight: '700', color: GRAY },
    chipTxtActive: { color: WHITE },

    // Deal Cards — Photo Cards
    dealScrollRow: {
        paddingHorizontal: wp(20),
        gap: wp(14),
        paddingBottom: wp(4),
    },
    dealCard: {
        width: wp(330),
        height: wp(220),
        borderRadius: wp(20),
        overflow: 'hidden',
        position: 'relative',
    },
    dealCardBg: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        width: '100%',
        height: '100%',
    },
    dealCardOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.38)',
    },
    dealTag: {
        position: 'absolute',
        top: wp(12),
        left: wp(12),
        borderRadius: wp(6),
        paddingHorizontal: wp(9),
        paddingVertical: wp(4),
    },
    dealTagTxt: { fontSize: fs(9), fontWeight: '800', color: WHITE, letterSpacing: 0.4 },
    dealHeart: {
        position: 'absolute',
        top: wp(10),
        right: wp(12),
        width: wp(32),
        height: wp(32),
        borderRadius: wp(16),
        backgroundColor: 'rgba(255,255,255,0.25)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dealHeartIcon: { fontSize: fs(16), color: WHITE },
    dealBottom: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        padding: wp(14),
        gap: wp(6),
    },
    dealName: { fontSize: fs(16), fontWeight: '900', color: WHITE },
    dealSpecsRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
    dealSpec: { fontSize: fs(9), color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
    dealSpecDot: { fontSize: fs(9), color: 'rgba(255,255,255,0.5)' },
    dealPriceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: wp(2),
    },
    dealPrice: { fontSize: fs(20), fontWeight: '900', color: WHITE },
    dealPer: { fontSize: fs(12), color: 'rgba(255,255,255,0.75)', fontWeight: '500' },
    viewDetailsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: WHITE,
        borderRadius: wp(50),
        paddingVertical: wp(7),
        paddingLeft: wp(14),
        paddingRight: wp(6),
        gap: wp(6),
    },
    viewDetailsTxt: { fontSize: fs(11), fontWeight: '700', color: NAVY },
    viewDetailsArrow: {
        width: wp(22),
        height: wp(22),
        borderRadius: wp(11),
        backgroundColor: BLUE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    viewDetailsArrowTxt: { fontSize: fs(14), color: WHITE, fontWeight: '900', marginTop: -wp(1) },
    // legacy unused styles
    dealCarWrap: { width: 0, height: 0 },
    dealCar: { width: 0 },
    dealRoof: { width: 0 },
    dealBody: { width: 0 },
    dealWheels: { width: 0 },
    dealWheel: { width: 0, height: 0 },
    dealWheelIn: { width: 0, height: 0 },
    dealInfo: { width: 0 },
    dealMeta: { width: 0 },
    starRow: { width: 0 },
    starIcon: { width: 0, height: 0 },
    dealRating: { fontSize: 0 },
    chevronWrap: { width: 0 },
    chevron: { fontSize: 0 },



    // Reviews Section Styles
    reviewsScroll: {
        gap: wp(12),
        paddingBottom: wp(4),
    },
    reviewCard: {
        width: wp(260),
        backgroundColor: WHITE,
        borderRadius: wp(16),
        padding: wp(16),
        borderWidth: 1,
        borderColor: BORDER,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: wp(2) },
        shadowOpacity: 0.04,
        shadowRadius: wp(6),
        elevation: 2,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: wp(10),
    },
    reviewUser: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(10),
    },
    reviewAvatar: {
        width: wp(36),
        height: wp(36),
        borderRadius: wp(18),
        backgroundColor: '#EFF6FF',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#DBEAFE',
    },
    reviewAvatarTxt: {
        fontSize: fs(12),
        fontWeight: '700',
        color: BLUE,
    },
    reviewName: {
        fontSize: fs(13),
        fontWeight: '700',
        color: NAVY,
    },
    reviewDate: {
        fontSize: fs(10),
        color: GRAY,
        marginTop: wp(1),
    },
    reviewRatingContainer: {
        backgroundColor: '#FFFBEB',
        borderRadius: wp(6),
        paddingHorizontal: wp(6),
        paddingVertical: wp(3),
    },
    reviewRatingTxt: {
        fontSize: fs(10),
        fontWeight: '700',
        color: '#D97706',
    },
    reviewComment: {
        fontSize: fs(12),
        color: '#4B5563',
        lineHeight: fs(18),
        fontStyle: 'italic',
    },
});
