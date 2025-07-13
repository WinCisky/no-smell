import notifee, { TimestampTrigger, TriggerType, AuthorizationStatus } from '@notifee/react-native';
import { getKvStorage } from './storage';

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
): Promise<string> {
    let notificationId: string;

    try {
        // Request permissions
        if (!await hasNotificationPermission()) {
            return "";
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
        return notificationId;
    } catch (error) {
        console.error('Error scheduling notification:', error);
        return "";
    }
}


export async function cancelNotification(notificationId: string): Promise<void> {
    try {
        await notifee.cancelNotification(notificationId);
        console.log('Notification cancelled:', notificationId);
    } catch (error) {
        console.error('Error cancelling notification:', error);
    }
}

export async function cancelAllNotifications(): Promise<void> {
    try {
        await notifee.cancelAllNotifications();
        console.log('All notifications cancelled');
    } catch (error) {
        console.error('Error cancelling all notifications:', error);
    }
}

async function cancelAllTypeNotifications(typeName: string): Promise<void> {
    try {
        const storage = await getKvStorage();
        const notificationsForType = storage.getString(`scheduled-${typeName}`) || "[]";
        const notificationIds = JSON.parse(notificationsForType).map((n: { id: string }) => n.id);

        for (const notificationId of notificationIds) {
            await cancelNotification(notificationId);
        }
        console.log(`All notifications for type ${typeName} cancelled`);
    } catch (error) {
        console.error('Error cancelling notifications for type:', error);
    }
}

async function setTypeNotifications(
    typeName: string,
    notifications: { date: Date; category: string; message: string }[]
): Promise<void> {
    const storage = await getKvStorage();
    
    const scheduled: {
        id: string;
        time: Date;
        type: string;
        message: string;
    }[] = [];

    for (const notification of notifications) {
        const notificationId = await scheduleNotification(
            notification.date,
            notification.category,
            notification.message
        );
        
        scheduled.push({
            id: notificationId,
            time: notification.date,
            type: notification.category,
            message: notification.message
        });
    }

    // Save the notifications to storage
    storage.set(`scheduled-${typeName}`, JSON.stringify(scheduled));
}

async function computeTypeNotifications(
    typeName: string
): Promise<{ date: Date; category: string; message: string }[]> {

    const storage = await getKvStorage();
    // Retrieve notifications times for the type
    const notificationsForType = storage.getString(`notifications-${typeName}`) || "[]";
    const notificationEvents = JSON.parse(notificationsForType) as { 
        id: string; time: string; type: string; message: string 
    }[];

    if (notificationEvents.length === 0) {
        console.log('No notifications found for type:', typeName);
        return [];
    }

    let dates: string[] = [];

    // Retrieve all dates for the type from storage
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    for (let year = currentYear - 1; year <= currentYear + 2; year++) {
        const key = `${year}-${typeName}`;
        const savedDates = storage.getString(key);

        if (savedDates) {
            dates = JSON.parse(savedDates);
        }
    }

    if (dates.length <= 0) {
        console.log('No dates found for type:', typeName);
        return [];
    }

    // compose dates with times
    const notifications: { date: Date; category: string; message: string }[] = [];
    for (const date of dates) {
        const dateObj = new Date(date);
        for (const event of notificationEvents) {
            if (event.time && event.type === typeName) {
                const [hours, minutes] = event.time.split(':').map(Number);
                const notificationDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), hours, minutes);
                notifications.push({
                    date: notificationDate,
                    category: event.type,
                    message: event.message
                });
            }
        }
    }

    return notifications;
}


export async function updateTypeNotifications(
    typeName: string,
): Promise<void> {
    const storage = await getKvStorage();

        console.log("notifications", storage.getString(`notifications-${typeName}`) || "[]");
    
    // Cancel existing notifications for this type
    await cancelAllTypeNotifications(typeName);

        console.log("notifications", storage.getString(`notifications-${typeName}`) || "[]");

    // Set new notifications
    const notifications = await computeTypeNotifications(typeName);

        console.log("notifications", storage.getString(`notifications-${typeName}`) || "[]");
    if (notifications.length > 0) {
        await setTypeNotifications(typeName, notifications);
        console.log("scheduled", storage.getString(`scheduled-${typeName}`) || "[]");
        console.log("notifications", storage.getString(`notifications-${typeName}`) || "[]");
    } else {
        console.log(`No notifications to set for type: ${typeName}`);
    }
}