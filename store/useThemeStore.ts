import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { DarkColors, LightColors } from '../constants/theme';

interface ThemeState {
    isDarkMode: boolean;
    colors: typeof DarkColors;
    toggleTheme: () => Promise<void>;
    loadTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set) => ({
    isDarkMode: true,
    colors: DarkColors,

    toggleTheme: async () => {
        set((state) => {
            const nextMode = !state.isDarkMode;
            AsyncStorage.setItem('@pintig_theme', nextMode ? 'dark' : 'light');
            return {
                isDarkMode: nextMode,
                colors: nextMode ? DarkColors : LightColors
            };
        });
    },

    loadTheme: async () => {
        const saved = await AsyncStorage.getItem('@pintig_theme');
        if (saved === 'light') {
            set({ isDarkMode: false, colors: LightColors });
        } else {
            set({ isDarkMode: true, colors: DarkColors });
        }
    }
}));
