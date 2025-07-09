import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import Icon from '@react-native-vector-icons/lucide';
import { calendarScreenStyles } from '../utility/styles';

function Element({ name, color }: { name: string, color: string }) {
  
  return (
    <View style={calendarScreenStyles.type}>
      {/* the text should be touchable too */}
      <View style={calendarScreenStyles.type__row}>
        <TouchableOpacity style={[calendarScreenStyles.type__button, calendarScreenStyles.item__container]}>
          <View style={[calendarScreenStyles.type__color, {backgroundColor: color}]} />
          <Text style={calendarScreenStyles.item__text}>{name}</Text>
        </TouchableOpacity>
        <View style={calendarScreenStyles.type_actions}>
          <TouchableOpacity style={calendarScreenStyles.type__button}>
            <Icon name="pencil" size={24} color='#616161' />
          </TouchableOpacity>
          <TouchableOpacity style={calendarScreenStyles.type__button}>
            <Icon name="trash" size={24} color='#EF9A9A' />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function CalendarScreen() {
  return (
    <View style={calendarScreenStyles.container}>
      <ScrollView style={calendarScreenStyles.container__scroll}>
        <Element name="CARTA" color='yellow' />
        <Element name="PLASTICA" color='blue' />
        <Element name="UMIDO" color='red' />
        {/* Add more elements as needed */}
      </ScrollView>
      <TouchableOpacity style={calendarScreenStyles.button__add}>
        <Icon name="plus" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}

export default CalendarScreen;
