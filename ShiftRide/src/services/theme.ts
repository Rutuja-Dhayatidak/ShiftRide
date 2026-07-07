import AsyncStorage from '@react-native-async-storage/async-storage';

let _isDarkMode = false;
const listeners = new Set<(isDark: boolean) => void>();

export const initTheme = async () => {
  try {
    const val = await AsyncStorage.getItem('dark_mode');
    _isDarkMode = val === 'true';
  } catch (e) {
    console.error('Failed to load theme setting', e);
  }
  return _isDarkMode;
};

export const isDarkMode = () => {
  return _isDarkMode;
};

export const setDarkMode = async (enabled: boolean) => {
  _isDarkMode = enabled;
  // Trigger listeners immediately for instant UI update!
  listeners.forEach(listener => listener(enabled));
  try {
    await AsyncStorage.setItem('dark_mode', enabled ? 'true' : 'false');
  } catch (e) {
    console.error('Failed to save theme setting', e);
  }
};

export const subscribeThemeChange = (listener: (isDark: boolean) => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
