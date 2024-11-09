import React from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';

const RegistrationScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../../images/icon.png')} style={styles.iconImage} />
        <Text style={styles.welcomeText}>RiseUp</Text>
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <Icon name="person" size={20} color="#6c757d" />
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#6c757d"
          />
        </View>

        <View style={styles.inputWrapper}>
          <Icon name="email" size={20} color="#6c757d" />
          <TextInput
            style={styles.input}
            placeholder="Email"
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

        <TouchableOpacity style={styles.registerButton}>
          <Text style={styles.registerButtonText}>Register</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/authentication/login')}>
          <Text style={styles.switchText}>Already have an account? Log in</Text>
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
  registerButton: { backgroundColor: '#28a745', borderRadius: 10, paddingVertical: 15, alignItems: 'center', marginBottom: 20 },
  registerButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  switchText: { textAlign: 'center', color: '#007bff' },
  iconImage: { width: 50, height: 45, resizeMode: 'contain' },
});

export default RegistrationScreen;
