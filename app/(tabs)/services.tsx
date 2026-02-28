import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, ImageBackground, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN } = Dimensions.get('window');
const isSmall = SCREEN < 375;

const CATEGORIES = [
    { id: 'all', label: 'All Services' },
    { id: 'utilities', label: 'Utilities' },
    { id: 'health', label: 'Health' },
    { id: 'transport', label: 'Transport' },
];

const SERVICES = [
    { id: '1', name: 'Water District', desc: 'Bill inquiry and online payment', status: 'Online', statusColor: '#00E676', icon: 'water', type: 'utilities' },
    { id: '2', name: 'Electric Co.', desc: 'Power outage alerts & billing', status: 'Online', statusColor: '#00E676', icon: 'flash', type: 'utilities' },
    { id: '3', name: 'City Health', desc: 'Book appointments & records', status: 'Open', statusColor: '#00E676', icon: 'medkit', type: 'health' },
    { id: '4', name: 'LTO Portal', desc: 'License renewal & registration', status: 'Online', statusColor: '#00E676', icon: 'car', type: 'transport' },
    { id: '5', name: 'Public Library', desc: 'Digital archives & room booking', status: 'Closed', statusColor: '#00E676', icon: 'book', type: 'education' },
    { id: '6', name: 'Waste Mgmt', desc: 'Collection schedule & requests', status: 'Active', statusColor: '#00E676', icon: 'sync', type: 'utilities' },
];

export default function ServicesScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const handleCall = (number: string) => {
        Linking.openURL(`tel:${number}`).catch(err => console.error('Failed to make call:', err));
    };

    return (
        <View style={s.container}>
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                {/* Header Graphic */}
                <ImageBackground
                    source={{ uri: 'https://images.unsplash.com/photo-1574768407481-9b161cba477d?auto=format&fit=crop&w=800&q=80' }} // Placeholder abstract gradient/buildings 
                    style={s.headerBg}
                >
                    <LinearGradient
                        colors={['rgba(0,102,255,0.8)', 'rgba(255,51,85,0.8)', '#121212']}
                        locations={[0, 0.5, 1]}
                        style={s.headerGradient}
                    >
                        <SafeAreaView edges={['top']} style={{ flex: 1 }}>

                            {/* Search */}
                            <View style={s.searchWrap}>
                                <View style={s.searchBar}>
                                    <Ionicons name="search" size={20} color="#888" />
                                    <TextInput
                                        style={s.searchInput}
                                        placeholder="Search utilities, health, or transport..."
                                        placeholderTextColor="#888"
                                    />
                                    <TouchableOpacity>
                                        <Ionicons name="options-outline" size={20} color="#0066FF" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={s.headerTextWrap}>
                                <Text style={s.headerTitle}>City Services</Text>
                                <Text style={s.headerSub}>Everything Butuan in one place</Text>
                            </View>

                        </SafeAreaView>
                    </LinearGradient>
                </ImageBackground>

                <View style={s.bodyContent}>

                    {/* Emergency Contacts */}
                    <View style={s.sectionHeader}>
                        <Text style={s.sectionTitle}>Emergency Contacts</Text>
                        <TouchableOpacity><Text style={s.viewAllTxt}>View All</Text></TouchableOpacity>
                    </View>
                    <View style={s.emergencyRow}>
                        <TouchableOpacity style={s.emergencyBtnLightRed} onPress={() => handleCall('911')}>
                            <Ionicons name="shield-checkmark" size={16} color="#E53935" />
                            <Text style={s.emergencyTextRed}>911 Police</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={s.emergencyBtnLightOrange} onPress={() => handleCall('160')}>
                            <Ionicons name="flame" size={16} color="#FF9500" />
                            <Text style={s.emergencyTextOrange}>Fire Dept</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Categories */}
                    <Text style={[s.sectionTitle, { marginTop: 24, marginBottom: 12 }]}>Categories</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.catScroll} contentContainerStyle={s.catContent}>
                        {CATEGORIES.map(cat => {
                            const active = activeTab === cat.id;
                            return (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[s.catChip, active ? s.catChipActive : s.catChipInactive]}
                                    onPress={() => setActiveTab(cat.id)}
                                >
                                    {active && <Ionicons name="checkmark" size={16} color="#FFF" style={{ marginRight: 6 }} />}
                                    <Text style={[s.catText, active ? s.catTextActive : s.catTextInactive]}>{cat.label}</Text>
                                </TouchableOpacity>
                            )
                        })}
                    </ScrollView>

                    {/* Grid */}
                    <View style={s.gridContainer}>
                        {SERVICES.map(item => (
                            <TouchableOpacity key={item.id} style={s.serviceCard} activeOpacity={0.8}>
                                <View style={s.iconWrapRow}>
                                    <View style={s.serviceIconBox}>
                                        <Ionicons name={item.icon as any} size={22} color="#0066FF" />
                                    </View>
                                </View>
                                <Text style={s.serviceName}>{item.name}</Text>
                                <Text style={s.serviceDesc} numberOfLines={2}>{item.desc}</Text>
                                <View style={s.cardFooter}>
                                    <Text style={[s.serviceStatus, { color: item.statusColor }]}>{item.status}</Text>
                                    <Ionicons name="arrow-forward" size={16} color="#666" />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Live Pintig Box */}
                    <View style={s.liveBox}>
                        <View style={s.liveHeader}>
                            <View>
                                <Text style={s.liveBoxTitle}>Live Pintig</Text>
                                <Text style={s.liveBoxSub}>Real-time city pulse</Text>
                            </View>
                            <View style={s.liveNowPill}>
                                <Text style={s.liveNowText}>Live Now</Text>
                            </View>
                        </View>
                        <View style={s.liveStatsRow}>
                            <View style={s.liveStatItem}>
                                <Text style={[s.liveStatNum, { color: '#0066FF' }]}>142</Text>
                                <Text style={s.liveStatLabel}>Active News</Text>
                            </View>
                            <View style={s.liveStatDiv} />
                            <View style={s.liveStatItem}>
                                <Text style={[s.liveStatNum, { color: '#00E676' }]}>12</Text>
                                <Text style={s.liveStatLabel}>Services Up</Text>
                            </View>
                            <View style={s.liveStatDiv} />
                            <View style={s.liveStatItem}>
                                <Text style={[s.liveStatNum, { color: '#FF3B30' }]}>0</Text>
                                <Text style={s.liveStatLabel}>Alerts</Text>
                            </View>
                        </View>
                    </View>

                    {/* Open Map Widget */}
                    <ImageBackground
                        source={{ uri: 'https://images.unsplash.com/photo-1548345680-f5475ea90f0ca?auto=format&fit=crop&q=80&w=800' }} // Map blur placeholder
                        style={s.mapWidget}
                        imageStyle={s.mapWidgetImg}
                    >
                        <View style={s.mapWidgetOverlay}>
                            <Ionicons name="location" size={24} color="#FFF" style={{ marginBottom: 8 }} />
                            <Text style={s.mapWidgetTitle}>Open Interactive City Map</Text>
                            <View style={s.mapBtnRow}>
                                <TouchableOpacity style={s.mapActionBtnBlue} onPress={() => router.push('/map')}>
                                    <Text style={s.mapBtnTxt}>Explore Nearby</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={s.mapActionBtnBrand}>
                                    <Ionicons name="headset" size={16} color="#FFF" />
                                    <Text style={s.mapBtnTxt}>Concierge</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ImageBackground>

                    <View style={{ height: 100 }} />
                </View>
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    headerBg: { width: '100%', height: 260 },
    headerGradient: { flex: 1 },
    searchWrap: { paddingHorizontal: 20, paddingTop: 10 },
    searchBar: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A',
        height: 48, borderRadius: 16, paddingHorizontal: 16, gap: 10,
    },
    searchInput: { flex: 1, color: '#FFF', fontSize: 14 },
    headerTextWrap: { position: 'absolute', bottom: 30, left: 20 },
    headerTitle: { color: '#FFF', fontSize: 32, fontWeight: 'bold' },
    headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 },

    bodyContent: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 60 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    viewAllTxt: { color: '#0066FF', fontSize: 14, fontWeight: 'bold' },
    errorText: { color: 'red' },

    emergencyRow: { flexDirection: 'row', gap: 12 },
    emergencyBtnLightRed: {
        flex: 1, backgroundColor: 'rgba(255, 230, 230, 0.9)',
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 14, borderRadius: 16, gap: 8
    },
    emergencyTextRed: { color: '#E53935', fontWeight: 'bold', fontSize: 15 },
    emergencyBtnLightOrange: {
        flex: 1, backgroundColor: 'rgba(255, 245, 230, 0.9)',
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 14, borderRadius: 16, gap: 8
    },
    emergencyTextOrange: { color: '#FF9500', fontWeight: 'bold', fontSize: 15 },

    catScroll: { marginHorizontal: -20 },
    catContent: { paddingHorizontal: 20, gap: 10 },
    catChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 36, borderRadius: 18 },
    catChipActive: { backgroundColor: '#0066FF' },
    catChipInactive: { backgroundColor: '#1E1E1E', borderWidth: 1, borderColor: '#333' },
    catText: { fontSize: 13, fontWeight: '600' },
    catTextActive: { color: '#FFF' },
    catTextInactive: { color: '#A0A0A0' },

    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 24, gap: 12 },
    serviceCard: {
        width: (SCREEN - 52) / 2, backgroundColor: '#1A1A1C',
        borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#2A2A2C', marginBottom: 4
    },
    iconWrapRow: { marginBottom: 16 },
    serviceIconBox: {
        width: 44, height: 44, borderRadius: 16, backgroundColor: '#FFF',
        alignItems: 'center', justifyContent: 'center'
    },
    serviceName: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
    serviceDesc: { color: '#888', fontSize: 12, lineHeight: 16, height: 32, marginBottom: 16 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    serviceStatus: { fontSize: 12, fontWeight: 'bold' },

    liveBox: {
        marginTop: 24, backgroundColor: '#1A1A1A', borderRadius: 20, padding: 20,
        borderWidth: 1, borderColor: '#2A2A2A'
    },
    liveHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
    liveBoxTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    liveBoxSub: { color: '#888', fontSize: 12, marginTop: 2 },
    liveNowPill: { backgroundColor: '#E6EFFF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    liveNowText: { color: '#0066FF', fontSize: 10, fontWeight: 'bold' },
    liveStatsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
    liveStatItem: { alignItems: 'center' },
    liveStatNum: { fontSize: 24, fontWeight: 'bold' },
    liveStatLabel: { color: '#A0A0A0', fontSize: 11, marginTop: 4 },
    liveStatDiv: { width: 1, height: 40, backgroundColor: '#333' },

    mapWidget: { marginTop: 24, height: 160, width: '100%', borderRadius: 24, overflow: 'hidden' },
    mapWidgetImg: { opacity: 0.6 },
    mapWidgetOverlay: {
        ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center', justifyContent: 'center', padding: 20
    },
    mapWidgetTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 16 },
    mapBtnRow: { flexDirection: 'row', gap: 12 },
    mapActionBtnBlue: { backgroundColor: '#0066FF', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
    mapActionBtnBrand: { backgroundColor: '#0066FF', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 6 },
    mapBtnTxt: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },

});
