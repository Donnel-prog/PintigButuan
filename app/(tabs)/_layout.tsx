import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import { Dimensions, Platform, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/useThemeStore';

const { width } = Dimensions.get('window');
const isSmall = width < 375;

export default function TabLayout() {
  const { colors, isDarkMode } = useThemeStore();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.cyan,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: isDarkMode ? 'transparent' : colors.surface,
          position: 'absolute',
          borderTopWidth: isDarkMode ? 0 : 1,
          borderTopColor: 'rgba(0,0,0,0.1)',
          elevation: isDarkMode ? 0 : 4,
          height: Platform.OS === 'ios' ? 88 : 68,
        },
        tabBarBackground: () => (
          isDarkMode ? (
            <BlurView
              tint="dark"
              intensity={80}
              style={StyleSheet.absoluteFill}
            />
          ) : null
        ),
        tabBarLabelStyle: {
          fontSize: isSmall ? 10 : 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginBottom: -2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={isSmall ? 22 : 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="news"
        options={{
          title: 'News',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'newspaper' : 'newspaper-outline'} size={isSmall ? 22 : 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'map' : 'map-outline'} size={isSmall ? 22 : 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: 'Services',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'call' : 'call-outline'} size={isSmall ? 22 : 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={isSmall ? 22 : 24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
