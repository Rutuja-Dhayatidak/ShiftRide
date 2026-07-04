import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Animated,
    PixelRatio,
    Dimensions,
    KeyboardTypeOptions,
} from 'react-native';

const { width } = Dimensions.get('window');
const BASE_W = 375;
const wp = (px: number) => (px / BASE_W) * width;
const fs = (px: number) => Math.round(PixelRatio.roundToNearestPixel((px / BASE_W) * width));

const BLUE     = '#1A6BFF';
const NAVY     = '#0D1B3E';
const LIGHT_BG = '#F4F7FF';
const INPUT_BG = '#F0F4FF';
const WHITE    = '#FFFFFF';
const RED      = '#FF3B30';
const BORDER   = '#E0E8FF';

interface InputFieldProps {
    label: string;
    placeholder: string;
    value: string;
    onChangeText: (t: string) => void;
    icon: string;
    secureTextEntry?: boolean;
    showToggle?: boolean;
    onToggle?: () => void;
    keyboardType?: KeyboardTypeOptions;
    error?: string;
    fadeAnim?: Animated.Value;
    slideAnim?: Animated.Value;
}

export const InputField = ({
    label,
    placeholder,
    value,
    onChangeText,
    icon,
    secureTextEntry = false,
    showToggle = false,
    onToggle,
    keyboardType = 'default',
    error,
    fadeAnim,
    slideAnim,
}: InputFieldProps) => {
    const [focused, setFocused] = useState(false);
    return (
        <Animated.View
            style={[
                styles.inputWrapper,
                fadeAnim && { opacity: fadeAnim },
                slideAnim && { transform: [{ translateY: slideAnim }] },
            ]}
        >
            <Text style={styles.inputLabel}>{label}</Text>
            <View
                style={[
                    styles.inputBox,
                    focused && styles.inputBoxFocused,
                    !!error && styles.inputBoxError,
                ]}
            >
                <Text style={styles.inputIcon}>{icon}</Text>
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor="#9AAACB"
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType}
                    autoCapitalize="none"
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                />
                {showToggle && (
                    <TouchableOpacity onPress={onToggle} style={styles.eyeBtn}>
                        <Text style={styles.eyeIcon}>
                            {secureTextEntry ? '👁️' : '🙈'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
            {!!error && <Text style={styles.errorText}>⚠ {error}</Text>}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    inputWrapper: { gap: 6 },
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
        height: 52,
        gap: wp(10),
    },
    inputBoxFocused: {
        borderColor: BLUE,
        backgroundColor: '#EDF3FF',
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
        marginTop: 2,
    },
});
