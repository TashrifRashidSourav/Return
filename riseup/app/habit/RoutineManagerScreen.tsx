import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Routine {
  _id: string;
  activity: string;
  startTime: string;
  endTime: string;
}

const RoutineScreen: React.FC = () => {
  const [date, setDate] = useState(new Date()); // Selected date
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [activity, setActivity] = useState('');
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(false);

  // Format date to YYYY-MM-DD
  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  // Format time to HH:mm AM/PM
  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  // Fetch token
  const getToken = async (): Promise<string | null> => {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      Alert.alert('Error', 'No token found. Please log in again.');
      return null;
    }
    return token;
  };

  // Fetch routines for the selected date
  const fetchRoutines = async () => {
    setLoading(true);
    const token = await getToken();
    if (!token) return;

    try {
      const response = await fetch(
        `http://10.15.56.133:5000/routines/${formatDate(date)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setRoutines(data.routines);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to fetch routines.');
    } finally {
      setLoading(false);
    }
  };

  // Add a new routine
  const addRoutine = async () => {
    if (!activity || !startTime || !endTime) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }

    const token = await getToken();
    if (!token) return;

    try {
      const response = await fetch('http://10.15.56.133:5000/routines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: formatDate(date),
          startTime: formatTime(startTime),
          endTime: formatTime(endTime),
          activity,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setActivity('');
      setStartTime(null);
      setEndTime(null);
      fetchRoutines();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add routine.');
    }
  };

  // Delete a routine
  const deleteRoutine = async (id: string) => {
    const token = await getToken();
    if (!token) return;

    try {
      const response = await fetch(`http://10.15.56.133:5000/routines/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      fetchRoutines();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to delete routine.');
    }
  };

  // Handle date selection
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      fetchRoutines(); // Fetch routines for the newly selected date
    }
  };

  // Handle time selection
  const handleTimeChange = (
    event: any,
    selectedTime: Date | undefined,
    type: 'start' | 'end'
  ) => {
    if (type === 'start') {
      setShowStartTimePicker(false);
      if (selectedTime) setStartTime(selectedTime);
    } else {
      setShowEndTimePicker(false);
      if (selectedTime) setEndTime(selectedTime);
    }
  };

  useEffect(() => {
    fetchRoutines();
  }, [date]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Routine for {formatDate(date)}</Text>

      {/* Calendar Picker */}
      <TouchableOpacity onPress={() => setShowDatePicker(true)}>
        <Text style={styles.datePickerButton}>Select Date</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {/* Time Pickers */}
      <TouchableOpacity onPress={() => setShowStartTimePicker(true)}>
        <Text style={styles.timePickerButton}>
          Start Time: {startTime ? formatTime(startTime) : 'Select'}
        </Text>
      </TouchableOpacity>
      {showStartTimePicker && (
        <DateTimePicker
          value={startTime || new Date()}
          mode="time"
          display="default"
          onChange={(event, selectedTime) =>
            handleTimeChange(event, selectedTime, 'start')
          }
        />
      )}

      <TouchableOpacity onPress={() => setShowEndTimePicker(true)}>
        <Text style={styles.timePickerButton}>
          End Time: {endTime ? formatTime(endTime) : 'Select'}
        </Text>
      </TouchableOpacity>
      {showEndTimePicker && (
        <DateTimePicker
          value={endTime || new Date()}
          mode="time"
          display="default"
          onChange={(event, selectedTime) =>
            handleTimeChange(event, selectedTime, 'end')
          }
        />
      )}

      {/* Input for Activity */}
      <TextInput
        style={styles.input}
        placeholder="Enter Activity"
        value={activity}
        onChangeText={setActivity}
      />

      {/* Add Button */}
      <TouchableOpacity style={styles.addButton} onPress={addRoutine}>
        <Text style={styles.addButtonText}>Add Routine</Text>
      </TouchableOpacity>

      {/* Routines List */}
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={routines}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.routineItem}>
              <Text style={styles.routineText}>
                {item.activity}: {item.startTime} - {item.endTime}
              </Text>
              <TouchableOpacity
                onPress={() => deleteRoutine(item._id)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  datePickerButton: { color: 'blue', textAlign: 'center', marginVertical: 10 },
  timePickerButton: { color: 'blue', textAlign: 'center', marginVertical: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: 'green',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: { color: 'white', fontWeight: 'bold' },
  routineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  routineText: { fontSize: 16 },
  deleteButton: { backgroundColor: 'red', padding: 8, borderRadius: 5 },
  deleteButtonText: { color: 'white' },
});

export default RoutineScreen;
