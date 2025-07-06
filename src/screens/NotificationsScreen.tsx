import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import notifee, { TimestampTrigger, TriggerType } from '@notifee/react-native';

async function scheduleNotification() {
    try {
        // Request permissions (required for iOS)
        const permission = await notifee.requestPermission();
        console.log('Permission status:', permission);

        // Create a channel (required for Android)
        const channelId = await notifee.createChannel({
            id: 'scheduled',
            name: 'Scheduled Notifications',
            description: 'Channel for scheduled notifications',
            importance: 4, // High importance for better delivery
            sound: 'default', // Default sound for notifications
            vibration: true, // Enable vibration
        });

        console.log('Channel created with ID:', channelId);

        // Create a timestamp trigger for 2 minutes from now
        const date = new Date(Date.now());
        date.setMinutes(date.getMinutes() + 2);
        
        const trigger: TimestampTrigger = {
            type: TriggerType.TIMESTAMP,
            timestamp: date.getTime(),
        };

        // Schedule the notification
        const notificationId = await notifee.createTriggerNotification(
            {
                title: 'Scheduled Notification',
                body: 'This notification was scheduled 2 minutes ago!',
                android: {
                    channelId,
                    smallIcon: 'ic_launcher',
                    importance: 4,
                    pressAction: {
                        id: 'default',
                        launchActivity: 'default',
                    },
                },
                ios: {
                    sound: 'default',
                    interruptionLevel: 'active',
                },
            },
            trigger,
        );

        console.log('Notification scheduled with ID:', notificationId);
        console.log('Scheduled for:', date.toLocaleString());
        
        return notificationId;
    } catch (error) {
        console.error('Error scheduling notification:', error);
        throw error;
    }
}

function NotificationsScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const handleScheduleNotification = async () => {
        try {
            const notificationId = await scheduleNotification();
            Alert.alert(
                'Notification Scheduled',
                `A notification has been scheduled for 2 minutes from now.\nNotification ID: ${notificationId}`,
                [{ text: 'OK' }]
            );
        } catch (error) {
            Alert.alert(
                'Error',
                'Failed to schedule notification. Please check permissions.',
                [{ text: 'OK' }]
            );
        }
    };

    const handleCancelScheduled = async () => {
        try {
            // Get all scheduled notifications
            const scheduledNotifications = await notifee.getTriggerNotifications();
            console.log('Scheduled notifications:', scheduledNotifications);
            
            if (scheduledNotifications.length > 0) {
                // Cancel all scheduled notifications
                await notifee.cancelAllNotifications();
                Alert.alert(
                    'Cancelled',
                    `Cancelled ${scheduledNotifications.length} scheduled notification(s)`,
                    [{ text: 'OK' }]
                );
            } else {
                Alert.alert(
                    'No Notifications',
                    'No scheduled notifications found',
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            console.error('Error cancelling notifications:', error);
        }
    };

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <Text style={{ fontSize: 24, marginBottom: 30, textAlign: 'center' }}>
                Notifications Screen
            </Text>
            
            <TouchableOpacity
                style={{
                    backgroundColor: '#007AFF',
                    padding: 15,
                    borderRadius: 8,
                    marginBottom: 15,
                    minWidth: 200,
                }}
                onPress={handleScheduleNotification}
            >
                <Text style={{ color: 'white', textAlign: 'center', fontSize: 16, fontWeight: 'bold' }}>
                    Schedule Notification (2 min)
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={{
                    backgroundColor: '#FF3B30',
                    padding: 15,
                    borderRadius: 8,
                    minWidth: 200,
                }}
                onPress={handleCancelScheduled}
            >
                <Text style={{ color: 'white', textAlign: 'center', fontSize: 16, fontWeight: 'bold' }}>
                    Cancel Scheduled
                </Text>
            </TouchableOpacity>
        </View>
    );
}

export default NotificationsScreen;
