import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Dimensions,
    StatusBar,
    Animated,
    PixelRatio,
    Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

// ─── Assets ────────────────────────────────────────────────────────────────
const slide1CarImg = require('../assets/images/slide1_car.png');
const slide2WorkerImg = require('../assets/images/slide2_worker.png');
const slide3TrackImg = require('../assets/images/slide3_tracking.png');

// ─── Responsive Scale Helpers ──────────────────────────────────────────────
const { width, height } = Dimensions.get('window');
const BASE_W = 375;
const BASE_H = 812;
const wp = (px: number) => (px / BASE_W) * width;
const hp = (px: number) => (px / BASE_H) * height;
const fs = (px: number) =>
    Math.round(PixelRatio.roundToNearestPixel((px / BASE_W) * width));

// ─── Constants ─────────────────────────────────────────────────────────────
const BLUE = '#1A6BFF';
const WHITE = '#FFFFFF';

// ─── Slide Data ────────────────────────────────────────────────────────────
const slides = [
    {
        id: '1',
        image: slide1CarImg,
        title: 'Smart Rides for',
        titleHighlight: 'Every Shift',
        description: 'Daily commute made easy for shift workers. Safe, reliable and on time.',
    },
    {
        id: '2',
        image: slide2WorkerImg,
        title: 'Built for',
        titleHighlight: 'Shift Workers',
        description: 'We understand your schedule. Book rides that fit your shifts, any time, any day.',
    },
    {
        id: '3',
        image: slide3TrackImg,
        title: 'Safe Rides,',
        titleHighlight: 'Every Time',
        description: 'Verified drivers, live tracking and SOS support for your peace of mind.',
    },
];

// ─── Component ─────────────────────────────────────────────────────────────
const OnboardingScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const scrollX = useRef(new Animated.Value(0)).current;

    const goToNext = () => {
        if (currentIndex < slides.length - 1) {
            const next = currentIndex + 1;
            flatListRef.current?.scrollToIndex({ index: next });
            setCurrentIndex(next);
        } else {
            navigation.navigate('Search');
        }
    };

    // Full-screen slide: image fills the entire phone screen
    const renderSlide = ({ item }: { item: (typeof slides)[0] }) => (
        <View style={styles.slide}>
            <Image source={item.image} style={styles.bgImage} resizeMode="cover" />
            {/* Very subtle white wash so illustration doesn't feel too raw */}
            <View style={styles.overlay} />
        </View>
    );

    const isLast = currentIndex === slides.length - 1;

    return (
        <View style={styles.screen}>
            {/* Translucent → image bleeds under status bar */}
            <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

            {/* ── Layer 1: Full-screen image FlatList ── */}
            <Animated.FlatList
                ref={flatListRef}
                data={slides}
                renderItem={renderSlide}
                keyExtractor={item => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false },
                )}
                onMomentumScrollEnd={e => {
                    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
                    setCurrentIndex(idx);
                }}
                scrollEventThrottle={16}
                style={StyleSheet.absoluteFill}
            />

            {/* ── Layer 2: Header overlay ── */}
            <View style={styles.header} pointerEvents="box-none">
                <View style={styles.logoRow}>
                    <View style={styles.logoBox}>
                        <Text style={styles.logoBoxText}>S</Text>
                    </View>
                    <Text style={styles.logoLabel}>ShiftRide</Text>
                </View>
                <TouchableOpacity style={styles.skipBtn} onPress={() => navigation.navigate('Search')}>
                    <Text style={styles.skipLabel}>Skip</Text>
                </TouchableOpacity>
            </View>

            {/* ── Layer 3: Bottom frosted card ── */}
            <View style={styles.bottomCard}>
                <Text style={styles.titleDark}>{slides[currentIndex].title}</Text>
                <Text style={styles.titleAccent}>{slides[currentIndex].titleHighlight}</Text>
                <Text style={styles.descText}>{slides[currentIndex].description}</Text>

                {/* Animated pagination dots */}
                <View style={styles.dotsRow}>
                    {slides.map((_, i) => {
                        const dotW = scrollX.interpolate({
                            inputRange: [(i - 1) * width, i * width, (i + 1) * width],
                            outputRange: [8, 26, 8],
                            extrapolate: 'clamp',
                        });
                        const op = scrollX.interpolate({
                            inputRange: [(i - 1) * width, i * width, (i + 1) * width],
                            outputRange: [0.3, 1, 0.3],
                            extrapolate: 'clamp',
                        });
                        return (
                            <Animated.View
                                key={i}
                                style={[styles.pageDot, { width: dotW, opacity: op }]}
                            />
                        );
                    })}
                </View>

                {/* CTA button */}
                <TouchableOpacity style={styles.actionBtn} onPress={goToNext} activeOpacity={0.85}>
                    <Text style={styles.actionBtnText}>{isLast ? 'Get Started' : 'Next'}</Text>
                </TouchableOpacity>

                {/* Login link */}
                <View style={styles.loginRow}>
                    <Text style={styles.loginMuted}>Have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.loginAccent}>Login</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default OnboardingScreen;

// ─── Styles ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    // Root fills entire screen
    screen: {
        flex: 1,
        backgroundColor: '#DDE9FF',
    },

    // Each slide is exactly the device screen size
    slide: {
        width,
        height,
    },
    bgImage: {
        width: '100%',
        height: '100%',
    },
    overlay: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },

    // ── Header floats at top ──
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: wp(24),
        paddingTop: hp(50),
        paddingBottom: hp(10),
    },
    logoRow: { flexDirection: 'row', alignItems: 'center', gap: wp(8) },
    logoBox: {
        width: wp(34),
        height: wp(34),
        backgroundColor: BLUE,
        borderRadius: wp(9),
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoBoxText: { color: WHITE, fontSize: fs(19), fontWeight: '800' },
    logoLabel: { fontSize: fs(18), fontWeight: '700', color: '#0D1B3E' },
    skipBtn: {
        paddingVertical: hp(6),
        paddingHorizontal: wp(14),
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderRadius: wp(20),
    },
    skipLabel: { fontSize: fs(14), color: '#444', fontWeight: '600' },

    // ── Bottom frosted card anchored to bottom ──
    bottomCard: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255,255,255,0.93)',
        borderTopLeftRadius: wp(30),
        borderTopRightRadius: wp(30),
        paddingHorizontal: wp(26),
        paddingTop: hp(22),
        paddingBottom: hp(38),
        gap: hp(10),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -hp(3) },
        shadowOpacity: 0.07,
        shadowRadius: wp(18),
        elevation: 12,
    },
    titleDark: {
        fontSize: fs(28),
        fontWeight: '800',
        color: '#0D1B3E',
        lineHeight: fs(36),
    },
    titleAccent: {
        fontSize: fs(28),
        fontWeight: '800',
        color: BLUE,
        lineHeight: fs(36),
        marginTop: -hp(2),
    },
    descText: {
        fontSize: fs(14),
        color: '#5A6880',
        lineHeight: fs(22),
        marginBottom: hp(4),
    },

    // Dots
    dotsRow: { flexDirection: 'row', alignItems: 'center', gap: wp(6) },
    pageDot: { height: wp(8), backgroundColor: BLUE, borderRadius: wp(4) },

    // Button
    actionBtn: {
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
    actionBtnText: {
        color: WHITE,
        fontSize: fs(16),
        fontWeight: '700',
        letterSpacing: 0.5,
    },

    // Login
    loginRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginMuted: { fontSize: fs(14), color: '#777' },
    loginAccent: { fontSize: fs(14), color: BLUE, fontWeight: '700' },
});
