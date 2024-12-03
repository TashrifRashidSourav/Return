import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import axios from 'axios';

const UserProfile = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = 'YOUR_JWT_TOKEN'; // Get the JWT token from your app storage (e.g., AsyncStorage)
        const response = await axios.get('http://192.168.0.111:5000/api/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch user profile');
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>User Profile</Text>
      <Text>Name: {user.name}</Text>
      <Text>Email: {user.email}</Text>
      <Text>Created At: {new Date(user.createdAt).toLocaleDateString()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default UserProfile;
