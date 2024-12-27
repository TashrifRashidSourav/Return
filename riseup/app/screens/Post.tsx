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
  Button,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Post {
  _id: string;
  text: string;
  imageUrl?: string;
  userId: {
    name: string;
  };
  likes: string[];
  createdAt: string;
}

const PostScreen = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [newText, setNewText] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const fetchPosts = async (page: number) => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'No token found, please login again.');
        return;
      }

      const response = await fetch(`http://192.168.0.110:5000/posts?page=${page}&limit=10`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch posts');
      }

      setPosts(page === 1 ? data.posts : [...posts, ...data.posts]); // Append posts for infinite scroll
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      Alert.alert('Error', error.message || 'Failed to fetch posts.');
    } finally {
      setLoading(false);
    }
  };

  const likePost = async (postId: string) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'No token found, please login again.');
        return;
      }

      const response = await fetch(`http://192.168.0.110:5000/posts/like/${postId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to like/unlike post');
      }

      // Update the liked state in posts
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId ? { ...post, likes: data.likes } : post
        )
      );
    } catch (error: any) {
      console.error('Error liking/unliking post:', error);
      Alert.alert('Error', error.message || 'Failed to like/unlike post.');
    }
  };

  const editPost = async () => {
    if (!editingPost) return;

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'No token found, please login again.');
        return;
      }

      const response = await fetch(`http://192.168.0.110:5000/posts/update/${editingPost._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: newText }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to edit post');
      }

      // Update the post in the list
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === editingPost._id ? { ...post, text: newText } : post
        )
      );

      Alert.alert('Success', 'Post updated successfully.');
      setIsEditing(false);
      setEditingPost(null);
      setNewText('');
    } catch (error: any) {
      console.error('Error editing post:', error);
      Alert.alert('Error', error.message || 'Failed to edit post.');
    }
  };

  const loadMorePosts = () => {
    if (currentPage < totalPages) {
      fetchPosts(currentPage + 1); // Fetch next page
    }
  };

  useEffect(() => {
    fetchPosts(1); // Fetch the first page on mount
  }, []);

  const renderPost = ({ item }: { item: Post }) => (
    <View style={styles.postContainer}>
      {/* User Info */}
      <View style={styles.userInfo}>
        {/* <Image
          source={require('./assets/default-user.png')} // Replace with actual user profile picture if available
          style={styles.userImage}
        /> */}
        <Text style={styles.userName}>{item.userId.name || 'Anonymous'}</Text> {/* Display username */}
      </View>

      {/* Post Text */}
      <Text style={styles.postText}>{item.text}</Text>

      {/* Post Image (if exists) */}
      {item.imageUrl && (
        <Image source={{ uri: `http://192.168.0.110:5000${item.imageUrl}` }} style={styles.postImage} />
      )}

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        {/* Like Button */}
        <TouchableOpacity
          style={styles.likeButton}
          onPress={() => likePost(item._id)}
        >
          <Text style={styles.likeButtonText}>
            {item.likes.includes('userId') ? 'Unlike' : 'Like'} ({item.likes.length})
          </Text>
        </TouchableOpacity>

        {/* Edit Button */}
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            setEditingPost(item);
            setNewText(item.text);
            setIsEditing(true);
          }}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && currentPage === 1) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item._id}
        onEndReached={loadMorePosts}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading ? <ActivityIndicator size="small" color="#007BFF" /> : null
        }
      />

      {/* Edit Modal */}
      {isEditing && (
        <Modal visible={isEditing} animationType="slide">
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Edit Post</Text>
            <TextInput
              style={styles.textInput}
              value={newText}
              onChangeText={setNewText}
              multiline
              placeholder="Edit your post..."
            />
            <Button title="Save Changes" onPress={editPost} />
            <Button title="Cancel" onPress={() => setIsEditing(false)} color="red" />
          </View>
        </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  postContainer: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  userInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  userImage: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  postText: { fontSize: 14, color: '#555', marginBottom: 10 },
  postImage: { width: '100%', height: 200, borderRadius: 8, marginBottom: 10 },
  actionContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  likeButton: { padding: 10, backgroundColor: '#007BFF', borderRadius: 8 },
  likeButtonText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  editButton: { padding: 10, backgroundColor: '#FFA500', borderRadius: 8 },
  editButtonText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  modalContainer: { flex: 1, justifyContent: 'center', padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  textInput: { borderWidth: 1, borderColor: '#CCC', padding: 10, borderRadius: 5, marginBottom: 10, textAlignVertical: 'top' },
});

export default PostScreen;
