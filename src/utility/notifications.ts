import notifee, { TimestampTrigger, TriggerType, AuthorizationStatus, EventType } from '@notifee/react-native';
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
    message: string,
    data?: Record<string, string>
): Promise<string> {
    // Schedule the notification
    const notificationId = await notifee.createTriggerNotification(
        {
            title: category,
            body: message,
            data,
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
    message: string,
    extraData?: Record<string, string>
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
        notificationId = await schedule(channelId, trigger, category, message, extraData);
        console.log('Notification scheduled with ID:', notificationId, 'for date:', date);
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
        // console.log(`Cancelling notifications for type ${typeName}:`, notificationsForType);
        const notificationIds = JSON.parse(notificationsForType).map((n: { id: string }) => n.id);

        for (const notificationId of notificationIds) {
            await cancelNotification(notificationId);
        }
        // console.log(`All notifications for type ${typeName} cancelled`);
    } catch (error) {
        console.error('Error cancelling notifications for type:', error);
    }
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

    const eventsForType = storage.getString(`events-${typeName}`) || "[]";
    const eventDates = JSON.parse(eventsForType) as string[];
    if (eventDates.length === 0) {
        console.log('No events found for type:', typeName);
        return [];
    }


    // TODO: remove events in the past
    
    
    const notifications: { date: Date; category: string; message: string }[] = [];
    for (const eventDateStr of eventDates) {
        const eventDate = new Date(eventDateStr);
        for (const notificationEvent of notificationEvents) {
            const [hours, minutes] = notificationEvent.time.split(':').map(Number);
            const notificationDate = new Date(eventDate);
            notificationDate.setHours(hours, minutes, 0, 0);
            notifications.push({
                date: notificationDate,
                category: notificationEvent.type,
                message: notificationEvent.message || `Reminder for ${notificationEvent.type}`,
            });
        }
    }

    return notifications;
}

// --- Chain scheduling (schedule-next-only) ---

/**
 * Returns the next future notification for a type, sorted by soonest first.
 */
async function computeNextForType(
    typeName: string,
    after: Date = new Date()
): Promise<{ date: Date; category: string; message: string } | null> {
    const all = await computeTypeNotifications(typeName);
    const next = all
        .filter(n => n.date.getTime() > after.getTime())
        .sort((a, b) => a.date.getTime() - b.date.getTime())[0];
    return next ?? null;
}

/**
 * Schedule only the next notification for a given type, replacing any existing scheduled items for that type.
 * Stores a single entry under `scheduled-${typeName}` with data needed to chain the next one.
 */
export async function scheduleNextForType(typeName: string, cancelPrevious: boolean = false): Promise<string | null> {
    if (cancelPrevious) {
        // Cancel any previously scheduled notifications for the type
        await cancelAllTypeNotifications(typeName);
    }

    // add 30s buffer to avoid immediate rescheduling
    const bufferDate = new Date(new Date().getTime() + 30 * 1000);
    const next = await computeNextForType(typeName, bufferDate);
    if (!next) {
        const storage = await getKvStorage();
        storage.set(`scheduled-${typeName}`, JSON.stringify([]));
        console.log(`No future notifications to schedule for type ${typeName}`);
        return null;
    }

    const id = await scheduleNotification(next.date, next.category, next.message, {
        typeName,
        scheduledTs: next.date.toISOString(),
    });

    const storage = await getKvStorage();
    storage.set(
        `scheduled-${typeName}`,
        JSON.stringify([
            { id, time: next.date, type: next.category, message: next.message },
        ])
    );

    console.log(`Scheduled next notification for type ${typeName} with ID:`, id, 'at', next.date);

    return id || null;
}

/**
 * Helper you can use in UI code to switch from full scheduling to chain scheduling.
 */
export async function updateTypeNotificationsChained(typeName: string): Promise<void> {
    await scheduleNextForType(typeName, true);
}

export function handleNotificationDelivered(event: { type: EventType; detail: { notification: { data?: Record<string, string> } } }) {
    const data = event.detail.notification.data;
    if (data && data.typeName) {
        // Schedule the next notification for this type
        scheduleNextForType(data.typeName);
    }
}