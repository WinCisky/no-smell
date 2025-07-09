import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Agenda, AgendaEntry, AgendaSchedule, DateData } from 'react-native-calendars';
import { MMKV, Mode } from 'react-native-mmkv'
import Icon from '@react-native-vector-icons/lucide';
import { homeScreenStyles } from '../utility/styles';

const mockItems: AgendaSchedule = {
    '2025-07-03': [{ name: 'Cycling', height: 80, day: '2025-07-03' }, { name: 'Data presentation', height: 80, day: '2025-07-03' }],
    '2025-07-04': [{ name: 'Go to the gym', height: 80, day: '2025-07-04' }],
    '2025-07-05': [{ name: 'Do the groceries', height: 80, day: '2025-07-05' }, { name: 'Go to the beach', height: 80, day: '2025-07-05' }],
};

function loadItemsForMonth(data: DateData): AgendaSchedule {
    const month = data.month;
    const year = data.year;

    const storage = new MMKV({
        id: 'agendaStorage',
        encryptionKey: 'hunter2',
        mode: Mode.MULTI_PROCESS,
        readOnly: true
    });

    const itemsFromStorage = storage.getString(`agendaItems-${year}-${month}`);
    if (itemsFromStorage) {
        return JSON.parse(itemsFromStorage) as AgendaSchedule;
    }
    return {};
}

function emptyDataView() {
    return (
        <View style={ homeScreenStyles.empty }>
            <View style={ homeScreenStyles.empty__row }>
                <Text>
                    There are no events scheduled
                </Text>
                <Icon name={'frown'} size={20} />
            </View>
            <View style={ homeScreenStyles.empty__row }>
            <Icon name={'calendar'} size={20} />
                <Text>
                    to add event types and dates
                </Text>
            </View>
            <View style={homeScreenStyles.empty__row}>
                <Icon name={'bell'} size={20} />
                <Text>
                    to set the time you want to be notified
                </Text>
            </View>
        </View>
    );
}

function HomeScreen() {
    const storage = new MMKV();
    const itemsFromStorage = storage.getString('agendaItems');
    let items = mockItems;
    if (itemsFromStorage) {
        items = JSON.parse(itemsFromStorage) as AgendaSchedule;
    }

    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];

    const renderItem = React.useCallback((item: AgendaEntry) => {
        return (
            <TouchableOpacity style={ homeScreenStyles.test }>
                <Text>{item.name}</Text>
            </TouchableOpacity>
        );
    }, []);

    const renderEmptyDate = React.useCallback(() => {
        return <Text>Empty date</Text>;
    }, []);

    return (
        <Agenda
            testID={'agenda'}
            items={items}
            loadItemsForMonth={(data: DateData) => loadItemsForMonth(data)}
            selected={formattedDate}
            renderEmptyData={emptyDataView}

            renderItem={renderItem}
            renderEmptyDate={renderEmptyDate}
            // renderItem={this.renderItem}
            // rowHasChanged={this.rowHasChanged}
            showClosingKnob={true}
            // markingType={'period'}
            // markedDates={{
            //    '2017-05-08': {textColor: '#43515c'},
            //    '2017-05-09': {textColor: '#43515c'},
            //    '2017-05-14': {startingDay: true, endingDay: true, color: 'blue'},
            //    '2017-05-21': {startingDay: true, color: 'blue'},
            //    '2017-05-22': {endingDay: true, color: 'gray'},
            //    '2017-05-24': {startingDay: true, color: 'gray'},
            //    '2017-05-25': {color: 'gray'},
            //    '2017-05-26': {endingDay: true, color: 'gray'}}}
            // monthFormat={'yyyy'}
            // theme={{calendarBackground: 'red', agendaKnobColor: 'green'}}
            // renderDay={this.renderDay}
            // hideExtraDays={false}
            // showOnlySelectedDayItems
            // reservationsKeyExtractor={this.reservationsKeyExtractor}
        />
    );
}

export default HomeScreen;
