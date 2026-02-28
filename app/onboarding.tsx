import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    FlatList,
    ImageBackground,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const WHY_PINTIG = [
    {
        id: '1',
        title: 'Real-time Alerts',
        description: 'Get instant emergency and traffic notifications directly from city hall.',
        icon: 'megaphone-outline' as const,
    },
    {
        id: '2',
        title: 'Verified News',
        description: 'Combat misinformation with news from shield-verified reporters.',
        icon: 'shield-checkmark-outline' as const,
    },
    {
        id: '3',
        title: 'City Intelligence',
        description: 'Official data pulse of the city updated every minute.',
        icon: 'stats-chart-outline' as const,
    },
];

export default function OnboardingScreen() {
    const router = useRouter();
    const setOnboardingSeen = useAuthStore(state => state.setOnboardingSeen);
    const { colors } = useThemeStore();

    const handleFinish = async () => {
        await setOnboardingSeen();
        router.replace('/login');
    };

    const renderReason = ({ item }: { item: typeof WHY_PINTIG[0] }) => (
        <BlurView intensity={20} tint="dark" style={[s.reasonCard, { borderColor: colors.border }]}>
            <View style={[s.iconWrap, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name={item.icon} size={28} color={colors.primary} />
            </View>
            <Text style={s.reasonTitle}>{item.title}</Text>
            <Text style={s.reasonDesc}>{item.description}</Text>
        </BlurView>
    );

    return (
        <View style={s.container}>
            <ImageBackground
                source={{ uri: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=2000&auto=format&fit=crop' }} // Substitute for city bridge background
                style={s.bgImage}
            >
                <LinearGradient
                    colors={['rgba(0,0,0,0.6)', 'rgba(5,5,5,1)']}
                    style={s.overlay}
                >
                    <SafeAreaView style={s.safeArea}>
                        {/* Top Header */}
                        <View style={s.header}>
                            <TouchableOpacity style={s.logoMini}>
                                <Ionicons name="flash-sharp" size={24} color={colors.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity style={s.langBtn}>
                                <Text style={s.langText}>EN</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Hero Section */}
                        <View style={s.hero}>
                            <View style={s.officialBadge}>
                                <Ionicons name="ribbon-sharp" size={14} color="#000" />
                                <Text style={s.officialText}>OFFICIAL CITY APP</Text>
                            </View>
                            <Text style={s.pintigTitle}>Pintig</Text>
                            <Text style={s.butuanTitle}>Butuan</Text>
                            <Text style={[s.heroSub, { color: colors.primary }]}>The digital heartbeat of your city.</Text>
                        </View>

                        {/* Why Pintig? Carousel */}
                        <View style={s.whySection}>
                            <Text style={s.whyTitle}>Why Pintig?</Text>
                            <FlatList
                                data={WHY_PINTIG}
                                renderItem={renderReason}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={s.reasonList}
                                snapToAlignment="start"
                                decelerationRate="fast"
                            />
                        </View>

                        {/* Action Footer */}
                        <View style={s.footer}>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={handleFinish}
                            >
                                <LinearGradient
                                    colors={[colors.primary, colors.primaryDark]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={s.mainBtn}
                                >
                                    <Text style={s.mainBtnText}>Get Started</Text>
                                    <Ionicons name="arrow-forward" size={20} color="#FFF" />
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => router.push('/login')}>
                                <Text style={s.signInLink}>Sign In to Your Account</Text>
                            </TouchableOpacity>

                            <Text style={s.poweredText}>
                                Powered by <Text style={{ fontWeight: 'bold' }}>DALOY Ecosystem</Text>
                            </Text>
                        </View>
                    </SafeAreaView>
                </LinearGradient>
            </ImageBackground>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    bgImage: { flex: 1, width: '100%', height: SCREEN_HEIGHT * 0.7 },
    overlay: { flex: 1 },
    safeArea: { flex: 1, paddingHorizontal: 24 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
    },
    logoMini: {
        width: 44, height: 44, borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center', justifyContent: 'center',
    },
    langBtn: {
        width: 44, height: 32, borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center', justifyContent: 'center',
    },
    langText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
    hero: { marginTop: SCREEN_HEIGHT * 0.08, alignItems: 'center' },
    officialBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: '#FFD700', paddingHorizontal: 12, paddingVertical: 6,
        borderRadius: 20, marginBottom: 16,
    },
    officialText: { color: '#000', fontSize: 10, fontWeight: '900' },
    pintigTitle: { fontSize: 80, color: '#FFF', fontWeight: 'bold', lineHeight: 85 },
    butuanTitle: { fontSize: 80, color: '#FFF', fontWeight: 'bold', marginTop: -15 },
    heroSub: { fontSize: 16, fontWeight: '600', marginTop: 10 },
    whySection: { marginTop: 40 },
    whyTitle: { color: '#FFF', fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
    reasonList: { paddingRight: 40, gap: 16 },
    reasonCard: {
        width: SCREEN_WIDTH * 0.7,
        padding: 24, borderRadius: 24,
        borderWidth: 1, overflow: 'hidden',
    },
    iconWrap: {
        width: 100, height: 60, borderRadius: 16,
        alignItems: 'center', justifyContent: 'center', marginBottom: 20,
    },
    reasonTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
    reasonDesc: { color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 18 },
    footer: { flex: 1, justifyContent: 'flex-end', paddingBottom: 30, alignItems: 'center' },
    mainBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingHorizontal: 40, height: 64, borderRadius: 32,
        width: SCREEN_WIDTH - 80, gap: 12,
        shadowColor: '#0066FF', shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5, shadowRadius: 20, elevation: 15,
    },
    mainBtnText: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
    signInLink: { color: 'rgba(255,255,255,0.7)', fontSize: 15, marginTop: 20, marginBottom: 30 },
    poweredText: { color: 'rgba(255,255,255,0.4)', fontSize: 11 },
});
