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
    time: string,
    category: string,
    message: string
): Promise<boolean> {
    let notificationId: string;

    // TODO: Handle time parsing and validation

    return true;
}