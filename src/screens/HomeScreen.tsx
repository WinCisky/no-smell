import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { ScrollView, View, TextStyle, StyleSheet } from 'react-native';
import { CalendarList, AgendaEntry, AgendaSchedule, DateData } from 'react-native-calendars';
import { MMKV, Mode } from 'react-native-mmkv'
import { homeScreenStyles } from '../utility/styles';
import { Card, Text, Button, Icon, Chip, useTheme } from 'react-native-paper';
import { getKvStorage } from '../utility/storage';
import { useFocusEffect } from '@react-navigation/native';

const RANGE = 24;

// Custom Day Component for multi-color display
const MultiColorDay = ({ date, marking, onPress }: any) => {
    const theme = useTheme();
    const daySize = 32;
    const dayStyle = {
        width: daySize,
        height: daySize,
        borderRadius: daySize / 2, // Perfect circle
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        margin: 2,
    };

    const textStyle = {
        color: marking?.selected ? 'white' : theme.colors.onSurface,
        fontWeight: marking?.selected ? 'bold' as const : 'normal' as const,
        fontSize: marking?.selected ? 18 : 16,
    };

    const handlePress = () => {
        if (onPress) {
            onPress(date);
        }
    };

    if (marking?.colors && marking.colors.length > 1) {
        // Multi-color background using segments
        return (
            <View style={[dayStyle, { backgroundColor: 'transparent' }]} onTouchEnd={handlePress}>
                {/* Create segments for different colors */}
                {marking.colors.map((color: string, index: number) => {
                    const isLeft = index % 2 === 0;
                    const isTop = index < 2;

                    const segmentStyle = {
                        position: 'absolute' as const,
                        width: '50%' as const,
                        height: '50%' as const,
                        backgroundColor: color,
                        borderRadius: daySize / 2,
                        opacity: 0.8,
                        left: isLeft ? 0 : daySize / 2,
                        top: isTop ? 0 : daySize / 2,
                    };

                    return (
                        <View key={index} style={segmentStyle} />
                    );
                })}

                {/* Day number on top */}
                <View style={{
                    zIndex: 10,
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    borderRadius: 12,
                    paddingHorizontal: 4,
                    paddingVertical: 2
                }}>
                    <Text style={[textStyle, { color: theme.colors.onSurface }]}>
                        {date.day}
                    </Text>
                </View>
            </View>
        );
    } else if (marking?.colors && marking.colors.length === 1) {
        // Single color background
        return (
            <View style={[dayStyle, { backgroundColor: marking.colors[0] }]} onTouchEnd={handlePress}>
                <Text style={textStyle}>
                    {date.day}
                </Text>
            </View>
        );
    } else {
        // Default day (no events)
        const backgroundColor = marking?.selected ? '#5E60CE' : 'transparent';
        const textColor = marking?.selected ? 'white' : theme.colors.onSurface;

        return (
            <View
                style={[
                    dayStyle,
                    {
                        backgroundColor,
                    }
                ]}
                onTouchEnd={handlePress}
            >
                <Text style={[textStyle, { color: textColor }]}>
                    {date.day}
                </Text>
            </View>
        );
    }
};

function HomeScreen() {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];

    const [selected, setSelected] = useState(formattedDate);
    const [currentMonth, setCurrentMonth] = useState(formattedDate);
    const [eventTypes, setEventTypes] = useState<Map<string, string>>(new Map());
    const [events, setEvents] = useState<AgendaSchedule>({});
    const [notifications, setNotifications] = useState<{ [key: string]: any[] }>({});
    const [markedDates, setMarkedDates] = useState<{ [key: string]: any }>({});
    const calendarRef = useRef<any>(null);

    // Load event types from storage
    const loadEventTypes = async () => {
        try {
            const storage = await getKvStorage();
            const typesFromStorage = storage.getString('eventTypes');
            if (typesFromStorage) {
                const types = new Map<string, string>(JSON.parse(typesFromStorage));
                setEventTypes(types);
                return types;
            }
        } catch (error) {
            console.error('Error loading event types:', error);
        }
        return new Map<string, string>();
    };

    // Load events for all event types
    const loadEvents = async (types: Map<string, string>) => {
        try {
            const storage = await getKvStorage();
            const loadedEvents: AgendaSchedule = {};
            const loadedMarked: { [key: string]: any } = {};
            for (const [typeName, typeColor] of types) {
                const key = `events-${typeName}`;
                const savedDates = storage.getString(key);

                if (savedDates) {
                    const dates = JSON.parse(savedDates) as string[];
                    dates.forEach(date => {
                        // Add to events
                        if (!loadedEvents[date]) {
                            loadedEvents[date] = [];
                        }
                        loadedEvents[date].push({
                            name: typeName,
                            height: 80,
                            day: date
                        });

                        // Add to marked dates
                        if (!loadedMarked[date]) {
                            loadedMarked[date] = {
                                marked: true,
                                colors: [],
                                selectedTextColor: 'white'
                            };
                        }
                        
                        // Add color to the array if not already present
                        if (!loadedMarked[date].colors.includes(typeColor)) {
                            loadedMarked[date].colors.push(typeColor);
                        }
                    });
                }
            }

            setEvents(loadedEvents);
            setMarkedDates(loadedMarked);
        } catch (error) {
            console.error('Error loading events:', error);
        }
    };

    const loadNotifications = async (types: Map<string, string>) => {
        try {
            const storage = await getKvStorage();
            const allNotifications: { [key: string]: any[] } = {};

            for (const typeName of types.keys()) {
                const notificationsForType = storage.getString(`notifications-${typeName}`) || "[]";
                allNotifications[typeName] = JSON.parse(notificationsForType ?? []);
            }

            console.log('Loaded notifications:', allNotifications);
            setNotifications(allNotifications);
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }

    // Load data when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            const loadData = async () => {
                const types = await loadEventTypes();
                if (types.size > 0) {
                    await loadEvents(types);
                    await loadNotifications(types);
                }
            };
            loadData();

        }, [])
    );

    const marked = useMemo(() => {
        const result = { ...markedDates };

        // Mark the selected date
        if (result[selected]) {
            result[selected] = {
                ...result[selected],
                selected: true,
            };
        } else {
            result[selected] = {
                selected: true,
                selectedColor: '#5E60CE',
                selectedTextColor: 'white'
            };
        }

        return result;
    }, [selected, markedDates]);

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

    const theme = useTheme();

    return (
        <ScrollView style={{ flex: 1 }}>
            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', margin: 20 }}>
                <Text variant="titleMedium" style={{ textAlign: 'center' }}>
                    {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric', day: 'numeric' })}
                </Text>
                <Button
                    icon="calendar-today"
                    mode="contained"
                    onPress={() => scrollToToday()}
                    disabled={isTodayInCurrentMonth}
                >
                    Scroll to Today
                </Button>
            </View>
            <CalendarList
                ref={calendarRef}
                testID={'calendarList'}
                current={formattedDate}
                onVisibleMonthsChange={onVisibleMonthsChange}
                pastScrollRange={RANGE}
                futureScrollRange={RANGE}
                onDayPress={onDayPress}
                markedDates={marked}
                dayComponent={MultiColorDay}
                renderHeader={undefined}
                calendarHeight={undefined}
                theme={{
                    agendaKnobColor: theme.colors.primary,
                    textSectionTitleColor: theme.colors.onSurfaceVariant,
                    calendarBackground: theme.colors.surface,
                }}
                horizontal={true}
                pagingEnabled={true}
                staticHeader={true}
            />

            <View>
                {/* show the selected date if it's not today properly formatted */}
                <Text style={{ color: theme.colors.onSurface, textAlign: 'center' }}>
                    Events for {selected === formattedDate ? 'today' : new Date(selected).toLocaleDateString('en-US', { month: 'long', year: 'numeric', day: 'numeric' })}
                </Text>
            </View>
            {/* Show selected date events */}
            <View style={{ margin: 20 }}>
                {!events[selected] ? (
                    <Text style={{ color: '#888', textAlign: 'center' }}>
                        No events for {selected === formattedDate ? 'today' : 'this date'}
                    </Text>
                ) : (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                        {events[selected].map((item: AgendaEntry, index: number) => (
                            // for each event, for each notification time, show a chip with the time
                            notifications[item.name] && notifications[item.name].length > 0 ? (
                                notifications[item.name].map((notification: any) => (
                                    <Chip
                                        icon={(props) => <Icon {...props} source="circle" color={eventTypes.get(item.name)} />}
                                        onPress={() => console.log('Pressed')}
                                        onClose={() => console.log('Closed')}
                                        closeIcon={(props) => <Icon {...props} source="close" />}
                                        key={`${item.name}-${notification.id}-${index}`}
                                    >
                                        {item.name} {notification.time}
                                    </Chip>

                                ))
                            ) : (
                                <Text key={`${item.name}-no-notifications-${index}`} style={{ color: '#666', fontStyle: 'italic' }}>
                                    No notifications set for {item.name}
                                </Text>
                            )
                        ))}
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

export default HomeScreen;
