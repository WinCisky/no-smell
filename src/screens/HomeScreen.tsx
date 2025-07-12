import React, { useState, useMemo, useCallback, useRef } from 'react';
import { TouchableOpacity, View, TextStyle, StyleSheet } from 'react-native';
import { CalendarList, AgendaEntry, AgendaSchedule, DateData } from 'react-native-calendars';
import { MMKV, Mode } from 'react-native-mmkv'
import Icon from '@react-native-vector-icons/lucide';
import { homeScreenStyles } from '../utility/styles';
import { Card, Text, Button } from 'react-native-paper';

const mockItems: AgendaSchedule = {
    '2025-07-03': [{ name: 'Cycling', height: 80, day: '2025-07-03' }, { name: 'Data presentation', height: 80, day: '2025-07-03' }],
    '2025-07-04': [{ name: 'Go to the gym', height: 80, day: '2025-07-04' }],
    '2025-07-05': [{ name: 'Do the groceries', height: 80, day: '2025-07-05' }, { name: 'Go to the beach', height: 80, day: '2025-07-05' }],
};

const RANGE = 24;
const initialDate = '2025-07-05';
const nextWeekDate = '2025-07-14';
const nextMonthDate = '2025-08-05';

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

function HomeScreen() {
    const storage = new MMKV();
    const itemsFromStorage = storage.getString('agendaItems');
    let items = mockItems;
    if (itemsFromStorage) {
        items = JSON.parse(itemsFromStorage) as AgendaSchedule;
    }

    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];

    const [selected, setSelected] = useState(initialDate);
    const [currentMonth, setCurrentMonth] = useState(formattedDate);
    const calendarRef = useRef<any>(null);

    const marked = useMemo(() => {
        return {
            [nextWeekDate]: {
                selected: selected === nextWeekDate,
                selectedTextColor: '#5E60CE',
                marked: true
            },
            [nextMonthDate]: {
                selected: selected === nextMonthDate,
                selectedTextColor: '#5E60CE',
                marked: true
            },
            [selected]: {
                selected: true,
                disableTouchEvent: true,
                selectedColor: '#5E60CE',
                selectedTextColor: 'white'
            }
        };
    }, [selected]);

    const onDayPress = useCallback((day: DateData) => {
        setSelected(day.dateString);
    }, []);

    const onVisibleMonthsChange = useCallback((months: any[]) => {
        console.log('now these months are visible', months);
        if (months && months.length > 0) {
            setCurrentMonth(months[0].dateString);
        }
    }, []);

    // Check if today's date is in the currently visible month
    const isTodayInCurrentMonth = useMemo(() => {
        const todayDate = new Date(formattedDate);
        const currentDate = new Date(currentMonth);
        return todayDate.getMonth() === currentDate.getMonth() && 
               todayDate.getFullYear() === currentDate.getFullYear();
    }, [formattedDate, currentMonth]);
    
    function scrollToToday() {
        // Scroll to today's date in the calendar
        const today = new Date();
        const formattedToday = today.toISOString().split('T')[0];
        
        if (calendarRef.current) {
            calendarRef.current.scrollToDay(formattedToday, 0, true);
            setSelected(formattedToday);
        }
    }


    return (
        <View style={{ flex: 1 }}>
            <CalendarList
                ref={calendarRef}
                testID={'calendarList'}
                current={formattedDate}
                onVisibleMonthsChange={onVisibleMonthsChange}
                pastScrollRange={RANGE}
                futureScrollRange={RANGE}
                onDayPress={onDayPress}
                markedDates={marked}
                renderHeader={undefined}
                calendarHeight={undefined}
                theme={undefined}
                horizontal={true}
                pagingEnabled={true}
                staticHeader={true}
            />
            <Button 
                icon="calendar-today" 
                mode="contained" 
                onPress={() => scrollToToday()}
                disabled={isTodayInCurrentMonth}
            >
                Scroll to Today
            </Button>
        </View>
    );
}

export default HomeScreen;
