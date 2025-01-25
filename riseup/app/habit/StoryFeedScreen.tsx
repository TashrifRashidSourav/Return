import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';

interface Story {
  _id: string;
  title: string;
  author: {
    name: string;
    email: string;
  } | null;
  content: string;
  likes: number;
}

const StoryFeedScreen: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await axios.get('http://192.168.0.106:5000/api/stories');
        setStories(response.data);
      } catch (err) {
        console.error('Failed to fetch stories:', err);
        setError('Failed to load stories. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  const goToStoryDetail = (storyId: string) => {
    if (storyId) {
      router.push(`/habit/StoryDetailScreen?storyId=${storyId}`);
    } else {
      console.error('Story ID is missing!');
    }
  };

  const renderItem = ({ item }: { item: Story }) => (
    <TouchableOpacity
      style={styles.storyCard}
      onPress={() => goToStoryDetail(item._id)}
    >
      <Text style={styles.storyTitle}>{item.title}</Text>
      <Text style={styles.storyAuthor}>by {item.author?.name || 'Unknown Author'}</Text>
      <Text style={styles.storyPreview}>{item.content.slice(0, 50)}...</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#388e3c" />
        <Text style={styles.loadingText}>Loading stories...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={stories}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: '#f7f7f7',
  },
  storyCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  storyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#388e3c',
  },
  storyAuthor: {
    fontSize: 14,
    color: '#6a6a6a',
    marginVertical: 5,
  },
  storyPreview: {
    fontSize: 16,
    color: '#333',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
});

export default StoryFeedScreen;
