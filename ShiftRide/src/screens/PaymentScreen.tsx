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
type PaymentRouteProp = RouteProp<RootStackParamList, 'Payment'>;

export default function PaymentScreen() {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<PaymentRouteProp>();
    
    const carId = route.params?.carId || '1';
    const billingData = route.params?.billingData || {};

    const [selectedMethod, setSelectedMethod] = useState<'Paypal' | 'Google Pay' | 'Apple Pay'>('Paypal');

    const handleContinue = () => {
        navigation.navigate('ReviewSummary', {
            carId,
            billingData,
            paymentMethod: selectedMethod,
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
                <Text style={s.headerTitle}>Payment</Text>
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
                    <View style={s.stepLine} />
                    <View style={s.stepItem}>
                        <View style={s.stepDot}>
                            <Text style={s.stepDotTxtInactive}>3</Text>
                        </View>
                        <Text style={s.stepTxt}>Review</Text>
                    </View>
                </View>

                <View style={s.methodsContainer}>
                    {/* Paypal */}
                    <TouchableOpacity 
                        style={[s.methodCard, selectedMethod === 'Paypal' && s.methodCardActive]} 
                        activeOpacity={0.8}
                        onPress={() => setSelectedMethod('Paypal')}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(10) }}>
                            <Image 
                                source={{ uri: 'https://img.icons8.com/color/96/000000/paypal.png' }} 
                                style={{ width: wp(24), height: wp(24) }} 
                                resizeMode="contain" 
                            />
                            <Text style={s.methodName}>Paypal</Text>
                        </View>
                        <View style={[s.radioCircle, selectedMethod === 'Paypal' && s.radioCircleActive]}>
                            {selectedMethod === 'Paypal' && <View style={s.radioDot} />}
                        </View>
                    </TouchableOpacity>

                    {/* Google Pay */}
                    <TouchableOpacity 
                        style={[s.methodCard, selectedMethod === 'Google Pay' && s.methodCardActive]} 
                        activeOpacity={0.8}
                        onPress={() => setSelectedMethod('Google Pay')}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(10) }}>
                            <Image 
                                source={{ uri: 'https://img.icons8.com/color/96/000000/google-logo.png' }} 
                                style={{ width: wp(24), height: wp(24) }} 
                                resizeMode="contain" 
                            />
                            <Text style={s.methodName}>Google Pay</Text>
                        </View>
                        <View style={[s.radioCircle, selectedMethod === 'Google Pay' && s.radioCircleActive]}>
                            {selectedMethod === 'Google Pay' && <View style={s.radioDot} />}
                        </View>
                    </TouchableOpacity>

                    {/* Apple Pay */}
                    <TouchableOpacity 
                        style={[s.methodCard, selectedMethod === 'Apple Pay' && s.methodCardActive]} 
                        activeOpacity={0.8}
                        onPress={() => setSelectedMethod('Apple Pay')}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(10) }}>
                            <Image 
                                source={{ uri: 'https://img.icons8.com/ios-filled/100/000000/mac-os.png' }} 
                                style={{ width: wp(24), height: wp(24) }} 
                                resizeMode="contain" 
                            />
                            <Text style={s.methodName}>Apple Pay</Text>
                        </View>
                        <View style={[s.radioCircle, selectedMethod === 'Apple Pay' && s.radioCircleActive]}>
                            {selectedMethod === 'Apple Pay' && <View style={s.radioDot} />}
                        </View>
                    </TouchableOpacity>
                </View>
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
    methodsContainer: {
        marginTop: wp(10),
        gap: wp(12),
    },
    methodCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: BORDER,
        borderRadius: wp(16),
        padding: wp(16),
        backgroundColor: WHITE,
    },
    methodCardActive: {
        borderColor: BLUE,
    },
    brandIcon: {
        fontSize: fs(18),
    },
    methodName: {
        fontSize: fs(13),
        fontWeight: '800',
        color: NAVY,
    },
    radioCircle: {
        width: wp(20),
        height: wp(20),
        borderRadius: wp(10),
        borderWidth: 2,
        borderColor: BORDER,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioCircleActive: {
        borderColor: BLUE,
    },
    radioDot: {
        width: wp(10),
        height: wp(10),
        borderRadius: wp(5),
        backgroundColor: BLUE,
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
});
