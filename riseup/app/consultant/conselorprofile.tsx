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

const EditProfileScreen = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch user profile
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'No token found, please login again.');
        return;
      }

      const response = await fetch(`${SERVER_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch profile data');
      }

      const data = await response.json();
      setUsername(data.name);
      setEmail(data.email);
      setProfilePicture(data.profilePicture ? data.profilePicture : null);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  };

  // Handle changing profile picture
  const handleChangePicture = async () => {
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
      setProfilePicture(pickerResult.assets[0].uri);
    }
  };

  // Handle updating profile
  const handleUpdate = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'No token found, please login again.');
        return;
      }

      const formData = new FormData();
      if (username.trim()) formData.append('name', username.trim());
      if (email.trim()) formData.append('email', email.trim());
      if (profilePicture) {
        formData.append('profilePicture', {
          uri: profilePicture,
          name: `profile-${Date.now()}.jpg`,
          type: 'image/jpeg',
        } as any);
      }

      const response = await fetch(`${SERVER_URL}/profile/update`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const result = await response.json();
      setUsername(result.user.name);
      setEmail(result.user.email);
      setProfilePicture(result.user.profilePicture || null);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.profilePictureContainer}>
        <TouchableOpacity onPress={handleChangePicture}>
          <Image
            source={
              profilePicture
                ? { uri: profilePicture }
                : require('../../assets/default-profile.png')
            }
            style={styles.profilePicture}
          />
        </TouchableOpacity>
        <Text style={styles.username}>{username}</Text>
        <Text style={styles.email}>{email}</Text>
        <TouchableOpacity onPress={handleChangePicture}>
          <Text style={styles.changePictureText}>Change Profile Picture</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Enter username"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter email"
          keyboardType="email-address"
          placeholderTextColor="#999"
        />

        <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
          <Text style={styles.updateButtonText}>Update Profile</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  contentContainer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  profilePictureContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#007BFF',
  },
  username: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  changePictureText: {
    marginTop: 10,
    fontSize: 16,
    color: '#007BFF',
    textDecorationLine: 'underline',
  },
  form: {
    width: '90%',
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333333',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
    fontSize: 16,
    color: '#333333',
  },
  updateButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});

export default EditProfileScreen;
