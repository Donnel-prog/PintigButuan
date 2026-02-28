import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';

export default function SettingsScreen() {
    const router = useRouter();
    const { user, logout } = useAuthStore();
    const { isDarkMode, toggleTheme } = useThemeStore();
    const [notificationsOn, setNotificationsOn] = useState(true);

    const handleLogout = async () => {
        await logout();
        router.replace('/login');
    };

    return (
        <SafeAreaView style={s.container} edges={['top']}>
            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Settings</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>

                {/* Profile Peek */}
                <TouchableOpacity style={s.profileRow} activeOpacity={0.8} onPress={() => router.back()}>
                    <Image source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=200&q=80' }} style={s.avatar} />
                    <View style={s.profileInfo}>
                        <Text style={s.profileName}>{user?.name || 'Marco Silverio'}</Text>
                        <Text style={s.viewProfile}>View Profile</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#666" />
                </TouchableOpacity>

                {/* Account Section */}
                <Text style={s.sectionHeader}>Account</Text>
                <View style={s.card}>
                    <SettingRow icon="person-outline" label="Personal Info" />
                    <SettingRow icon="bookmark-outline" label="Saved Articles" />
                    <SettingRow icon="shield-checkmark-outline" label="Security" last />
                </View>

                {/* Preferences Section */}
                <Text style={s.sectionHeader}>Preferences</Text>
                <View style={s.card}>
                    <View style={[s.row, s.borderBottom]}>
                        <View style={s.iconWrap}>
                            <Ionicons name="notifications-outline" size={20} color="#FFF" />
                        </View>
                        <Text style={s.rowLabel}>Notifications</Text>
                        <Switch
                            value={notificationsOn}
                            onValueChange={setNotificationsOn}
                            trackColor={{ false: '#333', true: '#0066FF' }}
                        />
                    </View>
                    <View style={[s.row, s.borderBottom]}>
                        <View style={s.iconWrap}>
                            <Ionicons name="moon-outline" size={20} color="#FFF" />
                        </View>
                        <Text style={s.rowLabel}>Dark Mode</Text>
                        <Switch
                            value={isDarkMode}
                            onValueChange={toggleTheme}
                            trackColor={{ false: '#333', true: '#0066FF' }}
                        />
                    </View>
                    <SettingRow icon="language-outline" label="Language" value="English" />
                    <SettingRow icon="location-outline" label="My District" value={user?.district || 'District 1'} last />
                </View>

                {/* Support Section */}
                <Text style={s.sectionHeader}>Support</Text>
                <View style={s.card}>
                    <SettingRow icon="help-circle-outline" label="Help Center" />
                    <SettingRow icon="information-circle-outline" label="About Pintig Butuan" />
                    <SettingRow icon="document-text-outline" label="Privacy Policy" last />
                </View>

                <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
                    <Text style={s.logoutTxt}>Log Out</Text>
                </TouchableOpacity>

                <Text style={s.version}>App Version 1.1.0</Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const SettingRow = ({ icon, label, last, value }: { icon: string, label: string, last?: boolean, value?: string }) => (
    <TouchableOpacity style={[s.row, !last && s.borderBottom]} activeOpacity={0.7}>
        <View style={s.iconWrap}>
            <Ionicons name={icon as any} size={20} color="#FFF" />
        </View>
        <Text style={s.rowLabel}>{label}</Text>
        {value && <Text style={s.rowValue}>{value}</Text>}
        <Ionicons name="chevron-forward" size={20} color="#666" />
    </TouchableOpacity>
);

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
    backBtn: { padding: 4 },
    headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },

    content: { padding: 20, paddingBottom: 60 },

    profileRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1C', padding: 16, borderRadius: 20, marginBottom: 32 },
    avatar: { width: 50, height: 50, borderRadius: 25 },
    profileInfo: { flex: 1, marginLeft: 16 },
    profileName: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    viewProfile: { color: '#0066FF', fontSize: 13, marginTop: 4 },

    sectionHeader: { color: '#A0A0A0', fontSize: 13, fontWeight: '600', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
    card: { backgroundColor: '#1A1A1C', borderRadius: 20, marginBottom: 32 },

    row: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    borderBottom: { borderBottomWidth: 1, borderBottomColor: '#2A2A2C' },
    iconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#2A2A2C', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    rowLabel: { flex: 1, color: '#FFF', fontSize: 15 },
    rowValue: { color: '#888', fontSize: 15, marginRight: 8 },

    logoutBtn: { backgroundColor: 'rgba(255, 59, 48, 0.1)', borderWidth: 1, borderColor: 'rgba(255, 59, 48, 0.3)', paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
    logoutTxt: { color: '#FF3B30', fontSize: 16, fontWeight: 'bold' },
    version: { color: '#666', fontSize: 12, textAlign: 'center', marginTop: 24 }
});
