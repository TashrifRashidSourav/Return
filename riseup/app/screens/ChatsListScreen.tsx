import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

interface User {
  _id: string;
  name: string;
}

interface Chat {
  _id: string;
  senderId: { _id: string; name: string } | null;
  receiverId: { _id: string; name: string } | null;
  lastMessage?: { text: string; createdAt: string };
}

const ChatsListScreen = () => {
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<User[]>([]);

  const getToken = async () => {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      Alert.alert('Error', 'No token found. Please log in again.');
      return null;
    }
    return token;
  };

  // Fetch chats
  const fetchChats = async () => {
    const token = await getToken();
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(`http://192.168.0.108:5000/chats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setChats(data.chats);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to fetch chats.');
    } finally {
      setLoading(false);
    }
  };

  // Search users
  const searchUsers = async () => {
    const token = await getToken();
    if (!token) return;

    if (!searchText.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `http://192.168.0.108:5000/users/search?name=${encodeURIComponent(searchText.trim())}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setSearchResults(data.users);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to search users.');
    } finally {
      setLoading(false);
    }
  };

  // Start a chat
  const startChat = async (userId: string) => {
    const token = await getToken();
    if (!token) return;

    try {
      const response = await fetch(`http://192.168.0.108:5000/chats/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ receiverId: userId }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      router.push({ pathname: './ChatMessagesScreen', params: { chatId: data.chat._id } });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to start a chat.');
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const renderChatItem = ({ item }: { item: Chat }) => {
    const senderName = item.senderId?.name || 'Unknown Sender';
    const receiverName = item.receiverId?.name || 'Unknown Receiver';

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() =>
          router.push({ pathname: './ChatMessagesScreen', params: { chatId: item._id } })
        }
      >
        <Text style={styles.chatName}>
          {senderName} ↔ {receiverName}
        </Text>
        {item.lastMessage && (
          <>
            <Text style={styles.lastMessage}>{item.lastMessage.text || 'No message yet'}</Text>
            <Text style={styles.lastMessageTime}>
              {item.lastMessage.createdAt
                ? new Date(item.lastMessage.createdAt).toLocaleTimeString()
                : ''}
            </Text>
          </>
        )}
      </TouchableOpacity>
    );
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity style={styles.userItem} onPress={() => startChat(item._id)}>
      <Text style={styles.userName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search users..."
        value={searchText}
        onChangeText={setSearchText}
        onSubmitEditing={searchUsers}
      />

      {searchResults.length > 0 ? (
        <FlatList data={searchResults} keyExtractor={(item) => item._id} renderItem={renderUserItem} />
      ) : loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList data={chats} keyExtractor={(item) => item._id} renderItem={renderChatItem} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  searchInput: { height: 40, borderColor: '#ccc', borderWidth: 1, borderRadius: 5, marginBottom: 10 },
  chatItem: { padding: 15, backgroundColor: '#f9f9f9', marginBottom: 5, borderRadius: 5 },
  chatName: { fontWeight: 'bold', fontSize: 16 },
  lastMessage: { fontSize: 14, color: '#555' },
  lastMessageTime: { fontSize: 12, color: '#999', marginTop: 5 },
  userItem: { padding: 15, backgroundColor: '#f0f0f0', marginBottom: 5, borderRadius: 5 },
  userName: { fontWeight: 'bold', fontSize: 16 },
});

export default ChatsListScreen;
