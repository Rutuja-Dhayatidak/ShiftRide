import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    TextInput,
    Dimensions,
    PixelRatio,
    Alert,
    Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

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

export default function ForgotPasswordScreen() {
    const navigation = useNavigation<NavigationProp>();
    const [email, setEmail] = useState('');
    const [isFocused, setIsFocused] = useState(false);

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
    }, []);

    const handleSendCode = () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address.');
            return;
        }
        navigation.navigate('VerifyAccount');
    };

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
                <Text style={s.title}>Forgot Password</Text>

                <Text style={s.label}>Email Address</Text>
                <View style={[s.inputBox, (isFocused || !!email) && s.inputBoxActive]}>
                    <TextInput
                        style={s.input}
                        placeholder="Enter email address"
                        placeholderTextColor="#94A3B8"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                    />
                </View>

                <TouchableOpacity style={s.btn} activeOpacity={0.8} onPress={handleSendCode}>
                    <Text style={s.btnText}>Send Code</Text>
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
    label: {
        fontSize: fs(12.5),
        fontWeight: '800',
        color: NAVY,
        marginBottom: wp(8),
    },
    inputBox: {
        borderWidth: 1.5,
        borderColor: BORDER,
        borderRadius: wp(12),
        backgroundColor: WHITE,
        paddingHorizontal: wp(16),
        paddingVertical: wp(2),
        marginBottom: wp(24),
    },
    inputBoxActive: {
        borderColor: BLUE,
    },
    input: {
        fontSize: fs(14),
        color: NAVY,
        fontWeight: '600',
        paddingVertical: wp(12),
    },
    btn: {
        backgroundColor: BLUE,
        borderRadius: wp(12),
        paddingVertical: wp(14),
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: wp(10),
    },
    btnText: {
        fontSize: fs(14.5),
        fontWeight: '800',
        color: WHITE,
    },
});
