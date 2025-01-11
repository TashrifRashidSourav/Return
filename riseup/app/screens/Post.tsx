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
  const [isLiking, setIsLiking] = useState<string | null>(null);

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
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Error', 'Failed to get user information.');
      }
    }
  };

  const fetchPosts = async (page: number) => {
    const token = await getToken();
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(`http://10.10.201.145:5000/api/posts?page=${page}&limit=10`, {
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
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Error', 'Failed to fetch posts.');
      }
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
      const response = await fetch(`http://10.10.201.145:5000/api/posts/like/${postId}`, {
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
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Error', 'Failed to like/unlike post.');
      }

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
      const response = await fetch(`http://10.10.201.145:5000/api/posts/delete/${postId}`, {
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
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Error', 'Failed to delete post.');
      }
    }
  };

  const editPost = async () => {
    if (!editingPost) return;

    const token = await getToken();
    if (!token) return;

    try {
      const response = await fetch(`http://10.10.201.145:5000/api/posts/update/${editingPost._id}`, {
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
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Error', 'Failed to edit post.');
      }
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
        <Text style={styles.postDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
      <Text style={styles.postText}>{item.text}</Text>
      {item.imageUrl && (
        <Image
          source={{ uri: `http://10.10.201.145:5000${item.imageUrl}` }}
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
              <Text>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deletePost(item._id)}
            >
              <Text>Delete</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading && <ActivityIndicator size="large" />}
      {!loading && (
        <>
          <FlatList
            data={posts}
            renderItem={renderPost}
            keyExtractor={(item) => item._id}
            onEndReached={loadMorePosts}
            onEndReachedThreshold={0.5}
          />
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
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    paddingHorizontal: 15,
  },
  postContainer: {
    paddingBottom: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userName: {
    fontWeight: 'bold',
  },
  postDate: {
    color: '#777',
  },
  postText: {
    fontSize: 16,
    marginVertical: 10,
  },
  postImage: {
    width: '100%',
    height: 200,
    marginVertical: 10,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  likeButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
  },
  likeText: {
    color: '#fff',
  },
  likeCount: {
    marginLeft: 10,
    alignSelf: 'center',
    color: '#555',
  },
  editButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#FFC107',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  deleteButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#DC3545',
    borderRadius: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  saveButton: {
    padding: 10,
    backgroundColor: '#28A745',
    borderRadius: 5,
  },
  saveButtonText: {
    color: '#fff',
  },
  cancelButton: {
    padding: 10,
    backgroundColor: '#DC3545',
    borderRadius: 5,
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#fff',
  },
});

export default PostScreen;
