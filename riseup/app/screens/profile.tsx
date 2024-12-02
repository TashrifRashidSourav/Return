import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useRouter } from 'expo-router';

const EditProfileScreen = () => {
  const router = useRouter();
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);

  const baseURL = 'http://10.15.17.245:5000/api'; // Adjust based on your server's URL.

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${baseURL}/profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Add any required auth headers here, e.g., Authorization: `Bearer ${token}`
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUsername(data.username);
          setEmail(data.email);
          setPhone(data.phone);
          setProfilePicture(data.profilePicture || null); // Adjust based on your API response
          setLoading(false);
        } else {
          Alert.alert('Error', 'Failed to fetch profile data');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        Alert.alert('Error', 'Could not fetch user profile');
      }
    };

    fetchProfile();
  }, []);

  const handleImagePicker = () => {
    launchImageLibrary(
      { mediaType: 'photo', quality: 1 },
      (response) => {
        if (response.didCancel) {
          Alert.alert('Cancelled', 'No image selected');
        } else if (response.errorCode) {
          Alert.alert('Error', response.errorMessage);
        } else if (response.assets && response.assets.length > 0) {
          const uri = response.assets[0]?.uri;
          setProfilePicture(uri ?? null); // Ensure URI is set or null
        } else {
          Alert.alert('Error', 'No image found');
        }
      }
    );
  };

  const handleUpdate = async () => {
    const formData = new FormData();

    // If profilePicture exists, append it as a file
    if (profilePicture) {
      // formData.append('profilePicture', {
      //   uri: profilePicture,
      //   name: 'profilePicture.jpg',
      //   type: 'image/jpeg',
      // });
    }
    
    // Append other form data (username, email, etc.)
    formData.append('username', username);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('password', password);

    try {
      const response = await fetch(`${baseURL}/profile/update`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          // Add any required auth headers here, e.g., Authorization: `Bearer ${token}`
        },
      });

      if (response.ok) {
        Alert.alert('Profile Updated', 'Your changes have been saved successfully.');
        router.push('/profile'); // Redirect to profile page after successful update.
      } else {
        Alert.alert('Error', 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Could not update profile');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Edit Profile</Text>
      </View>
      <TouchableOpacity onPress={handleImagePicker} style={styles.imageContainer}>
        <Image
          source={
            profilePicture
              ? { uri: profilePicture }
              : require('../../assets/default-profile.png') // Placeholder if no picture
          }
          style={styles.profileImage}
        />
        <Text style={styles.changePictureText}>Change Picture</Text>
      </TouchableOpacity>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Username"
        />
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="Phone Number"
          keyboardType="phone-pad"
        />
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
        />
        <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
          <Text style={styles.updateButtonText}>Update</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#FF6B6B',
    width: '100%',
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerText: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  imageContainer: {
    marginTop: -50,
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFF',
  },
  changePictureText: {
    marginTop: 10,
    color: '#555',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  form: {
    width: '90%',
    marginTop: 20,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 15,
    fontSize: 16,
  },
  updateButton: {
    backgroundColor: '#000',
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default EditProfileScreen;
