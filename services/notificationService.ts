import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { PintigColors } from '../constants/theme';

// Configure how notifications are displayed when the app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export const notificationService = {
    /**
     * Register for push notifications and get the token
     */
    registerForPushNotifications: async () => {
        let token;
        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                console.log('❌ Failed to get push token for push notification!');
                return;
            }

            // Get the projectId specifically for EAS/Expo
            const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

            try {
                token = (await Notifications.getExpoPushTokenAsync({
                    projectId: projectId,
                })).data;
                console.log('🎫 Expo Push Token:', token);
            } catch (e) {
                console.log('❌ Push Token Error:', e);
            }
        } else {
            console.log('📱 Must use physical device for Push Notifications');
        }

        if (Platform.OS === 'android') {
            Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: PintigColors.cyan,
            });
        }

        return token;
    },

    /**
     * Schedule a local notification (Simulation of Real-time alert)
     */
    sendLocalNotification: async (title: string, body: string, data = {}) => {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: `💙 Pintig Butuan: ${title}`,
                body: body,
                data: data,
                sound: true,
                priority: Notifications.AndroidNotificationPriority.HIGH,
                color: PintigColors.cyan,
            },
            trigger: null, // send immediately
        });
    },

    /**
     * Utility to check for new articles and notify
     */
    notifyNewArticles: async (oldArticles: any[], newArticles: any[]) => {
        if (oldArticles.length === 0) return; // Don't notify on first load

        const newItems = newArticles.filter(n => !oldArticles.find(o => o.id === n.id));
        if (newItems.length > 0) {
            const latest = newItems[0];
            await notificationService.sendLocalNotification(
                latest.source,
                latest.title,
                { articleId: latest.id }
            );
        }
    }
};
