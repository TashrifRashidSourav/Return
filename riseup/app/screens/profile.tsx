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

const SERVER_URL = 'http://192.168.0.106:5000';

const EditProfileScreen = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
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
      setPhoneNumber(data.phoneNumber || '');
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
      if (phoneNumber.trim()) formData.append('phoneNumber', phoneNumber.trim());
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <Text style={styles.currentName}>Current Name: {username}</Text>
      </View>
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
        <Text style={styles.changePictureText}>Change Picture</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Enter username"
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter email"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
        />

        <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
          <Text style={styles.updateButtonText}>Update Profile</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F4F4' },
  contentContainer: { alignItems: 'center', paddingBottom: 20 },
  header: {
    height: 200,
    backgroundColor: '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold' },
  currentName: { color: '#FFFFFF', fontSize: 16, marginTop: 10 },
  profilePictureContainer: { marginTop: -70, alignItems: 'center' },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  changePictureText: { marginTop: 10, fontSize: 16, color: '#007BFF' },
  form: { width: '90%', marginTop: 20 },
  label: { fontSize: 16, marginBottom: 5, color: '#333333', fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
    fontSize: 16,
  },
  updateButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  updateButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
});

export default EditProfileScreen;
