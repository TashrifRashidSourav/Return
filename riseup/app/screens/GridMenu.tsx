import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootParamList } from '../navigation/types'; // Adjust the path if needed

// Define RootNavigationProp
type RootNavigationProp = NavigationProp<RootParamList>;

type MenuItem = {
  title: string;
  icon: any; // Replace with `ImageSourcePropType` if importing local images
  route: keyof RootParamList; // Use the keys of RootParamList for type safety
};

const menuItems: MenuItem[] = [
  { title: 'Home', icon: require('../../assets/home.png'), route: 'Post' },
  { title: 'Profile', icon: require('../../assets/profile.png'), route: 'profile' },
  { title: 'Routine', icon: require('../../assets/calander.png'), route: 'habit/RoutineManagerScreen' },
  { title: 'Schedule', icon: require('../../assets/schedule.png'), route: 'habit/scheduleai' },
  { title: 'Post', icon: require('../../assets/create.png'), route: 'habit/postcreate' },
  { title: 'Donation', icon: require('../../assets/donation.png'), route: 'habit/donation' },
  { title: 'Music', icon: require('../../assets/music.png'), route:'habit/urnotalone'  },
  { title: 'Stories', icon: require('../../assets/books.png'), route: 'habit/StoryFeedScreen' },
  { title: 'counselling', icon: require('../../assets/counselling.png'), route: 'habit/VoiceCall' },
  { title: 'Books', icon: require('../../assets/bookslogo.png'), route: 'habit/pdf' },
];

export default function GridMenu() {
  const navigation = useNavigation<RootNavigationProp>(); // Typed navigation
  const [username, setUsername] = useState('');
  // Fetch user name from AsyncStorage
  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) return;

        const response = await fetch('http://192.168.0.106:5000/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setUsername(data.name);
        }
      } catch (error) {
        console.error('Failed to fetch username:', error);
      }
    };

    fetchUsername();
  }, []);

  const renderItem = ({ item }: { item: MenuItem }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => navigation.navigate(item.route)} // Type-safe navigation
    >
      <Image source={item.icon} style={styles.icon} />
      <Text style={styles.menuText}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.greetingText}>Hi! {username || 'User'}</Text>
      <FlatList
        data={menuItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.title}
        numColumns={3}
        contentContainerStyle={styles.grid}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 10,
    justifyContent: 'center',
  },
  greetingText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  grid: {
    justifyContent: 'center',
  },
  menuItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
  },
  icon: {
    width: 60,
    height: 60,
    marginBottom: 8,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
  },
});
