import React, { useState } from 'react';
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
    TextInput,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { createBookingOrder, verifyPayment } from '../services/payment';
import RazorpayCheckout from 'react-native-razorpay';

const { width } = Dimensions.get('window');
const BASE_W = 375;
const wp = (px: number) => Math.round(PixelRatio.roundToNearestPixel((px / BASE_W) * width));
const fs = (px: number) => Math.round(PixelRatio.roundToNearestPixel((px / BASE_W) * width));

const NAVY = '#0F172A';
const GRAY = '#64748B';
const WHITE = '#FFFFFF';
const BLUE = '#1A6BFF'; // Royal Blue App Theme
const BORDER = '#E2E8F0';
const GOLD = '#F59E0B';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ReviewSummaryRouteProp = RouteProp<RootStackParamList, 'ReviewSummary'>;

interface Car {
    id: string;
    name: string;
    brand: string;
    classType: string;
    price: number;
    rating: number;
    image: any;
    location: string;
    ratePerKm: string;
    estimatedFare: string;
}

const CARS_DATA: Car[] = [
    {
        id: '1',
        name: 'Swift Dzire',
        brand: 'Maruti Suzuki',
        classType: 'Luxury Sedan',
        price: 13,
        rating: 4.8,
        image: require('../assets/images/banner_car.png'),
        location: 'Pune',
        ratePerKm: '₹13 / km',
        estimatedFare: '₹1,950',
    },
    {
        id: '2',
        name: 'Hyundai i20',
        brand: 'Hyundai',
        classType: 'Compact Hatchback',
        price: 11,
        rating: 4.7,
        image: require('../assets/images/slide1_car.png'),
        location: 'Mumbai',
        ratePerKm: '₹11 / km',
        estimatedFare: '₹1,540',
    },
    {
        id: '3',
        name: 'Toyota Fortuner',
        brand: 'Toyota',
        classType: 'Premium SUV',
        price: 22,
        rating: 4.9,
        image: require('../assets/images/banner_car.png'),
        location: 'Pune',
        ratePerKm: '₹22 / km',
        estimatedFare: '₹3,850',
    },
];

export default function ReviewSummaryScreen() {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ReviewSummaryRouteProp>();

    const carId = route.params?.carId || '1';
    const billingData = route.params?.billingData || {};
    const paymentMethod = route.params?.paymentMethod || 'Paypal';

    const car = CARS_DATA.find(c => c.id === carId) || CARS_DATA[0];

    const [promoCode, setPromoCode] = useState('');

    // Specific Fare Calculation values based on Mockup details
    const baseFareVal = carId === '1' ? 1950 : 1540;
    const platformFeeVal = Math.round(baseFareVal * 0.1);
    const gstVal = Math.round(baseFareVal * 0.18);
    const totalPayableVal = baseFareVal + platformFeeVal + gstVal;

    const [submitting, setSubmitting] = useState(false);

    const handlePay = async () => {
        try {
            setSubmitting(true);
            
            let targetCarId = carId;
            let pickupLoc = car.location || 'Pune';
            let dropLoc = 'Mumbai';
            
            // If the ID is a mock string, get a real car ID from backend database
            if (targetCarId === '1' || targetCarId === '2' || targetCarId === '3' || targetCarId.length !== 24) {
                try {
                    const { getAllCars } = require('../services/Car');
                    const cars = await getAllCars();
                    if (cars && cars.length > 0) {
                        targetCarId = cars[0]._id || cars[0].id;
                        pickupLoc = cars[0].city || pickupLoc;
                    }
                } catch (carsErr) {
                    console.warn("Failed to fetch fallback cars from database:", carsErr);
                }
            }

            const bookingResponse = await createBookingOrder({
                car_id: targetCarId,
                pickup_location: pickupLoc,
                drop_location: dropLoc,
                start_date: new Date().toISOString(),
                end_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
                booking_mode: 'RENTAL',
                billing_type: 'PER_DAY',
                name: billingData.name || 'Andrew Ainsley',
                email: billingData.email || 'andrew.ainsley@gmail.com',
                phone: billingData.phone || '9999999999'
            });

            if (bookingResponse && bookingResponse.booking_id) {
                const options = {
                    description: `Booking for ${car.name}`,
                    image: 'https://i.imgur.com/3g7nmJC.png',
                    currency: 'INR',
                    key: bookingResponse.keyId || 'rzp_test_SNw35MkokY8h1y',
                    amount: Math.round(bookingResponse.pricing.totalAmount * 100), // Razorpay accepts in paise
                    name: 'ShiftRide',
                    order_id: bookingResponse.razorpayOrderId,
                    prefill: {
                        email: billingData.email || 'andrew.ainsley@gmail.com',
                        contact: billingData.phone || '9999999999',
                        name: billingData.name || 'Andrew Ainsley'
                    },
                    theme: { color: '#1A6BFF' }
                };

                // Stop the loading indicator on button before opening Razorpay checkout
                setSubmitting(false);

                RazorpayCheckout.open(options).then(async (data: any) => {
                    try {
                        setSubmitting(true);
                        const verifyResponse = await verifyPayment({
                            booking_id: bookingResponse.booking_id,
                            razorpay_order_id: data.razorpay_order_id,
                            razorpay_payment_id: data.razorpay_payment_id,
                            razorpay_signature: data.razorpay_signature
                        });

                        if (verifyResponse) {
                            Alert.alert(
                                'Booking Confirmed',
                                `Thank you, ${billingData.name || 'customer'}! Your booking is successfully confirmed.`,
                                [
                                    {
                                        text: 'View Bookings',
                                        onPress: () => navigation.navigate('MyBookings'),
                                    }
                                ]
                            );
                        }
                    } catch (err: any) {
                        const msg = err.response?.data?.message || err.message || 'Payment verification failed';
                        Alert.alert('Verification Error', msg);
                    } finally {
                        setSubmitting(false);
                    }
                }).catch((error: any) => {
                    Alert.alert('Payment Error', `Code: ${error.code} | Description: ${error.description}`);
                });
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message || 'Payment verification failed';
            Alert.alert('Booking Error', msg);
            setSubmitting(false);
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
                <Text style={s.headerTitle}>Review Summary</Text>
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
                    <View style={[s.stepLine, s.stepLineActive]} />
                    <View style={s.stepItem}>
                        <View style={[s.stepDot, s.stepDotActive]}>
                            <Text style={s.stepDotTxt}>2</Text>
                        </View>
                        <Text style={[s.stepTxt, s.stepTxtActive]}>Payment</Text>
                    </View>
                    <View style={[s.stepLine, s.stepLineActive]} />
                    <View style={s.stepItem}>
                        <View style={[s.stepDot, s.stepDotActive]}>
                            <Text style={s.stepDotTxt}>3</Text>
                        </View>
                        <Text style={[s.stepTxt, s.stepTxtActive]}>Review</Text>
                    </View>
                </View>

                {/* Car info mini card */}
                <View style={s.carMiniCard}>
                    <Image source={car.image} style={s.carMiniImg} resizeMode="contain" />
                    <View style={{ flex: 1, paddingLeft: wp(12) }}>
                        <Text style={s.carNameText}>{car.name}</Text>
                        <Text style={s.brandText}>{car.brand}</Text>
                        <Text style={s.rateText}>₹{car.price} / km</Text>
                    </View>
                    <View style={s.ratingRow}>
                        <Text style={s.ratingVal}>{car.rating.toFixed(1)}</Text>
                        <Text style={s.starIcon}>★</Text>
                    </View>
                </View>

                {/* Summary list details */}
                <View style={s.detailsBlock}>
                    <View style={s.detailRow}>
                        <Text style={s.detailLabel}>Pick-Up Date</Text>
                        <Text style={s.detailVal}>26/07/2026</Text>
                    </View>
                    <View style={s.detailRow}>
                        <Text style={s.detailLabel}>Pick-Up Time</Text>
                        <Text style={s.detailVal}>10:00 AM</Text>
                    </View>
                    <View style={s.detailRow}>
                        <Text style={s.detailLabel}>Drop-Off Date</Text>
                        <Text style={s.detailVal}>26/07/2026</Text>
                    </View>
                    <View style={s.detailRow}>
                        <Text style={s.detailLabel}>Drop-Off Time</Text>
                        <Text style={s.detailVal}>04:00 PM</Text>
                    </View>
                    <View style={s.detailRow}>
                        <Text style={s.detailLabel}>Rent Type</Text>
                        <Text style={s.detailVal}>Self Driver</Text>
                    </View>
                </View>

                <View style={s.divider} />

                {/* Pricing List */}
                <View style={s.pricingBlock}>
                    <View style={s.detailRow}>
                        <Text style={s.detailLabel}>Additional Drive</Text>
                        <Text style={s.detailVal}>₹0</Text>
                    </View>
                    <View style={s.detailRow}>
                        <Text style={s.detailLabel}>Subtotal</Text>
                        <Text style={s.detailVal}>₹{totalPayableVal.toLocaleString('en-IN')}</Text>
                    </View>
                    <View style={s.detailRow}>
                        <Text style={s.detailLabel}>Tax</Text>
                        <Text style={s.detailVal}>₹0</Text>
                    </View>
                </View>

                {/* Promo Code Input */}
                <View style={s.promoBox}>
                    <TextInput
                        style={s.promoInput}
                        placeholder="Apply promo code"
                        placeholderTextColor="#94A3B8"
                        value={promoCode}
                        onChangeText={setPromoCode}
                    />
                    <TouchableOpacity style={s.applyBtn} activeOpacity={0.7}>
                        <Text style={s.applyBtnTxt}>Apply Now</Text>
                    </TouchableOpacity>
                </View>

                {/* Payment Option display */}
                <View style={s.paymentMethodBox}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(8) }}>
                        <Image 
                            source={{
                                uri: paymentMethod === 'Paypal' 
                                    ? 'https://img.icons8.com/color/96/000000/paypal.png'
                                    : paymentMethod === 'Google Pay'
                                    ? 'https://img.icons8.com/color/96/000000/google-logo.png'
                                    : 'https://img.icons8.com/ios-filled/100/000000/mac-os.png'
                            }} 
                            style={{ width: wp(24), height: wp(24) }} 
                            resizeMode="contain" 
                        />
                        <Text style={s.paymentNameText}>{paymentMethod}</Text>
                    </View>
                    <TouchableOpacity style={s.changeBtn} onPress={() => navigation.navigate('Payment', { carId, billingData })}>
                        <Text style={s.changeBtnTxt}>Change</Text>
                    </TouchableOpacity>
                </View>

                <View style={s.divider} />

                {/* Total pricing */}
                <View style={s.totalRow}>
                    <Text style={s.totalLabel}>Total Rental Price</Text>
                    <Text style={s.totalValText}>₹{totalPayableVal.toLocaleString('en-IN')}</Text>
                </View>

                <View style={{ height: wp(120) }} />
            </ScrollView>

            {/* Bottom action button */}
            <View style={s.bottomContainer}>
                <TouchableOpacity 
                    style={[s.payBtn, submitting && { backgroundColor: '#A0ABBA' }]} 
                    activeOpacity={0.8} 
                    onPress={handlePay}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color={WHITE} size="small" />
                    ) : (
                        <Text style={s.payBtnTxt}>Pay ₹{totalPayableVal.toLocaleString('en-IN')}</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    screen: { flex: 1, backgroundColor: WHITE },
    scrollContent: { paddingHorizontal: wp(20), paddingTop: wp(10) },
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
    stepLineActive: {
        backgroundColor: BLUE,
    },
    carMiniCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: BORDER,
        borderRadius: wp(16),
        padding: wp(10),
        backgroundColor: WHITE,
        marginBottom: wp(20),
    },
    carMiniImg: {
        width: wp(64),
        height: wp(48),
    },
    carNameText: {
        fontSize: fs(13),
        fontWeight: '800',
        color: NAVY,
    },
    brandText: {
        fontSize: fs(10.5),
        color: GRAY,
        fontWeight: '600',
    },
    rateText: {
        fontSize: fs(11),
        fontWeight: '800',
        color: BLUE,
        marginTop: wp(2),
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(3),
    },
    ratingVal: {
        fontSize: fs(12),
        fontWeight: '800',
        color: GRAY,
    },
    starIcon: {
        fontSize: fs(12),
        color: GOLD,
    },
    detailsBlock: {
        gap: wp(10),
        marginBottom: wp(16),
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: fs(11.5),
        color: GRAY,
        fontWeight: '600',
    },
    detailVal: {
        fontSize: fs(12),
        fontWeight: '800',
        color: NAVY,
    },
    divider: {
        height: 1,
        backgroundColor: BORDER,
        marginVertical: wp(12),
    },
    pricingBlock: {
        gap: wp(10),
        marginBottom: wp(16),
    },
    promoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: BORDER,
        borderRadius: wp(12),
        paddingHorizontal: wp(12),
        backgroundColor: WHITE,
        marginVertical: wp(12),
    },
    promoInput: {
        flex: 1,
        paddingVertical: wp(12),
        fontSize: fs(12.5),
        color: NAVY,
        fontWeight: '600',
    },
    applyBtn: {
        paddingHorizontal: wp(12),
        paddingVertical: wp(6),
        borderRadius: wp(8),
    },
    applyBtnTxt: {
        fontSize: fs(12),
        fontWeight: '800',
        color: BLUE,
        backgroundColor: 'transparent',
    },
    paymentMethodBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: BORDER,
        borderRadius: wp(16),
        padding: wp(12),
        backgroundColor: WHITE,
        marginVertical: wp(8),
    },
    paymentNameText: {
        fontSize: fs(12.5),
        fontWeight: '800',
        color: NAVY,
    },
    changeBtn: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: wp(12),
        paddingVertical: wp(6),
        borderRadius: wp(8),
    },
    changeBtnTxt: {
        fontSize: fs(11),
        fontWeight: '700',
        color: GRAY,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: wp(8),
    },
    totalLabel: {
        fontSize: fs(13),
        fontWeight: '800',
        color: NAVY,
    },
    totalValText: {
        fontSize: fs(18),
        fontWeight: '900',
        color: BLUE,
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
    },
    payBtn: {
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
    payBtnTxt: {
        fontSize: fs(14),
        fontWeight: '800',
        color: WHITE,
    },
});
