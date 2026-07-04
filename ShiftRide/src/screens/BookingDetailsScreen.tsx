import React from 'react';
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
const BLUE = '#1A6BFF';
const BORDER = '#E2E8F0';
const BG = '#F8FAFC';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type BookingDetailsRouteProp = RouteProp<RootStackParamList, 'BookingDetails'>;

interface BookingDetail {
    id: string;
    carName: string;
    classType: string;
    pricePerDay: string;
    totalDaysAmount: string;
    status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
    fromLoc: string;
    fromDate: string;
    fromAddress: string;
    toLoc: string;
    toDate: string;
    toAddress: string;
    passengers: number;
    duration: string;
    distance: string;
    bookingDate: string;
    image: any;
    ratePerKm: string;
    baseFare: string;
    platformFee: string;
    gst: string;
    totalAmount: string;
    paymentMethod: string;
    cardLast4: string;
}

const DETAIL_DATA: Record<string, BookingDetail> = {
    'SR12345': {
        id: 'SR12345',
        carName: 'BMW 3 Series',
        classType: 'Luxury Sedan',
        pricePerDay: '$68',
        totalDaysAmount: '$136',
        status: 'Upcoming',
        fromLoc: 'Mumbai',
        fromDate: '24 May 2025, 10:00 AM',
        fromAddress: 'Andheri West, Mumbai, Maharashtra 400058',
        toLoc: 'Pune',
        toDate: '26 May 2025, 10:00 AM',
        toAddress: 'Hinjewadi, Pune, Maharashtra 411057',
        passengers: 2,
        duration: '2 Days',
        distance: '149 km',
        bookingDate: '22 May 2025',
        image: require('../assets/images/banner_car.png'),
        ratePerKm: '₹13 / km',
        baseFare: '₹1,950',
        platformFee: '₹195',
        gst: '₹351',
        totalAmount: '₹2,496',
        paymentMethod: 'Paid Online',
        cardLast4: '4242',
    },
    'SR12320': {
        id: 'SR12320',
        carName: 'Tesla Model 3',
        classType: 'Electric Sedan',
        pricePerDay: '$79',
        totalDaysAmount: '$158',
        status: 'Ongoing',
        fromLoc: 'Pune',
        fromDate: '22 May 2025, 09:00 AM',
        fromAddress: 'Hinjewadi, Pune, Maharashtra 411057',
        toLoc: 'Mumbai',
        toDate: '24 May 2025, 09:00 AM',
        toAddress: 'Andheri West, Mumbai, Maharashtra 400058',
        passengers: 2,
        duration: '2 Days',
        distance: '143 km',
        bookingDate: '20 May 2025',
        image: require('../assets/images/slide1_car.png'),
        ratePerKm: '₹14 / km',
        baseFare: '₹2,002',
        platformFee: '₹200',
        gst: '₹360',
        totalAmount: '₹2,562',
        paymentMethod: 'Paid Online',
        cardLast4: '1099',
    },
    'SR12210': {
        id: 'SR12210',
        carName: 'Toyota Fortuner',
        classType: 'SUV',
        pricePerDay: '$72',
        totalDaysAmount: '$144',
        status: 'Completed',
        fromLoc: 'Hyderabad',
        fromDate: '10 May 2025, 08:00 AM',
        fromAddress: 'Gachibowli, Hyderabad, Telangana 500032',
        toLoc: 'Vijayawada',
        toDate: '11 May 2025, 06:00 PM',
        toAddress: 'Benz Circle, Vijayawada, Andhra Pradesh 520010',
        passengers: 4,
        duration: '1 Day',
        distance: '158 km',
        bookingDate: '08 May 2025',
        image: require('../assets/images/banner_car.png'),
        ratePerKm: '₹22 / km',
        baseFare: '₹3,476',
        platformFee: '₹348',
        gst: '₹626',
        totalAmount: '₹4,450',
        paymentMethod: 'Paid Online',
        cardLast4: '5566',
    },
};

export default function BookingDetailsScreen() {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<BookingDetailsRouteProp>();
    const bookingId = route.params?.bookingId || 'SR12345';

    const detail = DETAIL_DATA[bookingId] || DETAIL_DATA['SR12345'];

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

    const statusTheme = getStatusStyle(detail.status);

    return (
        <View style={s.screen}>
            <StatusBar barStyle="dark-content" backgroundColor={WHITE} />

            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity style={s.circleBtn} onPress={() => navigation.goBack()}>
                    <Text style={s.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={s.headerTitle}>Booking Details</Text>
                <TouchableOpacity style={s.circleBtn}>
                    <Text style={s.moreIcon}>•••</Text>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
                {/* Main Card */}
                <View style={s.card}>
                    <View style={s.cardHeader}>
                        <View style={[s.statusBadge, { backgroundColor: statusTheme.bg }]}>
                            <Text style={[s.statusTxt, { color: statusTheme.text }]}>● {detail.status}</Text>
                        </View>
                        <Text style={s.bookingId}>Booking ID <Text style={{ color: NAVY }}>#{detail.id}</Text></Text>
                    </View>

                    <View style={s.carDetailsRow}>
                        <Image source={detail.image} style={s.carImg} resizeMode="contain" />
                        <View style={{ flex: 1, paddingLeft: wp(12) }}>
                            <Text style={s.carName}>{detail.carName}</Text>
                            <Text style={s.classType}>{detail.classType}</Text>
                            <Text style={s.priceTxt}>
                                {detail.pricePerDay} <Text style={s.perDay}>/ day</Text>
                            </Text>
                            <Text style={s.totalDaysVal}>Total Amount: <Text style={{ color: BLUE }}>{detail.totalDaysAmount}</Text></Text>
                        </View>
                    </View>

                    {/* Specs Row */}
                    <View style={s.specRow}>
                        <View style={s.specItem}>
                            <Text style={s.specIcon}>👤</Text>
                            <View>
                                <Text style={s.specValLabel}>Passengers</Text>
                                <Text style={s.specVal}>{detail.passengers}</Text>
                            </View>
                        </View>
                        <View style={s.specItem}>
                            <Text style={s.specIcon}>📅</Text>
                            <View>
                                <Text style={s.specValLabel}>Duration</Text>
                                <Text style={s.specVal}>{detail.duration}</Text>
                            </View>
                        </View>
                        <View style={s.specItem}>
                            <Text style={s.specIcon}>📍</Text>
                            <View>
                                <Text style={s.specValLabel}>Distance</Text>
                                <Text style={s.specVal}>{detail.distance}</Text>
                            </View>
                        </View>
                        <View style={s.specItem}>
                            <Text style={s.specIcon}>⏱️</Text>
                            <View>
                                <Text style={s.specValLabel}>Booking Date</Text>
                                <Text style={s.specVal}>{detail.bookingDate}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Pick-up / Drop-off details card */}
                <View style={s.card}>
                    {/* Pick up */}
                    <View style={s.routeDetailItem}>
                        <View style={s.routeLeftColumn}>
                            <View style={s.greenDotLarge} />
                            <View style={s.routeDotLine} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={s.routeHeadingGreen}>Pick-up</Text>
                            <Text style={s.routeLocName}>{detail.fromLoc}</Text>
                            <View style={s.timeRow}>
                                <Text style={s.timeIcon}>🕒</Text>
                                <Text style={s.timeText}>{detail.fromDate}</Text>
                            </View>
                            <Text style={s.addressText}>{detail.fromAddress}</Text>
                        </View>
                        <TouchableOpacity style={[s.mapCircle, s.mapCircleGreen]}>
                            <Text style={s.mapArrowGreen}>➦</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Drop off */}
                    <View style={[s.routeDetailItem, { marginTop: wp(16) }]}>
                        <View style={s.routeLeftColumn}>
                            <View style={s.redDotLarge} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={s.routeHeadingRed}>Drop-off</Text>
                            <Text style={s.routeLocName}>{detail.toLoc}</Text>
                            <View style={s.timeRow}>
                                <Text style={s.timeIcon}>🕒</Text>
                                <Text style={s.timeText}>{detail.toDate}</Text>
                            </View>
                            <Text style={s.addressText}>{detail.toAddress}</Text>
                        </View>
                        <TouchableOpacity style={[s.mapCircle, s.mapCircleRed]}>
                            <Text style={s.mapArrowRed}>➦</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Trip Summary Card */}
                <View style={s.card}>
                    <Text style={s.sectionTitle}>Trip Summary</Text>
                    <View style={s.summaryRow}>
                        <Text style={s.summaryLabel}>Billing Type</Text>
                        <Text style={s.summaryVal}>Per KM</Text>
                    </View>
                    <View style={s.summaryRow}>
                        <Text style={s.summaryLabel}>Rate (per km)</Text>
                        <Text style={s.summaryVal}>{detail.ratePerKm}</Text>
                    </View>
                    <View style={s.summaryRow}>
                        <Text style={s.summaryLabel}>Distance (Billed)</Text>
                        <Text style={s.summaryVal}>{detail.distance}</Text>
                    </View>
                    <View style={s.summaryRow}>
                        <Text style={s.summaryLabel}>Duration</Text>
                        <Text style={s.summaryVal}>{detail.duration}</Text>
                    </View>

                    <View style={s.dashedLine} />

                    <View style={s.summaryRow}>
                        <Text style={s.summaryLabel}>Base Fare</Text>
                        <Text style={s.summaryVal}>{detail.baseFare}</Text>
                    </View>
                    <View style={s.summaryRow}>
                        <Text style={s.summaryLabel}>Platform Fee (10%)</Text>
                        <Text style={s.summaryVal}>{detail.platformFee}</Text>
                    </View>
                    <View style={s.summaryRow}>
                        <Text style={s.summaryLabel}>GST (18%)</Text>
                        <Text style={s.summaryVal}>{detail.gst}</Text>
                    </View>

                    <View style={s.dashedLine} />

                    <View style={s.summaryRow}>
                        <Text style={s.totalAmountLabel}>Total Amount</Text>
                        <Text style={s.totalAmountVal}>{detail.totalAmount}</Text>
                    </View>
                </View>

                {/* Payment Details Card */}
                <View style={s.card}>
                    <Text style={s.sectionTitle}>Payment Details</Text>
                    <View style={s.paymentRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(8) }}>
                            <View style={s.cardIconBox}>
                                <Text style={s.cardIcon}>💳</Text>
                            </View>
                            <View>
                                <Text style={s.paymentMethodName}>{detail.paymentMethod}</Text>
                                <Text style={s.cardNo}>Visa •••• {detail.cardLast4}</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(8) }}>
                            <View style={s.paidBadge}>
                                <Text style={s.paidBadgeText}>Paid</Text>
                            </View>
                            <Text style={s.paidAmount}>{detail.totalAmount}</Text>
                        </View>
                    </View>
                </View>

                <View style={{ height: wp(120) }} />
            </ScrollView>

            {/* Bottom Buttons */}
            <View style={s.bottomContainer}>
                <TouchableOpacity style={s.downloadBtn}>
                    <Text style={s.downloadBtnTxt}>📥 Download Invoice</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.supportBtn}>
                    <Text style={s.supportBtnTxt}>🎧 Contact Support</Text>
                </TouchableOpacity>
            </View>
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
    moreIcon: {
        fontSize: fs(14),
        fontWeight: 'bold',
        color: NAVY,
    },
    headerTitle: {
        fontSize: fs(16),
        fontWeight: '800',
        color: NAVY,
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
        width: wp(110),
        height: wp(75),
    },
    carName: {
        fontSize: fs(14.5),
        fontWeight: '800',
        color: NAVY,
    },
    classType: {
        fontSize: fs(11),
        color: GRAY,
        fontWeight: '600',
        marginBottom: wp(4),
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
    totalDaysVal: {
        fontSize: fs(10.5),
        color: GRAY,
        fontWeight: '600',
        marginTop: wp(4),
    },
    specRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderColor: '#F1F5F9',
        paddingTop: wp(12),
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
    routeDetailItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    routeLeftColumn: {
        alignItems: 'center',
        width: wp(20),
        marginRight: wp(8),
        paddingTop: wp(4),
    },
    greenDotLarge: {
        width: wp(10),
        height: wp(10),
        borderRadius: wp(5),
        backgroundColor: '#10B981',
    },
    redDotLarge: {
        width: wp(10),
        height: wp(10),
        borderRadius: wp(5),
        backgroundColor: '#EF4444',
    },
    routeDotLine: {
        width: 2,
        height: wp(55),
        backgroundColor: BORDER,
        marginTop: wp(4),
    },
    routeHeadingGreen: {
        fontSize: fs(10.5),
        fontWeight: '700',
        color: '#10B981',
        marginBottom: wp(2),
    },
    routeHeadingRed: {
        fontSize: fs(10.5),
        fontWeight: '700',
        color: '#EF4444',
        marginBottom: wp(2),
    },
    routeLocName: {
        fontSize: fs(13.5),
        fontWeight: '800',
        color: NAVY,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(4),
        marginVertical: wp(2),
    },
    timeIcon: {
        fontSize: fs(11),
    },
    timeText: {
        fontSize: fs(11),
        fontWeight: '700',
        color: GRAY,
    },
    addressText: {
        fontSize: fs(10.5),
        color: GRAY,
        fontWeight: '500',
        paddingRight: wp(16),
    },
    mapCircle: {
        width: wp(28),
        height: wp(28),
        borderRadius: wp(14),
        alignItems: 'center',
        justifyContent: 'center',
    },
    mapCircleGreen: {
        backgroundColor: '#ECFDF5',
    },
    mapCircleRed: {
        backgroundColor: '#FEF2F2',
    },
    mapArrowGreen: {
        fontSize: fs(12),
        color: '#10B981',
    },
    mapArrowRed: {
        fontSize: fs(12),
        color: '#EF4444',
    },
    sectionTitle: {
        fontSize: fs(13),
        fontWeight: '800',
        color: NAVY,
        marginBottom: wp(12),
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: wp(4),
    },
    summaryLabel: {
        fontSize: fs(11.5),
        color: GRAY,
        fontWeight: '600',
    },
    summaryVal: {
        fontSize: fs(11.5),
        fontWeight: '800',
        color: NAVY,
    },
    dashedLine: {
        height: 1,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
        marginVertical: wp(10),
    },
    totalAmountLabel: {
        fontSize: fs(13),
        fontWeight: '800',
        color: NAVY,
    },
    totalAmountVal: {
        fontSize: fs(15),
        fontWeight: '900',
        color: BLUE,
    },
    paymentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardIconBox: {
        width: wp(32),
        height: wp(32),
        borderRadius: wp(8),
        backgroundColor: '#F8FAFC',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: BORDER,
    },
    cardIcon: {
        fontSize: fs(16),
    },
    paymentMethodName: {
        fontSize: fs(11.5),
        fontWeight: '800',
        color: NAVY,
    },
    cardNo: {
        fontSize: fs(10),
        color: GRAY,
        fontWeight: '600',
    },
    paidBadge: {
        backgroundColor: '#ECFDF5',
        paddingHorizontal: wp(8),
        paddingVertical: wp(2),
        borderRadius: wp(6),
    },
    paidBadgeText: {
        fontSize: fs(9.5),
        fontWeight: '800',
        color: '#10B981',
    },
    paidAmount: {
        fontSize: fs(13),
        fontWeight: '800',
        color: NAVY,
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        gap: wp(12),
        paddingHorizontal: wp(16),
        paddingTop: wp(14),
        paddingBottom: wp(24),
        backgroundColor: WHITE,
        borderTopWidth: 1,
        borderColor: BORDER,
    },
    downloadBtn: {
        flex: 1,
        borderWidth: 1.5,
        borderColor: BLUE,
        borderRadius: wp(12),
        paddingVertical: wp(12),
        alignItems: 'center',
        justifyContent: 'center',
    },
    downloadBtnTxt: {
        fontSize: fs(12.5),
        fontWeight: '800',
        color: BLUE,
    },
    supportBtn: {
        flex: 1,
        backgroundColor: BLUE,
        borderRadius: wp(12),
        paddingVertical: wp(12),
        alignItems: 'center',
        justifyContent: 'center',
    },
    supportBtnTxt: {
        fontSize: fs(12.5),
        fontWeight: '800',
        color: WHITE,
    },
});
