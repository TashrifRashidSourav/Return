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
    _id: string;
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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

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
    } catch (error: any) {
      Alert.alert('Error', 'Failed to get user information');
    }
  };

  const fetchPosts = async (page: number) => {
    const token = await getToken();
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(`http://192.168.0.110:5000/posts?page=${page}&limit=10`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setPosts(page === 1 ? data.posts : [...posts, ...data.posts]);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to fetch posts.');
    } finally {
      setLoading(false);
    }
  };

  const likePost = async (postId: string) => {
    const token = await getToken();
    if (!token) return;

    try {
      const response = await fetch(`http://192.168.0.110:5000/posts/like/${postId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setPosts(prevPosts =>
        prevPosts.map(post =>
          post._id === postId ? { ...post, likes: data.likes } : post
        )
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to like/unlike post.');
    }
  };

  const editPost = async () => {
    if (!editingPost) return;

    const token = await getToken();
    if (!token) return;

    try {
      const response = await fetch(`http://192.168.0.110:5000/posts/update/${editingPost._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: newText }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setPosts(prevPosts =>
        prevPosts.map(post =>
          post._id === editingPost._id ? { ...post, text: newText } : post
        )
      );

      setIsEditing(false);
      setEditingPost(null);
      setNewText('');
      Alert.alert('Success', 'Post updated successfully.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to edit post.');
    }
  };

  const deletePost = async (postId: string) => {
    const token = await getToken();
    if (!token) return;

    try {
      const response = await fetch(`http://192.168.0.110:5000/posts/delete/${postId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
      Alert.alert('Success', 'Post deleted successfully.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to delete post.');
    }
  };

  const loadMorePosts = () => {
    if (currentPage < totalPages) {
      fetchPosts(currentPage + 1);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchPosts(1);
  }, []);

  const renderPost = ({ item }: { item: Post }) => (
    <View style={styles.postContainer}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.userId.name || 'Anonymous'}</Text>
        <Text style={styles.postDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <Text style={styles.postText}>{item.text}</Text>
      {item.imageUrl && (
        <Image source={{ uri: `http://192.168.0.110:5000${item.imageUrl}` }} style={styles.postImage} />
      )}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.likeButton}
          onPress={() => likePost(item._id)}
        >
          <Text style={styles.likeButtonText}>
            {item.likes.includes(currentUserId || '') ? 'Unlike' : 'Like'} ({item.likes.length})
          </Text>
        </TouchableOpacity>
        {item.userId._id === currentUserId && (
          <View style={styles.ownerActions}>
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
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => 
                Alert.alert(
                  'Delete Post',
                  'Are you sure you want to delete this post?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', onPress: () => deletePost(item._id), style: 'destructive' }
                  ]
                )
              }
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
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
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item._id}
        onEndReached={loadMorePosts}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading ? <ActivityIndicator size="small" color="#007BFF" /> : null
        }
        refreshing={loading}
        onRefresh={() => fetchPosts(1)}
      />
      <Modal visible={isEditing} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Post</Text>
            <TextInput
              style={styles.textInput}
              value={newText}
              onChangeText={setNewText}
              multiline
              placeholder="Edit your post..."
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsEditing(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={editPost}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5'
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  postContainer: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    marginVertical: 4,
    marginHorizontal: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  postDate: {
    fontSize: 12,
    color: '#666'
  },
  postText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
    lineHeight: 20
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10
  },
  ownerActions: {
    flexDirection: 'row',
    gap: 8
  },
  likeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#007BFF',
    borderRadius: 6
  },
  likeButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500'
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFA500',
    borderRadius: 6
  },
  editButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500'
  },
  deleteButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FF4444',
    borderRadius: 6
  },
  deleteButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center'
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 14,
    color: '#333',
    backgroundColor: '#F8F8F8'
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center'
  },
  cancelButton: {
    backgroundColor: '#F5F5F5'
  },
  saveButton: {
    backgroundColor: '#007BFF'
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500'
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500'
  }
});

export default PostScreen;