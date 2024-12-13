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
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Network from 'expo-network';
import AsyncStorage from '@react-native-async-storage/async-storage';  // Add AsyncStorage for token storage
import { MaterialIcons } from '@expo/vector-icons'; 
const LoginScreen = () => {
  const router = useRouter();
  const [baseURL, setBaseURL] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const fetchIPAddress = async () => {
      try {
        const ipAddress = await Network.getIpAddressAsync();
        console.log('Detected IP Address:', ipAddress);

        if (ipAddress) {
          const apiBase = `http://10.10.200.30:5000`;  // Use dynamic IP
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

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Email and password are required!');
      return;
    }

    try {
      const response = await fetch(`${baseURL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      if (response.ok) {
        await AsyncStorage.setItem('authToken', result.token);  // Store the JWT token
        Alert.alert('Success', 'Login successful!');
        router.push('../screens/profile'); // Redirect to profile or desired page
      } else {
        Alert.alert('Error', result.message || 'Invalid credentials.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to the server.');
      console.error('Login error:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#f9f9f9' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          {/* Logo Image at the top */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../images/icon.png')} 
              style={styles.logo}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.title}>Sign in your account</Text>

            <View style={styles.inputWrapper}>
              <MaterialIcons name="email" size={20} color="#6c757d" />
              <TextInput
                style={styles.input}
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                placeholderTextColor="#6c757d"
              />
            </View>

            <View style={styles.inputWrapper}>
              <MaterialIcons name="lock" size={20} color="#6c757d" />
              <TextInput
                style={styles.input}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor="#6c757d"
              />
            </View>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>SIGN IN</Text>
            </TouchableOpacity>

            <View style={styles.socialMediaContainer}>
              <TouchableOpacity style={styles.socialButton}>
                <Image
                  source={require('../../images/google.png')} // Replace with your Google icon
                  style={styles.socialIcon}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Image
                  source={require('../../images/facebook.png')} // Replace with your Facebook icon
                  style={styles.socialIcon}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Image
                  source={require('../../images/twitter.png')} // Replace with your Twitter icon
                  style={styles.socialIcon}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => router.push('/authentication/registration')}
            >
              <Text style={styles.registerLink}>
                Don't have an account? SIGN UP
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
  logoContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain', // Keep aspect ratio intact
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
  loginButton: {
    backgroundColor: '#28a745', // Green
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
    elevation: 2,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  socialMediaContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  socialButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  registerLink: {
    textAlign: 'center',
    marginTop: 20,
    color: '#007BFF',
    fontSize: 16,
  },
});

export default LoginScreen;
