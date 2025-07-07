
function dateToTrigger(date: Date): TimestampTrigger {
    const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: date.getTime(),
    };
    return trigger;
}

function schedule(channelId: string, trigger: TimestampTrigger): boolean {
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
}

export function scheduleNotification(date: Date): boolean {
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
    // console.log('Channel created with ID:', channelId);

    const trigger = dateToTrigger(date);
    const notificationId = schedule(channelId, trigger);
}