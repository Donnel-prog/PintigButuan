import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PintigColors, responsive } from '../constants/theme';
import { Article } from '../types/news';

interface NewsCardProps {
    article: Article;
    onPress: () => void;
    variant?: 'featured' | 'standard';
}

export const NewsCard: React.FC<NewsCardProps> = ({ article, onPress, variant = 'standard' }) => {
    const timeAgo = () => {
        const diff = Date.now() - new Date(article.publishedAt).getTime();
        const hours = Math.floor(diff / 3600000);
        if (hours < 1) return 'Just now';
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    if (variant === 'featured') {
        return (
            <TouchableOpacity style={styles.featuredContainer} onPress={onPress} activeOpacity={0.9}>
                <Image source={{ uri: article.urlToImage }} style={styles.featuredImage} />
                <View style={styles.featuredOverlay} />
                <View style={styles.featuredContent}>
                    <View style={styles.badgeRow}>
                        <View style={styles.sourceBadge}>
                            <Text style={styles.sourceText}>{article.source}</Text>
                        </View>
                        {article.isAdminAlert && (
                            <View style={styles.alertBadge}>
                                <Ionicons name="shield" size={10} color={PintigColors.alert} />
                                <Text style={styles.alertText}>OFFICIAL</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.featuredTitle} numberOfLines={2}>{article.title}</Text>
                    <View style={styles.metaRow}>
                        <Text style={styles.metaText}>{timeAgo()}</Text>
                        <View style={styles.readTime}>
                            <Ionicons name="time-outline" size={12} color={PintigColors.textSecondary} />
                            <Text style={styles.metaText}>3 min read</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity style={styles.standardContainerWrapper} onPress={onPress} activeOpacity={0.8}>
            <BlurView intensity={30} tint="dark" style={[styles.standardContainer, { borderColor: PintigColors.border }]}>
                <Image source={{ uri: article.urlToImage }} style={styles.standardImage} />
                <View style={styles.standardContent}>
                    <View style={styles.sourceBadgeSmall}>
                        <Text style={styles.sourceTextSmall}>{article.source}</Text>
                    </View>
                    <Text style={styles.standardTitle} numberOfLines={2}>{article.title}</Text>
                    <Text style={styles.standardMeta}>{timeAgo()}</Text>
                </View>
            </BlurView>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    featuredContainer: {
        marginHorizontal: responsive.padding(20),
        borderRadius: responsive.cardRadius,
        overflow: 'hidden',
        height: responsive.fontSize(240),
        backgroundColor: PintigColors.surface,
    },
    featuredImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    featuredOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(11, 25, 41, 0.55)',
    },
    featuredContent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: responsive.padding(18),
    },
    badgeRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 10,
    },
    sourceBadge: {
        backgroundColor: PintigColors.cyan + '30',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    sourceText: {
        color: PintigColors.cyan,
        fontSize: 11,
        fontWeight: 'bold',
    },
    alertBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: PintigColors.alert + '25',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 4,
    },
    alertText: {
        color: PintigColors.alert,
        fontSize: 10,
        fontWeight: 'bold',
    },
    featuredTitle: {
        fontSize: responsive.fontSize(18),
        fontWeight: 'bold',
        color: '#FFFFFF',
        lineHeight: 24,
        marginBottom: 8,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    readTime: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 12,
        color: PintigColors.textSecondary,
    },
    standardContainerWrapper: {
        marginHorizontal: responsive.padding(20),
        marginBottom: 14,
        borderRadius: responsive.cardRadius,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    standardContainer: {
        flexDirection: 'row',
        backgroundColor: PintigColors.surface,
        borderRadius: responsive.cardRadius,
        overflow: 'hidden',
    },
    standardImage: {
        width: responsive.fontSize(110),
        height: responsive.fontSize(100),
        resizeMode: 'cover',
    },
    standardContent: {
        flex: 1,
        padding: 12,
        justifyContent: 'center',
    },
    sourceBadgeSmall: {
        alignSelf: 'flex-start',
        backgroundColor: PintigColors.cyan + '20',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
        marginBottom: 6,
    },
    sourceTextSmall: {
        color: PintigColors.cyan,
        fontSize: 10,
        fontWeight: 'bold',
    },
    standardTitle: {
        fontSize: responsive.fontSize(14),
        fontWeight: '700',
        color: '#FFFFFF',
        lineHeight: 19,
        marginBottom: 6,
    },
    standardMeta: {
        fontSize: 11,
        color: PintigColors.textMuted,
    },
});
