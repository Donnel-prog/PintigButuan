import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useArticleStore } from '../../store/useArticleStore';
import { useThemeStore } from '../../store/useThemeStore';

const { width: SCREEN } = Dimensions.get('window');

export default function ArticleDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { selectedArticle } = useArticleStore();
    const { colors } = useThemeStore();
    const insets = useSafeAreaInsets();

    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 500) + 50);

    const [comments, setComments] = useState<{ id: string, user: string, text: string, time: string }[]>([
        { id: '1', user: 'Juan De La Cruz', text: 'Thank you for this verified update. Very helpful!', time: '2h ago' },
        { id: '2', user: 'Maria Clara', text: 'Stay safe everyone in Butuan.', time: '1h ago' }
    ]);
    const [newComment, setNewComment] = useState('');

    if (!selectedArticle) {
        return (
            <SafeAreaView style={[s.container, { backgroundColor: colors.background }]}>
                <View style={s.emptyState}>
                    <Ionicons name="newspaper-outline" size={60} color={colors.textMuted} />
                    <Text style={[s.emptyTitle, { color: colors.textSecondary }]}>Article not found</Text>
                    <TouchableOpacity style={[s.backBtn, { backgroundColor: colors.primary }]} onPress={() => router.back()}>
                        <Text style={s.backBtnText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const formatTime = (d: string) => {
        const hrs = Math.floor((Date.now() - new Date(d).getTime()) / 3600000);
        if (hrs < 1) return 'Just now';
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    const handleLike = () => {
        setIsLiked(!isLiked);
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    };

    const handlePostComment = () => {
        if (!newComment.trim()) return;
        setComments([{ id: Date.now().toString(), user: 'You', text: newComment.trim(), time: 'Just now' }, ...comments]);
        setNewComment('');
    };

    return (
        <KeyboardAvoidingView
            style={[s.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                {/* Hero Image */}
                <View style={s.heroContainer}>
                    <Image source={{ uri: selectedArticle.urlToImage }} style={s.heroImage} />
                    <LinearGradient
                        colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.8)']}
                        style={StyleSheet.absoluteFill}
                    />
                    <SafeAreaView style={s.topBar} edges={['top']}>
                        <TouchableOpacity style={s.topBtn} onPress={() => router.back()}>
                            <Ionicons name="chevron-back" size={24} color="#FFF" />
                        </TouchableOpacity>
                        <View style={s.topRight}>
                            <TouchableOpacity style={s.topBtn}>
                                <Ionicons name="share-social-outline" size={22} color="#FFF" />
                            </TouchableOpacity>
                            <TouchableOpacity style={s.topBtn}>
                                <Ionicons name="ellipsis-horizontal" size={22} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </View>

                {/* Content Container */}
                <View style={s.content}>
                    {/* Legitimacy Check Box */}
                    <LinearGradient
                        colors={['#0066FF', '#0044BB']}
                        style={s.legitBox}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={s.legitIconBox}>
                            <Ionicons name="shield-checkmark" size={32} color="#FFF" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={s.legitTitle}>Legitimacy Check</Text>
                            <Text style={s.legitDesc}>This article has been verified by the Pintig Intelligence Team as FACTUAL.</Text>
                        </View>
                        <View style={s.legitBadgeSm}>
                            <Ionicons name="checkmark-circle" size={16} color="#00E676" />
                        </View>
                    </LinearGradient>

                    {/* Meta Info */}
                    <View style={s.metaRow}>
                        <View style={s.legitBadge}>
                            <Ionicons name="shield-checkmark" size={12} color="#FFF" />
                            <Text style={s.legitBadgeText}>LEGIT</Text>
                        </View>
                        <Text style={s.sourceName}>{selectedArticle.source}</Text>
                    </View>

                    <Text style={s.title}>{selectedArticle.title}</Text>
                    <Text style={s.regionText}>{selectedArticle.region || 'Butuan City, Philippines'}</Text>

                    <View style={s.divider} />

                    <View style={s.publishInfo}>
                        <Text style={s.publishText}>Published {formatTime(selectedArticle.publishedAt)}</Text>
                        <View style={s.dot} />
                        <Text style={s.publishText}>By {selectedArticle.author || 'Pintig Staff'}</Text>
                    </View>

                    <Text style={s.bodyText}>{selectedArticle.content || selectedArticle.description}</Text>

                    {/* Additional Content / Summary */}
                    <View style={s.infoCard}>
                        <Text style={s.infoTitle}>Background Information</Text>
                        <Text style={s.infoText}>
                            The local government of Butuan City encourages all citizens to remain calm and follow official guidelines.
                            Verified news is provided to ensure public safety and prevent misinformation.
                        </Text>
                    </View>

                    {/* Comments Section */}
                    <View style={s.commentSection}>
                        <Text style={s.commentSectionTitle}>Comments ({comments.length})</Text>
                        {comments.map((c) => (
                            <View key={c.id} style={s.commentItem}>
                                <View style={s.commentAvatar}>
                                    <Text style={s.commentAvatarText}>{c.user.charAt(0)}</Text>
                                </View>
                                <View style={s.commentContent}>
                                    <View style={s.commentHeader}>
                                        <Text style={s.commentAuthor}>{c.user}</Text>
                                        <Text style={s.commentTime}>{c.time}</Text>
                                    </View>
                                    <Text style={s.commentText}>{c.text}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
                <View style={{ height: 140 }} />
            </ScrollView>

            {/* Bottom Interaction */}
            <BlurView intensity={80} tint="dark" style={[s.bottomBtnBox, { paddingBottom: Math.max(insets.bottom, 15) }]}>
                <View style={s.bottomActionRow}>
                    <TouchableOpacity style={s.heartBtn} onPress={handleLike}>
                        <Ionicons name={isLiked ? "heart" : "heart-outline"} size={28} color={isLiked ? "#FF3B30" : "#FFF"} />
                        <Text style={s.countText}>{likeCount}</Text>
                    </TouchableOpacity>

                    <View style={s.commentInputContainer}>
                        <TextInput
                            style={s.commentInput}
                            placeholder="Write a comment..."
                            placeholderTextColor="rgba(255,255,255,0.4)"
                            value={newComment}
                            onChangeText={setNewComment}
                            onSubmitEditing={handlePostComment}
                            returnKeyType="send"
                        />
                        <TouchableOpacity onPress={handlePostComment} style={s.sendBtn}>
                            <Ionicons name="send" size={18} color={newComment.trim() ? "#0066FF" : "rgba(255,255,255,0.2)"} />
                        </TouchableOpacity>
                    </View>
                </View>
            </BlurView>
        </KeyboardAvoidingView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1 },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
    emptyTitle: { fontSize: 18 },
    backBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
    backBtnText: { color: '#FFF', fontWeight: 'bold' },
    heroContainer: { height: 320, position: 'relative' },
    heroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    topBar: {
        position: 'absolute', top: 0, left: 0, right: 0,
        flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10,
    },
    topBtn: {
        width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0, 0, 0, 0.4)',
        alignItems: 'center', justifyContent: 'center',
    },
    topRight: { flexDirection: 'row', gap: 10 },

    content: { padding: 25, marginTop: -30, backgroundColor: '#050505', borderTopLeftRadius: 30, borderTopRightRadius: 30 },

    legitBox: {
        flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 24, marginBottom: 25, gap: 15,
        shadowColor: '#0066FF', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
    },
    legitIconBox: { width: 56, height: 56, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
    legitTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    legitDesc: { color: 'rgba(255,255,255,0.8)', fontSize: 12, lineHeight: 18, marginTop: 4 },
    legitBadgeSm: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center' },

    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15 },
    legitBadge: { backgroundColor: '#0066FF', flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
    legitBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '900' },
    sourceName: { color: '#FFE600', fontSize: 13, fontWeight: 'bold' },

    title: { fontSize: 26, fontWeight: 'bold', color: '#FFF', lineHeight: 34, marginBottom: 10 },
    regionText: { color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: '600', marginBottom: 20 },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 20 },

    publishInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 25 },
    publishText: { color: 'rgba(255,255,255,0.4)', fontSize: 13 },
    dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)' },

    bodyText: { fontSize: 17, color: 'rgba(255,255,255,0.8)', lineHeight: 28, marginBottom: 30 },

    infoCard: { backgroundColor: 'rgba(255,255,255,0.03)', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 30 },
    infoTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
    infoText: { color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 22 },

    commentSection: { marginTop: 10 },
    commentSectionTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
    commentItem: { flexDirection: 'row', gap: 15, marginBottom: 20 },
    commentAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#0066FF', alignItems: 'center', justifyContent: 'center' },
    commentAvatarText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    commentContent: { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', padding: 15, borderRadius: 16 },
    commentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    commentAuthor: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
    commentTime: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
    commentText: { color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 20 },

    bottomBtnBox: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 15, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
    bottomActionRow: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    heartBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    countText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },

    commentInputContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 25, paddingHorizontal: 15, height: 50 },
    commentInput: { flex: 1, color: '#FFF', fontSize: 15, paddingRight: 10 },
    sendBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
});
