/**
 * @format
 */

import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import notifee, { EventType } from '@notifee/react-native';
import App from './App';
import { name as appName } from './app.json';
import { enGB, registerTranslation } from 'react-native-paper-dates'
import { handleNotificationDelivered } from './src/utility/notifications';

registerTranslation('en-GB', enGB)

// Handle background events to chain-schedule the next notification when one is delivered or pressed
notifee.onBackgroundEvent(async (event) => {
    if (event.type === EventType.DELIVERED) {
        handleNotificationDelivered(event);
    }
});

notifee.onForegroundEvent(async (event) => {
    if (event.type === EventType.DELIVERED) {
        handleNotificationDelivered(event);
    }
});

AppRegistry.registerComponent(appName, () => App);
