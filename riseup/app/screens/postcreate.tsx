import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CreatePostScreen = () => {
  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getToken = async () => {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      Alert.alert('Error', 'No token found, please login again.');
      return null;
    }
    return token;
  };

  const createPost = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    const token = await getToken();
    if (!token || !text) {
      setIsSubmitting(false);
      return Alert.alert('Error', 'Text is required to post');
    }

    const newPost = { text, imageUrl };

    try {
      const response = await fetch('http://192.168.0.109:5000/posts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newPost),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setText('');
      setImageUrl('');
      Alert.alert('Success', 'Post created successfully');
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message || 'Failed to create post');
      } else {
        Alert.alert('Error', 'An unknown error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="What's on your mind?"
        multiline
      />
      <TextInput
        style={styles.input}
        value={imageUrl}
        onChangeText={setImageUrl}
        placeholder="Image URL (optional)"
      />
      <TouchableOpacity
        style={styles.saveButton}
        onPress={createPost}
        disabled={isSubmitting}>
        {isSubmitting ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Create Post</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    paddingHorizontal: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
  saveButton: {
    backgroundColor: '#00f',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
  },
});

export default CreatePostScreen;
