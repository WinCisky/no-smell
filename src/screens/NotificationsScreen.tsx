import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView } from 'react-native';
import { Card, Text, IconButton, Chip, Icon, Portal } from 'react-native-paper';
import { notificationScreenStyles } from '../utility/styles';
import { getKvStorage } from '../utility/storage';
import { useFocusEffect } from '@react-navigation/native';
import { TimePickerModal } from 'react-native-paper-dates';

interface NotificationItem {
    id: string;
    type: string;
    time: string;
}

function NotificationsScreen() {
    const [eventTypes, setEventTypes] = useState<Map<string, string>>(new Map());
    const [notifications, setNotifications] = useState<{ [key: string]: NotificationItem[] }>({});
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedType, setSelectedType] = useState<{ name: string; color: string } | null>(null);
    const [notificationTime, setNotificationTime] = useState('');
    const [notificationMessage, setNotificationMessage] = useState('');

    // Load event types from storage
    const loadEventTypes = async () => {
        try {
            const storage = await getKvStorage();
            const typesFromStorage = storage.getString('eventTypes');
            if (typesFromStorage) {
                setEventTypes(new Map(JSON.parse(typesFromStorage)));
            }
        } catch (error) {
            console.error('Error loading event types:', error);
        }
    };

    // Load notifications for all event types
    const loadNotifications = async () => {
        const storage = await getKvStorage();
        const allNotifications: { [key: string]: NotificationItem[] } = {};

        for (const typeName of eventTypes.keys()) {
            const notificationsForType = storage.getString(`notifications-${typeName}`) || "[]";
            console.log(`Loaded notifications for ${typeName}:`, notificationsForType);
            allNotifications[typeName] = JSON.parse(notificationsForType ?? []);
        }

        setNotifications(allNotifications);
    };

    // Load data when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            loadEventTypes();
        }, [])
    );

    // Load notifications when event types change
    useEffect(() => {
        if (eventTypes.size > 0) {
            loadNotifications();
        }
    }, [eventTypes]);

    const handleAddNotification = (typeName: string, typeColor: string) => {
        setSelectedType({ name: typeName, color: typeColor });
        setModalVisible(true);
    };

    const onConfirm = React.useCallback(
        async ({ hours, minutes }: { hours: number; minutes: number }) => {
            
            if (!selectedType) {
                return;
            }
            const newNotification: NotificationItem = {
                id: `${selectedType?.name}-${hours}:${minutes}`,
                type: selectedType.name,
                time: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
            };

            setNotifications(prev => ({
                ...prev,
                [selectedType.name]: [...(prev[selectedType.name] || []), newNotification]
            }));

            const storage = await getKvStorage();
            const existingNotifications = storage.getString(`notifications-${selectedType.name}`) || "[]";
            const notificationsForType = JSON.parse(existingNotifications) ?? [];
            notificationsForType.push(newNotification);
            storage.set(`notifications-${selectedType.name}`, JSON.stringify(notificationsForType));
            
            setSelectedType(null);
            setModalVisible(false);
        },
        [setModalVisible]
    );

    const handleDeleteNotification = async (typeName: string, notificationId: string) => {
        // TODO: Implement notification deletion logic

        
        setNotifications(prev => ({
            ...prev,
            [typeName]: prev[typeName]?.filter(n => n.id !== notificationId) || []
        }));
    };

    const timeHasErrors = () => {
        // check that format is HH:MM
        const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;
        return !timePattern.test(notificationTime);
    };

    return (
        <View style={notificationScreenStyles.container}>
            <ScrollView style={{ flex: 1 }}>                
                {Array.from(eventTypes.entries()).map(([typeName, typeColor]) => (
                    <Card key={typeName} style={{ margin: 8 }}>
                        <Card.Title
                            title={typeName}
                            titleVariant="titleMedium"
                            left={(props) => <Icon {...props} source="circle" color={typeColor} />}
                            right={(props) => (
                                <IconButton
                                    {...props}
                                    icon="plus"
                                    onPress={() => handleAddNotification(typeName, typeColor)}
                                />
                            )}
                        />
                        
                        {notifications[typeName] && notifications[typeName].length > 0 ? (
                            <Card.Content style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                                {notifications[typeName].map((notification) => (
                                    <Chip
                                        icon={(props) => <Icon {...props} source="circle" color={typeColor} />}
                                        onPress={() => console.log('Pressed')}
                                        onClose={() => console.log('Closed')}
                                        closeIcon={(props) => <Icon {...props} source="close" />}
                                        key={notification.id}
                                    >
                                        {notification.time}
                                    </Chip>
                                ))}
                            </Card.Content>
                        ) : (
                            <Card.Content>
                                <Text variant="bodyMedium" style={{ color: '#666', fontStyle: 'italic' }}>
                                    No notifications set for this category
                                </Text>
                            </Card.Content>
                        )}
                    </Card>
                ))}

                {eventTypes.size === 0 && (
                    <Text variant="titleMedium" style={{ textAlign: 'center', marginTop: 28, color: '#888' }}>
                        No event types found
                    </Text>
                )}
            </ScrollView>

            {/* Add Notification Modal */}
                <TimePickerModal
                    animationType="fade"
                    visible={modalVisible}
                    onDismiss={() => setModalVisible(false)}
                    onConfirm={onConfirm}
                    hours={12}
                    minutes={14}
                    />
        </View>
    );
}

export default NotificationsScreen;
