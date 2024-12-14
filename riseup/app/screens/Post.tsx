import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, TextInput, Button, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Post {
  _id: string;
  user?: {
    name?: string;
    email?: string;
  };
  text: string;
  imageUrl?: string;
  likes: string[];
  createdAt: string;
  updatedAt: string;
}

const PostScreen = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostText, setNewPostText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [baseURL, setBaseURL] = useState('http://192.168.0.108:5000'); // Base URL for API
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1); // For pagination
  const [hasMore, setHasMore] = useState(true); // To check if there are more posts to load

  useEffect(() => {
    const fetchTokenAndPosts = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('authToken');
        if (storedToken) {
          setToken(storedToken);
          await fetchPosts(storedToken, 1); // Fetch the first page of posts
        } else {
          console.warn('No token found, please login again.');
          Alert.alert('Error', 'You are not logged in. Please log in again.');
        }
      } catch (error) {
        console.error('Error retrieving token:', error);
      }
    };

    fetchTokenAndPosts();
  }, []);

  // Fetch posts from API with pagination
  const fetchPosts = async (storedToken: string, pageNumber: number) => {
    if (loading) return; // Prevent multiple requests at once

    setLoading(true);
    try {
      const response = await axios.get<{ posts: Post[]; total: number }>(
        `${baseURL}/posts/`,
        {
          headers: { Authorization: `Bearer ${storedToken}` },
          params: { page: pageNumber, limit: 10 }, // Pagination params
        }
      );

      if (response.data.posts.length < 10) {
        setHasMore(false); // No more posts to load
      }

      setPosts((prevPosts) => (pageNumber === 1 ? response.data.posts : [...prevPosts, ...response.data.posts]));
      setPage(pageNumber); // Update page
    } catch (error) {
      console.error('Error fetching posts:', error);
      Alert.alert('Error', 'Failed to fetch posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Like a post
  const likePost = async (postId: string) => {
    if (!token) {
      console.warn('No token available, please login.');
      Alert.alert('Error', 'You are not logged in. Please log in again.');
      return;
    }

    try {
      await axios.put(
        `${baseURL}/posts/like/${postId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPosts(token, page); // Refresh posts to update likes
    } catch (error) {
      console.error('Error liking post:', error);
      Alert.alert('Error', 'Failed to like post. Please try again.');
    }
  };

  // Create a new post
  const createPost = async () => {
    if (!token) {
      Alert.alert('Error', 'You are not logged in. Please log in again.');
      return;
    }

    try {
      const newPost = {
        text: newPostText,
        imageUrl: imageUrl,
      };
      await axios.post(`${baseURL}/posts/create`, newPost, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewPostText('');
      setImageUrl('');
      fetchPosts(token, 1); // Refresh posts list
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    }
  };

  // Load more posts when scrolled to the end
  const loadMorePosts = () => {
    if (token && hasMore) { // Check if token is not null
      fetchPosts(token, page + 1); // Fetch the next page
    } else {
      console.warn('No token available, please login.');
      Alert.alert('Error', 'You are not logged in. Please log in again.');
    }
  };
  // Render a single post
  const renderPost = ({ item }: { item: Post }) => (
    <View style={styles.postContainer}>
      <Text style={styles.postUser}>
        {item.user?.name ? item.user.name : 'Anonymous'}
      </Text>
      <Text style={styles.postText}>{item.text}</Text>
      {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.postImage} />}
      <Text style={styles.postDate}>{new Date(item.createdAt).toLocaleString()}</Text>
      <TouchableOpacity onPress={() => likePost(item._id)} style={styles.likeButton}>
        <Text>👍 {item.likes.length}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="What's on your mind?"
        value={newPostText}
        onChangeText={setNewPostText}
      />
      <TextInput
        style={styles.input}
        placeholder="Image URL (optional)"
        value={imageUrl}
        onChangeText={setImageUrl}
      />
      <Button title="Post" onPress={createPost} />

      {loading && <ActivityIndicator size="large" color="#0000ff" style={styles.loading} />}
      
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.postsList}
        onEndReached={loadMorePosts} // Trigger when reaching the end
        onEndReachedThreshold={0.5} // 50% of the list visible
      />

      {posts.length === 0 && !loading && <Text>No posts to display</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
    borderRadius: 5,
  },
  postsList: {
    marginTop: 20,
  },
  postContainer: {
    padding: 15,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  postUser: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  postText: {
    fontSize: 14,
    marginVertical: 5,
  },
  postImage: {
    width: '100%',
    height: 200,
    marginVertical: 10,
    resizeMode: 'cover',
  },
  postDate: {
    fontSize: 12,
    color: 'gray',
    marginBottom: 10,
  },
  likeButton: {
    padding: 5,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  loading: {
    marginTop: 20,
  },
});

export default PostScreen;
