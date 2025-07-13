import React from 'react';
import {
  View,
  ScrollView
} from 'react-native';
import { calendarScreenStyles } from '../utility/styles';
import {
  Icon,
  Card,
  IconButton,
  FAB,
  Modal,
  Text,
  TextInput,
  RadioButton,
  Button,
  Dialog,
  Portal
} from 'react-native-paper';
import { getKvStorage } from '../utility/storage';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  CalendarTabs: undefined;
  TypeEvents: { typeName: string; typeColor: string };
};

type NavigationProp = StackNavigationProp<RootStackParamList, 'CalendarTabs'>;

async function loadTypes(setTypes: React.Dispatch<React.SetStateAction<Map<string, string>>>) {
  const storage = await getKvStorage();
  const typesFromStorage = storage.getString('eventTypes');
  if (typesFromStorage) {
    setTypes(new Map(JSON.parse(typesFromStorage)));
  }
}

async function saveNewType(
  name: string,
  color: string,
  types: Map<string, string>,
  setTypes: React.Dispatch<React.SetStateAction<Map<string, string>>>
) {
  if (!name.trim()) {
    return false; // Don't save if name is empty
  }

  const storage = await getKvStorage();
  const newTypes = new Map(types);

  // Find the hex color for the selected color name
  const selectedColor = colors.find(c => c.name === color);
  const hexColor = selectedColor ? selectedColor.hex : '#000000';

  newTypes.set(name.trim(), hexColor);

  // Save to storage
  storage.set('eventTypes', JSON.stringify(Array.from(newTypes.entries())));

  // Update state
  setTypes(newTypes);

  return true;
}

async function deleteType(
  typeName: string,
  types: Map<string, string>,
  setTypes: React.Dispatch<React.SetStateAction<Map<string, string>>>
) {
  const storage = await getKvStorage();
  const newTypes = new Map(types);

  // Remove the type
  newTypes.delete(typeName);

  // Save to storage
  storage.set('eventTypes', JSON.stringify(Array.from(newTypes.entries())));

  // Update state
  setTypes(newTypes);
}

const colors = [
  { name: 'red', hex: '#F44336' },
  { name: 'pink', hex: '#E91E63' },
  { name: 'purple', hex: '#9C27B0' },
  { name: 'blue', hex: '#2196F3' },
  { name: 'green', hex: '#4CAF50' },
  { name: 'yellow', hex: '#FFEB3B' },
  { name: 'orange', hex: '#FF9800' },
  { name: 'brown', hex: '#795548' },
]

function CalendarScreen() {
  const navigation = useNavigation<NavigationProp>();

  // import from mmkv the available types
  const [types, setTypes] = React.useState(new Map());
  const [visible, setVisible] = React.useState(false);
  const [dialogVisible, setDialogVisible] = React.useState(false);
  const [text, setText] = React.useState('');
  const [value, setValue] = React.useState('red');
  const [deletingType, setDeletingType] = React.useState<string | null>(null); // Track which type we're deleting

  const showModal = () => setVisible(true);
  const hideModal = () => {
    setVisible(false);
    // Reset form when closing modal
    setText('');
    setValue('red'); // Reset to default color
  };
  const showDialog = () => setDialogVisible(true);
  const hideDialog = () => {
    setDialogVisible(false);
    setDeletingType(null); // Clear the deleting type when dialog closes
  };

  const handleDelete = (typeName: string) => {
    setDeletingType(typeName);
    setDialogVisible(true);
  };

  const handleNavigateToTypeEvents = (typeName: string) => {
    const typeColor = types.get(typeName);
    if (typeColor) {
      navigation.navigate('TypeEvents', {
        typeName,
        typeColor
      });
    }
  };

  const confirmDelete = async () => {
    if (deletingType) {
      await deleteType(deletingType, types, setTypes);
      hideDialog();
    }
  };

  const handleSave = async () => {
    const success = await saveNewType(text, value, types, setTypes);
    if (success) {
      hideModal();
    }
    // If not successful (empty name), the modal stays open for user to fix
  };

  React.useEffect(() => {
    loadTypes(setTypes);
  }, []);

  const containerStyle = { backgroundColor: 'white', padding: 20, margin: 20, borderRadius: 10 };

  return (
    <View style={calendarScreenStyles.container}>
      <ScrollView style={calendarScreenStyles.container__scroll}>
        {Array.from(types).map(([name, color]) => (
          <Card key={name} style={{ marginBottom: 16 }}>
            <Card.Title
              title={name}
              titleVariant='titleMedium'
              titleStyle={calendarScreenStyles.card__title}
              left={(props) => <Icon {...props} source="circle" color={color} />}
              right={(props) => <View style={calendarScreenStyles.card__actions}>
                <IconButton {...props} icon="calendar" onPress={() => handleNavigateToTypeEvents(name)} />
                <IconButton {...props} icon="delete" onPress={() => handleDelete(name)} />
              </View>}
            />
          </Card>
        ))}

        {types.size === 0 && (
          <Card>
            <Card.Title
              title="No event types yet"
              titleVariant='titleMedium'
              titleStyle={calendarScreenStyles.card__title}
              left={(props) => <Icon {...props} source="information" />}
            />
          </Card>
        )}
      </ScrollView>
      <FAB
        icon="plus"
        style={calendarScreenStyles.fab}
        onPress={() => showModal()}
      />

      <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={containerStyle}>
        <Text variant="titleLarge" style={{ marginBottom: 10 }}>
          Create New Type
        </Text>
        <Text style={{ marginBottom: 10 }}>
          Pick the name of the type
        </Text>
        <TextInput
          label="Name"
          value={text}
          onChangeText={text => setText(text)}
          style={{ marginBottom: 20 }}
        />
        <Text style={{ marginBottom: 10 }}>
          Select the color of the type
        </Text>
        <RadioButton.Group onValueChange={newValue => setValue(newValue)} value={value}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            {Array.from(colors).map((color) => (
              <View key={color.name} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: `${color.hex}22`, paddingRight: 10, borderRadius: 5 }}>
                <RadioButton value={color.name} color={color.hex} />
                <Text>{color.name}</Text>
              </View>
            ))}
          </View>
        </RadioButton.Group>
        <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', marginTop: 20 }}>
          <Button icon="content-save" mode="contained" onPress={handleSave}>
            Save
          </Button>
          <Button icon="close" mode="contained-tonal" onPress={hideModal}>
            Cancel
          </Button>
        </View>
      </Modal>

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={hideDialog}>
          <Dialog.Title>Delete Type</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to delete "{deletingType}"? This action cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog}>Cancel</Button>
            <Button onPress={confirmDelete} textColor="red">Delete</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

export default CalendarScreen;
