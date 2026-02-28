import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { newsService } from '../../services/newsService';
import { useArticleStore } from '../../store/useArticleStore';
import { useThemeStore } from '../../store/useThemeStore';
import { Article } from '../../types/news';

const { width: SCREEN } = Dimensions.get('window');

const OFFICIAL_UPDATES = [
    { id: 'pio', label: 'PIO', color: '#0066FF', icon: 'megaphone' },
    { id: 'traffic', label: 'Traffic', color: '#FF9500', icon: 'car' },
    { id: 'health', label: 'Health', color: '#FF3B30', icon: 'heart' },
    { id: 'disaster', label: 'CDRRMO', color: '#FF2D55', icon: 'warning' },
    { id: 'events', label: 'Events', color: '#5856D6', icon: 'calendar' },
];

export default function NewsScreen() {
    const router = useRouter();
    const { articles, setArticles, setLoading, setSelectedArticle } = useArticleStore();
    const { colors, isDarkMode } = useThemeStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [likedArticles, setLikedArticles] = useState<Set<string>>(new Set());

    const loadNews = async (isRefresh = false) => {
        if (!isRefresh) setLoading(true);
        const data = await newsService.fetchNews();
        setArticles(data);
        setLoading(false);
        setRefreshing(false);
    };

    useEffect(() => {
        loadNews();
    }, []);

    const handleOpenArticle = (article: Article) => {
        setSelectedArticle(article);
        router.push(`/article/${article.id}`);
    };

    const toggleLike = (id: string) => {
        setLikedArticles(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const getSourceColor = (source: string) => {
        if (source.toLowerCase().includes('pio')) return '#0066FF';
        if (source.toLowerCase().includes('health')) return '#34C759';
        if (source.toLowerCase().includes('traffic')) return '#FF9500';
        if (source.toLowerCase().includes('disaster')) return '#FF3B30';
        return '#0066FF';
    };

    // Helper for transparency
    const getSurfaceColor = () => isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';
    const getBorderColor = () => isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

    return (
        <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()} style={[s.backBtn, { backgroundColor: getSurfaceColor() }]}>
                    <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[s.headerTitle, { color: colors.textPrimary }]}>Verified Feed</Text>
                <View style={s.headerActions}>
                    <TouchableOpacity style={[s.headActionBtn, { backgroundColor: getSurfaceColor() }]}>
                        <Ionicons name="search" size={22} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[s.headActionBtn, { backgroundColor: getSurfaceColor() }]}>
                        <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
                        <View style={[s.badgeDot, { borderColor: colors.background }]} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadNews(true); }} tintColor={colors.primary} />}
            >
                {/* Verified Feed List */}
                <View style={s.feedHeader}>
                    <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>Verified Feed</Text>
                    <TouchableOpacity style={s.filterBtn}>
                        <Ionicons name="options" size={14} color="#0066FF" />
                        <Text style={s.filterText}>All Sources</Text>
                    </TouchableOpacity>
                </View>

                {articles.map((article) => {
                    const srcColor = getSourceColor(article.source);
                    return (
                        <TouchableOpacity key={article.id} style={[s.newsCard, { backgroundColor: colors.surface, borderColor: getBorderColor() }]} onPress={() => handleOpenArticle(article)}>
                            <View style={s.cardImageContainer}>
                                <Image source={{ uri: article.urlToImage }} style={s.cardImg} />

                                {/* Overlay: Yellow Legit Pill */}
                                <View style={s.legitPillPos}>
                                    <View style={s.legitPill}>
                                        <Ionicons name="shield-checkmark" size={10} color="#000" />
                                        <Text style={s.legitPillText}>LEGIT</Text>
                                    </View>
                                </View>

                                {/* Overlay: Source Drop */}
                                <View style={s.sourcePillPos}>
                                    <View style={s.sourcePill}>
                                        <View style={[s.sourceInitialBadge, { backgroundColor: srcColor }]}>
                                            <Text style={s.sourceInitialLetter}>{article.source.charAt(0)}</Text>
                                        </View>
                                        <Text style={s.sourcePillText}>{article.source}</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={s.cardBody}>
                                <Text style={[s.cardTitle, { color: colors.textPrimary }]} numberOfLines={2}>{article.title}</Text>
                                <Text style={[s.cardDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                                    {article.description || 'The local government has officially released this statement...'}
                                </Text>

                                <View style={s.cardFooter}>
                                    <View style={s.footerLeft}>
                                        <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} onPress={() => toggleLike(article.id)} style={s.actionRow}>
                                            <Ionicons name={likedArticles.has(article.id) ? "heart" : "heart-outline"} size={16} color={likedArticles.has(article.id) ? "#FF3B30" : colors.textSecondary} />
                                            <Text style={[s.actionCount, { color: colors.textSecondary }]}>
                                                {likedArticles.has(article.id) ? '1.3k' : '1.2k'}
                                            </Text>
                                        </TouchableOpacity>
                                        <View style={s.actionRow}>
                                            <Ionicons name="chatbubble-outline" size={16} color={colors.textSecondary} />
                                            <Text style={[s.actionCount, { color: colors.textSecondary }]}>84</Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                        <Ionicons name="share-outline" size={20} color="#0066FF" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                })}

                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 15,
    },
    backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 20, fontWeight: 'bold' },
    headerActions: { flexDirection: 'row', gap: 10 },
    headActionBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    badgeDot: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF3355', borderWidth: 1.5 },

    statusPillContainer: { paddingHorizontal: 20, marginBottom: 25 },
    statusPill: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingVertical: 14, paddingHorizontal: 24, borderRadius: 24,
    },
    statusItem: { alignItems: 'center' },
    statusVal: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    statusLab: { color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: 'bold', marginTop: 2 },

    sectionHeader: { paddingHorizontal: 20, marginBottom: 15 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold' },
    circlesRow: { paddingHorizontal: 20, gap: 16, paddingBottom: 25 },
    circleItem: { alignItems: 'center', gap: 8 },
    circleIcon: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
    circleLabel: { fontSize: 11, fontWeight: '600' },

    urgentContainer: { paddingHorizontal: 20, marginBottom: 25 },
    urgentBanner: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, gap: 12, borderWidth: 1 },
    urgentIconWrap: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FF2D55', alignItems: 'center', justifyContent: 'center' },
    urgentContent: { flex: 1 },
    urgentTitle: { color: '#FF2D55', fontSize: 14, fontWeight: '700', marginBottom: 2 },
    urgentDesc: { color: '#993344', fontSize: 11 },

    feedHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, marginBottom: 15,
    },
    filterBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,102,255,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    filterText: { color: '#0066FF', fontSize: 12, fontWeight: 'bold' },

    newsCard: { marginHorizontal: 20, marginBottom: 24, borderRadius: 20, overflow: 'hidden', borderWidth: 1 },
    cardImageContainer: { width: '100%', height: 200, position: 'relative' },
    cardImg: { width: '100%', height: '100%', resizeMode: 'cover' },

    legitPillPos: { position: 'absolute', top: 12, left: 16, right: 16 },
    legitPill: { backgroundColor: '#FFDE00', paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', minWidth: '95%' },
    legitPillText: { color: '#000', fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 },

    sourcePillPos: { position: 'absolute', bottom: 12, left: 16 },
    sourcePill: { backgroundColor: 'rgba(25, 25, 25, 0.85)', paddingVertical: 4, paddingHorizontal: 6, paddingRight: 12, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 8 },
    sourceInitialBadge: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
    sourceInitialLetter: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
    sourcePillText: { color: '#FFF', fontSize: 12, fontWeight: '600' },

    cardBody: { padding: 20 },
    cardTitle: { fontSize: 17, fontWeight: 'bold', lineHeight: 24, marginBottom: 8 },
    cardDesc: { fontSize: 14, lineHeight: 20, marginBottom: 16 },

    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
    footerLeft: { flexDirection: 'row', gap: 24 },
    actionRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    actionCount: { fontSize: 13, fontWeight: '500' },
});
