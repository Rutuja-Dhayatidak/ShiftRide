import React, { useState, useRef, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    Animated,
    Easing,
    PixelRatio,
    Dimensions,
    Alert,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { loginUser, verifyOtp } from '../services/auth';
import { InputField } from '../components/InputField';



// ─── Responsive Helpers ────────────────────────────────────────────────────
const { width, height } = Dimensions.get('window');
const BASE_W = 375;
const BASE_H = 812;
const wp = (px: number) => (px / BASE_W) * width;
const hp = (px: number) => (px / BASE_H) * height;
const fs = (px: number) =>
    Math.round(PixelRatio.roundToNearestPixel((px / BASE_W) * width));

// ─── Theme ─────────────────────────────────────────────────────────────────
const BLUE     = '#1A6BFF';
const NAVY     = '#0D1B3E';
const GRAY     = '#5A6880';
const LIGHT_BG = '#F4F7FF';
const INPUT_BG = '#F0F4FF';
const WHITE    = '#FFFFFF';
const RED      = '#FF3B30';
const BORDER   = '#E0E8FF';

// ─── Login Screen ──────────────────────────────────────────────────────────
const LoginScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [loading, setLoading] = useState(false);
    const [email,    setEmail]    = useState('');
    const [password, setPassword] = useState('');
    const [otp,      setOtp]      = useState('');
    const [userId,   setUserId]   = useState('');
    const [showOtp,  setShowOtp]  = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [errors,   setErrors]   = useState<Record<string, string>>({});




    // ── Entrance Animations ──
    const headerFade  = useRef(new Animated.Value(0)).current;
    const headerSlide = useRef(new Animated.Value(-50)).current;
    const cardFade    = useRef(new Animated.Value(0)).current;
    const cardSlide   = useRef(new Animated.Value(80)).current;
    const field1Fade  = useRef(new Animated.Value(0)).current;
    const field1Slide = useRef(new Animated.Value(28)).current;
    const field2Fade  = useRef(new Animated.Value(0)).current;
    const field2Slide = useRef(new Animated.Value(28)).current;
    const btnFade     = useRef(new Animated.Value(0)).current;
    const btnSlide    = useRef(new Animated.Value(24)).current;
    const socialFade  = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const makeAnim = (
            fade: Animated.Value,
            slide: Animated.Value,
            delay: number,
        ) =>
            Animated.sequence([
                Animated.delay(delay),
                Animated.parallel([
                    Animated.spring(slide, {
                        toValue: 0,
                        tension: 80,
                        friction: 12,
                        // RN 0.86 Fabric can crash when this animated subtree is
                        // replaced by the OTP form while native updates are queued.
                        useNativeDriver: false,
                    }),
                    Animated.timing(fade, {
                        toValue: 1,
                        duration: 300,
                        easing: Easing.out(Easing.cubic),
                        useNativeDriver: false,
                    }),
                ]),
            ]);

        Animated.parallel([
            // Header slides down
            Animated.spring(headerSlide, {
                toValue: 0, tension: 55, friction: 9, useNativeDriver: false,
            }),
            Animated.timing(headerFade, {
                toValue: 1, duration: 400, useNativeDriver: false,
            }),
            // Card sweeps up
            Animated.spring(cardSlide, {
                toValue: 0, tension: 60, friction: 10, useNativeDriver: false,
            }),
            Animated.timing(cardFade, {
                toValue: 1, duration: 350, useNativeDriver: false,
            }),
            // Fields stagger
            makeAnim(field1Fade, field1Slide, 150),
            makeAnim(field2Fade, field2Slide, 230),
            makeAnim(btnFade,    btnSlide,    320),
            Animated.sequence([
                Animated.delay(420),
                Animated.timing(socialFade, {
                    toValue: 1, duration: 300, useNativeDriver: false,
                }),
            ]),
        ]).start();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Validation ──
    const validate = () => {
        const e: Record<string, string> = {};
        if (!email.trim() || !/\S+@\S+\.\S+/.test(email))
            e.email = 'Enter a valid email address';
        if (!password || password.length < 6)
            e.password = 'Password must be at least 6 characters';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSignIn = async () => {
        if (!validate()) return;
        
        setLoading(true);
        try {
            const data = await loginUser({
                email: email,
                password: password,
            });
            const { user_id, message } = data;
            setUserId(user_id);
            setShowOtp(true);
            setErrors({});
            Alert.alert('OTP Sent ✉️', message || 'Please check your email for the verification code.');
        } catch (error: any) {
            console.error('Login error:', error);
            const errMsg = error.response?.data?.message || 'Invalid credentials. Please try again.';
            Alert.alert('Login Failed', errMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp.trim() || otp.length < 6) {
            setErrors({ otp: 'Please enter a complete 6-digit OTP' });
            return;
        }

        setLoading(true);
        try {
            const data = await verifyOtp({
                user_id: userId,
                otp: otp,
            });
            Alert.alert('Success 🎉', 'Logged in successfully!', [
                { text: 'OK', onPress: () => navigation.navigate('Search') }
            ]);
        } catch (error: any) {
            console.error('OTP verification error:', error);
            const errMsg = error.response?.data?.message || 'Invalid or expired OTP. Please try again.';
            Alert.alert('Verification Failed', errMsg);
        } finally {
            setLoading(false);
        }
    };



    return (
        <View style={styles.screen}>
            <StatusBar barStyle="dark-content" backgroundColor={LIGHT_BG} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* ── Header ── */}
                    <Animated.View
                        style={[
                            styles.header,
                            {
                                opacity: headerFade,
                                transform: [{ translateY: headerSlide }],
                            },
                        ]}
                    >
                        <View style={styles.logoRow}>
                            <View style={styles.logoBox}>
                                <Text style={styles.logoBoxText}>S</Text>
                            </View>
                            <Text style={styles.logoLabel}>ShiftRide</Text>
                        </View>
                        <Text style={styles.heading}>Welcome Back!</Text>
                        <Text style={styles.subHeading}>
                            Sign in to continue your journey
                        </Text>
                    </Animated.View>

                    {/* ── Card ── */}
                    <Animated.View
                        style={[
                            styles.card,
                            {
                                opacity: cardFade,
                                transform: [{ translateY: cardSlide }],
                            },
                        ]}
                    >
                        {!showOtp ? (
                            <View style={{ width: '100%', gap: hp(16) }}>
                                {/* Email */}
                                <InputField
                                    label="Email Address"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChangeText={setEmail}
                                    icon="✉️"
                                    keyboardType="email-address"
                                    error={errors.email}
                                    fadeAnim={field1Fade}
                                    slideAnim={field1Slide}
                                />

                                {/* Password */}
                                <View style={{ position: 'relative' }}>
                                    <TouchableOpacity 
                                        onPress={() => navigation.navigate('ForgotPassword')}
                                        style={{ position: 'absolute', right: 0, top: 0, zIndex: 10 }}
                                    >
                                        <Text style={styles.forgotText}>Forgot Password?</Text>
                                    </TouchableOpacity>
                                    <InputField
                                        label="Password"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChangeText={setPassword}
                                        icon="🔒"
                                        secureTextEntry={!showPass}
                                        showToggle={true}
                                        onToggle={() => setShowPass(p => !p)}
                                        error={errors.password}
                                        fadeAnim={field2Fade}
                                        slideAnim={field2Slide}
                                    />
                                </View>

                                {/* Sign In Button */}
                                <Animated.View
                                    style={{
                                        opacity: btnFade,
                                        transform: [{ translateY: btnSlide }],
                                        marginTop: hp(8),
                                    }}
                                >
                                    <TouchableOpacity
                                        style={styles.signInBtn}
                                        onPress={handleSignIn}
                                        activeOpacity={0.85}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <ActivityIndicator color={WHITE} size="small" />
                                        ) : (
                                            <Text style={styles.signInBtnText}>Sign In</Text>
                                        )}
                                    </TouchableOpacity>
                                </Animated.View>

                                {/* Divider */}
                                <Animated.View style={[styles.dividerRow, { opacity: socialFade }]}>
                                    <View style={styles.dividerLine} />
                                    <Text style={styles.dividerText}>or continue with</Text>
                                    <View style={styles.dividerLine} />
                                </Animated.View>

                                {/* Social Buttons */}
                                <Animated.View style={[styles.socialRow, { opacity: socialFade }]}>
                                    <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
                                        <Text style={styles.socialIcon}>G</Text>
                                        <Text style={styles.socialBtnText}>Google</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.socialBtn, styles.socialBtnDark]}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={[styles.socialIcon, { color: WHITE }]}>🍎</Text>
                                        <Text style={[styles.socialBtnText, { color: WHITE }]}>
                                            Apple
                                        </Text>
                                    </TouchableOpacity>
                                </Animated.View>

                                {/* Register Link */}
                                <Animated.View style={[styles.registerRow, { opacity: socialFade }]}>
                                    <Text style={styles.registerMuted}>
                                        Don't have an account?{' '}
                                    </Text>
                                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                        <Text style={styles.registerAccent}>Register</Text>
                                    </TouchableOpacity>
                                </Animated.View>
                            </View>
                        ) : (
                            <View style={{ width: '100%', gap: hp(16) }}>
                                {/* OTP Input */}
                                <InputField
                                    label="Verification Code (OTP)"
                                    placeholder="Enter 6-digit OTP code"
                                    value={otp}
                                    onChangeText={setOtp}
                                    icon="🔑"
                                    keyboardType="number-pad"
                                    error={errors.otp}
                                />

                                {/* Verify Button */}
                                <TouchableOpacity
                                    style={styles.signInBtn}
                                    onPress={handleVerifyOtp}
                                    activeOpacity={0.85}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator color={WHITE} size="small" />
                                    ) : (
                                        <Text style={styles.signInBtnText}>Verify OTP</Text>
                                    )}
                                </TouchableOpacity>

                                {/* Back Link */}
                                <TouchableOpacity 
                                    onPress={() => {
                                        setShowOtp(false);
                                        setOtp('');
                                    }}
                                    style={{ alignSelf: 'center', marginTop: hp(10) }}
                                >
                                    <Text style={styles.forgotText}>← Back to login</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

export default LoginScreen;

// ─── Styles ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: LIGHT_BG,
    },
    scroll: {
        flexGrow: 1,
        paddingBottom: hp(30),
    },

    // Header
    header: {
        paddingHorizontal: wp(24),
        paddingTop: hp(60),
        paddingBottom: hp(28),
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(8),
        marginBottom: hp(22),
    },
    logoBox: {
        width: wp(34),
        height: wp(34),
        backgroundColor: BLUE,
        borderRadius: wp(9),
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoBoxText: { color: WHITE, fontSize: fs(19), fontWeight: '800' },
    logoLabel:   { fontSize: fs(18), fontWeight: '700', color: NAVY },
    heading: {
        fontSize: fs(32),
        fontWeight: '800',
        color: NAVY,
        marginBottom: hp(6),
    },
    subHeading: {
        fontSize: fs(14),
        color: GRAY,
        lineHeight: fs(20),
    },

    // Card
    card: {
        flex: 1,
        backgroundColor: WHITE,
        borderTopLeftRadius: wp(28),
        borderTopRightRadius: wp(28),
        paddingHorizontal: wp(24),
        paddingTop: hp(30),
        paddingBottom: hp(24),
        gap: hp(16),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -hp(2) },
        shadowOpacity: 0.05,
        shadowRadius: wp(12),
        elevation: 8,
    },

    // Input
    inputWrapper: { gap: hp(6) },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    inputLabel: {
        fontSize: fs(13),
        fontWeight: '600',
        color: NAVY,
    },
    forgotText: {
        fontSize: fs(13),
        color: BLUE,
        fontWeight: '600',
    },
    inputBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: INPUT_BG,
        borderRadius: wp(12),
        borderWidth: 1.5,
        borderColor: BORDER,
        paddingHorizontal: wp(14),
        height: hp(54),
        gap: wp(10),
    },
    inputBoxFocused: {
        borderColor: BLUE,
        backgroundColor: '#EDF3FF',
        shadowColor: BLUE,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: wp(6),
        elevation: 2,
    },
    inputBoxError: {
        borderColor: RED,
        backgroundColor: '#FFF5F5',
    },
    inputIcon: { fontSize: fs(16) },
    input: {
        flex: 1,
        fontSize: fs(14),
        color: NAVY,
        paddingVertical: 0,
    },
    eyeBtn:  { padding: wp(4) },
    eyeIcon: { fontSize: fs(16) },
    errorText: {
        fontSize: fs(12),
        color: RED,
        marginTop: hp(2),
    },

    // Sign In Button
    signInBtn: {
        width: '100%',
        backgroundColor: BLUE,
        paddingVertical: hp(16),
        borderRadius: wp(14),
        alignItems: 'center',
        shadowColor: BLUE,
        shadowOffset: { width: 0, height: hp(6) },
        shadowOpacity: 0.4,
        shadowRadius: wp(12),
        elevation: 6,
    },
    signInBtnText: {
        color: WHITE,
        fontSize: fs(16),
        fontWeight: '700',
        letterSpacing: 0.5,
    },

    // Divider
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(10),
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: BORDER,
    },
    dividerText: {
        fontSize: fs(12),
        color: GRAY,
        fontWeight: '500',
    },

    // Social
    socialRow: {
        flexDirection: 'row',
        gap: wp(12),
    },
    socialBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: wp(8),
        height: hp(50),
        borderRadius: wp(12),
        borderWidth: 1.5,
        borderColor: BORDER,
        backgroundColor: WHITE,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: hp(2) },
        shadowOpacity: 0.05,
        shadowRadius: wp(4),
        elevation: 2,
    },
    socialBtnDark: {
        backgroundColor: NAVY,
        borderColor: NAVY,
    },
    socialIcon: {
        fontSize: fs(16),
        fontWeight: '800',
        color: '#EA4335',
    },
    socialBtnText: {
        fontSize: fs(14),
        fontWeight: '600',
        color: NAVY,
    },

    // Register Link
    registerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: hp(4),
    },
    registerMuted:  { fontSize: fs(14), color: GRAY },
    registerAccent: { fontSize: fs(14), color: BLUE, fontWeight: '700' },
});
