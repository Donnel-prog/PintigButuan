import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';

const { width: SCREEN } = Dimensions.get('window');

const RECENT_ACTIVITY = [
    { id: '1', title: 'Traffic Alert Reported', desc: 'Heavy congestion at JC Aquino Ave', time: '2h ago', status: 'VERIFIED', statusColor: '#00E676', icon: 'warning', iconColor: '#FF3B30', iconBg: 'rgba(255, 59, 48, 0.15)' },
    { id: '2', title: 'Commented on News', desc: 'Great to see the new river park project...', time: '5h ago', status: 'PUBLIC', statusColor: '#A0A0A0', icon: 'chatbox-ellipses', iconColor: '#0066FF', iconBg: 'rgba(0, 102, 255, 0.15)' },
    { id: '3', title: 'Emergency Alert Shared', desc: 'Flood warning for Brgy. Golden Ribbon', time: '1d ago', status: 'LEGIT', statusColor: '#FFDE00', icon: 'megaphone', iconColor: '#FFCC00', iconBg: 'rgba(255, 204, 0, 0.15)' },
];

const BADGES = [
    { id: '1', title: 'Truth Seeker', sub: '10+ Verified Reports', icon: 'shield-checkmark', color: '#FFCC00' },
    { id: '2', title: 'First Responder', sub: 'Active in Alerts', icon: 'heart', color: '#FF2D55' },
    { id: '3', title: 'Top Resident', sub: 'High Engagement', icon: 'star', color: '#FFDE00' },
];

export default function ProfileScreen() {
    const router = useRouter();
    const { user } = useAuthStore();
    const { colors } = useThemeStore();
    const insets = useSafeAreaInsets();

    const topOffset = insets.top > 0 ? insets.top : 20;

    return (
        <View style={[s.container, { backgroundColor: colors.background }]}>
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>

                {/* Header / Cover */}
                <ImageBackground
                    source={{ uri: 'https://images.unsplash.com/photo-1574768407481-9b161cba477d?auto=format&fit=crop&q=80&w=800' }}
                    style={s.coverImage}
                >
                    <View style={[s.headerTopLayer, { paddingTop: topOffset }]}>
                        <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={24} color="#FFF" />
                        </TouchableOpacity>
                        <View style={s.headerRight}>
                            <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} onPress={() => router.push('/settings')} style={s.iconBtn}>
                                <Ionicons name="settings" size={20} color="#FFF" />
                            </TouchableOpacity>
                            <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={s.iconBtn}>
                                <Ionicons name="share-social" size={20} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </ImageBackground>

                {/* Profile Info Overlay */}
                <View style={s.profileHeaderWrap}>
                    <Image source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=200&q=80' }} style={[s.avatar, { borderColor: colors.background }]} />
                    <View style={s.nameRow}>
                        <Text style={[s.profileName, { color: colors.textPrimary }]}>{user?.name || 'Guest User'}</Text>
                        <Ionicons name="checkmark-circle" size={18} color="#0066FF" />
                    </View>
                    <Text style={[s.profileHandle, { color: colors.textSecondary }]}>
                        @{user?.name?.toLowerCase().replace(/\s/g, '') || 'guest'} • {user?.district || 'Butuan City'} Resident
                    </Text>
                </View>

                {/* Body Details */}
                <View style={s.bodyContent}>

                    {/* About Card */}
                    <View style={[s.aboutCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={s.sectionTitleSmall}>About Me</Text>
                        <Text style={[s.bioText, { color: colors.textSecondary }]}>
                            Digital storyteller and local advocate. Passionate about urban development and keeping the community informed. 📍 {user?.district || 'Butuan City'}
                        </Text>
                        <View style={s.statsRow}>
                            <View style={s.statItem}>
                                <Text style={[s.statNum, { color: colors.textPrimary }]}>1.2k</Text>
                                <Text style={[s.statLabel, { color: colors.textMuted }]}>Followers</Text>
                            </View>
                            <View style={s.statItem}>
                                <Text style={[s.statNum, { color: colors.textPrimary }]}>842</Text>
                                <Text style={[s.statLabel, { color: colors.textMuted }]}>Following</Text>
                            </View>
                            <View style={s.statItem}>
                                <Text style={[s.statNum, { color: colors.textPrimary }]}>156</Text>
                                <Text style={[s.statLabel, { color: colors.textMuted }]}>Reports</Text>
                            </View>
                        </View>
                    </View>

                    {/* Recent Activity */}
                    <View style={s.sectionRow}>
                        <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>Recent Activity</Text>
                        <TouchableOpacity><Text style={s.viewAllTxt}>View All</Text></TouchableOpacity>
                    </View>

                    {RECENT_ACTIVITY.map(item => (
                        <TouchableOpacity key={item.id} style={[s.activityCard, { backgroundColor: colors.surface, borderColor: colors.border }]} activeOpacity={0.8}>
                            <View style={[s.activityIconBox, { backgroundColor: item.iconBg }]}>
                                <Ionicons name={item.icon as any} size={20} color={item.iconColor} />
                            </View>
                            <View style={s.activityInfo}>
                                <Text style={[s.activityTitle, { color: colors.textPrimary }]}>{item.title}</Text>
                                <Text style={[s.activityDesc, { color: colors.textSecondary }]} numberOfLines={1}>{item.desc}</Text>
                            </View>
                            <View style={s.activityRight}>
                                <Text style={[s.activityTime, { color: colors.textMuted }]}>{item.time}</Text>
                                {item.status && (
                                    <View style={[s.statusPill, item.status === 'VERIFIED' ? { backgroundColor: item.statusColor } : { backgroundColor: colors.border }]}>
                                        <Text style={[s.statusText, item.status === 'VERIFIED' ? { color: '#000' } : { color: item.statusColor }]}>{item.status}</Text>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    ))}

                    {/* Community Badges */}
                    <Text style={[s.sectionTitle, { marginTop: 24, marginBottom: 16, color: colors.textPrimary }]}>Community Badges</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.badgesScroll} contentContainerStyle={s.badgesContent}>
                        {BADGES.map((badge, idx) => (
                            <View key={badge.id} style={[s.badgeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                <Ionicons name={badge.icon as any} size={28} color={badge.color} style={{ marginBottom: 12 }} />
                                <Text style={[s.badgeTitle, { color: colors.textPrimary }]}>{badge.title}</Text>
                                <Text style={[s.badgeSub, { color: colors.textSecondary }]}>{badge.sub}</Text>
                            </View>
                        ))}
                    </ScrollView>

                    <View style={{ height: 120 }} />
                </View>
            </ScrollView>

            {/* Floating Action Button */}
            <TouchableOpacity style={s.fab} activeOpacity={0.9} onPress={() => router.push('/settings')}>
                <Ionicons name="pencil" size={18} color="#FFF" />
                <Text style={s.fabText}>Edit Profile</Text>
            </TouchableOpacity>

        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    coverImage: { width: '100%', height: 260, borderBottomLeftRadius: 36, borderBottomRightRadius: 36, overflow: 'hidden' },
    headerTopLayer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20 },
    headerRight: { flexDirection: 'row', gap: 12 },
    iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },

    profileHeaderWrap: { alignItems: 'center', marginTop: -50 },
    avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: '#121212', backgroundColor: '#333' },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
    profileName: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
    profileHandle: { color: '#A0A0A0', fontSize: 13, marginTop: 4 },

    bodyContent: { paddingHorizontal: 20, paddingTop: 30 },
    aboutCard: { backgroundColor: '#1A1A1C', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#2A2A2C', marginBottom: 24 },
    sectionTitleSmall: { color: '#0066FF', fontSize: 14, fontWeight: 'bold', marginBottom: 12 },
    bioText: { color: '#E0E0E0', fontSize: 13, lineHeight: 20, marginBottom: 24 },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
    statItem: { alignItems: 'center' },
    statNum: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    statLabel: { color: '#A0A0A0', fontSize: 11, marginTop: 4 },

    sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    viewAllTxt: { color: '#0066FF', fontSize: 13, fontWeight: 'bold' },

    activityCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1C', borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2A2A2C' },
    activityIconBox: { width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    activityInfo: { flex: 1, marginLeft: 14 },
    activityTitle: { color: '#FFF', fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
    activityDesc: { color: '#A0A0A0', fontSize: 12 },
    activityRight: { alignItems: 'flex-end', marginLeft: 10 },
    activityTime: { color: '#888', fontSize: 10, marginBottom: 8 },
    statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 9, fontWeight: 'bold', letterSpacing: 0.5 },

    badgesScroll: { marginHorizontal: -20 },
    badgesContent: { paddingHorizontal: 20, gap: 12 },
    badgeCard: { width: 130, backgroundColor: '#1A1A1C', borderRadius: 20, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#2A2A2C' },
    badgeTitle: { color: '#FFF', fontSize: 13, fontWeight: 'bold', marginBottom: 4, textAlign: 'center' },
    badgeSub: { color: '#888', fontSize: 10, textAlign: 'center' },

    fab: {
        position: 'absolute', right: 20, bottom: 100,
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#0066FF',
        paddingHorizontal: 20, height: 50, borderRadius: 25, gap: 8,
        shadowColor: '#0066FF', shadowOpacity: 0.4, shadowRadius: 12, elevation: 6,
    },
    fabText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
});
