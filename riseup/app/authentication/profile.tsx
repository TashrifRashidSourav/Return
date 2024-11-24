import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Platform,
} from 'react-native';
import * as ImagePicker from 'react-native-image-picker';

const EditProfileScreen = () => {
  const [username, setUsername] = useState('yANCHUI');
  const [email, setEmail] = useState('yanchui@gmail.com');
  const [phone, setPhone] = useState('+14987889999');
  const [password, setPassword] = useState('evFTbyVVCd');
  const [profileImage, setProfileImage] = useState(null);

  // Function to pick an image
  const selectImage = () => {
    ImagePicker.launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 1,
      },
      (response) => {
        if (response.didCancel) {
          Alert.alert('Cancelled', 'No image selected');
        } else if (response.errorCode) {
          Alert.alert('Error', response.errorMessage || 'Unknown error');
        } else if (response.assets && response.assets.length > 0) {
          // setProfileImage(response.assets[0].uri);
        }
      }
    );
  };

  const handleUpdate = () => {
    Alert.alert('Profile Updated', `Username: ${username}\nEmail: ${email}`);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Edit Profile</Text>
      </View>

      {/* Profile Picture */}
      <View style={styles.profileSection}>
        <TouchableOpacity onPress={selectImage}>
          <Image
            // source={
            //   profileImage
            //     ? { uri: profileImage }
            //     : require('../../images/google') // Replace with a default image in your project
            // }
            style={styles.profileImage}
          />
        </TouchableOpacity>
        <Text style={styles.changePictureText}>Change Picture</Text>
      </View>

      {/* Form Fields */}
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Username"
          placeholderTextColor="#888"
        />
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email Id"
          placeholderTextColor="#888"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="Phone Number"
          placeholderTextColor="#888"
          keyboardType="phone-pad"
        />
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="#888"
          secureTextEntry
        />
      </View>

      {/* Update Button */}
      <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
        <Text style={styles.updateButtonText}>Update</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    backgroundColor: '#FF6F61',
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileSection: {
    alignItems: 'center',
    marginTop: -50,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFF',
  },
  changePictureText: {
    color: '#888',
    fontSize: 14,
    marginTop: 10,
  },
  form: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#FFF',
    color: '#333',
  },
  updateButton: {
    backgroundColor: '#000',
    marginHorizontal: 20,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  updateButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditProfileScreen;
