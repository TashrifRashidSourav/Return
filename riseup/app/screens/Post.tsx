import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  TextInput,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

interface Post {
  _id: string;
  text: string;
  imageUrl?: string;
  userId: {
    _id: string;
    name: string;
  };
  likes: string[];
  createdAt: string;
}

interface Quote {
  _id: string;
  text: string;
  author: string;
}

const PostScreen = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [motivation, setMotivation] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [newText, setNewText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLiking, setIsLiking] = useState<string | null>(null);

  const navigation = useNavigation();

  const getToken = async () => {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      Alert.alert('Error', 'No token found, please login again.');
      return null;
    }
    return token;
  };

  const fetchCurrentUser = async () => {
    const token = await getToken();
    if (!token) return;

    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      setCurrentUserId(tokenData.id);
    } catch (error) {
      Alert.alert('Error', 'Failed to get user information.');
    }
  };

  const fetchMotivation = async () => {
    const token = await getToken();
    if (!token) return;

    try {
      const response = await fetch(`http://192.168.0.110:5000/api/quotes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setMotivation(data[0]);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch motivation.');
    }
  };

  const fetchPosts = async (page: number) => {
    const token = await getToken();
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(`http://192.168.0.110:5000/api/posts?page=${page}&limit=10`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setPosts(page === 1 ? data.posts : [...posts, ...data.posts]);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch posts.');
    } finally {
      setLoading(false);
    }
  };

  const likePost = async (postId: string) => {
    if (isLiking) return;

    setIsLiking(postId);

    const token = await getToken();
    if (!token) {
      setIsLiking(null);
      return;
    }

    const postIndex = posts.findIndex((post) => post._id === postId);
    const post = posts[postIndex];

    if (!post) {
      setIsLiking(null);
      return;
    }

    const isLiked = post.likes.includes(currentUserId || '');
    const updatedLikes = isLiked
      ? post.likes.filter((id) => id !== currentUserId)
      : [...post.likes, currentUserId || ''];

    const updatedPosts = [...posts];
    updatedPosts[postIndex] = { ...post, likes: updatedLikes };
    setPosts(updatedPosts);

    try {
      const response = await fetch(`http://192.168.0.110:5000/api/posts/like/${postId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      const syncedPosts = [...posts];
      syncedPosts[postIndex] = { ...post, likes: data.likes };
      setPosts(syncedPosts);
    } catch (error) {
      Alert.alert('Error', 'Failed to like/unlike post.');

      const revertedPosts = [...posts];
      revertedPosts[postIndex] = post;
      setPosts(revertedPosts);
    } finally {
      setIsLiking(null);
    }
  };

  const deletePost = async (postId: string) => {
    const token = await getToken();
    if (!token) return;

    try {
      const response = await fetch(`http://192.168.0.110:5000/api/posts/delete/${postId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
      }

      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
      Alert.alert('Success', 'Post deleted successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete post.');
    }
  };

  const editPost = async () => {
    if (!editingPost) return;

    const token = await getToken();
    if (!token) return;

    try {
      const response = await fetch(`http://192.168.0.110:5000/api/posts/update/${editingPost._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: newText }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === editingPost._id ? { ...post, text: newText } : post
        )
      );

      setIsEditing(false);
      setEditingPost(null);
      setNewText('');
      Alert.alert('Success', 'Post updated successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to edit post.');
    }
  };

  const loadMorePosts = () => {
    if (currentPage < totalPages) {
      fetchPosts(currentPage + 1);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchMotivation();
    fetchPosts(1);
  }, []);

  const renderPost = ({ item }: { item: Post }) => (
    <View style={styles.postContainer}>
      <View style={styles.userInfo}>
        <View style={styles.avatarContainer}>
          <Image
            style={styles.avatar}
            source={{ uri: 'https://via.placeholder.com/50' }}
          />
        </View>
        <View style={styles.userNameSection}>
          <Text style={styles.userName}>{item.userId.name || 'Anonymous'}</Text>
          <Text style={styles.postDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
      </View>
      <Text style={styles.postText}>{item.text}</Text>
      {item.imageUrl && (
        <Image
          source={{ uri: `http://192.168.0.110:5000${item.imageUrl}` }}
          style={styles.postImage}
        />
      )}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.likeButton}
          onPress={() => likePost(item._id)}
          disabled={isLiking === item._id}
        >
          <Text style={styles.likeText}>
            {item.likes.includes(currentUserId || '') ? 'Unlike' : 'Like'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.likeCount}>{item.likes.length} Likes</Text>
        {item.userId._id === currentUserId && (
          <>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => {
                setEditingPost(item);
                setNewText(item.text || '');
                setIsEditing(true);
              }}
            >
              <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deletePost(item._id)}
            >
              <Text style={styles.actionText}>Delete</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>RiseUP</Text>
      </View>
      {motivation && (
        <View style={styles.motivationSection}>
          <Text style={styles.motivationText}>{motivation.text}</Text>
          <Text style={styles.motivationAuthor}>- {motivation.author}</Text>
        </View>
      )}
      {loading && <ActivityIndicator size="large" color="#4CAF50" />}
      {!loading && (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item._id}
          onEndReached={loadMorePosts}
          onEndReachedThreshold={0.5}
        />
      )}
      <Modal visible={isEditing} animationType="slide" transparent={false}>
        <View style={styles.modalContainer}>
          <TextInput
            style={styles.input}
            value={newText}
            onChangeText={setNewText}
            multiline
            placeholder="Edit your post"
          />
          <TouchableOpacity style={styles.saveButton} onPress={editPost}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              setIsEditing(false);
              setEditingPost(null);
              setNewText('');
            }}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 15,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  motivationSection: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
  },
  motivationText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  motivationAuthor: {
    fontSize: 16,
    color: '#777',
    marginTop: 5,
  },
  postContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarContainer: {
    marginRight: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ccc',
  },
  userNameSection: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  postDate: {
    fontSize: 12,
    color: '#999',
  },
  postText: {
    fontSize: 16,
    color: '#333',
    marginVertical: 10,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginVertical: 10,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  likeButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  likeText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  likeCount: {
    fontSize: 14,
    color: '#777',
  },
  editButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  deleteButton: {
    backgroundColor: '#F44336',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  input: {
    height: 100,
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 10,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#F44336',
    padding: 15,
    alignItems: 'center',
    borderRadius: 5,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

  export default PostScreen;