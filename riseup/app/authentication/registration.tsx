import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  CheckBox,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';

const RegistrationScreen = () => {
  const [isChecked, setIsChecked] = useState(false);
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Image source={require('../../images/icon.png')} style={styles.iconImage} />
        <Text style={styles.titleText}>Create your account</Text>
      </View>

      {/* Form Section */}
      <View style={styles.inputContainer}>
        {/* Name Input */}
        <View style={styles.inputWrapper}>
          <Icon name="person" size={20} color="#6c757d" />
          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor="#6c757d"
          />
        </View>

        {/* Email Input */}
        <View style={styles.inputWrapper}>
          <Icon name="email" size={20} color="#6c757d" />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#6c757d"
            keyboardType="email-address"
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputWrapper}>
          <Icon name="lock" size={20} color="#6c757d" />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#6c757d"
            secureTextEntry
          />
        </View>

        {/* Confirm Password Input */}
        <View style={styles.inputWrapper}>
          <Icon name="lock" size={20} color="#6c757d" />
          <TextInput
            style={styles.input}
            placeholder="Confirm password"
            placeholderTextColor="#6c757d"
            secureTextEntry
          />
        </View>

        {/* Checkbox for Terms & Policy */}
        <View style={styles.checkboxContainer}>
          <CheckBox
            value={isChecked}
            onValueChange={setIsChecked}
            style={styles.checkbox}
          />
          <Text style={styles.checkboxText}>
            I understood the{' '}
            <TouchableOpacity onPress={() => router.push('/terms')}>
              <Text style={styles.linkText}>terms & policy</Text>
            </TouchableOpacity>
            .
          </Text>
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity
          style={[styles.registerButton, { opacity: isChecked ? 1 : 0.5 }]}
          disabled={!isChecked}
        >
          <Text style={styles.registerButtonText}>SIGN UP</Text>
        </TouchableOpacity>

        {/* Divider Text */}
        <Text style={styles.orText}>or sign up with</Text>

        {/* Social Media Login Buttons */}
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

        {/* Redirect to Login */}
        <View style={styles.footer}>
          <Text>Have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/authentication/login')}>
            <Text style={styles.signInText}> SIGN IN</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  header: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  titleText: { color: '#000', fontSize: 22, fontWeight: 'bold', marginTop: 10 },
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
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
  checkbox: { marginRight: 8 },
  checkboxText: { fontSize: 14, color: '#6c757d' },
  linkText: { color: '#007bff', textDecorationLine: 'underline' },
  registerButton: {
    backgroundColor: '#28A745',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 15,
  },
  registerButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  orText: { textAlign: 'center', marginVertical: 15, color: '#6c757d' },
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
  signInText: { color: '#28A745', fontWeight: 'bold', marginLeft: 5 },
  iconImage: { width: 60, height: 60, resizeMode: 'contain' },
});

export default RegistrationScreen;
