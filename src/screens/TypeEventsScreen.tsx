import React, { useState, useMemo, useCallback, useRef } from 'react';
import { View, ScrollView } from 'react-native';
import { Card, Text, Icon, FAB, Button } from 'react-native-paper';
import { calendarScreenStyles } from '../utility/styles';
import { StackScreenProps } from '@react-navigation/stack';
import { CalendarList, AgendaEntry, AgendaSchedule, DateData } from 'react-native-calendars';

const RANGE = 24;

type RootStackParamList = {
    CalendarTabs: undefined;
    TypeEvents: { typeName: string; typeColor: string };
};

type Props = StackScreenProps<RootStackParamList, 'TypeEvents'>;

function TypeEventsScreen({ route }: Props) {
    const { typeName, typeColor } = route.params;

    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];

    const calendarRef = useRef<any>(null);
    const [marked, setMarked] = useState<{ [key: string]: any }>();
    const [currentMonth, setCurrentMonth] = useState(formattedDate);

    const onDayPress = useCallback((day: DateData) => {

        setMarked(prevMarked => {
            if (prevMarked && prevMarked[day.dateString]) {
                // Remove from marked dates
                const newMarked = { ...prevMarked };
                delete newMarked[day.dateString];
                console.log('Removing date:', day.dateString, newMarked);
                return newMarked;
            } else {
                // Add to marked dates
                const newMarked = {
                    ...prevMarked,
                    [day.dateString]: {
                        selected: true,
                        disableTouchEvent: false,
                        selectedColor: typeColor,
                        selectedTextColor: 'white'
                    }
                };
                console.log('Adding date:', day.dateString, newMarked);
                return newMarked;
            }
        });
    }, [typeColor]);

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
        }
    }

    function saveMarkedDates() {
        // Here you would typically save the marked dates to your storage or state management solution
        console.log('Marked dates saved:', marked);
    }

    return (
        <View style={calendarScreenStyles.container}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10 }}>
                <Text variant="headlineMedium" style={{ color: typeColor }}>
                    Set {typeName} events
                </Text>
                <Button 
                    mode="contained" 
                    icon="thumb-up"
                    onPress={saveMarkedDates}
                >
                    Done
                </Button>
            </View>
            <Text variant="labelLarge" style={{ margin: 10 }}>
                {`${marked ? Object.keys(marked).length : 0} events set so far`}
            </Text>
            <Button 
                icon="calendar-today" 
                mode="contained-tonal" 
                onPress={() => scrollToToday()} 
                style={{ margin: 10 }}
                disabled={isTodayInCurrentMonth}
            >
                Scroll to today
            </Button>
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
                horizontal={false}
                pagingEnabled={false}
                staticHeader={false}
            />
        </View>
    );
}

export default TypeEventsScreen;
