import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Dimensions,
    PixelRatio,
    Alert,
    TextInput,
    Animated,
    ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { verifyOtp } from '../services/auth';


const { width } = Dimensions.get('window');
const BASE_W = 375;
const wp = (px: number) => Math.round(PixelRatio.roundToNearestPixel((px / BASE_W) * width));
const fs = (px: number) => Math.round(PixelRatio.roundToNearestPixel((px / BASE_W) * width));

const NAVY = '#0F172A';
const GRAY = '#64748B';
const WHITE = '#FFFFFF';
const BLUE = '#1A6BFF';
const BORDER = '#E2E8F0';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function VerifyAccountScreen() {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<any>();
    const userId = route.params?.userId;

    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<TextInput>(null);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(24)).current;


    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();

        setTimeout(() => {
            inputRef.current?.focus();
        }, 150);
    }, []);

    const handleVerify = async () => {
        if (otp.length < 6) {
            Alert.alert('Error', 'Please enter a complete 6-digit code.');
            return;
        }
        if (!userId) {
            Alert.alert('Error', 'Missing user reference. Please log in again.');
            navigation.navigate('Login');
            return;
        }

        setLoading(true);
        try {
            const data = await verifyOtp({
                user_id: userId,
                otp: otp,
            });
            Alert.alert('Success 🎉', 'Login verified successfully!', [
                { text: 'OK', onPress: () => navigation.navigate('Home') }
            ]);
        } catch (error: any) {
            console.error('OTP verification error:', error);
            const errMsg = error.response?.data?.message || 'Invalid or expired OTP. Please try again.';
            Alert.alert('Verification Failed', errMsg);
        } finally {
            setLoading(false);
        }
    };

    const otpArray = Array.from({ length: 6 }, (_, i) => otp[i] || '');


    return (
        <View style={s.screen}>
            <StatusBar barStyle="dark-content" backgroundColor={WHITE} />

            {/* Back Button */}
            <View style={s.header}>
                <TouchableOpacity style={s.circleBtn} onPress={() => navigation.goBack()}>
                    <Text style={s.backIcon}>←</Text>
                </TouchableOpacity>
            </View>

            <Animated.View style={[s.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                <Text style={s.title}>Verify Account</Text>

                {/* Hidden TextInput for native keyboard */}
                <TextInput
                    ref={inputRef}
                    value={otp}
                    onChangeText={(val) => {
                        if (/^\d*$/.test(val)) {
                            setOtp(val);
                        }
                    }}
                    maxLength={6}
                    keyboardType="number-pad"
                    style={s.hiddenInput}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />

                {/* OTP Boxes */}
                <TouchableOpacity 
                    activeOpacity={1} 
                    style={s.otpRow}
                    onPress={() => inputRef.current?.focus()}
                >
                    {otpArray.map((digit, i) => {
                        const boxFocused = isFocused && (otp.length === i || (otp.length === 6 && i === 5));
                        return (
                            <View
                                key={i}
                                style={[s.otpBox, boxFocused && s.otpBoxActive]}
                            >
                                <Text style={s.otpText}>{digit}</Text>
                                {boxFocused && digit === '' && <View style={s.cursor} />}
                            </View>
                        );
                    })}
                </TouchableOpacity>

                {/* Resend Link */}
                <Text style={s.resendText}>
                    Don't receive OTP? <Text style={s.resendLink} onPress={() => Alert.alert('OTP Sent', 'Code has been resent.')}>Re-send Code</Text>
                </Text>

                {/* Verify Button */}
                <TouchableOpacity 
                    style={s.btn} 
                    activeOpacity={0.8} 
                    onPress={handleVerify}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={WHITE} size="small" />
                    ) : (
                        <Text style={s.btnText}>Verify</Text>
                    )}
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

const s = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: WHITE,
    },
    header: {
        paddingHorizontal: wp(24),
        paddingTop: (StatusBar.currentHeight || wp(20)) + wp(10),
    },
    circleBtn: {
        width: wp(40),
        height: wp(40),
        borderRadius: wp(20),
        backgroundColor: WHITE,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: BORDER,
    },
    backIcon: {
        fontSize: fs(18),
        color: NAVY,
        fontWeight: 'bold',
    },
    container: {
        flex: 1,
        paddingHorizontal: wp(24),
        paddingTop: wp(40),
    },
    title: {
        fontSize: fs(24),
        fontWeight: '800',
        color: NAVY,
        textAlign: 'center',
        marginBottom: wp(40),
    },
    otpRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: wp(24),
    },
    otpBox: {
        width: wp(45),
        height: wp(50),
        borderRadius: wp(12),
        borderWidth: 1.5,
        borderColor: BORDER,
        backgroundColor: '#FAF9F9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    otpBoxActive: {
        borderColor: BLUE,
        backgroundColor: WHITE,
    },
    otpText: {
        fontSize: fs(20),
        fontWeight: '800',
        color: NAVY,
    },
    cursor: {
        width: 1.5,
        height: wp(20),
        backgroundColor: BLUE,
        position: 'absolute',
    },
    resendText: {
        fontSize: fs(12),
        color: GRAY,
        textAlign: 'center',
        fontWeight: '600',
        marginBottom: wp(30),
    },
    resendLink: {
        color: BLUE,
        fontWeight: '700',
    },
    btn: {
        backgroundColor: BLUE,
        borderRadius: wp(12),
        paddingVertical: wp(14),
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnText: {
        fontSize: fs(14.5),
        fontWeight: '800',
        color: WHITE,
    },
    hiddenInput: {
        position: 'absolute',
        width: 1,
        height: 1,
        opacity: 0,
    },
});
