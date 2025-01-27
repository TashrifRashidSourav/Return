import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const SERVER_URL = 'http://10.10.200.209:5000';

const PostCreateScreen = () => {
  const [text, setText] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [editingPost, setEditingPost] = useState<string | null>(null);

  // Fetch token
  const getToken = async (): Promise<string | null> => {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      Alert.alert('Error', 'No token found. Please log in again.');
      return null;
    }
    return token;
  };

  // Fetch user-specific posts
  const fetchPosts = async () => {
    setLoading(true);
    const token = await getToken();
    if (!token) return;

    try {
      const response = await fetch(`${SERVER_URL}/api/posts/my-posts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setPosts(data); // Assuming backend returns an array of posts
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load posts.');
    } finally {
      setLoading(false);
    }
  };

  // Handle image selection
  const handleSelectImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Denied', 'You need to allow access to your gallery.');
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!pickerResult.canceled && pickerResult.assets.length > 0) {
      setImage(pickerResult.assets[0].uri);
    }
  };

  // Create or update post
  const handleCreateOrUpdatePost = async () => {
    if (!text.trim() && !image) {
      Alert.alert('Error', 'Please add some text or an image.');
      return;
    }

    setLoading(true);

    try {
      const token = await getToken();
      if (!token) return;

      const formData = new FormData();
      formData.append('text', text.trim());
      if (image) {
        const filename = image.split('/').pop(); // Extract file name
        const fileType = image.substring(image.lastIndexOf('.') + 1); // Extract file type
        formData.append('image', {
          uri: image,
          name: filename || `image_${Date.now()}.jpg`,
          type: `image/${fileType}`, // Dynamically set MIME type
        } as any);
      }

      console.log('FormData before sending:', Array.from(formData.entries())); // Debugging FormData

      const url = editingPost
        ? `${SERVER_URL}/api/posts/update/${editingPost}`
        : `${SERVER_URL}/api/posts/create`;

      const method = editingPost ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      Alert.alert('Success', editingPost ? 'Post updated successfully!' : 'Post created successfully!');
      setText('');
      setImage(null);
      setEditingPost(null);
      fetchPosts();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to process post.');
    } finally {
      setLoading(false);
    }
  };

  // Delete post
  const handleDeletePost = async (postId: string) => {
    setLoading(true);

    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetch(`${SERVER_URL}/api/posts/delete/${postId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
      }

      Alert.alert('Success', 'Post deleted successfully!');
      fetchPosts();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to delete post.');
    } finally {
      setLoading(false);
    }
  };

  // Edit post
  const handleEditPost = (post: any) => {
    setText(post.text);
    setImage(post.imageUrl ? `${SERVER_URL}${post.imageUrl}` : null);
    setEditingPost(post._id);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.header}>{editingPost ? 'Edit Post' : 'Create a New Post'}</Text>

      {/* Text Input */}
      <TextInput
        style={styles.input}
        placeholder="What's on your mind?"
        value={text}
        onChangeText={setText}
        multiline
      />

      {/* Image Preview */}
      {image && <Image source={{ uri: image }} style={styles.imagePreview} />}

      {/* Select Image Button */}
      <TouchableOpacity style={styles.imageButton} onPress={handleSelectImage}>
        <Text style={styles.imageButtonText}>{image ? 'Change Image' : 'Add Image'}</Text>
      </TouchableOpacity>

      {/* Create/Update Post Button */}
      <TouchableOpacity style={styles.createButton} onPress={handleCreateOrUpdatePost}>
        <Text style={styles.createButtonText}>{editingPost ? 'Update Post' : 'Post'}</Text>
      </TouchableOpacity>

      {/* Posts Section */}
      <Text style={styles.subHeader}>Your Posts</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : (
        posts.map((post) => (
          <View key={post._id} style={styles.post}>
            <Text style={styles.postText}>{post.text}</Text>
            {post.imageUrl && (
              <Image source={{ uri: `${SERVER_URL}${post.imageUrl}` }} style={styles.postImage} />
            )}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.editButton} onPress={() => handleEditPost(post)}>
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeletePost(post._id)}>
                <Text style={styles.actionText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F0F0' },
  contentContainer: { padding: 16 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  subHeader: { fontSize: 18, fontWeight: 'bold', marginTop: 24, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  imagePreview: { width: '100%', height: 200, marginBottom: 16, borderRadius: 8 },
  imageButton: { backgroundColor: '#007BFF', padding: 12, borderRadius: 8, marginBottom: 16, alignItems: 'center' },
  imageButtonText: { color: '#FFFFFF', fontWeight: 'bold' },
  createButton: { backgroundColor: '#28A745', padding: 12, borderRadius: 8, alignItems: 'center' },
  createButtonText: { color: '#FFFFFF', fontWeight: 'bold' },
  post: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 8, marginBottom: 16 },
  postText: { fontSize: 16, marginBottom: 8 },
  postImage: { width: '100%', height: 200, borderRadius: 8 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  editButton: { backgroundColor: '#FFC107', padding: 8, borderRadius: 5 },
  deleteButton: { backgroundColor: '#DC3545', padding: 8, borderRadius: 5 },
  actionText: { color: '#FFFFFF', fontWeight: 'bold' },
});

export default PostCreateScreen;
