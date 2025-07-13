import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { Card, Text, Icon, FAB, Button } from 'react-native-paper';
import { calendarScreenStyles } from '../utility/styles';
import { StackScreenProps } from '@react-navigation/stack';
import { CalendarList, AgendaEntry, AgendaSchedule, DateData } from 'react-native-calendars';
import { getKvStorage } from '../utility/storage';
import { updateTypeNotifications } from '../utility/notifications';

const RANGE = 24;

type RootStackParamList = {
    CalendarTabs: undefined;
    TypeEvents: { typeName: string; typeColor: string };
};

type Props = StackScreenProps<RootStackParamList, 'TypeEvents'>;

function TypeEventsScreen({ route, navigation }: Props) {
    const { typeName, typeColor } = route.params;

    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];

    const calendarRef = useRef<any>(null);
    const [marked, setMarked] = useState<{ [key: string]: any }>();
    const [currentMonth, setCurrentMonth] = useState(formattedDate);

    // Load saved events when component mounts
    useEffect(() => {
        const loadSavedEvents = async () => {
            try {
                const storage = await getKvStorage();
                const currentYear = new Date().getFullYear();
                const loadedMarked: { [key: string]: any } = {};

                // Load events for the current year and surrounding years
                for (let year = currentYear - 1; year <= currentYear + 2; year++) {
                    const key = `${year}-${typeName}`;
                    const savedDates = storage.getString(key);
                    
                    if (savedDates) {
                        const dates = JSON.parse(savedDates) as string[];
                        dates.forEach(date => {
                            loadedMarked[date] = {
                                selected: true,
                                disableTouchEvent: false,
                                selectedColor: typeColor,
                                selectedTextColor: 'white'
                            };
                        });
                    }
                }

                if (Object.keys(loadedMarked).length > 0) {
                    setMarked(loadedMarked);
                }
            } catch (error) {
                console.error('Error loading saved events:', error);
            }
        };

        loadSavedEvents();
    }, [typeName, typeColor]);

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

    async function saveMarkedDates() {
        // save the marked dates to mmkv grouped by type and year
        const storage = await getKvStorage();
        const newMarked = { ...marked };

        if (Object.keys(newMarked).length === 0) {
            console.warn('No dates marked to save');
            return;
        }

        // Group by year
        const grouped: { [key: string]: string[] } = {};
        Object.keys(newMarked).forEach(date => {
            const dateObj = new Date(date);
            const year = dateObj.getFullYear();

            if (!grouped[year]) {
                grouped[year] = [];
            }
            grouped[year].push(date);
        });

        // Save to storage
        for (const year in grouped) {
            const key = `${year}-${typeName}`;
            storage.set(key, JSON.stringify(grouped[year]));
        }

        // Update notifications for the type
        await updateTypeNotifications(typeName);

        // Go back to the calendar screen
        navigation.goBack();
    }

    return (
        <View style={calendarScreenStyles.container}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10 }}>
                <Text variant="headlineMedium" style={{ color: typeColor }}>
                    Set {typeName} events
                </Text>
                <Button 
                    mode="contained" 
                    icon="content-save"
                    onPress={saveMarkedDates}
                >
                    Save
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
