import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';
import { io, Socket } from 'socket.io-client';

interface Message {
  _id: string;
  sender?: { _id: string; name: string };
  text: string;
  createdAt: string;
}

const ChatMessagesScreen: React.FC = () => {
  const route = useRoute();
  const { chatId } = route.params as { chatId: string };

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newMessage, setNewMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [userId, setUserId] = useState<string | null>(null);
  const [receiverName, setReceiverName] = useState<string>('Unknown User');

  const socketRef = useRef<Socket | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const API_BASE_URL = 'http://192.168.0.101:5000';

  useEffect(() => {
    const initializeChat = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) throw new Error('No token found');

        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        if (!tokenPayload || !tokenPayload.id) throw new Error('Invalid token payload');

        setUserId(tokenPayload.id);

        await fetchChatDetails();
        await fetchMessages();

        // Initialize socket connection
        socketRef.current = io(API_BASE_URL, {
          query: { token },
        });

        // Listen for new messages
        socketRef.current.on('message', (message: Message) => {
          setMessages((prev) => [...prev, message]);
          // Automatically scroll to the bottom when a new message is received
          flatListRef.current?.scrollToEnd({ animated: true });
        });

        return () => {
          // Clean up socket connection on unmount
          socketRef.current?.disconnect();
        };
      } catch (err: any) {
        Alert.alert('Error', 'Initialization failed. Please try again.');
        console.error('Initialization error:', err.message);
        setError('Initialization failed.');
      } finally {
        setLoading(false);
      }
    };

    initializeChat();
  }, [chatId]);

  const fetchChatDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) throw new Error('No token found');

      const response = await fetch(`${API_BASE_URL}/chats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      const chat = data.chats.find((chat: any) => chat._id === chatId);
      if (chat) {
        const otherMember = chat.members.find((member: any) => member._id !== userId);
        setReceiverName(otherMember?.name || 'Unknown User');
      }
    } catch (err: any) {
      console.error('Error fetching chat details:', err.message);
      setReceiverName('Unknown User');
    }
  };

  const fetchMessages = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) throw new Error('No token found');

      const response = await fetch(`${API_BASE_URL}/chats/${chatId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setMessages(data.messages);
    } catch (err: any) {
      console.error('Error fetching messages:', err.message);
      setError('Failed to fetch messages.');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) {
      setError('Message cannot be empty.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) throw new Error('No token found');

      const response = await fetch(`${API_BASE_URL}/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: newMessage }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      // Add the new message to the list
      setMessages((prev) => [...prev, data.newMessage]);
      setNewMessage('');

      // Emit the message through WebSocket
      socketRef.current?.emit('newMessage', data.newMessage);

      // Automatically scroll to the bottom
      flatListRef.current?.scrollToEnd({ animated: true });
    } catch (err: any) {
      console.error('Error sending message:', err.message);
      setError('Failed to send message.');
    }
  };

  const renderMessageItem = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageItem,
        item.sender?._id === userId ? styles.myMessage : styles.theirMessage,
      ]}
    >
      {item.sender?._id !== userId && (
        <Text style={styles.messageSender}>{item.sender?.name || 'Unknown User'}</Text>
      )}
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header with receiver name */}
      <View style={styles.header}>
        <View style={styles.userInfoContainer}>
          <Image
            source={{ uri: 'https://via.placeholder.com/50' }}
            style={styles.userAvatar}
          />
          <Text style={styles.receiverName}>{receiverName}</Text>
        </View>
      </View>

      {/* Messages */}
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item._id}
          renderItem={renderMessageItem}
          style={styles.messagesList}
        />
      )}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Input field */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1301/1301456.png' }}
            style={styles.sendIcon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F9F9' },
  header: {
    backgroundColor: '#41D3BD',
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
  },
  userInfoContainer: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 20,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 5,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  receiverName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  messagesList: { flex: 1, padding: 10 },
  messageItem: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 15,
    maxWidth: '70%',
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#41d6b8',
    color: '#fff',
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
  },
  messageSender: { fontSize: 12, color: '#555', marginBottom: 2 },
  messageText: { fontSize: 16, color: '#333' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    padding: 10,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#41D3BD',
    padding: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIcon: {
    width: 20,
    height: 20,
    tintColor: '#fff',
  },
  errorText: { color: 'red', textAlign: 'center', marginVertical: 5 },
});

export default ChatMessagesScreen;
