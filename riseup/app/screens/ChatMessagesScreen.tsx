import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  message: string;
  createdAt: string;
}

const ChatMessagesScreen = () => {
  const { chatId } = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const getToken = async () => {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) throw new Error('No token found');
    return token;
  };

  const fetchMessages = async () => {
    const token = await getToken();

    setLoading(true);
    try {
      const response = await fetch(`http://192.168.56.1:5000/chats/${chatId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setMessages(data.messages);
    } catch (error: any) {
      console.error('Error fetching messages:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    const token = await getToken();

    try {
      const response = await fetch(`http://192.168.0.108:5000/chats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ receiverId: chatId, message: newMessage }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setMessages((prev) => [...prev, data.chat]);
      setNewMessage('');
    } catch (error: any) {
      console.error('Error sending message:', error.message);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.messageItem}>
            <Text>{item.senderId === chatId ? 'You' : 'Them'}: {item.message}</Text>
          </View>
        )}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  messageItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  inputContainer: { flexDirection: 'row', padding: 10 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5 },
  sendButton: { backgroundColor: '#007bff', padding: 10, borderRadius: 5, marginLeft: 10 },
  sendButtonText: { color: 'white' },
});

export default ChatMessagesScreen;
