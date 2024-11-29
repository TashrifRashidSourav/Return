import React, { useState } from 'react';
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

const EditProfileScreen = () => {
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [username, setUsername] = useState('yANCHUI');
  const [email, setEmail] = useState('yanchui@gmail.com');
  const [phone, setPhone] = useState('+14987889999');
  const [password, setPassword] = useState('evFTbyWVCd');

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
  
  const handleUpdate = () => {
    Alert.alert('Profile Updated', 'Your changes have been saved successfully.');
  };

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
              : require('../../assets/default-profile.png') // Add a placeholder image in the `assets` folder
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
          placeholder="Email I'd"
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
