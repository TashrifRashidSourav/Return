import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from './App'; // Import the type

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.title}>RiseUP</Text>

      {/* Image */}
      <Image source={require('../images/icon.png')} style={styles.image} />

      {/* Curve */}
      <View style={styles.curveContainer}>
        <Text style={styles.subtitle}>Transform Your Habits, Elevate Your Life!</Text>

        {/* Buttons */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('authentication/login')}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.signupButton]}
          onPress={() => navigation.navigate('authentication/registration')}
        >
          <Text style={styles.buttonText}>Signup</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#27AE60',
    marginTop: 50,
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginVertical: 20,
  },
  curveContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#D6F5E6',
    borderTopLeftRadius: 200,
    borderTopRightRadius: 200,
    alignItems: 'center',
    paddingTop: 40,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    color: '#000',
    marginBottom: 40,
  },
  button: {
    width: '80%',
    backgroundColor: '#27AE60',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupButton: {
    backgroundColor: '#1B9CFC',
  },
});

export default HomeScreen;
