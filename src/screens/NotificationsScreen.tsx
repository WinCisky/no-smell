import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { scheduleNotification } from '../utility/notifications';

function NotificationsScreen() {

    const handleScheduleNotification = async () => {
        const date = new Date(Date.now());
        date.setMinutes(date.getMinutes() + 2);

        const message = 'This notification was scheduled 2 minutes ago!';
        const category = 'TEST';

        // Schedule the notification
        const result = await scheduleNotification(date, category, message);
        
        if (result) {
            console.log('Notification scheduling succeeded');
            Alert.alert(
                'Notification Scheduled',
                `A notification has been scheduled for 2 minutes from now.`,
                [{ text: 'OK' }]
            );
        } else {
            console.log('Failed to schedule notification');
            Alert.alert(
                'Error',
                'Failed to schedule notification. Please check permissions.',
                [{ text: 'OK' }]
            );
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
        </View>
    );
}

export default NotificationsScreen;
