import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    Dimensions,
    PixelRatio,
    Switch,
    Animated,
    TextInput,
    Alert,
    Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { BottomNavigation } from '../components/bottomnavigation';
import { getSessionUser, setSession } from '../services/auth';
import { isDarkMode, setDarkMode, subscribeThemeChange } from '../services/theme';
import api from '../services/api';
import { launchImageLibrary } from 'react-native-image-picker';

const { width } = Dimensions.get('window');
const BASE_W = 375;
const wp = (px: number) => Math.round(PixelRatio.roundToNearestPixel((px / BASE_W) * width));
const fs = (px: number) => Math.round(PixelRatio.roundToNearestPixel((px / BASE_W) * width));

// Premium Theme Colors
const NAVY = '#10173A';
const GRAY = '#8A94A6';
const GRAY_LT = '#F4F6F9';
const WHITE = '#FFFFFF';
const BLUE = '#1C69D4';
const BORDER = '#EAEFF5';
const RED = '#FF5C5C';
const GOLD = '#F5A623';

// ─── Custom Vector Icons (Drawn using React Native Views) ───

// Gear/Settings Icon
const SettingsIcon = () => (
    <View style={{ width: wp(20), height: wp(20), alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: wp(12), height: wp(12), borderRadius: wp(6), borderWidth: 2.5, borderColor: WHITE }} />
        {[0, 45, 90, 135].map((deg) => (
            <View
                key={deg}
                style={{
                    position: 'absolute',
                    width: wp(20),
                    height: wp(3),
                    borderRadius: wp(1),
                    backgroundColor: WHITE,
                    opacity: 0.3,
                    transform: [{ rotate: `${deg}deg` }],
                    zIndex: -1,
                }}
            />
        ))}
    </View>
);

// Wallet Icon (replacing 👛/💳)
const CustomWalletIcon = ({ color }: { color: string }) => (
    <View style={{ width: wp(20), height: wp(16), borderRadius: wp(4), borderWidth: 2, borderColor: color, justifyContent: 'center' }}>
        <View style={{ position: 'absolute', right: -wp(1), width: wp(6), height: wp(8), borderRadius: wp(2), backgroundColor: color, borderLeftWidth: 1, borderLeftColor: WHITE }} />
        <View style={{ position: 'absolute', right: wp(1), width: wp(2), height: wp(2), borderRadius: wp(1), backgroundColor: WHITE }} />
    </View>
);

// Car Icon (replacing 🏎️/🚗)
const CustomCarIcon = ({ color }: { color: string }) => (
    <View style={{ width: wp(22), height: wp(14), justifyContent: 'flex-end', position: 'relative' }}>
        {/* Roof */}
        <View style={{ width: wp(12), height: wp(6), borderTopLeftRadius: wp(4), borderTopRightRadius: wp(4), backgroundColor: color, alignSelf: 'center', marginBottom: -wp(1) }} />
        {/* Body */}
        <View style={{ width: wp(22), height: wp(7), borderRadius: wp(2), backgroundColor: color }} />
        {/* Wheels */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: wp(2), marginTop: -wp(1) }}>
            <View style={{ width: wp(5), height: wp(5), borderRadius: wp(2.5), backgroundColor: NAVY, borderWidth: 1, borderColor: WHITE }} />
            <View style={{ width: wp(5), height: wp(5), borderRadius: wp(2.5), backgroundColor: NAVY, borderWidth: 1, borderColor: WHITE }} />
        </View>
    </View>
);

// Star Icon (replacing ⭐️)
const CustomStarIcon = ({ color }: { color: string }) => (
    <View style={{ width: wp(18), height: wp(18), alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: fs(18), color, fontWeight: 'bold', lineHeight: fs(20) }}>★</Text>
    </View>
);

// User Icon (replacing 👤)
const CustomUserIcon = ({ color }: { color: string }) => (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: wp(20), height: wp(20) }}>
        <View style={{ width: wp(10), height: wp(10), borderRadius: wp(5), borderWidth: 2, borderColor: color }} />
        <View style={{ width: wp(18), height: wp(7), borderTopLeftRadius: wp(8), borderTopRightRadius: wp(8), borderWidth: 2, borderBottomWidth: 0, borderColor: color, marginTop: wp(1) }} />
    </View>
);

// Bell Icon (replacing 🔔)
const CustomBellIcon = ({ color }: { color: string }) => (
    <View style={{ alignItems: 'center', width: wp(20), height: wp(20), justifyContent: 'center' }}>
        <View style={{ width: wp(14), height: wp(12), borderTopLeftRadius: wp(7), borderTopRightRadius: wp(7), borderWidth: 2, borderColor: color, borderBottomWidth: 0 }} />
        <View style={{ width: wp(18), height: wp(2.5), borderRadius: wp(1), backgroundColor: color }} />
        <View style={{ width: wp(6), height: wp(3), borderBottomLeftRadius: wp(3), borderBottomRightRadius: wp(3), backgroundColor: color, marginTop: wp(0.5) }} />
    </View>
);

// Moon Icon (replacing 🌙)
const CustomMoonIcon = ({ color, bg = WHITE }: { color: string, bg?: string }) => (
    <View style={{ width: wp(16), height: wp(16), borderRadius: wp(8), backgroundColor: color, position: 'relative' }}>
        {/* Overlay to create crescent */}
        <View style={{ position: 'absolute', top: -wp(2), left: -wp(2), width: wp(14), height: wp(14), borderRadius: wp(7), backgroundColor: bg }} />
    </View>
);

// Shield Icon (replacing 🛡️)
const CustomShieldIcon = ({ color }: { color: string }) => (
    <View style={{ width: wp(16), height: wp(18), borderLeftWidth: 2, borderRightWidth: 2, borderBottomWidth: 2, borderTopWidth: 2, borderColor: color, borderBottomLeftRadius: wp(8), borderBottomRightRadius: wp(8), borderTopLeftRadius: wp(2), borderTopRightRadius: wp(2), alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: wp(6), height: wp(6), backgroundColor: color, borderRadius: wp(1) }} />
    </View>
);

// Logout Icon (replacing 🚪)
const CustomLogoutIcon = ({ color }: { color: string }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', width: wp(20), height: wp(20) }}>
        {/* Arrow */}
        <View style={{ width: wp(10), height: wp(2), backgroundColor: color, marginRight: -wp(2), position: 'relative', justifyContent: 'center' }}>
            <View style={{ position: 'absolute', right: 0, width: wp(5), height: wp(5), borderTopWidth: 2, borderRightWidth: 2, borderColor: color, transform: [{ rotate: '45deg' }], marginTop: -wp(1.5) }} />
        </View>
        {/* Bracket */}
        <View style={{ width: wp(6), height: wp(16), borderTopWidth: 2, borderBottomWidth: 2, borderRightWidth: 2, borderColor: color, borderTopRightRadius: wp(3), borderBottomRightRadius: wp(3) }} />
    </View>
);

const PRESET_AVATARS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
];

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ProfileScreen() {
    const navigation = useNavigation<NavigationProp>();
    const [activeTab, setActiveTab] = useState(4); // Profile tab is 4
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [darkModeEnabled, setDarkModeEnabled] = useState(isDarkMode());

    // Entrance Animation Values
    const headerFade = useRef(new Animated.Value(0)).current;
    const headerTranslateY = useRef(new Animated.Value(-30)).current;
    const contentFade = useRef(new Animated.Value(0)).current;
    const contentTranslateY = useRef(new Animated.Value(45)).current;

    useEffect(() => {
        Animated.stagger(40, [
            Animated.parallel([
                Animated.timing(headerFade, { toValue: 1, duration: 180, useNativeDriver: true }),
                Animated.timing(headerTranslateY, { toValue: 0, duration: 180, useNativeDriver: true }),
            ]),
            Animated.parallel([
                Animated.timing(contentFade, { toValue: 1, duration: 200, useNativeDriver: true }),
                Animated.timing(contentTranslateY, { toValue: 0, duration: 200, useNativeDriver: true }),
            ]),
        ]).start();

        const unsubscribe = subscribeThemeChange((isDark) => {
            setDarkModeEnabled(isDark);
        });
        return unsubscribe;
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const sessionUser = getSessionUser();
    const [fullName, setFullName] = useState(sessionUser?.name || 'Andrew Ainsley');
    const [email, setEmail] = useState(sessionUser?.email || 'andrew.ainsley@gmail.com');
    const [phone, setPhone] = useState(sessionUser?.phone || '+1 111 467 378');
    const [showPersonalInfo, setShowPersonalInfo] = useState(false);
    const [showPaymentMethods, setShowPaymentMethods] = useState(false);
    const [tripCount, setTripCount] = useState(0);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);
    const [customUrl, setCustomUrl] = useState('');

    useEffect(() => {
        const loadSavedAvatar = async () => {
            try {
                const saved = await AsyncStorage.getItem('user_avatar');
                if (saved) setProfileImage(saved);
            } catch (e) {
                console.log('Failed to load saved avatar:', e);
            }
        };
        loadSavedAvatar();
    }, []);

    const saveAvatar = async (uri: string | null) => {
        try {
            setProfileImage(uri);
            if (uri) {
                await AsyncStorage.setItem('user_avatar', uri);
            } else {
                await AsyncStorage.removeItem('user_avatar');
            }
        } catch (e) {
            console.log('Failed to save avatar:', e);
        }
    };

    const selectImageFromGallery = () => {
        launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.errorMessage) {
                console.log('ImagePicker Error: ', response.errorMessage);
                Alert.alert('Error', response.errorMessage);
            } else if (response.assets && response.assets.length > 0) {
                const uri = response.assets[0].uri;
                if (uri) {
                    saveAvatar(uri);
                    setShowAvatarPicker(false);
                }
            }
        });
    };

    useEffect(() => {
        const fetchTrips = async () => {
            try {
                const response = await api.get('/bookings/mybookings');
                if (response && Array.isArray(response.data)) {
                    setTripCount(response.data.length);
                }
            } catch (err) {
                console.log("Failed to load user bookings count:", err);
            }
        };
        fetchTrips();
    }, []);

    const userProfile = {
        name: fullName,
        email: email,
        phone: phone,
        status: 'Active',
        trips: tripCount,
        joined: '2026',
    };

    const isDark = darkModeEnabled;
    const theme = {
        bg: isDark ? '#0F172A' : '#FAFBFD',
        cardBg: isDark ? '#1E293B' : WHITE,
        textMain: isDark ? WHITE : NAVY,
        textSub: isDark ? '#94A3B8' : GRAY,
        border: isDark ? '#334155' : 'rgba(234, 237, 244, 0.7)',
        menuIconBg: isDark ? '#334155' : '#F8FAFC',
    };

    const initials = userProfile.name
        .split(' ')
        .filter(Boolean)
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'AA';

    return (
        <View style={[s.screen, { backgroundColor: theme.bg }]}>
            {/* Dark status bar to match navy header */}
            <StatusBar barStyle="light-content" backgroundColor={NAVY} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContainer}>
                
                {/* ── Navy Curved Header (Animated) ── */}
                <Animated.View style={[s.navyHeader, { opacity: headerFade, transform: [{ translateY: headerTranslateY }] }]}>
                    {/* Background visual accents */}
                    <View style={s.circleAccent1} />
                    <View style={s.circleAccent2} />

                    <View style={s.headerTop}>
                        <Text style={s.headerTitle}>Profile</Text>
                        <TouchableOpacity style={s.settingsIconBtn} activeOpacity={0.7}>
                            <SettingsIcon />
                        </TouchableOpacity>
                    </View>

                    {/* Profile Card Inside Header */}
                    <View style={s.profileCard}>
                        <TouchableOpacity style={s.avatarContainer} activeOpacity={0.8} onPress={() => setShowAvatarPicker(!showAvatarPicker)}>
                            <View style={s.avatar}>
                                {profileImage ? (
                                    <Image source={{ uri: profileImage }} style={s.avatarImg} />
                                ) : (
                                    <Text style={s.avatarTxt}>{initials}</Text>
                                )}
                            </View>
                            <View style={[s.editBadge]}>
                                <Text style={s.editBadgeTxt}>📷</Text>
                            </View>
                        </TouchableOpacity>
                        <View style={s.profileInfo}>
                            <Text style={s.profileName}>{userProfile.name}</Text>
                            <Text style={s.profileEmail}>{userProfile.email}</Text>
                            <View style={s.vipBadge}>
                                <Text style={s.vipText}>★ VIP GOLD MEMBER</Text>
                            </View>
                        </View>
                    </View>

                    {/* Avatar Picker Panel */}
                    {showAvatarPicker && (
                        <View style={[s.pickerPanel, { backgroundColor: 'rgba(255,255,255,0.08)' }]}>
                            <Text style={s.pickerTitle}>Choose Profile Photo</Text>
                            <View style={s.presetRow}>
                                {PRESET_AVATARS.map((url, i) => (
                                    <TouchableOpacity 
                                        key={i} 
                                        style={[s.presetAvatarBtn, profileImage === url && s.presetAvatarBtnActive]} 
                                        onPress={() => saveAvatar(url)}
                                    >
                                        <Image source={{ uri: url }} style={s.presetAvatarImg} />
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TouchableOpacity 
                                style={s.gallerySelectBtn}
                                activeOpacity={0.85}
                                onPress={selectImageFromGallery}
                            >
                                <Text style={s.gallerySelectBtnTxt}>🖼️ Choose from Gallery</Text>
                            </TouchableOpacity>

                            <View style={s.customUrlRow}>
                                <TextInput 
                                    style={s.urlInput}
                                    placeholder="Or paste photo URL..."
                                    placeholderTextColor="rgba(255,255,255,0.5)"
                                    value={customUrl}
                                    onChangeText={setCustomUrl}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity 
                                    style={s.applyBtn}
                                    onPress={() => {
                                        if (customUrl.trim()) {
                                            saveAvatar(customUrl.trim());
                                            setCustomUrl('');
                                        }
                                    }}
                                >
                                    <Text style={s.applyBtnTxt}>Apply</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </Animated.View>

                {/* ── Floating Stats and Menu List (Animated) ── */}
                <Animated.View style={{ opacity: contentFade, transform: [{ translateY: contentTranslateY }] }}>
                    
                    {/* ── Floating Stats Card ── */}
                    <View style={[s.statsContainer, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                        <View style={s.statBox}>
                            <View style={s.statIconWrapper}>
                                <CustomCarIcon color={BLUE} />
                            </View>
                            <Text style={[s.statVal, { color: theme.textMain }]}>{userProfile.trips}</Text>
                            <Text style={s.statLabel}>Trips</Text>
                        </View>
                        <View style={[s.statDivider, { backgroundColor: theme.border }]} />
                        <View style={s.statBox}>
                            <View style={s.statIconWrapper}>
                                <CustomShieldIcon color="#10B981" />
                            </View>
                            <Text style={[s.statVal, { color: '#10B981' }]}>{userProfile.status}</Text>
                            <Text style={s.statLabel}>Status</Text>
                        </View>
                        <View style={[s.statDivider, { backgroundColor: theme.border }]} />
                        <View style={s.statBox}>
                            <View style={s.statIconWrapper}>
                                <CustomUserIcon color={GOLD} />
                            </View>
                            <Text style={[s.statVal, { color: theme.textMain }]}>{userProfile.joined}</Text>
                            <Text style={s.statLabel}>Joined</Text>
                        </View>
                    </View>

                    {/* ── Account Settings Section ── */}
                    <View style={s.section}>
                        <View style={s.sectionHeader}>
                            <Text style={[s.sectionTitle, { color: theme.textMain }]}>Account Settings</Text>
                            <View style={[s.titleBar, { backgroundColor: theme.border }]} />
                        </View>

                        <TouchableOpacity 
                            style={[s.menuItem, { backgroundColor: theme.cardBg, borderColor: theme.border }]} 
                            activeOpacity={0.75}
                            onPress={() => setShowPersonalInfo(!showPersonalInfo)}
                        >
                            <View style={s.menuLeft}>
                                <View style={[s.menuIconBg, { backgroundColor: isDark ? '#334155' : '#EEF2FF' }]}>
                                    <CustomUserIcon color={isDark ? '#818CF8' : '#4F46E5'} />
                                </View>
                                <View style={s.menuTextContent}>
                                    <Text style={[s.menuTitle, { color: theme.textMain }]}>Personal Information</Text>
                                    <Text style={[s.menuSubtitle, { color: theme.textSub }]}>Manage your profile details</Text>
                                </View>
                            </View>
                            <Text style={[s.chevron, { color: theme.textSub }]}>{showPersonalInfo ? '▼' : '›'}</Text>
                        </TouchableOpacity>

                        {showPersonalInfo && (
                            <View style={[s.personalInfoCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                                <Text style={[s.infoLabel, { color: theme.textSub }]}>Full Name</Text>
                                <TextInput 
                                    style={[s.infoInput, { color: theme.textMain, borderColor: theme.border, backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}
                                    value={fullName}
                                    onChangeText={setFullName}
                                />
                                
                                <Text style={[s.infoLabel, { color: theme.textSub, marginTop: wp(12) }]}>Email Address</Text>
                                <TextInput 
                                    style={[s.infoInput, { color: theme.textMain, borderColor: theme.border, backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                                
                                <Text style={[s.infoLabel, { color: theme.textSub, marginTop: wp(12) }]}>Phone Number</Text>
                                <TextInput 
                                    style={[s.infoInput, { color: theme.textMain, borderColor: theme.border, backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}
                                    value={phone}
                                    onChangeText={setPhone}
                                    keyboardType="phone-pad"
                                />
                                
                                
                                <TouchableOpacity 
                                    style={s.saveBtn} 
                                    activeOpacity={0.85}
                                    onPress={() => {
                                        Alert.alert('Success 🎉', 'Profile information updated successfully!');
                                        setShowPersonalInfo(false);
                                    }}
                                >
                                    <Text style={s.saveBtnTxt}>Save Changes</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        <TouchableOpacity 
                            style={[s.menuItem, { backgroundColor: theme.cardBg, borderColor: theme.border }]} 
                            activeOpacity={0.75}
                            onPress={() => setShowPaymentMethods(!showPaymentMethods)}
                        >
                            <View style={s.menuLeft}>
                                <View style={[s.menuIconBg, { backgroundColor: isDark ? '#1E293B' : '#ECFDF5' }]}>
                                    <CustomWalletIcon color="#10B981" />
                                </View>
                                <View style={s.menuTextContent}>
                                    <Text style={[s.menuTitle, { color: theme.textMain }]}>Payment Methods</Text>
                                    <Text style={[s.menuSubtitle, { color: theme.textSub }]}>Saved cards and payment accounts</Text>
                                </View>
                            </View>
                            <Text style={[s.chevron, { color: theme.textSub }]}>{showPaymentMethods ? '▼' : '›'}</Text>
                        </TouchableOpacity>

                        {showPaymentMethods && (
                            <View style={[s.personalInfoCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                                <Text style={[s.infoLabel, { color: theme.textSub }]}>Active Payment Gateway</Text>
                                <View style={[s.paymentMethodRow, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: theme.border }]}>
                                    <Text style={{ fontSize: fs(18) }}>💳</Text>
                                    <View style={{ flex: 1, paddingLeft: wp(8) }}>
                                        <Text style={[s.paymentTitle, { color: theme.textMain }]}>Razorpay / Cards</Text>
                                        <Text style={{ fontSize: fs(10.5), color: theme.textSub }}>Primary Gateway Connected</Text>
                                    </View>
                                    <View style={s.activeBadge}>
                                        <Text style={s.activeBadgeTxt}>ACTIVE</Text>
                                    </View>
                                </View>
                                
                                <Text style={[s.infoLabel, { color: theme.textSub, marginTop: wp(12) }]}>Saved Card</Text>
                                <View style={[s.paymentMethodRow, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: theme.border }]}>
                                    <Text style={{ fontSize: fs(18) }}>💳</Text>
                                    <View style={{ flex: 1, paddingLeft: wp(8) }}>
                                        <Text style={[s.paymentTitle, { color: theme.textMain }]}>Visa ending in 4242</Text>
                                        <Text style={{ fontSize: fs(10.5), color: theme.textSub }}>Expires 12/28</Text>
                                    </View>
                                </View>
                                
                                <TouchableOpacity 
                                    style={s.saveBtn} 
                                    activeOpacity={0.85}
                                    onPress={() => {
                                        Alert.alert('Payment Methods', 'Razorpay integration is secure and configured for cards/UPI.');
                                    }}
                                >
                                    <Text style={s.saveBtnTxt}>Configure Razorpay</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        <TouchableOpacity style={[s.menuItem, { backgroundColor: theme.cardBg, borderColor: theme.border }]} activeOpacity={0.75} onPress={() => navigation.navigate('MyBookings')}>
                            <View style={s.menuLeft}>
                                <View style={[s.menuIconBg, { backgroundColor: isDark ? '#1E293B' : '#EFF6FF' }]}>
                                    <CustomCarIcon color={BLUE} />
                                </View>
                                <View style={s.menuTextContent}>
                                    <Text style={[s.menuTitle, { color: theme.textMain }]}>My Bookings</Text>
                                    <Text style={[s.menuSubtitle, { color: theme.textSub }]}>Active, pending, and past rentals</Text>
                                </View>
                            </View>
                            <Text style={s.chevron}>›</Text>
                        </TouchableOpacity>
                    </View>

                    {/* ── Preferences Section ── */}
                    <View style={s.section}>
                        <View style={s.sectionHeader}>
                            <Text style={[s.sectionTitle, { color: theme.textMain }]}>Preferences</Text>
                            <View style={[s.titleBar, { backgroundColor: theme.border }]} />
                        </View>

                        <View style={[s.menuItemNonClickable, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                            <View style={s.menuLeft}>
                                <View style={[s.menuIconBg, { backgroundColor: isDark ? '#334155' : '#FFF7ED' }]}>
                                    <CustomBellIcon color={isDark ? '#FDBA74' : '#F97316'} />
                                </View>
                                <View style={s.menuTextContent}>
                                    <Text style={[s.menuTitle, { color: theme.textMain }]}>Notifications</Text>
                                    <Text style={[s.menuSubtitle, { color: theme.textSub }]}>Get updates on deals and rides</Text>
                                </View>
                            </View>
                            <Switch
                                value={notificationsEnabled}
                                onValueChange={setNotificationsEnabled}
                                trackColor={{ false: '#E2E8F0', true: BLUE }}
                                thumbColor={WHITE}
                            />
                        </View>

                        <TouchableOpacity
                            style={[s.menuItemNonClickable, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
                            activeOpacity={0.8}
                            onPress={() => setDarkMode(!darkModeEnabled)}
                        >
                            <View style={s.menuLeft}>
                                <View style={[s.menuIconBg, { backgroundColor: theme.menuIconBg }]}>
                                    <CustomMoonIcon color={isDark ? '#94A3B8' : '#64748B'} bg={theme.menuIconBg} />
                                </View>
                                <View style={s.menuTextContent}>
                                    <Text style={[s.menuTitle, { color: theme.textMain }]}>Dark Mode</Text>
                                    <Text style={[s.menuSubtitle, { color: theme.textSub }]}>Switch app presentation style</Text>
                                </View>
                            </View>
                            <Switch
                                value={darkModeEnabled}
                                onValueChange={(val) => setDarkMode(val)}
                                trackColor={{ false: '#E2E8F0', true: BLUE }}
                                thumbColor={WHITE}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* ── Support & Legal ── */}
                    <View style={s.section}>
                        <View style={s.sectionHeader}>
                            <Text style={[s.sectionTitle, { color: theme.textMain }]}>Support & Legal</Text>
                            <View style={[s.titleBar, { backgroundColor: theme.border }]} />
                        </View>

                        <TouchableOpacity style={[s.menuItem, { backgroundColor: theme.cardBg, borderColor: theme.border }]} activeOpacity={0.75}>
                            <View style={s.menuLeft}>
                                <View style={[s.menuIconBg, { backgroundColor: isDark ? '#1E293B' : '#ECFEFF' }]}>
                                    <CustomShieldIcon color="#0891B2" />
                                </View>
                                <View style={s.menuTextContent}>
                                    <Text style={[s.menuTitle, { color: theme.textMain }]}>Privacy Policy</Text>
                                    <Text style={[s.menuSubtitle, { color: theme.textSub }]}>Data privacy and terms of service</Text>
                                </View>
                            </View>
                            <Text style={s.chevron}>›</Text>
                        </TouchableOpacity>

                        {/* Red themed elegant logout button */}
                        <TouchableOpacity 
                            style={[s.logoutBtn, isDark && { backgroundColor: '#311E1E', borderColor: '#5C3A3A' }]} 
                            activeOpacity={0.8} 
                            onPress={async () => {
                                await setSession(null, null);
                                navigation.navigate('Login');
                            }}
                        >
                            <View style={s.logoutContent}>
                                <CustomLogoutIcon color={RED} />
                                <Text style={s.logoutText}>Log Out</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                </Animated.View>

                <View style={{ height: wp(40) }} />
            </ScrollView>

            {/* ── Bottom Nav Component ── */}
            <BottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        </View>
    );
}

const s = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#FAFBFD' },
    scrollContainer: { flexGrow: 1 },
    
    // Navy Curved Header Banner
    navyHeader: {
        backgroundColor: NAVY,
        paddingTop: wp(20),
        paddingHorizontal: wp(24),
        paddingBottom: wp(48),
        borderBottomLeftRadius: wp(32),
        borderBottomRightRadius: wp(32),
        position: 'relative',
        overflow: 'hidden',
    },
    circleAccent1: {
        position: 'absolute',
        top: -wp(40),
        right: -wp(40),
        width: wp(140),
        height: wp(140),
        borderRadius: wp(70),
        backgroundColor: 'rgba(28, 105, 212, 0.15)',
    },
    circleAccent2: {
        position: 'absolute',
        bottom: -wp(30),
        left: -wp(30),
        width: wp(100),
        height: wp(100),
        borderRadius: wp(50),
        backgroundColor: 'rgba(28, 105, 212, 0.08)',
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: wp(24),
    },
    headerTitle: {
        fontSize: fs(24),
        fontWeight: '900',
        color: WHITE,
        letterSpacing: 0.5,
    },
    settingsIconBtn: {
        width: wp(40),
        height: wp(40),
        borderRadius: wp(20),
        backgroundColor: 'rgba(255,255,255,0.12)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
        marginRight: wp(16),
    },
    avatar: {
        width: wp(80),
        height: wp(80),
        borderRadius: wp(40),
        backgroundColor: '#C8D8FF',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.8)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: wp(4) },
        shadowOpacity: 0.2,
        shadowRadius: wp(6),
        elevation: 5,
    },
    avatarTxt: {
        fontSize: fs(26),
        fontWeight: '900',
        color: NAVY,
    },
    onlineBadge: {
        position: 'absolute',
        right: wp(2),
        bottom: wp(2),
        width: wp(16),
        height: wp(16),
        borderRadius: wp(8),
        backgroundColor: '#10B981',
        borderWidth: 2.5,
        borderColor: NAVY,
    },
    profileInfo: {
        flex: 1,
        gap: wp(3),
    },
    profileName: {
        fontSize: fs(20),
        fontWeight: '800',
        color: WHITE,
    },
    profileEmail: {
        fontSize: fs(13),
        fontWeight: '500',
        color: 'rgba(255,255,255,0.7)',
    },
    vipBadge: {
        alignSelf: 'flex-start',
        backgroundColor: GOLD,
        paddingHorizontal: wp(8),
        paddingVertical: wp(3),
        borderRadius: wp(6),
        marginTop: wp(4),
    },
    vipText: {
        fontSize: fs(9),
        fontWeight: '900',
        color: NAVY,
        letterSpacing: 0.8,
    },

    // Floating Stats Card
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: WHITE,
        marginHorizontal: wp(24),
        borderRadius: wp(24),
        paddingVertical: wp(16),
        borderWidth: 1.5,
        borderColor: 'rgba(234, 237, 244, 0.8)',
        marginTop: -wp(28),
        marginBottom: wp(24),
        shadowColor: '#10173A',
        shadowOffset: { width: 0, height: wp(8) },
        shadowOpacity: 0.08,
        shadowRadius: wp(12),
        elevation: 8,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statIconWrapper: {
        height: wp(32),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: wp(6),
    },
    statVal: {
        fontSize: fs(15),
        fontWeight: '800',
        color: NAVY,
        marginBottom: wp(2),
    },
    statLabel: {
        fontSize: fs(11),
        fontWeight: '600',
        color: GRAY,
    },
    statDivider: {
        width: 1,
        height: wp(35),
        backgroundColor: BORDER,
        alignSelf: 'center',
    },

    // Menu Sections
    section: {
        marginHorizontal: wp(24),
        marginBottom: wp(24),
    },
    sectionHeader: {
        marginBottom: wp(12),
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(8),
    },
    sectionTitle: {
        fontSize: fs(13),
        fontWeight: '900',
        color: NAVY,
        textTransform: 'uppercase',
        letterSpacing: wp(0.8),
    },
    titleBar: {
        flex: 1,
        height: 1.5,
        backgroundColor: BORDER,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: WHITE,
        paddingHorizontal: wp(16),
        paddingVertical: wp(14),
        borderRadius: wp(20),
        borderWidth: 1.5,
        borderColor: 'rgba(234, 237, 244, 0.7)',
        marginBottom: wp(10),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: wp(2) },
        shadowOpacity: 0.01,
        shadowRadius: wp(4),
        elevation: 1,
    },
    menuItemNonClickable: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: WHITE,
        paddingHorizontal: wp(16),
        paddingVertical: wp(14),
        borderRadius: wp(20),
        borderWidth: 1.5,
        borderColor: 'rgba(234, 237, 244, 0.7)',
        marginBottom: wp(10),
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: wp(12),
    },
    menuIconBg: {
        width: wp(40),
        height: wp(40),
        borderRadius: wp(12),
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuTextContent: {
        gap: wp(1),
    },
    menuTitle: {
        fontSize: fs(14),
        fontWeight: '700',
        color: NAVY,
    },
    menuSubtitle: {
        fontSize: fs(11),
        fontWeight: '500',
        color: GRAY,
    },
    chevron: {
        fontSize: fs(22),
        color: GRAY,
        fontWeight: '600',
    },

    // Elegant Logout Button
    logoutBtn: {
        backgroundColor: '#FFEBEB',
        paddingVertical: wp(14),
        borderRadius: wp(20),
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: '#FFD1D1',
        marginTop: wp(10),
        shadowColor: RED,
        shadowOffset: { width: 0, height: wp(4) },
        shadowOpacity: 0.05,
        shadowRadius: wp(8),
        elevation: 2,
    },
    logoutContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(8),
    },
    logoutText: {
        fontSize: fs(15),
        fontWeight: '800',
        color: RED,
    },
    personalInfoCard: {
        padding: wp(16),
        borderWidth: 1.5,
        borderRadius: wp(16),
        marginBottom: wp(14),
        gap: wp(4),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: wp(2) },
        shadowOpacity: 0.02,
        shadowRadius: wp(6),
        elevation: 1,
    },
    infoLabel: {
        fontSize: fs(11),
        fontWeight: '800',
        color: GRAY,
        marginTop: wp(4),
    },
    infoInput: {
        borderWidth: 1.5,
        borderRadius: wp(10),
        paddingVertical: wp(8),
        paddingHorizontal: wp(12),
        fontSize: fs(13),
        fontWeight: '700',
        marginTop: wp(4),
    },
    saveBtn: {
        backgroundColor: BLUE,
        paddingVertical: wp(12),
        borderRadius: wp(12),
        alignItems: 'center',
        marginTop: wp(14),
        shadowColor: BLUE,
        shadowOffset: { width: 0, height: wp(4) },
        shadowOpacity: 0.2,
        shadowRadius: wp(8),
        elevation: 3,
    },
    saveBtnTxt: {
        color: WHITE,
        fontSize: fs(13),
        fontWeight: '800',
    },
    paymentMethodRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderRadius: wp(12),
        paddingHorizontal: wp(12),
        paddingVertical: wp(10),
        marginTop: wp(6),
    },
    paymentTitle: {
        fontSize: fs(13),
        fontWeight: '800',
    },
    activeBadge: {
        backgroundColor: '#ECFDF5',
        paddingHorizontal: wp(8),
        paddingVertical: wp(4),
        borderRadius: wp(6),
        borderWidth: 1,
        borderColor: '#A7F3D0',
    },
    activeBadgeTxt: {
        color: '#059669',
        fontSize: fs(9),
        fontWeight: '800',
    },
    avatarImg: {
        width: wp(74),
        height: wp(74),
        borderRadius: wp(37),
    },
    editBadge: {
        position: 'absolute',
        right: -wp(2),
        bottom: -wp(2),
        width: wp(28),
        height: wp(28),
        borderRadius: wp(14),
        backgroundColor: BLUE,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: WHITE,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: wp(2) },
        shadowOpacity: 0.15,
        shadowRadius: wp(4),
        elevation: 3,
    },
    editBadgeTxt: {
        fontSize: fs(12),
    },
    pickerPanel: {
        marginTop: wp(16),
        padding: wp(14),
        borderRadius: wp(16),
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    pickerTitle: {
        fontSize: fs(12),
        fontWeight: '800',
        color: WHITE,
        marginBottom: wp(10),
    },
    presetRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: wp(10),
        marginBottom: wp(12),
    },
    presetAvatarBtn: {
        width: wp(42),
        height: wp(42),
        borderRadius: wp(21),
        borderWidth: 2,
        borderColor: 'transparent',
        overflow: 'hidden',
    },
    presetAvatarBtnActive: {
        borderColor: BLUE,
    },
    presetAvatarImg: {
        width: '100%',
        height: '100%',
    },
    customUrlRow: {
        flexDirection: 'row',
        gap: wp(8),
    },
    urlInput: {
        flex: 1,
        height: wp(38),
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: wp(8),
        paddingHorizontal: wp(10),
        color: WHITE,
        fontSize: fs(12),
    },
    applyBtn: {
        backgroundColor: BLUE,
        paddingHorizontal: wp(14),
        borderRadius: wp(8),
        justifyContent: 'center',
    },
    applyBtnTxt: {
        color: WHITE,
        fontSize: fs(12),
        fontWeight: '800',
    },
    gallerySelectBtn: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.25)',
        borderRadius: wp(10),
        paddingVertical: wp(10),
        alignItems: 'center',
        marginBottom: wp(12),
    },
    gallerySelectBtnTxt: {
        color: WHITE,
        fontSize: fs(12),
        fontWeight: '800',
    },
});
