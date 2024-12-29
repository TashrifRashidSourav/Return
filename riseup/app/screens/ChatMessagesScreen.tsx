import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import io  from 'socket.io-client';
import axios from 'axios';

// Define the type for a message
interface Message {
  _id: string;
  chatId: string;
  sender: { _id: string; name: string };
  text: string;
  createdAt: string; // Or Date if you prefer to parse it
}

const ChatMessagesScreen = ({ route }: { route: any }) => {
  const { chatId } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const socket = io('http:// 192.168.0.104:5000'); // Replace with your backend address

  useEffect(() => {
    fetchMessages();
    socket.emit('joinRoom', { chatId });

    socket.on('messageReceived', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchMessages = async () => {
    try {
      const token = 'YOUR_JWT_TOKEN'; // Replace with the token from login
      const response = await axios.get(`http://192.168.x.x:5000/chats/${chatId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = () => {
    const message = {
      chatId,
      senderId: 'YOUR_USER_ID', // Replace with the logged-in user's ID
      text: newMessage,
    };

    socket.emit('sendMessage', message);
    setNewMessage('');
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.messageItem}>
            <Text style={styles.messageSender}>{item.sender.name}</Text>
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        )}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message"
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
  messageSender: { fontWeight: 'bold', marginBottom: 5 },
  messageText: { fontSize: 16 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5 },
  sendButton: { marginLeft: 10, padding: 10, backgroundColor: '#007bff', borderRadius: 5 },
  sendButtonText: { color: 'white', fontWeight: 'bold' },
});

export default ChatMessagesScreen;
