import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import {
    Dimensions,
    Image,
    Linking,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Article } from '../types/news';

import { useArticleStore } from '../store/useArticleStore';
import { useThemeStore } from '../store/useThemeStore';

const { width: SCREEN, height: SCREEN_H } = Dimensions.get('window');

interface NewsModalProps {
    visible: boolean;
    article: Article | null;
    onClose: () => void;
}

export function NewsModal({ visible, article, onClose }: NewsModalProps) {
    const { savedArticles, toggleSavedArticle } = useArticleStore();
    const { colors } = useThemeStore();

    if (!article) return null;

    const isSaved = savedArticles.some(a => a.id === article.id);

    const formatTime = (d: string) => {
        const hrs = Math.floor((Date.now() - new Date(d).getTime()) / 3600000);
        if (hrs < 1) return 'Just now';
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    const openOriginal = async () => {
        if (article.url) {
            try {
                await WebBrowser.openBrowserAsync(article.url);
            } catch (error) {
                console.error('Failed to open URL:', error);
                Linking.openURL(article.url).catch(err => console.error('Failed to open URL with Linking:', err));
            }
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={[s.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.85)' }]}>
                <View style={[s.modalContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    {/* Header */}
                    <View style={[s.modalHeader, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
                        <TouchableOpacity style={[s.closeBtn, { backgroundColor: colors.surfaceLight }]} onPress={onClose}>
                            <Ionicons name="close" size={24} color={colors.textPrimary} />
                        </TouchableOpacity>
                        <View style={s.headerCenter}>
                            <Text style={[s.modalSource, { color: colors.textPrimary }]}>{article.source}</Text>
                            {article.isVerified && (
                                <View style={s.verifiedBadge}>
                                    <Ionicons name="checkmark-circle" size={12} color={colors.cyan} />
                                    <Text style={[s.verifiedText, { color: colors.cyan }]}>Verified</Text>
                                </View>
                            )}
                        </View>
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <TouchableOpacity style={[s.shareBtn, { backgroundColor: colors.cyan + '15' }]} onPress={() => toggleSavedArticle(article)}>
                                <Ionicons name={isSaved ? "bookmark" : "bookmark-outline"} size={22} color={colors.cyan} />
                            </TouchableOpacity>
                            <TouchableOpacity style={[s.shareBtn, { backgroundColor: colors.cyan + '15' }]} onPress={openOriginal}>
                                <Ionicons name="open-outline" size={22} color={colors.cyan} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.modalScroll}>
                        <Image source={{ uri: article.urlToImage }} style={s.modalImage} />

                        <View style={s.modalBody}>
                            <View style={s.modalMetaRow}>
                                <Text style={[s.modalTime, { color: colors.textMuted }]}>{formatTime(article.publishedAt)}</Text>
                                <Text style={[s.modalRegion, { color: colors.purple }]}>{article.region}</Text>
                            </View>

                            <Text style={[s.modalTitle, { color: colors.textPrimary }]}>{article.title}</Text>

                            {/* Verification Box */}
                            <View style={[s.legitimacyBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                <View style={[s.legitimacyIcon, { backgroundColor: colors.success + '15' }]}>
                                    <Ionicons name="shield-checkmark" size={18} color={colors.success} />
                                </View>
                                <View style={s.legitimacyContent}>
                                    <Text style={[s.legitimacyTitle, { color: colors.success }]}>News Verification</Text>
                                    <Text style={[s.legitimacyDesc, { color: colors.textSecondary }]}>
                                        {article.verificationSource || `Sourced from ${article.source}, a recognized local media outlet in Butuan City.`}
                                    </Text>
                                </View>
                            </View>

                            <View style={[s.modalDivider, { backgroundColor: colors.border }]} />

                            <Text style={[s.modalContent, { color: colors.textSecondary }]}>
                                {article.content || article.description}
                            </Text>

                            {article.isAdminAlert && (
                                <View style={[s.modalAlertBox, { backgroundColor: colors.alert + '15', borderColor: colors.alert + '30' }]}>
                                    <Ionicons name="warning" size={20} color={colors.alert} />
                                    <Text style={[s.modalAlertText, { color: colors.alert }]}>This is an official emergency alert for Butuan City.</Text>
                                </View>
                            )}

                            {/* Verification Action */}
                            <TouchableOpacity style={[s.verifyAction, { backgroundColor: colors.surfaceLight, borderColor: colors.cyan + '50' }]} onPress={openOriginal}>
                                <View style={s.verifyActionInner}>
                                    <Text style={[s.verifyActionText, { color: colors.textPrimary }]}>For more legitimacy, check the original link</Text>
                                    <View style={s.linkRow}>
                                        <Text style={[s.linkText, { color: colors.cyan }]} numberOfLines={1}>{article.url}</Text>
                                        <Ionicons name="chevron-forward" size={14} color={colors.cyan} />
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={{ height: 40 }} />
                    </ScrollView>

                    <View style={[s.footerActions, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                        <TouchableOpacity style={[s.modalActionBtn, { backgroundColor: colors.surfaceLight }]} onPress={onClose}>
                            <Text style={[s.modalActionText, { color: colors.textPrimary }]}>Close News</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[s.modalActionBtn, s.primaryAction, { backgroundColor: colors.cyan }]} onPress={openOriginal}>
                            <Ionicons name="newspaper-outline" size={18} color="#FFF" />
                            <Text style={[s.modalActionText, { color: '#FFF' }]}>View Original</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const s = StyleSheet.create({
    modalOverlay: {
        flex: 1, justifyContent: 'flex-end',
    },
    modalContainer: {
        borderTopLeftRadius: 30, borderTopRightRadius: 30,
        height: SCREEN_H * 0.88, width: SCREEN, overflow: 'hidden',
        borderWidth: 1,
    },
    modalHeader: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 18, borderBottomWidth: 1,
    },
    headerCenter: { alignItems: 'center' },
    closeBtn: {
        width: 40, height: 40, borderRadius: 20,
        alignItems: 'center', justifyContent: 'center',
    },
    shareBtn: {
        width: 40, height: 40, borderRadius: 20,
        alignItems: 'center', justifyContent: 'center',
    },
    modalSource: { fontWeight: 'bold', fontSize: 15 },
    verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
    verifiedText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },

    modalScroll: { paddingBottom: 60 },
    modalImage: { width: SCREEN, height: 260, resizeMode: 'cover' },
    modalBody: { padding: 24 },
    modalMetaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    modalTime: { fontSize: 12 },
    modalRegion: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
    modalTitle: { fontSize: 24, fontWeight: 'bold', lineHeight: 32 },

    legitimacyBox: {
        flexDirection: 'row', gap: 14,
        padding: 16, borderRadius: 16, marginTop: 20, borderWidth: 1
    },
    legitimacyIcon: {
        width: 36, height: 36, borderRadius: 10,
        alignItems: 'center', justifyContent: 'center'
    },
    legitimacyContent: { flex: 1 },
    legitimacyTitle: { fontSize: 14, fontWeight: 'bold' },
    legitimacyDesc: { fontSize: 12, marginTop: 2, lineHeight: 18 },

    modalDivider: { height: 1, marginVertical: 24 },
    modalContent: { fontSize: 16, lineHeight: 28 },

    modalAlertBox: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        padding: 16, borderRadius: 12,
        marginTop: 24, borderWidth: 1,
    },
    modalAlertText: { fontSize: 13, flex: 1, fontWeight: '600' },

    verifyAction: {
        marginTop: 30, borderRadius: 20,
        padding: 20, borderStyle: 'dashed', borderWidth: 1,
    },
    verifyActionInner: { gap: 8 },
    verifyActionText: { fontSize: 13, fontWeight: 'bold' },
    linkRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    linkText: { flex: 1, fontSize: 12, textDecorationLine: 'underline' },

    footerActions: {
        flexDirection: 'row', padding: 20, gap: 12,
        borderTopWidth: 1,
    },
    modalActionBtn: {
        flex: 1, height: 56, borderRadius: 16, alignItems: 'center',
        justifyContent: 'center',
    },
    primaryAction: {
        flexDirection: 'row', gap: 10
    },
    modalActionText: { fontSize: 15, fontWeight: 'bold' },
});
