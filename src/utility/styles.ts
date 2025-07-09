import {
    StyleSheet,
    // Appearance
} from 'react-native';

// const colorScheme = Appearance.getColorScheme();
// const isDarkMode = colorScheme === 'dark';
const colours = {
    text: '#081209',
    background: '#f5faf5',
    primary: '#5baf5a',
    secondary: '#a1bad3',
    accent: '#7c83c0',
};

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
        backgroundColor: colours.background,
    },
    container__scroll: {
        flex: 1
    },
    type: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        borderRadius: 10,
        paddingVertical: 10,
        gap: 20,
        marginBottom: 5,
        marginTop: 10,
        marginHorizontal: 10,
        padding: 10,
        backgroundColor: 'white',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
    },
    item__text: {
        fontSize: 18,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        color: colours.text,
    },
    type__row: {
        flex: 1,
        flexDirection: 'row',
        display: 'flex',
        justifyContent: 'space-between',
        gap: 10
    },
    type__color: {
        width: 20,
        height: 20,
        borderRadius: 20,
        position: 'relative'
    },
    type_actions: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },
    type__button: {
        paddingHorizontal: 8,
        paddingVertical: 12,
        borderRadius: 10,
    },
    button__add: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: colours.primary,
    },
    item__container: {
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    }
});

export const notificationScreenStyles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
    },
    container__text: {
        fontSize: 24,
        marginBottom: 30,
        textAlign: 'center'
    },
});
