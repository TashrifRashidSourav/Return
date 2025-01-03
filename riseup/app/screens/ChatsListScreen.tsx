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
  members: { _id: string; name: string }[];
  updatedAt: string;
  lastMessage?: { content: string; createdAt: string };
}

const ChatsListScreen = () => {
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get the JWT token
  const getToken = async (): Promise<string | null> => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'No token found. Please log in again.');
        return null;
      }
      return token;
    } catch (err) {
      console.error('Error fetching token:', err);
      return null;
    }
  };

  // Fetch current user's ID from token
  const fetchCurrentUserId = async () => {
    const token = await getToken();
    if (!token) return;

    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      setCurrentUserId(tokenData.id);
    } catch (err) {
      console.error('Error decoding token:', err);
    }
  };

  // Fetch chats
  const fetchChats = async () => {
    const token = await getToken();
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(`http://192.168.0.105:5000/chats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setChats(data.chats);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to fetch chats.');
    } finally {
      setLoading(false);
    }
  };

  // Search users by name
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
        `http://192.168.0.105:5000/users/search?name=${encodeURIComponent(searchText.trim())}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setSearchResults(data.users);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to search users.');
    } finally {
      setLoading(false);
    }
  };

  // Start a new chat
  const startChat = async (userId: string) => {
    const token = await getToken();
    if (!token) return;

    try {
      const response = await fetch(`http://192.168.0.105:5000/chats/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ receiverId: userId }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      router.push({ pathname: './ChatMessagesScreen', params: { chatId: data.chat._id, receiverName: data.chat.receiverName } });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to start a chat.');
    }
  };

  useEffect(() => {
    fetchCurrentUserId();
    fetchChats();
  }, []);

  const renderChatItem = ({ item }: { item: Chat }) => {
    const otherMember = item.members.find((member) => member._id !== currentUserId);
    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() =>
          router.push({ pathname: './ChatMessagesScreen', params: { chatId: item._id, receiverName: otherMember?.name || 'Unknown' } })
        }
      >
        <Text style={styles.chatName}>{otherMember?.name || 'Unknown User'}</Text>
        {item.lastMessage && (
          <>
            <Text style={styles.lastMessage}>{item.lastMessage.content || 'No message yet'}</Text>
            <Text style={styles.lastMessageTime}>
              {new Date(item.lastMessage.createdAt).toLocaleString()}
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
  searchInput: { height: 40, borderColor: '#ccc', borderWidth: 1, borderRadius: 5, marginBottom: 10, paddingHorizontal: 10 },
  chatItem: { padding: 15, backgroundColor: '#f9f9f9', marginBottom: 5, borderRadius: 5 },
  chatName: { fontWeight: 'bold', fontSize: 16 },
  lastMessage: { fontSize: 14, color: '#555' },
  lastMessageTime: { fontSize: 12, color: '#999', marginTop: 5 },
  userItem: { padding: 15, backgroundColor: '#f0f0f0', marginBottom: 5, borderRadius: 5 },
  userName: { fontWeight: 'bold', fontSize: 16 },
});

export default ChatsListScreen;
