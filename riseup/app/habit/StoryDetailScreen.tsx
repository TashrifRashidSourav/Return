import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootParamList } from '../navigation/types'; // Ensure the path to your RootParamList is correct
import axios from 'axios';

type StoryDetailRouteProp = RouteProp<RootParamList, 'StoryDetail'>;

const StoryDetailScreen: React.FC = () => {
  const route = useRoute<StoryDetailRouteProp>();
  const [story, setStory] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const storyId = route.params?.storyId;

  useEffect(() => {
    const fetchStory = async () => {
      try {
        if (!storyId) {
          console.error('No storyId provided');
          return;
        }
        const response = await axios.get(`http://10.10.200.209:5000/api/stories/${storyId}`);
        setStory(response.data);
      } catch (error) {
        console.error('Failed to fetch story:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [storyId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#388e3c" />
        <Text style={styles.loadingText}>Loading story...</Text>
      </View>
    );
  }

  if (!story) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Story not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{story.title}</Text>
      <Text style={styles.author}>by {story.author?.name || 'Unknown Author'}</Text>
      <Text style={styles.content}>{story.content}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#388e3c',
    marginBottom: 10,
  },
  author: {
    fontSize: 16,
    color: '#6a6a6a',
    marginBottom: 20,
  },
  content: {
    fontSize: 18,
    lineHeight: 24,
    color: '#333',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
});

export default StoryDetailScreen;
