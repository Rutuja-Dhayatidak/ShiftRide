import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    Animated,
    Easing,
    PixelRatio,
    Dimensions,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { registerUser } from '../services/auth';
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



// ─── Register Screen ───────────────────────────────────────────────────────
const RegisterScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [loading,         setLoading]         = useState(false);
    const [fullName,        setFullName]        = useState('');
    const [mobile,          setMobile]          = useState('');

    const [email,           setEmail]           = useState('');
    const [password,        setPassword]        = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPass,        setShowPass]        = useState(false);
    const [showConfirm,     setShowConfirm]     = useState(false);
    const [agreed,          setAgreed]          = useState(false);
    const [errors,          setErrors]          = useState<Record<string, string>>({});

    // ── Entrance Animations ──
    const headerFade  = useRef(new Animated.Value(0)).current;
    const headerSlide = useRef(new Animated.Value(-40)).current;
    const field1Fade  = useRef(new Animated.Value(0)).current;
    const field1Slide = useRef(new Animated.Value(30)).current;
    const field2Fade  = useRef(new Animated.Value(0)).current;
    const field2Slide = useRef(new Animated.Value(30)).current;
    const field3Fade  = useRef(new Animated.Value(0)).current;
    const field3Slide = useRef(new Animated.Value(30)).current;
    const field4Fade  = useRef(new Animated.Value(0)).current;
    const field4Slide = useRef(new Animated.Value(30)).current;
    const field5Fade  = useRef(new Animated.Value(0)).current;
    const field5Slide = useRef(new Animated.Value(30)).current;
    const btnFade     = useRef(new Animated.Value(0)).current;
    const btnSlide    = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        const makeAnim = (fade: Animated.Value, slide: Animated.Value, delay: number) =>
            Animated.sequence([
                Animated.delay(delay),
                Animated.parallel([
                    Animated.spring(slide, { toValue: 0, tension: 80, friction: 12, useNativeDriver: true }),
                    Animated.timing(fade, { toValue: 1, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
                ]),
            ]);

        Animated.parallel([
            Animated.spring(headerSlide, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
            Animated.timing(headerFade, { toValue: 1, duration: 350, useNativeDriver: true }),
            makeAnim(field1Fade, field1Slide, 120),
            makeAnim(field2Fade, field2Slide, 190),
            makeAnim(field3Fade, field3Slide, 260),
            makeAnim(field4Fade, field4Slide, 330),
            makeAnim(field5Fade, field5Slide, 400),
            makeAnim(btnFade,    btnSlide,    470),
        ]).start();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Validation ──
    const validate = () => {
        const e: Record<string, string> = {};
        if (!fullName.trim())
            e.fullName = 'Full name is required';
        if (!mobile.trim() || mobile.length < 10)
            e.mobile = 'Enter a valid 10-digit mobile number';
        if (!email.trim() || !/\S+@\S+\.\S+/.test(email))
            e.email = 'Enter a valid email address';
        if (!password || password.length < 6)
            e.password = 'Password must be at least 6 characters';
        if (password !== confirmPassword)
            e.confirmPassword = 'Passwords do not match';
        if (!agreed)
            e.terms = 'You must agree to the Terms & Conditions';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleRegister = async () => {
        if (!validate()) return;
        
        setLoading(true);
        try {
            const data = await registerUser({
                name: fullName,
                email: email,
                phone: mobile,
                password: password,
            });
            Alert.alert('Success 🎉', data.message || 'Account created successfully!', [
                { text: 'Login Now', onPress: () => navigation.navigate('Login') }
            ]);
        } catch (error: any) {
            console.error('Registration error:', error);
            const errMsg = error.response?.data?.message || 'Something went wrong. Please try again.';
            Alert.alert('Registration Failed', errMsg);
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
                            { opacity: headerFade, transform: [{ translateY: headerSlide }] },
                        ]}
                    >
                        <View style={styles.logoRow}>
                            <View style={styles.logoBox}>
                                <Text style={styles.logoBoxText}>S</Text>
                            </View>
                            <Text style={styles.logoLabel}>ShiftRide</Text>
                        </View>
                        <Text style={styles.heading}>Create Account</Text>
                        <Text style={styles.subHeading}>
                            Join thousands of shift workers commuting smarter
                        </Text>
                    </Animated.View>

                    {/* ── Form Card ── */}
                    <View style={styles.card}>
                        <InputField
                            label="Full Name"
                            placeholder="Enter your full name"
                            value={fullName}
                            onChangeText={setFullName}
                            icon="👤"
                            error={errors.fullName}
                            fadeAnim={field1Fade}
                            slideAnim={field1Slide}
                        />
                        <InputField
                            label="Mobile Number"
                            placeholder="Enter your mobile number"
                            value={mobile}
                            onChangeText={setMobile}
                            icon="📱"
                            keyboardType="phone-pad"
                            error={errors.mobile}
                            fadeAnim={field2Fade}
                            slideAnim={field2Slide}
                        />
                        <InputField
                            label="Email Address"
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={setEmail}
                            icon="✉️"
                            keyboardType="email-address"
                            error={errors.email}
                            fadeAnim={field3Fade}
                            slideAnim={field3Slide}
                        />
                        <InputField
                            label="Password"
                            placeholder="Create a password"
                            value={password}
                            onChangeText={setPassword}
                            icon="🔒"
                            secureTextEntry={!showPass}
                            showToggle
                            onToggle={() => setShowPass(p => !p)}
                            error={errors.password}
                            fadeAnim={field4Fade}
                            slideAnim={field4Slide}
                        />
                        <InputField
                            label="Confirm Password"
                            placeholder="Re-enter your password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            icon="🔒"
                            secureTextEntry={!showConfirm}
                            showToggle
                            onToggle={() => setShowConfirm(p => !p)}
                            error={errors.confirmPassword}
                            fadeAnim={field5Fade}
                            slideAnim={field5Slide}
                        />

                        {/* ── Terms & Conditions ── */}
                        <Animated.View style={[styles.termsRow, { opacity: btnFade }]}>
                            <TouchableOpacity
                                style={[styles.checkbox, agreed && styles.checkboxChecked]}
                                onPress={() => setAgreed(a => !a)}
                                activeOpacity={0.8}
                            >
                                {agreed && <Text style={styles.checkmark}>✓</Text>}
                            </TouchableOpacity>
                            <View style={styles.termsTextWrap}>
                                <Text style={styles.termsText}>
                                    I agree to the{' '}
                                    <Text style={styles.termsLink}>Terms & Conditions</Text>
                                    {' '}and{' '}
                                    <Text style={styles.termsLink}>Privacy Policy</Text>
                                </Text>
                            </View>
                        </Animated.View>
                        {!!errors.terms && (
                            <Text style={[styles.errorText, { marginTop: -hp(6) }]}>
                                ⚠ {errors.terms}
                            </Text>
                        )}

                        {/* ── Register Button ── */}
                        <Animated.View
                            style={{ opacity: btnFade, transform: [{ translateY: btnSlide }] }}
                        >
                            <TouchableOpacity
                                style={styles.registerBtn}
                                onPress={handleRegister}
                                activeOpacity={0.85}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color={WHITE} size="small" />
                                ) : (
                                    <Text style={styles.registerBtnText}>Register</Text>
                                )}
                            </TouchableOpacity>
                        </Animated.View>

                        {/* ── Login Link ── */}
                        <Animated.View style={[styles.loginRow, { opacity: btnFade }]}>
                            <Text style={styles.loginMuted}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.loginAccent}>Login</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

export default RegisterScreen;

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
        paddingBottom: hp(24),
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(8),
        marginBottom: hp(20),
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
        fontSize: fs(30),
        fontWeight: '800',
        color: NAVY,
        marginBottom: hp(6),
    },
    subHeading: {
        fontSize: fs(14),
        color: GRAY,
        lineHeight: fs(20),
    },

    // Form Card
    card: {
        flex: 1,
        backgroundColor: WHITE,
        borderTopLeftRadius: wp(28),
        borderTopRightRadius: wp(28),
        paddingHorizontal: wp(24),
        paddingTop: hp(28),
        paddingBottom: hp(24),
        gap: hp(14),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -hp(2) },
        shadowOpacity: 0.05,
        shadowRadius: wp(12),
        elevation: 8,
    },

    // Input
    inputWrapper: { gap: hp(6) },
    inputLabel: {
        fontSize: fs(13),
        fontWeight: '600',
        color: NAVY,
    },
    inputBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: INPUT_BG,
        borderRadius: wp(12),
        borderWidth: 1.5,
        borderColor: BORDER,
        paddingHorizontal: wp(14),
        height: hp(52),
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

    // Terms
    termsRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: wp(10),
        marginTop: hp(4),
    },
    checkbox: {
        width: wp(20),
        height: wp(20),
        borderRadius: wp(5),
        borderWidth: 2,
        borderColor: BLUE,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: hp(2),
        backgroundColor: WHITE,
    },
    checkboxChecked: {
        backgroundColor: BLUE,
        borderColor: BLUE,
    },
    checkmark: {
        color: WHITE,
        fontSize: fs(12),
        fontWeight: '800',
    },
    termsTextWrap: { flex: 1 },
    termsText: {
        fontSize: fs(13),
        color: GRAY,
        lineHeight: fs(20),
    },
    termsLink: {
        color: BLUE,
        fontWeight: '600',
    },

    // Register Button
    registerBtn: {
        width: '100%',
        backgroundColor: BLUE,
        paddingVertical: hp(16),
        borderRadius: wp(14),
        alignItems: 'center',
        marginTop: hp(6),
        shadowColor: BLUE,
        shadowOffset: { width: 0, height: hp(6) },
        shadowOpacity: 0.4,
        shadowRadius: wp(12),
        elevation: 6,
    },
    registerBtnText: {
        color: WHITE,
        fontSize: fs(16),
        fontWeight: '700',
        letterSpacing: 0.5,
    },

    // Login Link
    loginRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: hp(4),
    },
    loginMuted:  { fontSize: fs(14), color: GRAY },
    loginAccent: { fontSize: fs(14), color: BLUE, fontWeight: '700' },
});
