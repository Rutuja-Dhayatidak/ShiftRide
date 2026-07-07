import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, PixelRatio, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getSessionToken } from '../services/auth';

const { width } = Dimensions.get('window');
const BASE_W = 375;
const wp = (px: number) => (px / BASE_W) * width;
const fs = (px: number) => Math.round(PixelRatio.roundToNearestPixel((px / BASE_W) * width));

const NAVY = '#12183D';
const GRAY = '#8A94A6';
const GRAY_LT = '#F2F4F8';
const WHITE = '#FFFFFF';
const BORDER = '#EAEDF4';

import { isDarkMode, subscribeThemeChange } from '../services/theme';

const ic = (active?: boolean, isDark?: boolean) => {
    if (active) return isDark ? '#FFFFFF' : '#12183D';
    return isDark ? '#94A3B8' : '#8A94A6';
};

const HouseIcon = ({ active, isDark }: { active?: boolean; isDark?: boolean }) => (
    <View style={{ alignItems: 'center', gap: wp(1.5) }}>
        <View style={{ width: 0, height: 0, borderLeftWidth: wp(8), borderRightWidth: wp(8), borderBottomWidth: wp(7), borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: ic(active, isDark) }} />
        <View style={{ width: wp(12), height: wp(9), backgroundColor: ic(active, isDark), borderRadius: wp(2) }} />
    </View>
);

const OrderIcon = ({ active, isDark }: { active?: boolean; isDark?: boolean }) => (
    <View style={{ gap: wp(2.5) }}>
        {[wp(16), wp(12), wp(16)].map((w, i) => (
            <View key={i} style={{ width: w, height: wp(2), backgroundColor: ic(active, isDark), borderRadius: wp(1) }} />
        ))}
    </View>
);

const InboxIcon = ({ active, isDark }: { active?: boolean; isDark?: boolean }) => (
    <View>
        <View style={{ width: wp(18), height: wp(14), borderRadius: wp(3), borderWidth: 2, borderColor: ic(active, isDark) }} />
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, alignItems: 'center' }}>
            <View style={{ width: wp(10), height: wp(7), borderBottomLeftRadius: wp(5), borderBottomRightRadius: wp(5), borderWidth: 2, borderTopWidth: 0, borderColor: ic(active, isDark) }} />
        </View>
    </View>
);

const WalletIcon = ({ active, isDark }: { active?: boolean; isDark?: boolean }) => (
    <View>
        <View style={{ width: wp(20), height: wp(14), borderRadius: wp(3), borderWidth: 2, borderColor: ic(active, isDark) }}>
            <View style={{ width: wp(6), height: wp(6), borderRadius: wp(3), borderWidth: 2, borderColor: ic(active, isDark), position: 'absolute', right: wp(2), top: wp(2), backgroundColor: ic(active, isDark) + '30' }} />
        </View>
    </View>
);

const PersonIcon = ({ active, isDark }: { active?: boolean; isDark?: boolean }) => (
    <View style={{ alignItems: 'center', gap: wp(2) }}>
        <View style={{ width: wp(10), height: wp(10), borderRadius: wp(5), borderWidth: 2, borderColor: ic(active, isDark) }} />
        <View style={{ width: wp(18), height: wp(7), borderTopLeftRadius: wp(9), borderTopRightRadius: wp(9), borderWidth: 2, borderBottomWidth: 0, borderColor: ic(active, isDark) }} />
    </View>
);

interface BottomNavigationProps {
    activeTab: number;
    setActiveTab: (index: number) => void;
}

export const BottomNavigation = ({ activeTab, setActiveTab }: BottomNavigationProps) => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const [isDark, setIsDark] = React.useState(isDarkMode());
    
    React.useEffect(() => {
        const unsubscribe = subscribeThemeChange((darkVal) => {
            setIsDark(darkVal);
        });
        return unsubscribe;
    }, []);

    const theme = {
        bg: isDark ? '#1E293B' : WHITE,
        textActive: isDark ? WHITE : '#12183D',
        textInactive: isDark ? '#94A3B8' : GRAY,
        border: isDark ? '#334155' : BORDER,
        iconAreaActive: isDark ? '#334155' : GRAY_LT,
    };

    const navItems = [
        { label: 'Search', icon: <HouseIcon isDark={isDark} /> },
        { label: 'Bookings', icon: <WalletIcon isDark={isDark} /> },
        { label: 'Inbox', icon: <InboxIcon isDark={isDark} /> },
        { label: 'Profile', icon: <PersonIcon isDark={isDark} /> },
    ];

    return (
        <View style={[s.bottomNav, { backgroundColor: theme.bg, borderTopColor: theme.border }]}>
            {navItems.map((tab, i) => {
                const active = activeTab === i;
                return (
                    <TouchableOpacity
                        key={i}
                        style={s.navTab}
                        onPress={() => {
                            if (i === 0) {
                                navigation.navigate('Search');
                            } else if (i === 1) {
                                const token = getSessionToken();
                                if (!token) {
                                    Alert.alert(
                                        'Authentication Required',
                                        'Please register or login first to view your bookings.',
                                        [
                                            { text: 'Cancel', style: 'cancel' },
                                            { text: 'Login', onPress: () => navigation.navigate('Login') }
                                        ]
                                    );
                                } else {
                                    navigation.navigate('MyBookings');
                                }
                            } else if (i === 3) {
                                const token = getSessionToken();
                                if (!token) {
                                    Alert.alert(
                                        'Authentication Required',
                                        'Please register or login first to view your profile.',
                                        [
                                            { text: 'Cancel', style: 'cancel' },
                                            { text: 'Login', onPress: () => navigation.navigate('Login') }
                                        ]
                                        
                                    );
                                } else {
                                    navigation.navigate('Profile');
                                }
                            } else {
                                setActiveTab(i);
                            }
                        }}
                        activeOpacity={0.75}
                    >
                        <View style={[s.navIconArea, { backgroundColor: 'transparent' }, active && { backgroundColor: theme.iconAreaActive }]}>
                            {React.cloneElement(tab.icon, { active })}
                        </View>
                        <Text style={[s.navLabel, { color: theme.textInactive }, active && { color: theme.textActive, fontWeight: '700' }]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const s = StyleSheet.create({
    bottomNav: {
        flexDirection: 'row',
        backgroundColor: WHITE,
        paddingTop: wp(12),
        paddingBottom: wp(24),
        borderTopWidth: 1,
        borderTopColor: BORDER,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -wp(2) },
        shadowOpacity: 0.04,
        shadowRadius: wp(8),
        elevation: 10,
    },
    navTab: { flex: 1, alignItems: 'center', gap: wp(4) },
    navIconArea: {
        width: wp(44),
        height: wp(32),
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: wp(10),
    },
    navIconAreaActive: { backgroundColor: GRAY_LT },
    navLabel: { fontSize: fs(10), fontWeight: '600', color: GRAY },
    navLabelActive: { color: NAVY, fontWeight: '700' },
});
