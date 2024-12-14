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

const EditProfileScreen = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch user profile data
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'No token found, please login again.');
        return;
      }

      const response = await fetch('http://192.168.0.108:5000/profile', {
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
      setProfilePicture(data.profilePicture || null);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  };

  // Change profile picture
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

  // Update profile
  const handleUpdate = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'No token found, please login again.');
        return;
      }

      const formData = new FormData();
      formData.append('name', username.trim());
      formData.append('email', email.trim());
      formData.append('phoneNumber', phoneNumber.trim());

      if (profilePicture) {
        formData.append('profilePicture', {
          uri: profilePicture,
          name: 'profile.jpg',
          type: 'image/jpeg',
        } as any);
      }

      const response = await fetch('http://10.10.200.30:5000', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update profile');
      }

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
      <View style={styles.header} />
      <View style={styles.profilePictureContainer}>
        <TouchableOpacity onPress={handleChangePicture}>
          <Image
            // source={
            //   profilePicture ? { uri: profilePicture } : require('./assets/default-profile.png')
            // }
            // style={styles.profilePicture}
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
          <Text style={styles.updateButtonText}>Update</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  contentContainer: { alignItems: 'center' },
  header: { height: 150, width: '100%', backgroundColor: '#FF7466' },
  profilePictureContainer: { marginTop: -75, alignItems: 'center' },
  profilePicture: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#FFFFFF' },
  changePictureText: { marginTop: 8, fontSize: 14, color: '#007BFF' },
  form: { width: '90%', marginTop: 20 },
  label: { fontSize: 16, marginBottom: 8, color: '#333333' },
  input: { borderWidth: 1, borderColor: '#CCCCCC', borderRadius: 8, padding: 10, marginBottom: 20, backgroundColor: '#F9F9F9' },
  updateButton: { backgroundColor: '#007BFF', paddingVertical: 15, borderRadius: 8, alignItems: 'center' },
  updateButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9f9f9' },
});

export default EditProfileScreen;
