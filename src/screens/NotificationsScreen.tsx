import React from 'react';
import { View, Text } from 'react-native';
import { notificationScreenStyles } from '../utility/styles';

function NotificationsScreen() {

    return (
        <View style={ notificationScreenStyles.container }>
            <Text style={ notificationScreenStyles.container__text }>
                Notifications Screen
            </Text>
        </View>
    );
}

export default NotificationsScreen;
