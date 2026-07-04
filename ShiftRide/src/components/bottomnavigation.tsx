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

const ic = (active?: boolean) => active ? NAVY : GRAY;

const HouseIcon = ({ active }: { active?: boolean }) => (
    <View style={{ alignItems: 'center', gap: wp(1.5) }}>
        <View style={{ width: 0, height: 0, borderLeftWidth: wp(8), borderRightWidth: wp(8), borderBottomWidth: wp(7), borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: ic(active) }} />
        <View style={{ width: wp(12), height: wp(9), backgroundColor: ic(active), borderRadius: wp(2) }} />
    </View>
);

const OrderIcon = ({ active }: { active?: boolean }) => (
    <View style={{ gap: wp(2.5) }}>
        {[wp(16), wp(12), wp(16)].map((w, i) => (
            <View key={i} style={{ width: w, height: wp(2), backgroundColor: ic(active), borderRadius: wp(1) }} />
        ))}
    </View>
);

const InboxIcon = ({ active }: { active?: boolean }) => (
    <View>
        <View style={{ width: wp(18), height: wp(14), borderRadius: wp(3), borderWidth: 2, borderColor: ic(active) }} />
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, alignItems: 'center' }}>
            <View style={{ width: wp(10), height: wp(7), borderBottomLeftRadius: wp(5), borderBottomRightRadius: wp(5), borderWidth: 2, borderTopWidth: 0, borderColor: ic(active) }} />
        </View>
    </View>
);

const WalletIcon = ({ active }: { active?: boolean }) => (
    <View>
        <View style={{ width: wp(20), height: wp(14), borderRadius: wp(3), borderWidth: 2, borderColor: ic(active) }}>
            <View style={{ width: wp(6), height: wp(6), borderRadius: wp(3), borderWidth: 2, borderColor: ic(active), position: 'absolute', right: wp(2), top: wp(2), backgroundColor: ic(active) + '30' }} />
        </View>
    </View>
);

const PersonIcon = ({ active }: { active?: boolean }) => (
    <View style={{ alignItems: 'center', gap: wp(2) }}>
        <View style={{ width: wp(10), height: wp(10), borderRadius: wp(5), borderWidth: 2, borderColor: ic(active) }} />
        <View style={{ width: wp(18), height: wp(7), borderTopLeftRadius: wp(9), borderTopRightRadius: wp(9), borderWidth: 2, borderBottomWidth: 0, borderColor: ic(active) }} />
    </View>
);



interface BottomNavigationProps {
    activeTab: number;
    setActiveTab: (index: number) => void;
}

export const BottomNavigation = ({ activeTab, setActiveTab }: BottomNavigationProps) => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const navItems = [
        { label: 'Search', icon: <HouseIcon /> },
        { label: 'orders', icon: <OrderIcon /> },
        { label: 'Bookings', icon: <WalletIcon /> },
        { label: 'Inbox', icon: <InboxIcon /> },
        { label: 'Profile', icon: <PersonIcon /> },
    ];

    return (
        <View style={s.bottomNav}>
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
                                navigation.navigate('Home');
                            } else if (i === 2) {
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
                            } else if (i === 4) {
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
                        <View style={[s.navIconArea, active && s.navIconAreaActive]}>
                            {React.cloneElement(tab.icon, { active })}
                        </View>
                        <Text style={[s.navLabel, active && s.navLabelActive]}>
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
