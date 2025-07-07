import notifee, { TimestampTrigger, TriggerType, AuthorizationStatus } from '@notifee/react-native';
import { storeNotification } from './storage';

function dateToTrigger(date: Date): TimestampTrigger {
    const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: date.getTime(),
    };
    return trigger;
}

async function hasNotificationPermission(): Promise<boolean> {
    const permission = await notifee.requestPermission();
    if (permission.authorizationStatus >= AuthorizationStatus.AUTHORIZED) {
        return true;
    } else {
        await notifee.openNotificationSettings();
    }
    return false;
}


async function schedule(
    channelId: string,
    trigger: TimestampTrigger,
    category: string,
    message: string
): Promise<string> {
    // Schedule the notification
    const notificationId = await notifee.createTriggerNotification(
        {
            title: category,
            body: message,
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
    return notificationId;
}

export async function scheduleNotification(
    date: Date,
    category: string,
    message: string
): Promise<boolean> {
    let notificationId: string;

    try {
        // Request permissions
        if (!hasNotificationPermission()) {
            return false;
        }

        // Create a channel
        const channelId = await notifee.createChannel({
            id: 'scheduled',
            name: 'Scheduled Notifications',
            description: 'Channel for scheduled notifications',
            importance: 4, // High importance for better delivery
            sound: 'default', // Default sound for notifications
            vibration: true, // Enable vibration
        });
        // console.log('Channel created with ID:', channelId);

        const trigger = dateToTrigger(date);
        notificationId = await schedule(channelId, trigger, category, message);
        // console.log('Notification scheduled with ID:', notificationId);
    } catch (error) {
        console.error('Error scheduling notification:', error);
        return false;
    }

    const notificationYear = date.getFullYear();
    const notificationMonth = date.getMonth() + 1;

    await storeNotification(notificationYear, notificationMonth, category, notificationId);

    return true;
}