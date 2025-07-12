import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Appbar, BottomNavigation } from 'react-native-paper';
import HomeScreen from '../screens/HomeScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import CalendarScreen from '../screens/CalendarScreen';
import TypeEventsScreen from '../screens/TypeEventsScreen';

type RootStackParamList = {
  CalendarTabs: undefined;
  TypeEvents: { typeName: string; typeColor: string };
};

const Stack = createStackNavigator<RootStackParamList>();

// Bottom Navigation Component
const CalendarTabs = () => {
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'home', title: 'Home', focusedIcon: 'home', unfocusedIcon: 'home-outline'},
    { key: 'calendar', title: 'Calendar', focusedIcon: 'calendar', unfocusedIcon: 'calendar-outline' },
    { key: 'notifications', title: 'Notifications', focusedIcon: 'bell', unfocusedIcon: 'bell-outline' },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    home: HomeScreen,
    calendar: CalendarScreen,
    notifications: NotificationsScreen,
  });

  return (
    <>
      <Appbar.Header>
        <Appbar.Content title={routes[index].title} />
      </Appbar.Header>
      <BottomNavigation
        navigationState={{ index, routes }}
        onIndexChange={setIndex}
        renderScene={renderScene}
      />
    </>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="CalendarTabs">
        <Stack.Screen 
          name="CalendarTabs" 
          component={CalendarTabs} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="TypeEvents" 
          component={TypeEventsScreen}
          options={({ route }) => ({ 
            title: `${route.params.typeName} Events`,
            headerStyle: {
              backgroundColor: route.params.typeColor,
            },
            headerTintColor: '#fff',
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
