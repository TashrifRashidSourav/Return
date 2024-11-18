import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './index'; // Ensure the Home screen file is named `index.tsx`
import LoginScreen from './authentication/login'; // Ensure the file path is correct
import RegisterScreen from './authentication/registration'; // Ensure the file path is correct

// Define route types and export it for use in other screens
export type RootStackParamList = {
  Home: undefined; // No parameters for the Home screen
  'authentication/login': undefined; // No parameters for Login
  'authentication/registration': undefined; // No parameters for Registration
};

const Stack = createStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{ headerShown: false }} // Hides the header for all screens
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="authentication/login" component={LoginScreen} />
        <Stack.Screen name="authentication/registration" component={RegisterScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
