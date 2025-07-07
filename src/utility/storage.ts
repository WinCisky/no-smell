import { MMKV, Mode } from "react-native-mmkv";

export async function getKvStorage(readOnly: boolean, mode: Mode): Promise<MMKV> {
    return new MMKV();
}

export async function storeNotification(year: number, month: number, category: string, notificationId: string): Promise<void> {
    const storage = await getKvStorage(false, Mode.SINGLE_PROCESS);

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