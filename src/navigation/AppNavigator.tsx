import * as React from 'react';
import { Appbar, BottomNavigation } from 'react-native-paper';
import HomeScreen from '../screens/HomeScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import CalendarScreen from '../screens/CalendarScreen';

const AppNavigator = () => {
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

export default AppNavigator;
