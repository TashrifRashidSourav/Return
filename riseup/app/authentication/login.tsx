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
        <Text style={styles.welcomeText}>RiseUp</Text>
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <Icon name="email" size={20} color="#6c757d" />
          <TextInput
           placeholder="email"
            style={styles.input}
          
          />
          <Icon name="check-circle" size={20} color="#4caf50" />
        </View>

        <View style={styles.inputWrapper}>
          <Icon name="lock" size={20} color="#6c757d" />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#6c757d"
            secureTextEntry
          />
          <Icon name="visibility-off" size={20} color="#6c757d" />
        </View>

        <TouchableOpacity>
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton}>
          <Text style={styles.loginButtonText}>Log in</Text>
        </TouchableOpacity>

        <Text style={styles.orText}>or</Text>

        <TouchableOpacity
          style={styles.signUpButton}
          onPress={() => router.push('/authentication/registration')}
        >
          <Text style={styles.signUpButtonText}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  welcomeText: { color: 'Black', fontSize: 28, fontWeight: 'bold', marginTop: 10 },
  inputContainer: { flex: 2, backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: 10, padding: 10, marginBottom: 15 },
  input: { flex: 1, marginLeft: 10, fontSize: 16, color: '#000' },
  forgotText: { textAlign: 'right', color: '#007bff', marginBottom: 15 },
  loginButton: { backgroundColor: '#007bff', borderRadius: 10, paddingVertical: 15, alignItems: 'center' },
  loginButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  orText: { textAlign: 'center', marginVertical: 20, color: '#6c757d' },
  signUpButton: { borderColor: '#6c757d', borderWidth: 1, borderRadius: 10, paddingVertical: 15, alignItems: 'center' },
  signUpButtonText: { color: '#6c757d', fontSize: 18, fontWeight: 'bold' },
  iconImage: { width: 50, height: 45, resizeMode: 'contain' },
});

export default LoginScreen;
