import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Network from 'expo-network';

const RegistrationScreen = () => {
  const router = useRouter();
  const [baseURL, setBaseURL] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const fetchIPAddress = async () => {
      try {
        const ipAddress = await Network.getIpAddressAsync();
        console.log('Detected IP Address:', ipAddress);

        if (ipAddress) {
          const apiBase = `http://localhost:5000/api`; // Replace with dynamic assignment if required
          setBaseURL(apiBase);
        } else {
          Alert.alert('Error', 'Unable to fetch IP address.');
        }
      } catch (error) {
        console.error('Error fetching IP address:', error);
        Alert.alert('Error', 'Failed to fetch the IP address.');
      }
    };

    fetchIPAddress();
  }, []);

  const handleRegistration = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'All fields are required!');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match!');
      return;
    }

    try {
      const response = await fetch(`${baseURL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const result = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Registration successful!');
        router.push('/authentication/login'); // Redirect to the login screen
      } else {
        Alert.alert('Error', result.message || 'Registration failed.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to the server.');
      console.error('Registration error:', error);
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
            <View style={styles.inputWrapper}>
              <MaterialIcons name="person" size={20} color="#6c757d" />
              <TextInput
                style={styles.input}
                placeholder="Name"
                placeholderTextColor="#6c757d"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputWrapper}>
              <MaterialIcons name="email" size={20} color="#6c757d" />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#6c757d"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputWrapper}>
              <MaterialIcons name="lock" size={20} color="#6c757d" />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#6c757d"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <View style={styles.inputWrapper}>
              <MaterialIcons name="lock" size={20} color="#6c757d" />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#6c757d"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegistration}
            >
              <Text style={styles.registerButtonText}>REGISTER</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/authentication/login')}
            >
              <Text style={styles.loginLink}>
                Already have an account? Login
              </Text>
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#000',
  },
  registerButton: {
    backgroundColor: '#007BFF',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
    elevation: 2,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginLink: {
    textAlign: 'center',
    marginTop: 20,
    color: '#007BFF',
    fontSize: 16,
  },
});

export default RegistrationScreen;
