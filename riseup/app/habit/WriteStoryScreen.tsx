import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootParamList } from '../navigation/types'; // Adjust the path as needed

type NavigationProps = NativeStackNavigationProp<RootParamList, 'WriteStory'>;

const WriteStoryScreen: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [authorId, setAuthorId] = useState('63d2f8eacb5a1b0012a6f123'); // Example author ID
  const navigation = useNavigation<NavigationProps>();

  const handleSubmit = async () => {
    if (!title || !content) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }

    try {
      const response = await axios.post('http://192.168.0.106:5000/api/stories/create', {
        title,
        authorId,
        content,
      });

      // Navigate to the StoryDetail screen after successful submission
      navigation.navigate('StoryDetail', { storyId: response.data._id });

      Alert.alert('Success', 'Your story has been submitted!');
      setTitle('');
      setContent('');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit your story. Please try again.');
      console.error('Failed to create story:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Enter Story Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Story Title"
      />
      <Text style={styles.label}>Write Your Story</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={content}
        onChangeText={setContent}
        placeholder="Story Content"
        multiline
      />
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit Story</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  textArea: {
    height: 120,
  },
  submitButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WriteStoryScreen;
