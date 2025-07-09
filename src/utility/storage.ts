import { MMKV } from "react-native-mmkv";

export async function getKvStorage(): Promise<MMKV> {
    return new MMKV();
}

export async function storeNotification(year: number, month: number, category: string, notificationId: string): Promise<void> {
    const storage = await getKvStorage();

    const notificationsKey = `${year}-${month}-${category}`;
    const notificationsFromStorage = storage.getString(notificationsKey);
    let notifications: string[] = [];
    if (notificationsFromStorage) {
        notifications = JSON.parse(notificationsFromStorage);
    }

    // Add the new notification ID to the list
    notifications.push(notificationId);
    storage.set(notificationsKey, JSON.stringify(notifications));
}