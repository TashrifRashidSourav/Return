import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';

// Define the type for a chat
interface Chat {
  _id: string;
  users: { _id: string; name: string }[]; // Array of users in the chat
  lastMessage?: string; // Optional field for the last message
}

const ChatListScreen = ({ navigation }: { navigation: any }) => {
  const [chats, setChats] = useState<Chat[]>([]); // Explicitly type the chats state

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const token = 'YOUR_JWT_TOKEN'; // Replace with actual token
      const response = await axios.get('http://192.168.0.104:5000/chats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChats(response.data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const navigateToChat = (chatId: string) => {
    navigation.navigate('ChatMessages', { chatId });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.chatItem} onPress={() => navigateToChat(item._id)}>
            <Text style={styles.chatName}>
              {item.users.map((user) => user.name).join(', ')}
            </Text>
            <Text style={styles.lastMessage}>{item.lastMessage || 'No messages yet'}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  chatItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  chatName: { fontSize: 18, fontWeight: 'bold' },
  lastMessage: { fontSize: 14, color: '#666', marginTop: 5 },
});

export default ChatListScreen;
