/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StatusBar, StyleSheet, useColorScheme, View, Text } from 'react-native';
import * as React from 'react';
import {
  createStaticNavigation,
  useNavigation,
} from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Button } from '@react-navigation/elements';

// function App() {
//   const isDarkMode = useColorScheme() === 'dark';

//   return (
//     <View style={styles.container}>
//       <Navigation />
//       <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
//       <Text>HELLO</Text>
//     </View>
//   );
// }

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

type RootStackParamList = {
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
});


function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Home Screen</Text>
      <Button onPress={() => navigation.navigate('Notifications')}>
        Go to Notifications
      </Button>
    </View>
  );
}

function NotificationsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Notifications Screen</Text>
    </View>
  );
}

function CalendarScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Calendar Screen</Text>
    </View>
  );
}

const Navigation = createStaticNavigation(MyTabs);

export default function App() {
  return <Navigation />;
}