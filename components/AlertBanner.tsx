import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeStore } from '../store/useThemeStore';

interface AlertBannerProps {
    title: string;
    message: string;
    onDismiss?: () => void;
    onViewDetails?: () => void;
}

export function AlertBanner({ title, message, onDismiss, onViewDetails }: AlertBannerProps) {
    const { colors } = useThemeStore();

    return (
        <View style={[s.container, { backgroundColor: colors.surface, borderColor: colors.alert + '30', borderLeftColor: colors.alert }]}>
            <View style={s.header}>
                <View style={s.liveIndicator}>
                    <View style={[s.liveDot, { backgroundColor: colors.alert }]} />
                    <Text style={[s.liveText, { color: colors.alert }]}>LIVE ALERT</Text>
                </View>
                <TouchableOpacity onPress={onDismiss}>
                    <Ionicons name="close" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>
            <View style={s.body}>
                <Ionicons name="warning" size={24} color={colors.alert} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[s.title, { color: colors.textPrimary }]}>{title}</Text>
                    <Text style={[s.message, { color: colors.textSecondary }]} numberOfLines={2}>{message}</Text>
                </View>
            </View>
            <View style={s.actions}>
                <TouchableOpacity style={[s.viewBtn, { backgroundColor: colors.alert + '15', borderColor: colors.alert + '30' }]} onPress={onViewDetails}>
                    <Text style={[s.viewText, { color: colors.alert }]}>View Details</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.dismissBtn, { backgroundColor: colors.surfaceLight }]} onPress={onDismiss}>
                    <Text style={[s.dismissText, { color: colors.textMuted }]}>Dismiss</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    container: {
        borderRadius: 16, padding: 16,
        marginBottom: 16, borderWidth: 1,
        borderLeftWidth: 4,
    },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    liveIndicator: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    liveDot: { width: 8, height: 8, borderRadius: 4 },
    liveText: { fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
    body: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
    title: { fontSize: 15, fontWeight: 'bold', marginBottom: 2 },
    message: { fontSize: 13, lineHeight: 18 },
    actions: { flexDirection: 'row', gap: 10 },
    viewBtn: {
        flex: 1, alignItems: 'center',
        paddingVertical: 10, borderRadius: 10, borderWidth: 1,
    },
    viewText: { fontWeight: 'bold', fontSize: 13 },
    dismissBtn: {
        flex: 1, alignItems: 'center',
        paddingVertical: 10, borderRadius: 10,
    },
    dismissText: { fontWeight: '600', fontSize: 13 },
});
