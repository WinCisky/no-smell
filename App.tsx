/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import * as React from 'react';
import {
  createStaticNavigation,
} from '@react-navigation/native';
import MyTabs from './src/navigation/AppNavigator';

const Navigation = createStaticNavigation(MyTabs);

export default function App() {
  return <Navigation />;
}