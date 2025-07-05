import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from '@react-native-vector-icons/lucide';
import HomeScreen from '../screens/HomeScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import CalendarScreen from '../screens/CalendarScreen';

export type RootStackParamList = {
  Home: undefined;
  Notifications: undefined;
  Calendar: undefined;
};

const MyTabs = createBottomTabNavigator({
  screens: {
    Home: HomeScreen,
    Notifications: NotificationsScreen,
    Calendar: CalendarScreen,
  },
  screenOptions: ({ route }) => ({
    headerShown: false,
    tabBarIcon: ({ focused, color, size }) => {
      let iconName: React.ComponentProps<typeof Icon>['name'];

      switch (route.name) {
        case 'Home':
          iconName = 'house';
          break;
        case 'Calendar':
          iconName = 'calendar';
          break;
        case 'Notifications':
          iconName = 'bell';
          break;
        default:
          iconName = 'triangle-alert';
          break;
      }

      return <Icon name={iconName} size={size} color={color} />;
    },
    tabBarActiveTintColor: 'tomato',
    tabBarInactiveTintColor: 'gray',
  }),
});

export default MyTabs;
