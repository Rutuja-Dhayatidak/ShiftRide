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
    ActivityIndicator,
    Linking,
    Share,
    Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import api, { getCarImageUrl } from '../services/api';
import { getSessionToken } from '../services/auth';

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

    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [sosActivated, setSosActivated] = useState(false);

    useEffect(() => {
        const fetchBookingDetails = async (isSilent = false) => {
            try {
                if (!isSilent) setLoading(true);
                // Use public tracking details route to fetch fully populated booking details
                const response = await api.get(`/bookings/track/${bookingId}`);
                if (response && response.data) {
                    setBooking(response.data);
                }
            } catch (err) {
                console.error("Failed to load booking details:", err);
            } finally {
                if (!isSilent) setLoading(false);
            }
        };
        
        fetchBookingDetails(false);

        // Silent background polling every 4 seconds
        const intervalId = setInterval(() => {
            fetchBookingDetails(true);
        }, 4000);

        return () => clearInterval(intervalId);
    }, [bookingId]);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Upcoming':
            case 'BOOKED':
            case 'CONFIRMED':
                return { bg: '#EFF6FF', text: '#3B82F6', label: 'Upcoming' };
            case 'Ongoing':
            case 'ONGOING':
            case 'IN_PROGRESS':
            case 'STARTED':
                return { bg: '#ECFDF5', text: '#10B981', label: 'Ongoing' };
            case 'Completed':
            case 'COMPLETED':
                return { bg: '#F1F5F9', text: '#64748B', label: 'Completed' };
            default:
                return { bg: '#FEF2F2', text: '#EF4444', label: status || 'Cancelled' };
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: WHITE }}>
                <ActivityIndicator size="large" color={BLUE} />
            </View>
        );
    }

    // Use fetched booking data
    const displayBooking = booking || {
        _id: bookingId,
        pickup_location: 'Mumbai',
        drop_location: 'Pune',
        start_date: '2025-05-24T10:00:00.000Z',
        end_date: '2025-05-26T10:00:00.000Z',
        created_at: '2025-05-22T08:00:00.000Z',
        rate_per_day: 5000,
        total_amount: 2496,
        status: 'BOOKED',
        baseFare: 1950,
        platformFee: 195,
        gst: 351,
        billing_type: 'PER_KM',
        rate_per_km: 13,
        car_id: {
            name: 'BMW 3 Series',
            brand: 'Luxury Sedan',
            seats: 2,
        }
    };

    const statusTheme = getStatusStyle(displayBooking.status);

    // Format Dates helper
    const formatNiceDate = (dateStr: any) => {
        if (!dateStr) return '-';
        const rawDate = dateStr?.$date || dateStr;
        const d = new Date(rawDate);
        if (Number.isNaN(d.getTime())) return String(dateStr);
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatNiceDateTime = (dateStr: any) => {
        if (!dateStr) return '-';
        const rawDate = dateStr?.$date || dateStr;
        const d = new Date(rawDate);
        if (Number.isNaN(d.getTime())) return String(dateStr);
        return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
    };

    // Calculate Duration in Days
    const getDurationText = () => {
        const startRaw = displayBooking.start_date?.$date || displayBooking.start_date;
        const endRaw = displayBooking.end_date?.$date || displayBooking.end_date;
        if (!startRaw || !endRaw) return '2 Days';
        const start = new Date(startRaw);
        const end = new Date(endRaw);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? `${diffDays} Day${diffDays > 1 ? 's' : ''}` : '1 Day';
    };

    const carName = displayBooking.car_id?.name || displayBooking.car_id?.model_name || 'Car';
    const carClass = displayBooking.car_id?.brand || displayBooking.car_id?.brand_name || 'Premium Car';
    const carImage = displayBooking.car_id?.cars_image 
        ? { uri: getCarImageUrl(displayBooking.car_id.cars_image) } 
        : require('../assets/images/banner_car.png');

    const duration = getDurationText();
    const rateText = displayBooking.billing_type === 'PER_KM' 
        ? `₹${displayBooking.rate_per_km} / km` 
        : `₹${displayBooking.rate_per_day} / day`;

    const priceText = displayBooking.billing_type === 'PER_KM' 
        ? `₹${displayBooking.rate_per_km}` 
        : `₹${displayBooking.rate_per_day}`;

    const totalDaysAmountText = displayBooking.billing_type === 'PER_KM'
        ? `₹${displayBooking.total_amount}`
        : `₹${displayBooking.baseFare || displayBooking.total_amount}`;

    const handleDownloadInvoice = () => {
        try {
            const token = getSessionToken();
            const id = displayBooking._id || displayBooking.id;
            let invoiceUrl = `${api.defaults.baseURL}/bookings/invoice/${id}?token=${token}`;
            
            // Replace localhost or 127.0.0.1 with host computer's local IP (192.168.1.45) 
            // so the phone's browser can route to the development server.
            if (invoiceUrl.includes('localhost')) {
                invoiceUrl = invoiceUrl.replace('localhost', '192.168.1.45');
            } else if (invoiceUrl.includes('127.0.0.1')) {
                invoiceUrl = invoiceUrl.replace('127.0.0.1', '192.168.1.45');
            }
            
            Linking.openURL(invoiceUrl);
        } catch (err) {
            console.error('Failed to open invoice:', err);
            Alert.alert('Error', 'Unable to download invoice at the moment.');
        }
    };

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
                            <Text style={[s.statusTxt, { color: statusTheme.text }]}>● {statusTheme.label}</Text>
                        </View>
                        <Text style={s.bookingId}>Booking ID <Text style={{ color: NAVY }}>#{displayBooking._id?.slice(-6).toUpperCase()}</Text></Text>
                    </View>

                    <View style={s.carDetailsRow}>
                        <Image source={typeof carImage === 'object' ? carImage : carImage} style={s.carImg} resizeMode="contain" />
                        <View style={{ flex: 1, paddingLeft: wp(12) }}>
                            <Text style={s.carName}>{carName}</Text>
                            <Text style={s.classType}>{carClass}</Text>
                            <Text style={s.priceTxt}>
                                {priceText} <Text style={s.perDay}>{displayBooking.billing_type === 'PER_KM' ? '/ km' : '/ day'}</Text>
                            </Text>
                            <Text style={s.totalDaysVal}>Total Amount: <Text style={{ color: BLUE }}>₹{displayBooking.total_amount}</Text></Text>
                        </View>
                    </View>

                    {/* Specs Row */}
                    <View style={s.specRow}>
                        <View style={s.specItem}>
                            <Text style={s.specIcon}>📅</Text>
                            <View>
                                <Text style={s.specValLabel}>Duration</Text>
                                <Text style={s.specVal}>{duration}</Text>
                            </View>
                        </View>
                        <View style={s.specItem}>
                            <Text style={s.specIcon}>📍</Text>
                            <View>
                                <Text style={s.specValLabel}>Distance</Text>
                                <Text style={s.specVal}>{displayBooking.distance_km ? `${displayBooking.distance_km} km` : '-'}</Text>
                            </View>
                        </View>
                        <View style={s.specItem}>
                            <Text style={s.specIcon}>⏱️</Text>
                            <View>
                                <Text style={s.specValLabel}>Booking Date</Text>
                                <Text style={s.specVal}>{formatNiceDate(displayBooking.created_at || displayBooking.bookingDate)}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* ── Women Safety & SOS Center ── */}
                {displayBooking.women_safety_mode && (
                    <View style={[s.card, { borderColor: '#FBCFE8', borderWidth: 1.5, backgroundColor: '#FFF5F7' }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: wp(8) }}>
                            <Text style={[s.sectionTitle, { color: '#DB2777', marginBottom: 0 }]}>♀️ Women Safety Center</Text>
                            <View style={{ backgroundColor: '#FCE7F3', paddingHorizontal: wp(8), paddingVertical: wp(2), borderRadius: wp(6) }}>
                                <Text style={{ fontSize: fs(9), fontWeight: '800', color: '#DB2777' }}>SECURE RIDE</Text>
                            </View>
                        </View>
                        <Text style={{ fontSize: fs(11), color: '#9D174D', fontWeight: '600', lineHeight: wp(16), marginBottom: wp(12) }}>
                            This ride is verified for women safety. Live GPS tracking is active and SOS priority assistance is enabled.
                        </Text>

                        {/* SOS Action button */}
                        <TouchableOpacity
                            style={[
                                {
                                    backgroundColor: sosActivated ? '#F59E0B' : '#E11D48',
                                    paddingVertical: wp(12),
                                    borderRadius: wp(12),
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: wp(12),
                                }
                            ]}
                            activeOpacity={0.85}
                            onPress={() => setSosActivated(!sosActivated)}
                        >
                            <Text style={{ color: '#FFF', fontWeight: '900', fontSize: fs(12), letterSpacing: 0.5 }}>
                                {sosActivated ? '🚨 SOS ACTIVE (Tap to Cancel)' : '🚨 TRIGGER EMERGENCY SOS'}
                            </Text>
                        </TouchableOpacity>

                        {sosActivated && (
                            <View style={{ backgroundColor: '#FEF3C7', borderLeftWidth: 4, borderLeftColor: '#D97706', padding: wp(8), borderRadius: wp(6), marginBottom: wp(12) }}>
                                <Text style={{ fontSize: fs(10), color: '#78350F', fontWeight: '800', lineHeight: wp(14) }}>
                                    🚨 SOS Alert Broadcasted! Law enforcement, our 24/7 security dispatch, and your emergency contacts are being alerted with your live GPS location.
                                </Text>
                            </View>
                        )}

                        {/* Helper Safety Actions */}
                        <View style={{ flexDirection: 'row', gap: wp(10) }}>
                            <TouchableOpacity
                                style={{ flex: 1, backgroundColor: '#FFF', borderColor: '#FBCFE8', borderWidth: 1, paddingVertical: wp(8), borderRadius: wp(10) }}
                                activeOpacity={0.7}
                                onPress={() => Linking.openURL('tel:1091')}
                            >
                                <Text style={{ fontSize: fs(11), fontWeight: '700', color: '#DB2777', textAlign: 'center' }}>
                                    📞 Call Helpline (1091)
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={{ flex: 1, backgroundColor: '#FFF', borderColor: '#FBCFE8', borderWidth: 1, paddingVertical: wp(8), borderRadius: wp(10) }}
                                activeOpacity={0.7}
                                onPress={async () => {
                                    try {
                                        await Share.share({
                                            message: `Track my safe ride on ShiftRide: https://shiftride.com/track/${displayBooking._id || displayBooking.id}`,
                                        });
                                    } catch (err) {
                                        console.warn(err);
                                    }
                                }}
                            >
                                <Text style={{ fontSize: fs(11), fontWeight: '700', color: '#DB2777', textAlign: 'center' }}>
                                    🔗 Share tracking link
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Driver & OTP Verification Card */}
                {displayBooking.driverAssigned && displayBooking.driverId ? (
                    <View style={s.card}>
                        <Text style={s.sectionTitle}>Driver & Verification</Text>
                        <View style={s.driverRow}>
                            <View style={s.driverAvatarCircle}>
                                <Text style={s.driverAvatarText}>👤</Text>
                            </View>
                            <View style={{ flex: 1, paddingLeft: wp(12) }}>
                                <Text style={s.driverName}>{displayBooking.driverId.driverName}</Text>
                                <Text style={s.driverExp}>Experience: {displayBooking.driverId.experience || '2'} Years</Text>
                                <View style={s.driverActionsRow}>
                                    <TouchableOpacity 
                                        style={[s.driverActionBtn, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}
                                        onPress={() => Linking.openURL(`tel:${displayBooking.driverId.phone}`)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={s.driverActionIcon}>📞</Text>
                                        <Text style={[s.driverActionText, { color: BLUE }]}>Call</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        style={[s.driverActionBtn, { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE' }]}
                                        onPress={() => Linking.openURL(`sms:${displayBooking.driverId.phone}`)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={s.driverActionIcon}>💬</Text>
                                        <Text style={[s.driverActionText, { color: '#4F46E5' }]}>Message</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            {displayBooking.otp && !['OTP_VERIFIED', 'TRIP_STARTED', 'COMPLETED', 'ONGOING', 'STARTED', 'IN_PROGRESS'].includes(String(displayBooking.status).toUpperCase()) ? (
                                <View style={s.otpContainer}>
                                    <Text style={s.otpLabel}>START OTP</Text>
                                    <Text style={s.otpVal}>{displayBooking.otp}</Text>
                                </View>
                            ) : null}
                        </View>
                    </View>
                ) : (
                    displayBooking.otp && !['OTP_VERIFIED', 'TRIP_STARTED', 'COMPLETED', 'ONGOING', 'STARTED', 'IN_PROGRESS'].includes(String(displayBooking.status).toUpperCase()) ? (
                        <View style={s.card}>
                            <Text style={s.sectionTitle}>Ride Verification Code</Text>
                            <View style={s.otpFullRow}>
                                <Text style={s.otpDescription}>Share this OTP with the driver to start the trip:</Text>
                                <View style={s.otpBadgeLarge}>
                                    <Text style={s.otpValLarge}>{displayBooking.otp}</Text>
                                </View>
                            </View>
                        </View>
                    ) : null
                )}

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
                            <Text style={s.routeLocName}>{displayBooking.pickup_location}</Text>
                            <View style={s.timeRow}>
                                <Text style={s.timeIcon}>🕒</Text>
                                <Text style={s.timeText}>{formatNiceDateTime(displayBooking.start_date)}</Text>
                            </View>
                            <Text style={s.addressText}>{displayBooking.pickup_location}, India</Text>
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
                            <Text style={s.routeLocName}>{displayBooking.drop_location}</Text>
                            <View style={s.timeRow}>
                                <Text style={s.timeIcon}>🕒</Text>
                                <Text style={s.timeText}>{formatNiceDateTime(displayBooking.end_date)}</Text>
                            </View>
                            <Text style={s.addressText}>{displayBooking.drop_location}, India</Text>
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
                        <Text style={s.summaryVal}>{displayBooking.billing_type === 'PER_KM' ? 'Per KM' : 'Per Day'}</Text>
                    </View>
                    <View style={s.summaryRow}>
                        <Text style={s.summaryLabel}>Rate</Text>
                        <Text style={s.summaryVal}>{rateText}</Text>
                    </View>
                    <View style={s.summaryRow}>
                        <Text style={s.summaryLabel}>Distance (Billed)</Text>
                        <Text style={s.summaryVal}>{displayBooking.distance_km ? `${displayBooking.distance_km} km` : '-'}</Text>
                    </View>
                    <View style={s.summaryRow}>
                        <Text style={s.summaryLabel}>Duration</Text>
                        <Text style={s.summaryVal}>{duration}</Text>
                    </View>

                    <View style={s.dashedLine} />

                    <View style={s.summaryRow}>
                        <Text style={s.summaryLabel}>Base Fare</Text>
                        <Text style={s.summaryVal}>₹{displayBooking.baseFare || 0}</Text>
                    </View>
                    <View style={s.summaryRow}>
                        <Text style={s.summaryLabel}>Platform Fee</Text>
                        <Text style={s.summaryVal}>₹{displayBooking.platformFee || 0}</Text>
                    </View>
                    <View style={s.summaryRow}>
                        <Text style={s.summaryLabel}>GST (18%)</Text>
                        <Text style={s.summaryVal}>₹{displayBooking.gst || 0}</Text>
                    </View>

                    <View style={s.dashedLine} />

                    <View style={s.summaryRow}>
                        <Text style={s.totalAmountLabel}>Total Amount</Text>
                        <Text style={s.totalAmountVal}>₹{displayBooking.total_amount}</Text>
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
                                <Text style={s.paymentMethodName}>{displayBooking.razorpayPaymentId ? 'Paid Online' : 'Cash/Other'}</Text>
                                <Text style={s.cardNo}>ID: {displayBooking.razorpayPaymentId ? displayBooking.razorpayPaymentId.slice(-6).toUpperCase() : 'N/A'}</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(8) }}>
                            <View style={s.paidBadge}>
                                <Text style={s.paidBadgeText}>{displayBooking.paymentStatus || 'PAID'}</Text>
                            </View>
                            <Text style={s.paidAmount}>₹{displayBooking.total_amount}</Text>
                        </View>
                    </View>
                </View>

                <View style={{ height: wp(120) }} />
            </ScrollView>

            {/* Bottom Buttons */}
            <View style={s.bottomContainer}>
                <TouchableOpacity style={s.downloadBtn} onPress={handleDownloadInvoice}>
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
    driverRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: wp(10),
    },
    driverAvatarCircle: {
        width: wp(48),
        height: wp(48),
        borderRadius: wp(24),
        backgroundColor: '#EFF6FF',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#DBEAFE',
    },
    driverAvatarText: {
        fontSize: fs(20),
    },
    driverName: {
        fontSize: fs(14),
        fontWeight: '800',
        color: NAVY,
    },
    driverExp: {
        fontSize: fs(11),
        color: GRAY,
        fontWeight: '600',
        marginTop: wp(2),
    },
    driverPhone: {
        fontSize: fs(11),
        color: BLUE,
        fontWeight: '700',
        marginTop: wp(2),
    },
    driverActionsRow: {
        flexDirection: 'row',
        gap: wp(8),
        marginTop: wp(6),
    },
    driverActionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: wp(8),
        paddingVertical: wp(4),
        borderRadius: wp(8),
        borderWidth: 1,
        gap: wp(4),
    },
    driverActionIcon: {
        fontSize: fs(10),
    },
    driverActionText: {
        fontSize: fs(9.5),
        fontWeight: '700',
    },
    otpContainer: {
        backgroundColor: '#F0FDF4',
        borderWidth: 1,
        borderColor: '#BBF7D0',
        borderRadius: wp(12),
        paddingHorizontal: wp(14),
        paddingVertical: wp(8),
        alignItems: 'center',
        justifyContent: 'center',
    },
    otpLabel: {
        fontSize: fs(8),
        fontWeight: '900',
        color: '#16A34A',
        letterSpacing: 0.5,
        marginBottom: wp(2),
    },
    otpVal: {
        fontSize: fs(16),
        fontWeight: '900',
        color: '#15803D',
        letterSpacing: 1.5,
    },
    otpFullRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: wp(10),
    },
    otpDescription: {
        fontSize: fs(11),
        color: GRAY,
        fontWeight: '600',
        flex: 1,
        marginRight: wp(10),
    },
    otpBadgeLarge: {
        backgroundColor: '#EFF6FF',
        borderWidth: 1.5,
        borderColor: '#BFDBFE',
        borderRadius: wp(12),
        paddingHorizontal: wp(16),
        paddingVertical: wp(10),
    },
    otpValLarge: {
        fontSize: fs(18),
        fontWeight: '900',
        color: BLUE,
        letterSpacing: 2,
    },
});
