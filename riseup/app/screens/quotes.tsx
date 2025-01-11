import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  TextInput,
  StyleSheet,
  FlatList,
  Alert,
  Modal,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Quote {
  id: string;
  text: string;
  author: string;
}

const API_URL = 'http://192.168.0.101:5000/api/quotes'; // Adjust to your backend URL

const App: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [currentQuote, setCurrentQuote] = useState<Quote>({ id: '', text: '', author: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'No token found, please login again.');
        return;
      }

      const response = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setQuotes(data);
    } catch (error) {
      console.error('Error fetching quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrUpdate = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'No token found, please login again.');
        return;
      }

      const url = isEditing ? `${API_URL}/update/${currentQuote.id}` : `${API_URL}/add`;
      const method = isEditing ? 'PUT' : 'POST';

      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(currentQuote),
      });

      setModalVisible(false);
      setCurrentQuote({ id: '', text: '', author: '' });
      fetchQuotes();
    } catch (error) {
      console.error('Error adding/updating quote:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'No token found, please login again.');
        return;
      }

      await fetch(`${API_URL}/delete/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchQuotes();
    } catch (error) {
      console.error('Error deleting quote:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (quote: Quote = { id: '', text: '', author: '' }) => {
    setCurrentQuote(quote);
    setIsEditing(!!quote.id);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setCurrentQuote({ id: '', text: '', author: '' });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quotes Management</Text>
      <Button title="Add Quote" onPress={() => openModal()} />
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={quotes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.quoteCard}>
              <Text style={styles.quoteText}>{item.text}</Text>
              <Text style={styles.quoteAuthor}>- {item.author}</Text>
              <View style={styles.actions}>
                <Button
                  title="Edit"
                  onPress={() => openModal({ id: item.id, text: item.text, author: item.author })}
                />
                <Button title="Delete" color="red" onPress={() => handleDelete(item.id)} />
              </View>
            </View>
          )}
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{isEditing ? 'Edit Quote' : 'Add Quote'}</Text>
          <TextInput
            style={styles.input}
            placeholder="Quote Text"
            value={currentQuote.text}
            onChangeText={(text) => setCurrentQuote({ ...currentQuote, text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Author"
            value={currentQuote.author}
            onChangeText={(author) => setCurrentQuote({ ...currentQuote, author })}
          />
          <View style={styles.modalActions}>
            <Button title="Cancel" onPress={closeModal} />
            <Button title={isEditing ? 'Update' : 'Add'} onPress={handleAddOrUpdate} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  quoteCard: { padding: 10, marginVertical: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 8 },
  quoteText: { fontSize: 16, fontWeight: 'bold' },
  quoteAuthor: { fontSize: 14, color: '#555' },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: { width: '100%', padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 10 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
});

export default App;
