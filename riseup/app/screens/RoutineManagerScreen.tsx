import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, FlatList, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Routine {
  _id: string;
  time: string;
  activity: string;
}

const RoutineManagerScreen: React.FC = () => {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [time, setTime] = useState<string>('');
  const [activity, setActivity] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const getToken = async (): Promise<string | null> => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'No token found. Please login again.');
        return null;
      }
      return token;
    } catch (err) {
      console.error('Error fetching token:', err);
      return null;
    }
  };

  const fetchRoutines = async () => {
    const token = await getToken();
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch('http://192.168.0.105:5000/routines', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRoutines(data.routines);
      } else {
        Alert.alert('Error', 'Failed to fetch routines');
      }
    } catch (err) {
      console.error('Error fetching routines:', err);
    } finally {
      setLoading(false);
    }
  };

  const addRoutine = async () => {
    if (!time || !activity) {
      Alert.alert('Error', 'Please enter both time and activity');
      return;
    }

    const token = await getToken();
    if (!token) return;

    try {
      const response = await fetch('http://192.168.0.105:5000/routines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ time, activity }),
      });

      if (response.ok) {
        const newRoutine = await response.json();
        setRoutines((prev) => [...prev, newRoutine.routine]);
        setTime('');
        setActivity('');
      } else {
        Alert.alert('Error', 'Failed to add routine');
      }
    } catch (err) {
      console.error('Error adding routine:', err);
    }
  };

  useEffect(() => {
    fetchRoutines();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Routine Manager</Text>
      <TextInput
        placeholder="Time"
        value={time}
        onChangeText={setTime}
        style={styles.input}
      />
      <TextInput
        placeholder="Activity"
        value={activity}
        onChangeText={setActivity}
        style={styles.input}
      />
      <Button title="Add Routine" onPress={addRoutine} />
      {loading && <Text>Loading...</Text>}
      <FlatList
        data={routines}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={styles.listText}>Time: {item.time}</Text>
            <Text style={styles.listText}>Activity: {item.activity}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyMessage}>No routines found.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f9f9f9', flex: 1 },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', marginBottom: 10, padding: 8 },
  listItem: { borderBottomWidth: 1, borderColor: '#ddd', padding: 10 },
  listText: { fontSize: 16 },
  emptyMessage: { textAlign: 'center', marginTop: 20, color: '#999' },
});

export default RoutineManagerScreen;
