import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView } from 'react-native';
import { Card, Text, IconButton, HelperText, Button, Icon, Portal, Modal, TextInput } from 'react-native-paper';
import { notificationScreenStyles } from '../utility/styles';
import { getKvStorage } from '../utility/storage';
import { scheduleNotification } from '../utility/notifications';
import { useFocusEffect } from '@react-navigation/native';

interface NotificationItem {
    id: string;
    type: string;
    time: string;
    message: string;
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
        
        // Set default values
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setNotificationTime('09:00');
        setNotificationMessage(`Don't forget about ${typeName}!`);
    };

    const handleSaveNotification = async () => {
        if (!selectedType || !notificationTime || !notificationMessage || timeHasErrors()) {
            return;
        }

        // add to notifications
        const newNotification: NotificationItem = {
            id: `${selectedType.name}-${notificationTime}`,
            type: selectedType.name,
            time: notificationTime,
            message: notificationMessage,
        }

        setNotifications(prev => ({
            ...prev,
            [selectedType.name]: [...(prev[selectedType.name] || []), newNotification]
        }));

        // save to mmkv
        const storage = await getKvStorage();
        const existingNotifications = storage.getString(`notifications-${selectedType.name}`) || "[]";
        const notificationsForType = JSON.parse(existingNotifications) ?? [];
        notificationsForType.push(newNotification);
        storage.set(`notifications-${selectedType.name}`, JSON.stringify(notificationsForType));

        setModalVisible(false);
        // Reset form
        setSelectedType(null);
        setNotificationTime('');
        setNotificationMessage('');
    };

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
                            <Card.Content>
                                {notifications[typeName].map((notification) => (
                                    <View key={notification.id} style={{ 
                                        flexDirection: 'row', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'center',
                                        paddingVertical: 8,
                                        borderBottomWidth: 1,
                                        borderBottomColor: '#f0f0f0'
                                    }}>
                                        <View style={{ flex: 1 }}>
                                            <Text variant="bodyMedium">
                                                {notification.time}
                                            </Text>
                                            <Text variant="bodySmall" style={{ color: '#666' }}>
                                                {notification.message}
                                            </Text>
                                        </View>
                                        <IconButton
                                            icon="delete"
                                            size={16}
                                            onPress={() => handleDeleteNotification(typeName, notification.id)}
                                        />
                                    </View>
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
                    <Card style={{ margin: 16 }}>
                        <Card.Content>
                            <Text variant="titleMedium" style={{ textAlign: 'center' }}>
                                No event types found
                            </Text>
                            <Text variant="bodyMedium" style={{ textAlign: 'center', marginTop: 8 }}>
                                Create some event types in the Calendar tab first
                            </Text>
                        </Card.Content>
                    </Card>
                )}
            </ScrollView>

            {/* Add Notification Modal */}
            <Portal>
                <Modal
                    visible={modalVisible}
                    onDismiss={() => setModalVisible(false)}
                    contentContainerStyle={{
                        backgroundColor: 'white',
                        padding: 20,
                        margin: 20,
                        borderRadius: 8
                    }}
                >
                    <Text variant="headlineSmall" style={{ marginBottom: 16, textAlign: 'center' }}>
                        Add notification for {selectedType?.name}
                    </Text>
                    
                    <TextInput
                        label="Time (HH:MM)"
                        value={notificationTime}
                        onChangeText={setNotificationTime}
                        placeholder="09:00"
                    />
                    <HelperText 
                        type="error" visible={timeHasErrors()}
                        style={{ marginBottom: 16 }}
                    >
                        Time is invalid!
                    </HelperText>
                    
                    <TextInput
                        label="Message"
                        value={notificationMessage}
                        onChangeText={setNotificationMessage}
                        style={{ marginBottom: 16 }}
                        multiline
                    />
                    
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Button mode="outlined" onPress={() => setModalVisible(false)}>
                            Cancel
                        </Button>
                        <Button mode="contained" onPress={handleSaveNotification}>
                            Save
                        </Button>
                    </View>
                </Modal>
            </Portal>
        </View>
    );
}

export default NotificationsScreen;
