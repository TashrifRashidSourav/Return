import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';
import io, { Socket } from 'socket.io-client';

interface Message {
  _id: string;
  sender: { _id: string; name: string };
  text: string;
  createdAt: string;
}

const ChatMessagesScreen: React.FC = () => {
  const route = useRoute();
  const { chatId, receiverName } = route.params as { chatId: string; receiverName: string };

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newMessage, setNewMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [userId, setUserId] = useState<string | null>(null);
  const [socket, setSocket] = useState<any>(null);



  useEffect(() => {
    const initializeSocket = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) throw new Error('No token found');

        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        setUserId(tokenPayload.id);

        const newSocket = io('http://192.168.0.105:5000', {
          query: { token },
        });
        setSocket(newSocket);

        // Listen for new messages
        newSocket.on('message', (message: Message) => {
          console.log('New message received:', message);
          setMessages((prev) => [...prev, message]);
        });

        return () => {
          newSocket.disconnect();
        };
      } catch (err) {
        Alert.alert('Error', 'Token not found or invalid. Please log in again.');
        setError('Failed to initialize user.');
      }
    };

    const fetchMessages = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) throw new Error('No token found');

        const response = await fetch(`http://192.168.0.105:5000/chats/${chatId}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message);

        setMessages(data.messages);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch messages.');
      } finally {
        setLoading(false);
      }
    };

    initializeSocket();
    fetchMessages();

    return () => {
      if (socket) {
        socket.off('message');
        socket.disconnect();
      }
    };
  }, [chatId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) {
      setError('Message cannot be empty.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) throw new Error('No token found');

      const response = await fetch(`http://192.168.0.105:5000/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: newMessage }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setMessages((prev) => [...prev, data.newMessage]);
      setNewMessage('');

      if (socket) {
        const payload = {
          chatId,
          text: data.newMessage.text,
          sender: data.newMessage.sender,
          createdAt: data.newMessage.createdAt,
        };

        console.log('Sending message to socket:', payload);
        socket.emit('newMessage', payload, (ack: any) => {
          if (ack?.error) {
            console.error('Socket acknowledgment error:', ack.error);
          }
        });
      } else {
        console.warn('Socket not initialized. Cannot emit new message.');
      }
    } catch (err: any) {
      console.error('SendMessage Error:', err);
      setError(err.message || 'Failed to send message.');
    }
  };

  const renderMessageItem = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageItem,
        item.sender?._id === userId ? styles.myMessage : styles.theirMessage,
      ]}
    >
      <Text style={styles.messageSender}>{item.sender?.name || 'Unknown User'}</Text>
      <Text style={styles.messageText}>{item.text}</Text>
      <Text style={styles.timestamp}>{new Date(item.createdAt).toLocaleTimeString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.receiverName}>{receiverName}</Text>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => item._id}
          renderItem={renderMessageItem}
          style={styles.messagesList}
        />
      )}
      {error && <Text style={styles.errorText}>{error}</Text>}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
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
  container: { flex: 1, padding: 10, backgroundColor: '#fff' },
  receiverName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'green',
    textAlign: 'center',
    marginBottom: 10,
  },
  messagesList: { flex: 1 },
  messageItem: { padding: 10, marginVertical: 5, borderRadius: 8 },
  myMessage: { alignSelf: 'flex-end', backgroundColor: '#d1f1d1' },
  theirMessage: { alignSelf: 'flex-start', backgroundColor: '#f1f1f1' },
  messageSender: { fontSize: 12, color: '#555', marginBottom: 2 },
  messageText: { fontSize: 16 },
  timestamp: { fontSize: 12, color: '#555', textAlign: 'right' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 8, marginRight: 5 },
  sendButton: { backgroundColor: 'green', padding: 10, borderRadius: 5 },
  sendButtonText: { color: '#fff', fontSize: 16 },
  errorText: { color: 'red', textAlign: 'center', marginVertical: 5 },
});

export default ChatMessagesScreen;
