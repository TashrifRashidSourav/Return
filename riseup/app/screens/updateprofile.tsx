import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';  // For accessing the stored JWT token
import { useRouter } from 'expo-router';

const UpdateProfileScreen = () => {
  const router = useRouter();

  // States to hold the updated user data
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Fetch the existing user profile on initial load (optional)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
          Alert.alert('Error', 'You are not logged in!');
          return;
        }

        const response = await fetch('http://192.168.0.107:5000/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const result = await response.json();
        if (response.ok) {
          setName(result.name || '');
          setEmail(result.email || '');
        } else {
          Alert.alert('Error', result.message || 'Failed to fetch profile');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch profile');
        console.error('Fetch Profile Error:', error);
      }
    };

    fetchProfile();
  }, []);

  // Handle updating profile
  const handleUpdateProfile = async () => {
    if (!name && !email && !password) {
      Alert.alert('Error', 'Please provide fields to update.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'You are not logged in!');
        return;
      }

      const response = await fetch('http://192.168.0.107:5000/update-profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email, password }),
      });

      const result = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Profile updated successfully!');
        // router.push('/profile');  // Navigate to profile or any other screen you want after success
      } else {
        Alert.alert('Error', result.message || 'Failed to update profile');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
      console.error('Update Profile Error:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#f9f9f9' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          <View style={styles.inputContainer}>
            <Text style={styles.title}>Update Profile</Text>

            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Name"
              placeholderTextColor="#6c757d"
            />

            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor="#6c757d"
            />

            <TextInput
              style={styles.input}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholder="New Password (Leave empty to keep the same)"
              placeholderTextColor="#6c757d"
            />

            <TouchableOpacity style={styles.updateButton} onPress={handleUpdateProfile}>
              <Text style={styles.updateButtonText}>UPDATE PROFILE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
  },
  inputContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    height: 50,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#000',
  },
  updateButton: {
    backgroundColor: '#28a745', // Green
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
    elevation: 2,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default UpdateProfileScreen;
