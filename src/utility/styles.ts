import {
    StyleSheet
} from 'react-native';

export const homeScreenStyles = StyleSheet.create({
    empty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 25,
        flexDirection: 'column',
        margin: 0,
        padding: 0,
    },
    empty__row: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        flexWrap: 'wrap',
    },
    test: {
        marginRight: 10,
        marginTop: 17,
    },
});

export const calendarScreenStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 8
    },
    container__scroll: {
        display: 'flex',
        flex: 1,
        padding: 8,
    },
    card__title: {
        verticalAlign: 'middle',
    },
    card__actions: {
        flexDirection: 'row',
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
});

export const notificationScreenStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 8
    },
    container__text: {
        fontSize: 24,
        marginBottom: 30,
        textAlign: 'center'
    },
});
