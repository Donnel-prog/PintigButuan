import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdminAlert, firestoreService } from '../../services/firestoreService';
import { newsService } from '../../services/newsService';
import { notificationService } from '../../services/notificationService';
import { useArticleStore } from '../../store/useArticleStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import { Article } from '../../types/news';

const { width: SCREEN } = Dimensions.get('window');
const isSmall = SCREEN < 375;

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { articles, setArticles, setSelectedArticle, setLoading } = useArticleStore();
  const { colors, isDarkMode } = useThemeStore();

  const [refreshing, setRefreshing] = useState(false);
  const [liveAlerts, setLiveAlerts] = useState<AdminAlert[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const [likedArticles, setLikedArticles] = useState<Set<string>>(new Set());

  const loadArticles = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    const data = await newsService.fetchNews();

    // Notification logic for real-time simulation (Polling based)
    if (isRefresh) {
      notificationService.notifyNewArticles(articles, data);
    }

    setArticles(data);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadArticles();
    notificationService.registerForPushNotifications();

    // 1️⃣ REAL-TIME: Listen to Firestore Alerts (Official City Alerts)
    const unsubscribeAlerts = firestoreService.subscribeToAlerts((alerts) => {
      const active = alerts.filter(a => a.isActive);
      setLiveAlerts(active);

      // If a new urgent alert comes in, send a system notification
      if (active.length > 0) {
        const latest = active[0];
        // Only notify if we haven't seen this alert ID in the current session
        notificationService.sendLocalNotification(
          `OFFICIAL: ${latest.title}`,
          latest.message
        );
      }
    });

    // 2️⃣ REAL-TIME: Background News Polling (Check every 60 seconds)
    const interval = setInterval(() => {
      loadArticles(true);
    }, 60000);

    return () => {
      clearInterval(interval);
      unsubscribeAlerts();
    };
  }, [articles.length]);

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

  const handleDismissAlert = (id: string) => {
    setDismissedAlerts([...dismissedAlerts, id]);
  };

  const formatTime = (d: string) => {
    const hrs = Math.floor((Date.now() - new Date(d).getTime()) / 3600000);
    if (hrs < 1) return 'Just now';
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const getSourceColor = (source: string) => {
    if (source.toLowerCase().includes('pio')) return '#0066FF';
    if (source.toLowerCase().includes('health')) return '#34C759';
    if (source.toLowerCase().includes('traffic')) return '#FF9500';
    if (source.toLowerCase().includes('disaster')) return '#FF3B30';
    return '#0066FF';
  };

  const getSurfaceColor = () => isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';
  const getBorderColor = () => isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

  const greetName = user?.name?.split(' ')[0] || 'User';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  const visibleAlerts = liveAlerts.filter(a => !dismissedAlerts.includes(a.id!));
  const featured = articles[0];
  const otherNews = articles.slice(1, 10);

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      {/* Fixed Sticky Header */}
      <View style={s.fixedHeader}>
        <View>
          <Text style={s.brandTitle}>PINTIG</Text>
          <Text style={[s.brandSub, { color: colors.textSecondary }]}>BUTUAN CITY</Text>
        </View>
        <TouchableOpacity style={[s.notifBtn, { backgroundColor: getSurfaceColor() }]}>
          <Ionicons name="notifications" size={24} color={colors.textPrimary} />
          <View style={[s.notifBadge, { borderColor: colors.background }]}>
            <Text style={s.notifCount}>3</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadArticles(true); }} tintColor={colors.primary} />}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Urgent Alert Banner */}
        <TouchableOpacity style={s.urgentAlert}>
          <LinearGradient
            colors={['#FF3355', '#FF2D55']}
            style={s.urgentInside}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={s.alertIconBox}>
              <Ionicons name="warning" size={24} color="#FFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.alertTitle}>Heavy Rainfall Warning</Text>
              <Text style={s.alertDesc} numberOfLines={1}>Orange level alert issued for Butuan City.</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Live Pintig Stats */}
        <View style={s.liveContainer}>
          <View style={s.liveHeader}>
            <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>Live Pintig</Text>
            <View style={s.liveBadge}>
              <View style={s.liveDot} />
              <Text style={s.liveText}>LIVE</Text>
            </View>
          </View>
          <View style={s.statsGrid}>
            <View style={[s.statCard, { backgroundColor: getSurfaceColor(), borderColor: getBorderColor() }]}>
              <Text style={[s.statNum, { color: colors.primary }]}>12</Text>
              <Text style={[s.statLabel, { color: colors.textSecondary }]}>Active Alerts</Text>
            </View>
            <View style={[s.statCard, { backgroundColor: getSurfaceColor(), borderColor: getBorderColor() }]}>
              <Text style={[s.statNum, { color: colors.cyan }]}>84</Text>
              <Text style={[s.statLabel, { color: colors.textSecondary }]}>Verified News</Text>
            </View>
            <View style={[s.statCard, { backgroundColor: getSurfaceColor(), borderColor: getBorderColor() }]}>
              <Text style={[s.statNum, { color: '#FF9500' }]}>2.4k</Text>
              <Text style={[s.statLabel, { color: colors.textSecondary }]}>Active Users</Text>
            </View>
          </View>
        </View>
        {/* Visual Stories */}
        <View style={s.visualSection}>
          <View style={s.visualHeaderRow}>
            <View>
              <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>Visual Stories</Text>
              <Text style={[s.visualSub, { color: colors.textSecondary }]}>Latest Updates</Text>
            </View>
            <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="ellipsis-horizontal" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.visualScroll} contentContainerStyle={s.visualContent}>

            {articles.slice(0, 5).map(article => {
              const sourceLower = article.source.toLowerCase();
              let logoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(article.source)}&background=random`;
              if (sourceLower.includes('bombo') || sourceLower.includes('bomboradio')) {
                logoUrl = 'https://upload.wikimedia.org/wikipedia/en/thumb/9/91/Bombo_Radyo_Philippines_logo.svg/1200px-Bombo_Radyo_Philippines_logo.svg.png';
              } else if (sourceLower.includes('pio') || sourceLower.includes('city')) {
                logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Butuan_City_Seal.png/600px-Butuan_City_Seal.png';
              } else if (sourceLower.includes('gma')) {
                logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/4/4e/GMA_Network_logo.png';
              }

              return (
                <TouchableOpacity key={article.id} style={s.storyCard} activeOpacity={0.9} onPress={() => handleOpenArticle(article)}>
                  <Image source={{ uri: article.urlToImage || 'https://images.unsplash.com/photo-1548345680-f5475ea90f0ca?auto=format&fit=crop&q=80&w=400' }} style={s.storyImage} />
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={s.storyOverlay} />
                  <View style={s.storyTopWrap}>
                    <View style={[s.storyBadge, { backgroundColor: getSourceColor(article.source) }]}>
                      <Text style={s.storyBadgeText}>{article.source}</Text>
                    </View>
                  </View>
                  <View style={s.storyBottomWrap}>
                    <Text style={s.storyTitle} numberOfLines={2}>{article.title}</Text>
                    <View style={s.storyAuthorRow}>
                      <Image source={{ uri: logoUrl }} style={[s.storyAvatar, { backgroundColor: '#FFF' }]} />
                      <Text style={s.storyAuthorText}>{article.source.substring(0, 15)} • <Text style={{ color: '#A0A0A0' }}>{formatTime(article.publishedAt)}</Text></Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )
            })}

          </ScrollView>
        </View>

        {/* Featured Stories */}
        <View style={s.feedHeader}>
          <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>Featured Stories</Text>
          <TouchableOpacity onPress={() => router.push('/news')}>
            <Text style={s.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {articles.map((article) => {
          const srcColor = getSourceColor(article.source);
          return (
            <TouchableOpacity key={article.id} style={[s.newsCard, { backgroundColor: colors.surface, borderColor: getBorderColor() }]} onPress={() => handleOpenArticle(article)}>
              <View style={s.cardImageContainer}>
                <Image source={{ uri: article.urlToImage }} style={s.cardImg} />

                <View style={s.legitPillPos}>
                  <View style={s.legitPill}>
                    <Ionicons name="shield-checkmark" size={10} color="#000" />
                    <Text style={s.legitPillText}>LEGIT</Text>
                  </View>
                </View>

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
                    <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} onPress={() => handleOpenArticle(article)} style={s.actionRow}>
                      <Ionicons name="chatbubble-outline" size={16} color={colors.textSecondary} />
                      <Text style={[s.actionCount, { color: colors.textSecondary }]}>84</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="share-outline" size={20} color="#0066FF" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Map Preview Card */}
        <View style={s.mapCard}>
          <Image
            source={{ uri: 'https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/125.53,8.95,12,0/400x200?access_token=placeholder' }}
            style={s.mapImg}
          />
          <View style={s.mapOverlay}>
            <Text style={s.mapTitle}>Interactive City Map</Text>
            <TouchableOpacity style={s.openMapBtn}>
              <Text style={s.openMapText}>Open Map</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* FAB - Adjusted position to completely sit safely above Bottom Tab on all screens */}
      {isDarkMode && (
        <TouchableOpacity style={s.fab}>
          <LinearGradient
            colors={['#0066FF', '#0044BB']}
            style={s.fabGradient}
          >
            <Ionicons name="add" size={22} color="#FFF" />
            <Text style={s.fabText}>Report News</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  fixedHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 15,
  },
  brandTitle: { fontSize: 24, fontWeight: 'bold', color: '#0066FF', letterSpacing: 1 },
  brandSub: { fontSize: 13, fontWeight: 'bold', marginTop: -4 },
  notifBtn: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  notifBadge: {
    position: 'absolute', top: 10, right: 8,
    backgroundColor: '#FF3355', width: 14, height: 14,
    borderRadius: 7, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5,
  },
  notifCount: { color: '#FFF', fontSize: 8, fontWeight: 'bold' },

  urgentAlert: { paddingHorizontal: 20, marginBottom: 25 },
  urgentInside: {
    flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, gap: 12,
  },
  alertIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  alertTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  alertDesc: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },

  liveContainer: { paddingHorizontal: 20, marginBottom: 30 },
  liveHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold' },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(0, 230, 118, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12
  },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#00E676' },
  liveText: { color: '#00E676', fontSize: 10, fontWeight: 'bold' },
  statsGrid: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1, borderRadius: 20,
    padding: 16, alignItems: 'center', borderWidth: 1,
  },
  statNum: { fontSize: 22, fontWeight: '900' },
  statLabel: { fontSize: 10, marginTop: 4, textAlign: 'center' },

  visualSection: { marginTop: 16, marginBottom: 16 },
  visualHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, marginBottom: 12 },
  visualSub: { fontSize: 12, marginTop: 2 },
  visualScroll: { marginHorizontal: -20 },
  visualContent: { paddingHorizontal: 20, gap: 12 },
  storyCard: { width: 160, height: 220, borderRadius: 20, overflow: 'hidden', backgroundColor: '#333' },
  storyImage: { ...StyleSheet.absoluteFillObject },
  storyOverlay: { ...StyleSheet.absoluteFillObject },
  storyTopWrap: { padding: 12, alignItems: 'flex-start' },
  storyBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  storyBadgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  storyBottomWrap: { position: 'absolute', bottom: 12, left: 12, right: 12 },
  storyTitle: { color: '#FFF', fontSize: 14, fontWeight: 'bold', marginBottom: 8, textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 4 },
  storyAuthorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  storyAvatar: { width: 20, height: 20, borderRadius: 10, borderWidth: 1, borderColor: '#FFF' },
  storyAuthorText: { color: '#FFF', fontSize: 10, fontWeight: '600' },

  feedHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 15,
  },
  seeAll: { color: '#0066FF', fontWeight: 'bold' },

  newsCard: { marginHorizontal: 20, marginBottom: 24, borderRadius: 20, overflow: 'hidden', borderWidth: 1 },
  cardImageContainer: { width: '100%', height: 200, position: 'relative' },
  cardImg: { width: '100%', height: '100%', resizeMode: 'cover' },

  legitPillPos: { position: 'absolute', top: 12, left: 16, right: 16 },
  legitPill: { backgroundColor: '#FFDE00', paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', minWidth: '95%' },
  legitPillText: { color: '#000', fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 },

  sourcePillPos: { position: 'absolute', bottom: 12, left: 16 },
  sourcePill: { backgroundColor: 'rgba(25, 25, 25, 0.9)', paddingVertical: 4, paddingHorizontal: 6, paddingRight: 12, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 8 },
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

  mapCard: { marginHorizontal: 20, borderRadius: 24, overflow: 'hidden', height: 160, marginBottom: 20 },
  mapImg: { width: '100%', height: '100%' },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 20,
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
  },
  mapTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  openMapBtn: {
    backgroundColor: '#0066FF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12,
  },
  openMapText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },

  fab: {
    position: 'absolute', bottom: 110, right: 20,
    borderRadius: 28, overflow: 'hidden',
    shadowColor: '#0066FF', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4, shadowRadius: 15, elevation: 12,
  },
  fabGradient: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, height: 56, gap: 10,
  },
  fabText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
});
