import React, { useState, useEffect, useRef } from 'react';
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

const EyeIcon = ({ visible, active }: { visible: boolean; active: boolean }) => {
    const color = active ? BLUE : '#94A3B8';
    return (
        <View style={{ width: wp(20), height: wp(14), alignItems: 'center', justifyContent: 'center' }}>
            <View style={{
                width: wp(18),
                height: wp(11),
                borderRadius: wp(6),
                borderWidth: 1.8,
                borderColor: color,
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <View style={{
                    width: wp(6),
                    height: wp(6),
                    borderRadius: wp(3),
                    backgroundColor: color,
                }} />
            </View>
            {!visible && (
                <View style={{
                    position: 'absolute',
                    width: 1.8,
                    height: wp(16),
                    backgroundColor: color,
                    transform: [{ rotate: '-45deg' }],
                }} />
            )}
        </View>
    );
};

export default function NewPasswordScreen() {
    const navigation = useNavigation<NavigationProp>();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [focusedField, setFocusedField] = useState<'pass' | 'confirm' | null>(null);
    
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

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

    const handleReset = () => {
        if (!password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in both password fields.');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match.');
            return;
        }
        Alert.alert('Success', 'Your password has been reset successfully.', [
            { text: 'Login Now', onPress: () => navigation.navigate('Login') }
        ]);
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
                <Text style={s.title}>New Password</Text>

                {/* Password Field */}
                <Text style={s.label}>Password</Text>
                <View style={[s.inputBox, focusedField === 'pass' && s.inputBoxActive]}>
                    <TextInput
                        style={s.inputField}
                        placeholder="Enter password"
                        placeholderTextColor="#94A3B8"
                        secureTextEntry={!showPass}
                        value={password}
                        onChangeText={setPassword}
                        onFocus={() => setFocusedField('pass')}
                        onBlur={() => setFocusedField(null)}
                    />
                    <TouchableOpacity style={s.eyeBtn} onPress={() => setShowPass(!showPass)}>
                        <EyeIcon visible={showPass} active={focusedField === 'pass'} />
                    </TouchableOpacity>
                </View>

                {/* Confirm Password Field */}
                <Text style={s.label}>Confirm Password</Text>
                <View style={[s.inputBox, focusedField === 'confirm' && s.inputBoxActive]}>
                    <TextInput
                        style={s.inputField}
                        placeholder="Enter password"
                        placeholderTextColor="#94A3B8"
                        secureTextEntry={!showConfirm}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        onFocus={() => setFocusedField('confirm')}
                        onBlur={() => setFocusedField(null)}
                    />
                    <TouchableOpacity style={s.eyeBtn} onPress={() => setShowConfirm(!showConfirm)}>
                        <EyeIcon visible={showConfirm} active={focusedField === 'confirm'} />
                    </TouchableOpacity>
                </View>

                {/* Reset Button */}
                <TouchableOpacity style={s.btn} activeOpacity={0.8} onPress={handleReset}>
                    <Text style={s.btnText}>Reset Password</Text>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: BORDER,
        borderRadius: wp(12),
        backgroundColor: '#FAF9F9',
        paddingHorizontal: wp(16),
        paddingVertical: wp(2),
        marginBottom: wp(24),
    },
    inputBoxActive: {
        borderColor: BLUE,
        backgroundColor: WHITE,
    },
    inputField: {
        flex: 1,
        fontSize: fs(14),
        color: NAVY,
        fontWeight: '600',
        paddingVertical: wp(12),
    },
    eyeBtn: {
        padding: wp(4),
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
