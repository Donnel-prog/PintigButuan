import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { BUTUAN_DISTRICTS } from '../constants/Regions';
import { PintigColors, responsive } from '../constants/theme';

interface RegionFilterProps {
    selectedRegion: string;
    onSelectRegion: (region: string) => void;
}

export const RegionFilter: React.FC<RegionFilterProps> = ({ selectedRegion, onSelectRegion }) => {
    // Note: BUTUAN_DISTRICTS includes 'All Butuan', we handle it here
    const regions = BUTUAN_DISTRICTS;

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.container}
        >
            {regions.map((region) => {
                const isActive = selectedRegion === region;
                return (
                    <TouchableOpacity
                        key={region}
                        style={[styles.chip, isActive && styles.chipActive]}
                        onPress={() => onSelectRegion(region)}
                    >
                        {region.includes('All') && (
                            <Ionicons
                                name="map"
                                size={14}
                                color={isActive ? 'white' : PintigColors.textSecondary}
                                style={{ marginRight: 4 }}
                            />
                        )}
                        <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                            {region}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: responsive.padding(20),
        paddingVertical: 10,
        gap: 8,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: PintigColors.surface,
        borderWidth: 1,
        borderColor: PintigColors.border,
    },
    chipActive: {
        backgroundColor: PintigColors.cyan,
        borderColor: PintigColors.cyanLight,
    },
    chipText: {
        color: PintigColors.textSecondary,
        fontSize: 13,
        fontWeight: '600',
    },
    chipTextActive: {
        color: '#FFFFFF',
    },
});
