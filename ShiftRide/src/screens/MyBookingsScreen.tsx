import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    Image,
    Dimensions,
    PixelRatio,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { BottomNavigation } from '../components/bottomnavigation';
import api, { getCarImageUrl } from '../services/api';
import { isDarkMode, subscribeThemeChange } from '../services/theme';

const { width } = Dimensions.get('window');
const BASE_W = 375;
const wp = (px: number) => Math.round(PixelRatio.roundToNearestPixel((px / BASE_W) * width));
const fs = (px: number) => Math.round(PixelRatio.roundToNearestPixel((px / BASE_W) * width));

const NAVY = '#0F172A';
const GRAY = '#64748B';
const WHITE = '#FFFFFF';
const BLUE = '#1A6BFF';
const BORDER = '#E2E8F0';
const BG = '#F8FAFC';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Booking {
    id: string;
    carName: string;
    classType: string;
    pricePerDay: string;
    status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
    fromLoc: string;
    fromDate: string;
    toLoc: string;
    toDate: string;
    passengers: number;
    duration: string;
    distance: string;
    totalAmount: string;
    image: any;
}

const BOOKINGS_DATA: Booking[] = [
    {
        id: 'SR12345',
        carName: 'BMW 3 Series',
        classType: 'Luxury Sedan',
        pricePerDay: '$68',
        status: 'Upcoming',
        fromLoc: 'Mumbai',
        fromDate: '24 May 2025, 10:00 AM',
        toLoc: 'Pune',
        toDate: '26 May 2025, 10:00 AM',
        passengers: 2,
        duration: '2 Days',
        distance: '149 km',
        totalAmount: '$136',
        image: require('../assets/images/banner_car.png'),
    },
    {
        id: 'SR12320',
        carName: 'Tesla Model 3',
        classType: 'Electric Sedan',
        pricePerDay: '$79',
        status: 'Ongoing',
        fromLoc: 'Pune',
        fromDate: '22 May 2025, 09:00 AM',
        toLoc: 'Mumbai',
        toDate: '24 May 2025, 09:00 AM',
        passengers: 2,
        duration: '2 Days',
        distance: '143 km',
        totalAmount: '$158',
        image: require('../assets/images/slide1_car.png'),
    },
    {
        id: 'SR12210',
        carName: 'Toyota Fortuner',
        classType: 'SUV',
        pricePerDay: '$72',
        status: 'Completed',
        fromLoc: 'Hyderabad',
        fromDate: '10 May 2025, 08:00 AM',
        toLoc: 'Vijayawada',
        toDate: '11 May 2025, 06:00 PM',
        passengers: 4,
        duration: '1 Day',
        distance: '158 km',
        totalAmount: '$144',
        image: require('../assets/images/banner_car.png'),
    },
];

const FILTERS = ['All', 'Upcoming', 'Ongoing', 'Completed', 'Cancelled'];

export default function MyBookingsScreen() {
    const navigation = useNavigation<NavigationProp>();
    const [activeFilter, setActiveFilter] = useState('All');
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
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

    useEffect(() => {
        const fetchMyBookings = async () => {
            try {
                setLoading(true);
                const response = await api.get('/bookings/mybookings');
                if (response && Array.isArray(response.data)) {
                    // Map API responses to UI fields
                    const mapped = response.data.map((item: any) => {
                        // Map status strings
                        let uiStatus: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled' = 'Upcoming';
                        const st = String(item.status || '').toUpperCase();
                        if (st === 'COMPLETED' || st === 'DELIVERED') {
                            uiStatus = 'Completed';
                        } else if (st === 'CANCELLED') {
                            uiStatus = 'Cancelled';
                        } else if (st === 'ONGOING' || st === 'IN_PROGRESS') {
                            uiStatus = 'Ongoing';
                        }

                        // Format dates
                        const formatDateStr = (dateStr: string) => {
                            if (!dateStr) return '-';
                            const d = new Date(dateStr);
                            if (Number.isNaN(d.getTime())) return dateStr;
                            return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                        };

                        return {
                            id: item.id || item._id,
                            carName: item.car_id?.name || item.car_id?.model_name || 'Car',
                            classType: item.car_id?.brand || 'Premium Car',
                            pricePerDay: `₹${item.rate_per_day || 0}`,
                            status: uiStatus,
                            fromLoc: item.pickup_location || 'Pune',
                            fromDate: formatDateStr(item.start_date),
                            toLoc: item.drop_location || 'Mumbai',
                            toDate: formatDateStr(item.end_date),
                            passengers: item.car_id?.seats || 5,
                            duration: item.distance_km ? `${item.distance_km} KM` : '2 Days',
                            distance: item.distance_km ? `${item.distance_km} KM` : '150 KM',
                            totalAmount: `₹${item.total_amount || 0}`,
                            image: item.car_id?.cars_image 
                                ? { uri: getCarImageUrl(item.car_id.cars_image) } 
                                : require('../assets/images/banner_car.png')
                        };
                    });
                    setBookings(mapped);
                }
            } catch (err) {
                console.error("Failed to load user bookings:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMyBookings();
    }, []);

    const filteredBookings = bookings.filter(booking => {
        if (activeFilter === 'All') return true;
        return booking.status === activeFilter;
    });

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Upcoming':
                return { bg: '#EFF6FF', text: '#3B82F6' };
            case 'Ongoing':
                return { bg: '#ECFDF5', text: '#10B981' };
            case 'Completed':
                return { bg: '#F1F5F9', text: '#64748B' };
            default:
                return { bg: '#FEF2F2', text: '#EF4444' };
        }
    };

    return (
        <View style={[s.screen, { backgroundColor: theme.bg }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={isDark ? NAVY : WHITE} />

            {/* Header */}
            <View style={[s.header, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                <TouchableOpacity style={[s.circleBtn, { backgroundColor: theme.cardBg, borderColor: theme.border }]} onPress={() => navigation.goBack()}>
                    <Text style={[s.backIcon, { color: theme.textMain }]}>←</Text>
                </TouchableOpacity>
                <Text style={[s.headerTitle, { color: theme.textMain }]}>My Bookings</Text>
                <View style={{ width: wp(36) }} />
            </View>

            {/* Filter Tabs */}
            <View style={[s.filterRow, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                <FlatList
                    data={FILTERS}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={item => item}
                    contentContainerStyle={{ paddingHorizontal: wp(16) }}
                    renderItem={({ item }) => {
                        const isActive = activeFilter === item;
                        return (
                            <TouchableOpacity
                                style={[s.filterTab, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }, isActive && s.filterTabActive]}
                                onPress={() => setActiveFilter(item)}
                            >
                                <Text style={[s.filterText, { color: isDark ? '#94A3B8' : GRAY }, isActive && s.filterTextActive]}>{item}</Text>
                            </TouchableOpacity>
                        );
                    }}
                />
            </View>

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={BLUE} />
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
                    {filteredBookings.length === 0 ? (
                        <View style={{ paddingVertical: wp(60), alignItems: 'center' }}>
                            <Text style={{ fontSize: fs(14), color: theme.textSub, fontWeight: '600' }}>No Bookings Found</Text>
                        </View>
                    ) : (
                        filteredBookings.map((item) => {
                            const statusTheme = getStatusStyle(item.status);
                            return (
                                <TouchableOpacity key={item.id} style={[s.card, { backgroundColor: theme.cardBg, borderColor: theme.border }]} activeOpacity={0.9} onPress={() => navigation.navigate('BookingDetails', { bookingId: item.id })}>
                                    {/* Card Header Info */}
                                    <View style={s.cardHeader}>
                                        <View style={[s.statusBadge, { backgroundColor: statusTheme.bg }]}>
                                            <Text style={[s.statusTxt, { color: statusTheme.text }]}>● {item.status}</Text>
                                        </View>
                                        <Text style={[s.bookingId, { color: theme.textSub }]}>Booking ID <Text style={{ color: theme.textMain }}>#{item.id.slice(-6).toUpperCase()}</Text></Text>
                                    </View>

                                    {/* Car main details */}
                                    <View style={s.carDetailsRow}>
                                        <Image source={typeof item.image === 'object' ? item.image : item.image} style={s.carImg} resizeMode="contain" />
                                        <View style={{ flex: 1, paddingLeft: wp(12) }}>
                                            <Text style={[s.carName, { color: theme.textMain }]}>{item.carName}</Text>
                                            <Text style={[s.classType, { color: theme.textSub }]}>{item.classType}</Text>
                                            
                                            {/* Route points */}
                                            <View style={s.routeBlock}>
                                                <View style={{ alignItems: 'center' }}>
                                                    <View style={s.greenDot} />
                                                    <View style={[s.dotLine, isDark && { backgroundColor: '#475569' }]} />
                                                    <View style={s.redDot} />
                                                </View>
                                                <View style={{ gap: wp(4) }}>
                                                    <Text style={s.routeText}>
                                                        <Text style={{ fontWeight: '700', color: theme.textMain }}>{item.fromLoc}</Text>
                                                        <Text style={{ color: theme.textSub }}> ({item.fromDate})</Text>
                                                    </Text>
                                                    <Text style={s.routeText}>
                                                        <Text style={{ fontWeight: '700', color: theme.textMain }}>{item.toLoc}</Text>
                                                        <Text style={{ color: theme.textSub }}> ({item.toDate})</Text>
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                        <View style={{ alignItems: 'flex-end' }}>
                                            <Text style={[s.priceTxt, { color: theme.textMain }]}>{item.pricePerDay}</Text>
                                            <Text style={[s.perDay, { color: theme.textSub }]}>/ day</Text>
                                        </View>
                                    </View>

                                    {/* Spec Row */}
                                    <View style={s.specRow}>
                                        <View style={s.specItem}>
                                            <Text style={s.specIcon}>👤</Text>
                                            <View>
                                                <Text style={[s.specValLabel, { color: theme.textSub }]}>Passengers</Text>
                                                <Text style={[s.specVal, { color: theme.textMain }]}>{item.passengers}</Text>
                                            </View>
                                        </View>
                                        <View style={s.specItem}>
                                            <Text style={s.specIcon}>📅</Text>
                                            <View>
                                                <Text style={[s.specValLabel, { color: theme.textSub }]}>Duration</Text>
                                                <Text style={[s.specVal, { color: theme.textMain }]}>{item.duration}</Text>
                                            </View>
                                        </View>
                                        <View style={s.specItem}>
                                            <Text style={s.specIcon}>📍</Text>
                                            <View>
                                                <Text style={[s.specValLabel, { color: theme.textSub }]}>Distance</Text>
                                                <Text style={[s.specVal, { color: theme.textMain }]}>{item.distance}</Text>
                                            </View>
                                        </View>
                                        <View style={s.specItem}>
                                            <Text style={s.specIcon}>💳</Text>
                                            <View>
                                                <Text style={[s.specValLabel, { color: theme.textSub }]}>Total Amount</Text>
                                                <Text style={[s.specVal, { color: theme.textMain }]}>{item.totalAmount}</Text>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Action Buttons */}
                                    <View style={s.btnRow}>
                                        <TouchableOpacity 
                                            style={[s.detailsBtn, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]}
                                            onPress={() => navigation.navigate('BookingDetails', { bookingId: item.id })}
                                        >
                                            <Text style={[s.detailsBtnTxt, { color: theme.textMain }]}>👁️ View Details</Text>
                                        </TouchableOpacity>

                                        {item.status === 'Upcoming' && (
                                            <TouchableOpacity style={s.primaryBtn}>
                                                <Text style={s.primaryBtnTxt}>Manage Booking ›</Text>
                                            </TouchableOpacity>
                                        )}
                                        {item.status === 'Ongoing' && (
                                            <TouchableOpacity style={s.outlineBtn}>
                                                <Text style={s.outlineBtnTxt}>📞 Contact Support</Text>
                                            </TouchableOpacity>
                                        )}

                                    </View>
                                </TouchableOpacity>
                            );
                        })
                    )}
                    <View style={{ height: wp(40) }} />
                </ScrollView>
            )}
            <BottomNavigation activeTab={1} setActiveTab={() => {}} />
        </View>
    );
}

const s = StyleSheet.create({
    screen: { flex: 1, backgroundColor: BG },
    scrollContent: { paddingHorizontal: wp(16), paddingTop: wp(8) },
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
    filterIcon: {
        fontSize: fs(16),
    },
    headerTitle: {
        fontSize: fs(16),
        fontWeight: '800',
        color: NAVY,
    },
    filterRow: {
        backgroundColor: WHITE,
        paddingVertical: wp(10),
        borderBottomWidth: 1,
        borderColor: BORDER,
    },
    filterTab: {
        paddingHorizontal: wp(16),
        paddingVertical: wp(8),
        borderRadius: wp(20),
        marginRight: wp(8),
        backgroundColor: '#F1F5F9',
    },
    filterTabActive: {
        backgroundColor: BLUE,
    },
    filterText: {
        fontSize: fs(12),
        fontWeight: '700',
        color: GRAY,
    },
    filterTextActive: {
        color: WHITE,
    },
    card: {
        backgroundColor: WHITE,
        borderRadius: wp(16),
        padding: wp(16),
        marginVertical: wp(8),
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: wp(4) },
        shadowOpacity: 0.02,
        shadowRadius: wp(8),
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: wp(12),
    },
    statusBadge: {
        paddingHorizontal: wp(8),
        paddingVertical: wp(4),
        borderRadius: wp(8),
    },
    statusTxt: {
        fontSize: fs(10.5),
        fontWeight: '800',
    },
    bookingId: {
        fontSize: fs(11),
        fontWeight: '700',
        color: GRAY,
    },
    carDetailsRow: {
        flexDirection: 'row',
        marginBottom: wp(16),
    },
    carImg: {
        width: wp(100),
        height: wp(70),
    },
    carName: {
        fontSize: fs(14),
        fontWeight: '800',
        color: NAVY,
    },
    classType: {
        fontSize: fs(11),
        color: GRAY,
        fontWeight: '600',
        marginBottom: wp(6),
    },
    priceTxt: {
        fontSize: fs(15),
        fontWeight: '800',
        color: BLUE,
    },
    perDay: {
        fontSize: fs(10),
        color: GRAY,
        fontWeight: '600',
    },
    routeBlock: {
        flexDirection: 'row',
        gap: wp(8),
        alignItems: 'center',
        marginTop: wp(4),
    },
    greenDot: {
        width: wp(6),
        height: wp(6),
        borderRadius: wp(3),
        backgroundColor: '#10B981',
    },
    dotLine: {
        width: 1,
        height: wp(12),
        backgroundColor: BORDER,
    },
    redDot: {
        width: wp(6),
        height: wp(6),
        borderRadius: wp(3),
        backgroundColor: '#EF4444',
    },
    routeText: {
        fontSize: fs(10.5),
    },
    specRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#F1F5F9',
        paddingVertical: wp(10),
        marginBottom: wp(14),
    },
    specItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(4),
    },
    specIcon: {
        fontSize: fs(14),
    },
    specValLabel: {
        fontSize: fs(9),
        color: GRAY,
        fontWeight: '600',
    },
    specVal: {
        fontSize: fs(10),
        fontWeight: '800',
        color: NAVY,
    },
    btnRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailsBtn: {
        paddingVertical: wp(8),
    },
    detailsBtnTxt: {
        fontSize: fs(12),
        fontWeight: '800',
        color: BLUE,
    },
    primaryBtn: {
        backgroundColor: BLUE,
        paddingHorizontal: wp(16),
        paddingVertical: wp(8),
        borderRadius: wp(10),
    },
    primaryBtnTxt: {
        fontSize: fs(12),
        fontWeight: '800',
        color: WHITE,
    },
    outlineBtn: {
        borderWidth: 1.5,
        borderColor: BLUE,
        paddingHorizontal: wp(16),
        paddingVertical: wp(8),
        borderRadius: wp(10),
    },
    outlineBtnTxt: {
        fontSize: fs(12),
        fontWeight: '800',
        color: BLUE,
    },
});
