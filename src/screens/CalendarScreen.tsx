import React from 'react';
import {
  View,
  ScrollView
} from 'react-native';
import Icon from '@react-native-vector-icons/lucide';
import { calendarScreenStyles } from '../utility/styles';
import { Avatar, Card, IconButton, FAB } from 'react-native-paper';

function CalendarScreen() {
  return (
    <View style={calendarScreenStyles.container}>
      <ScrollView style={calendarScreenStyles.container__scroll}>
        <Card>
          <Card.Title
            title="Card Title"
            subtitle="Card Subtitle"
            left={(props) => <Avatar.Icon {...props} icon="folder" />}
            right={(props) => <View style={calendarScreenStyles.card__actions}>
              <IconButton {...props} icon="pencil" onPress={() => { }} />
              <IconButton {...props} icon="delete" onPress={() => { }} />
            </View>}
          />
        </Card>
      </ScrollView>
      <FAB
        icon="plus"
        style={calendarScreenStyles.fab}
        onPress={() => console.log('Pressed')}
      />
    </View>
  );
}

export default CalendarScreen;
