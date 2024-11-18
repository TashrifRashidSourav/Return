import React from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';

const LoginScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../../images/icon.png')} style={styles.iconImage} />
        <Text style={styles.welcomeText}>Sign in your account</Text>
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <Icon name="email" size={20} color="#6c757d" />
          <TextInput
            placeholder="Email"
            style={styles.input}
            keyboardType="email-address"
            placeholderTextColor="#6c757d"
          />
        </View>

        <View style={styles.inputWrapper}>
          <Icon name="lock" size={20} color="#6c757d" />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#6c757d"
            secureTextEntry
          />
        </View>

        <TouchableOpacity>
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton}>
          <Text style={styles.loginButtonText}>Log in</Text>
        </TouchableOpacity>

        <Text style={styles.orText}>or sign in with</Text>

        <View style={styles.socialContainer}>
          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => alert('Google login pressed')}
          >
            <Image source={require('../../images/google.png')} style={styles.socialIcon} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => alert('Facebook login pressed')}
          >
            <Image source={require('../../images/facebook.png')} style={styles.socialIcon} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => alert('Twitter login pressed')}
          >
            <Image source={require('../../images/twitter.png')} style={styles.socialIcon} />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text>Don’t have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/authentication/registration')}>
            <Text style={styles.signUpText}> Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  header: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  welcomeText: { color: '#000', fontSize: 20, fontWeight: 'bold', marginTop: 10 },
  inputContainer: {
    flex: 2,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
  },
  input: { flex: 1, marginLeft: 10, fontSize: 16, color: '#000' },
  forgotText: { textAlign: 'right', color: '#007bff', marginBottom: 15 },
  loginButton: {
    backgroundColor: '#28A745',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  loginButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  orText: { textAlign: 'center', marginVertical: 20, color: '#6c757d' },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 20,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
  },
  socialIcon: { width: 25, height: 25 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  signUpText: { color: '#28A745', fontWeight: 'bold', marginLeft: 5 },
  iconImage: { width: 60, height: 60, resizeMode: 'contain' },
});

export default LoginScreen;