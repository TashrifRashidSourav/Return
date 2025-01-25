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
  Image,
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

  const fetchChats = async () => {
    const token = await getToken();
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(`http://192.168.0.106:5000/chats`, {
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
        `http://192.168.0.106:5000/users/search?name=${encodeURIComponent(searchText.trim())}`,
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

  const startChat = async (userId: string) => {
    const token = await getToken();
    if (!token) return;

    try {
      const response = await fetch(`http://192.168.0.106:5000/chats/start`, {
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

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity style={styles.userItem} onPress={() => startChat(item._id)}>
      <View style={styles.userRow}>
        <View style={styles.avatarContainer}>
          <Image
            style={styles.userAvatar}
            source={{ uri: 'https://via.placeholder.com/50' }}
          />
          <View style={styles.statusDot} />
        </View>
        <Text style={styles.userName}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={searchUsers}
        />
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#41D3BD" />
      ) : searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item._id}
          renderItem={renderUserItem}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <Text style={styles.noDataText}>No users found.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9F9',
  },
  searchContainer: {
    padding: 10,
    paddingTop: 20,
    backgroundColor: '#41D3BD',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  searchInput: {
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 3,
  },
  listContainer: {
    padding: 10,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 3,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 10,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ccc',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#41D3BD',
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#555',
  },
});

export default ChatsListScreen;
