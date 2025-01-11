import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

interface Task {
  start: string;
  end: string;
  task: string;
  priority: number;
}

const Schedule24Hours: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskName, setNewTaskName] = useState<string>('');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [priority, setPriority] = useState<number>(1);
  const [isStartTimePickerVisible, setStartTimePickerVisible] = useState(false);
  const [isEndTimePickerVisible, setEndTimePickerVisible] = useState(false);
  const API_BASE_URL = 'http://192.168.0.101:5000/api/schedule'; // Replace with your backend URL

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      console.log('Token:', token); // Log token for debugging
      if (!token) {
        Alert.alert('Error', 'You are not logged in!');
        return;
      }

      const response = await fetch(`${API_BASE_URL}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        Alert.alert('Error', 'Invalid or expired token. Please log in again.');
        return;
      }

      const data = await response.json();
      if (response.ok) {
        setTasks(data.schedule || []);
      } else {
        Alert.alert('Error', data.message || 'Failed to fetch schedule.');
      }
    } catch (error) {
      console.error('Fetch Schedule Error:', error);
      Alert.alert('Error', 'Unable to fetch schedule.');
    }
  };

  const addTask = async () => {
    if (!newTaskName.trim()) {
      Alert.alert('Error', 'Task name cannot be empty.');
      return;
    }

    if (!startTime || !endTime) {
      Alert.alert('Error', 'Please select both start and end times.');
      return;
    }

    if (startTime >= endTime) {
      Alert.alert('Error', 'End time must be later than start time.');
      return;
    }

    const newTask: Task = {
      start: startTime.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
      end: endTime.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
      task: newTaskName,
      priority,
    };

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'You are not logged in!');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/add-task`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newTask }),
      });

      const data = await response.json();

      if (response.ok) {
        setTasks((prevTasks) => [...prevTasks, newTask]);
        setNewTaskName('');
        setStartTime(new Date(endTime)); // Update start time for next task
        setEndTime(null); // Reset end time
        setPriority(1); // Reset priority to default
      } else {
        Alert.alert('Error', data.message || 'Failed to add task.');
      }
    } catch (error) {
      console.error('Add Task Error:', error);
      Alert.alert('Error', 'Unable to save the task.');
    }
  };

  const renderTask = ({ item }: { item: Task }) => (
    <View style={styles.taskContainer}>
      <Text style={styles.taskText}>{item.task}</Text>
      <Text style={styles.taskTime}>
        {item.start} - {item.end}
      </Text>
      <Text style={styles.taskPriority}>Priority: {item.priority}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>24-Hour Schedule</Text>

      <FlatList
        data={tasks}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderTask}
        style={styles.taskList}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Task Name"
          value={newTaskName}
          onChangeText={setNewTaskName}
        />

        <Picker
          selectedValue={priority}
          onValueChange={(itemValue) => setPriority(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Priority 1" value={1} />
          <Picker.Item label="Priority 2" value={2} />
          <Picker.Item label="Priority 3" value={3} />
          <Picker.Item label="Priority 4" value={4} />
          <Picker.Item label="Priority 5" value={5} />
        </Picker>

        <TouchableOpacity
          onPress={() => setStartTimePickerVisible(true)}
          style={styles.timePickerButton}
        >
          <Text style={styles.timePickerText}>
            Start Time: {startTime
              ? startTime.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })
              : 'Select'}
          </Text>
        </TouchableOpacity>

        {isStartTimePickerVisible && (
          <DateTimePicker
            value={startTime || new Date()}
            mode="time"
            is24Hour={false}
            display="default"
            onChange={(event, selectedDate) => {
              setStartTimePickerVisible(false);
              if (selectedDate) setStartTime(selectedDate);
            }}
          />
        )}

        <TouchableOpacity
          onPress={() => setEndTimePickerVisible(true)}
          style={styles.timePickerButton}
        >
          <Text style={styles.timePickerText}>
            End Time: {endTime
              ? endTime.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })
              : 'Select'}
          </Text>
        </TouchableOpacity>

        {isEndTimePickerVisible && (
          <DateTimePicker
            value={endTime || new Date()}
            mode="time"
            is24Hour={false}
            display="default"
            onChange={(event, selectedDate) => {
              setEndTimePickerVisible(false);
              if (selectedDate) setEndTime(selectedDate);
            }}
          />
        )}

        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Text style={styles.addButtonText}>Add Task</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F9F9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  taskList: {
    marginBottom: 20,
  },
  taskContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 3,
  },
  taskText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  taskTime: {
    fontSize: 16,
    color: '#555',
    marginTop: 5,
  },
  taskPriority: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
  inputContainer: {
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  timePickerButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
    marginBottom: 10,
  },
  timePickerText: {
    color: '#333',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#41D3BD',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Schedule24Hours;
