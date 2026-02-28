import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { Dimensions, Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useArticleStore } from '../../store/useArticleStore';
import { useThemeStore } from '../../store/useThemeStore';

const { width: SCREEN } = Dimensions.get('window');
const isSmall = SCREEN < 375;

const BUTUAN_CENTER = { lat: 8.9475, lng: 125.5406 };

const getLeafletHtml = (isDark: boolean, colors: any) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; }
    html, body, #map { width: 100%; height: 100%; background: ${colors.background}; }
    .leaflet-popup-content-wrapper { 
      background: ${colors.surface}; 
      color: ${colors.textPrimary}; 
      border-radius: 12px; 
    }
    .leaflet-popup-tip { background: ${colors.surface}; }
    .leaflet-control-attribution { display: none !important; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', {
      center: [${BUTUAN_CENTER.lat}, ${BUTUAN_CENTER.lng}],
      zoom: 14,
      zoomControl: false
    });

    var tileUrl = '${isDark ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}';
    L.tileLayer(tileUrl, {
      maxZoom: 19
    }).addTo(map);

    var colorMap = {
      health: '${colors.cyan}', incident: '#FF2D55'
    };

    function icon(type) {
      var color = colorMap[type] || '${colors.cyan}';
      return L.divIcon({
        className: '',
        html: '<div style="background:' + color + ';width:16px;height:16px;border-radius:50%;border:2px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.5);"></div>',
        iconSize: [22, 22], iconAnchor: [11, 11]
      });
    }

    var places = pointsStr_INJECT;

    places.forEach(function(p) {
      L.marker([p.lat, p.lng], { icon: icon(p.type) }).addTo(map);
    });
  </script>
</body>
</html>
`;

export default function MapScreen() {
    const { colors, isDarkMode } = useThemeStore();
    const { articles } = useArticleStore();
    const insets = useSafeAreaInsets();
    const webViewRef = useRef<WebView>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activePill, setActivePill] = useState('alerts');

    const topOffset = insets.top > 0 ? insets.top : 20;

    const PILLS = [
        { id: 'alerts', label: 'Alerts', icon: 'medical' },
        { id: 'hospitals', label: 'Hospitals', icon: 'medkit' },
        { id: 'police', label: 'Police', icon: 'shield' },
        { id: 'weather', label: 'Weather', icon: 'partly-sunny' },
    ];

    // Compute dynamic points from real articles
    const dynamicPoints = articles.slice(0, 6).map((a, i) => {
        // Just mock some offsets around Butuan center for demonstration
        const latOffset = (i % 2 === 0 ? 1 : -1) * (Math.random() * 0.015);
        const lngOffset = (i % 3 === 0 ? 1 : -1) * (Math.random() * 0.015);
        return {
            id: a.id,
            name: a.title,
            lat: BUTUAN_CENTER.lat + latOffset,
            lng: BUTUAN_CENTER.lng + lngOffset,
            type: a.isVerified ? 'health' : 'incident' // Mapping to 'health'(blue/green) or 'incident'(red)
        };
    });

    const NEARBY_POINTS = dynamicPoints.map(p => {
        const art = articles.find(a => a.id === p.id)!;
        return {
            id: p.id,
            title: p.name,
            type: art.isVerified ? 'Verified News' : 'Community Alert',
            dist: (Math.random() * 3).toFixed(1) + ' km',
            color: art.isVerified ? colors.cyan : '#FF2D55',
            img: art.urlToImage || 'https://images.unsplash.com/photo-1547633282-552796443c68?auto=format&fit=crop&q=80&w=200'
        };
    });

    const placesString = JSON.stringify(dynamicPoints);
    const finalHtml = getLeafletHtml(isDarkMode, colors).replace('pointsStr_INJECT', placesString);

    return (
        <View style={s.container}>
            {/* Base Map */}
            {Platform.OS !== 'web' ? (
                <WebView
                    ref={webViewRef}
                    source={{ html: finalHtml }}
                    style={s.mapWebView}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                />
            ) : (
                <View style={[s.webFallback, { backgroundColor: colors.surface }]}>
                    <Ionicons name="map-outline" size={64} color={colors.textMuted} />
                    <Text style={[s.webFallbackText, { color: colors.textPrimary }]}>Map Preview</Text>
                </View>
            )}

            {/* Overlays Wrapper */}
            <View style={[s.overlayWrapper, { top: topOffset }]} pointerEvents="box-none">

                {/* Search Header Area */}
                <View style={s.topBarRow}>
                    <View style={[s.searchBar, { backgroundColor: 'rgba(25, 25, 25, 0.95)' }]}>
                        <Ionicons name="search" size={20} color="#A0A0A0" />
                        <TextInput
                            style={s.searchInput}
                            placeholder="Search services, news, ..."
                            placeholderTextColor="#A0A0A0"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <Ionicons name="options-outline" size={20} color="#0066FF" />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={s.myLocationBtn} activeOpacity={0.8}>
                        <Ionicons name="locate" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>

                {/* Filter Pills */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.pillsScroll} contentContainerStyle={s.pillsContent}>
                    {PILLS.map(pill => {
                        const isActive = activePill === pill.id;
                        return (
                            <TouchableOpacity
                                key={pill.id}
                                style={[s.pillBtn, isActive ? s.pillActive : s.pillInactive]}
                                onPress={() => setActivePill(pill.id)}
                            >
                                {pill.icon && (
                                    <Ionicons name={pill.icon as any} size={14} color={isActive ? '#FFF' : '#E0E0E0'} />
                                )}
                                <Text style={[s.pillText, { color: isActive ? '#FFF' : '#E0E0E0' }]}>{pill.label}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* Weather Forecast Banner */}
                <TouchableOpacity style={[s.trafficBanner, { backgroundColor: 'rgba(0, 102, 255, 0.95)' }]} activeOpacity={0.9}>
                    <View style={s.bannerIconBox}>
                        <Ionicons name="partly-sunny" size={24} color="#FFF" />
                    </View>
                    <View style={s.bannerContent}>
                        <Text style={s.bannerTitle}>Butuan City Weather</Text>
                        <Text style={s.bannerDesc}>Partly cloudy, 28°C. Slight chance of rain.</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#FFF" />
                </TouchableOpacity>

            </View>

            {/* Side Floating Controls */}
            <View style={s.sideControls} pointerEvents="box-none">
                <TouchableOpacity style={s.sideBtn}>
                    <Ionicons name="layers" size={20} color="#E0E0E0" />
                </TouchableOpacity>
                <TouchableOpacity style={s.sideBtn}>
                    <Ionicons name="car" size={20} color="#E0E0E0" />
                </TouchableOpacity>
            </View>

            {/* Bottom Floating Content */}
            <View style={s.bottomFloatingArea} pointerEvents="box-none">

                {/* Nearby Points */}
                <View style={s.nearbyHeaderRow}>
                    <Text style={s.nearbyTitle}>Nearby Pintig Points</Text>
                    <Text style={s.nearbyListText}>List</Text>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.nearbyScroll} style={{ marginBottom: 20 }}>
                    {NEARBY_POINTS.map(pt => (
                        <TouchableOpacity key={pt.id} style={s.nearbyCard} activeOpacity={0.9}>
                            <Image source={{ uri: pt.img }} style={s.nearbyThumb} />
                            <View style={s.nearbyInfo}>
                                <View style={s.nearbyTypeRow}>
                                    <View style={[s.typeDot, { backgroundColor: pt.color }]} />
                                    <Text style={s.typeText}>{pt.type}</Text>
                                </View>
                                <Text style={s.nearbyName} numberOfLines={1}>{pt.title}</Text>
                                <View style={s.distRow}>
                                    <Ionicons name="location" size={10} color="#FF3B30" />
                                    <Text style={s.distText}>{pt.dist}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    mapWebView: { ...StyleSheet.absoluteFillObject },
    webFallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    webFallbackText: { fontSize: 18, marginTop: 10 },
    overlayWrapper: { position: 'absolute', left: 0, right: 0 },
    topBarRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12 },
    searchBar: {
        flex: 1, flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, height: 48, borderRadius: 24, gap: 10,
        shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, elevation: 5,
    },
    searchInput: { flex: 1, fontSize: 15, color: '#FFF' },
    myLocationBtn: {
        width: 48, height: 48, borderRadius: 24, backgroundColor: '#0066FF',
        alignItems: 'center', justifyContent: 'center',
        shadowColor: '#0066FF', shadowOpacity: 0.4, shadowRadius: 8, elevation: 5,
    },
    pillsScroll: { marginTop: 12 },
    pillsContent: { paddingHorizontal: 16, gap: 10, paddingBottom: 10 },
    pillBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 36, borderRadius: 18, gap: 6 },
    pillActive: { backgroundColor: '#0066FF' },
    pillInactive: { backgroundColor: '#1C1C1E' },
    pillText: { fontSize: 13, fontWeight: '600' },
    trafficBanner: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#FF2D55',
        marginHorizontal: 16, marginTop: 8, padding: 16, borderRadius: 20,
        shadowColor: '#FF2D55', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
    },
    bannerIconBox: { marginRight: 12 },
    bannerContent: { flex: 1 },
    bannerTitle: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
    bannerDesc: { color: 'rgba(255,255,255,0.9)', fontSize: 12, marginTop: 2 },

    sideControls: { position: 'absolute', right: 16, top: '45%', gap: 12 },
    sideBtn: {
        width: 44, height: 44, borderRadius: 22, backgroundColor: '#151515',
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: '#333',
        shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
    },

    bottomFloatingArea: { position: 'absolute', bottom: 85, left: 0, right: 0 },
    nearbyHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 20, marginBottom: 12 },
    nearbyTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 4 },
    nearbyListText: { color: '#0066FF', fontSize: 14, fontWeight: 'bold' },
    nearbyScroll: { paddingHorizontal: 16, gap: 16 },
    nearbyCard: {
        flexDirection: 'row', alignItems: 'center', width: 260, backgroundColor: '#1A1A1A',
        padding: 12, borderRadius: 20,
        shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
        borderWidth: 1, borderColor: '#333'
    },
    nearbyThumb: { width: 50, height: 50, borderRadius: 25 },
    nearbyInfo: { flex: 1, marginLeft: 12 },
    nearbyTypeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    typeDot: { width: 8, height: 8, borderRadius: 4 },
    typeText: { color: '#A0A0A0', fontSize: 10, fontWeight: '600' },
    nearbyName: { color: '#FFF', fontSize: 14, fontWeight: 'bold', marginTop: 2 },
    distRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    distText: { color: '#A0A0A0', fontSize: 10 },
});
