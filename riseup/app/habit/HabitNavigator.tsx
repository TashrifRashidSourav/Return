import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { TouchableOpacity, StyleSheet, View, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import StoryFeedScreen from "./StoryFeedScreen";
import StoryDetailScreen from "./StoryDetailScreen";
import WriteStoryScreen from "../consultant/WriteStoryScreen";
import DonationScreen from "./donation";
import PostCreateScreen from "./postcreate";
import RoutineManagerScreen from "./RoutineManagerScreen";
import ScheduleAIScreen from "./scheduleai";
import UrNotAloneScreen from "./urnotalone";
import VoiceCall from "./VoiceCall";
import VoiceCallScreen from "./VoiceCallScreen";
import PDFViewer from "./PDFViewer";

type RootStackParamList = {
  StoryFeed: undefined;
  StoryDetail: undefined;
  WriteStory: undefined;
  Donation: undefined;
  PostCreate: undefined;
  RoutineManager: undefined;
  ScheduleAI: undefined;
  UrNotAlone: undefined;
  VoiceCall: undefined;
  VoiceCallScreen: undefined;
  PDFViewer: { fileUri: string }; // Accepts a "fileUri" parameter
};

const Stack = createStackNavigator<RootStackParamList>();

// Custom Header for Navigation
const CustomHeader = ({ navigation }: { navigation: any }) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={() => navigation.goBack()}>
      <Ionicons name="arrow-back" size={24} color="#000" />
    </TouchableOpacity>
  </View>
);

const HabitNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="StoryFeed"
        screenOptions={{
          headerShown: true,
          headerTitle: "",
          header: ({ navigation }) => <CustomHeader navigation={navigation} />,
        }}
      >
        {/* All Screens */}
        <Stack.Screen name="StoryFeed" component={StoryFeedScreen} />
        <Stack.Screen name="StoryDetail" component={StoryDetailScreen} />
        <Stack.Screen name="WriteStory" component={WriteStoryScreen} />
        <Stack.Screen name="Donation" component={DonationScreen} />
        <Stack.Screen name="PostCreate" component={PostCreateScreen} />
        <Stack.Screen name="RoutineManager" component={RoutineManagerScreen} />
        <Stack.Screen name="ScheduleAI" component={ScheduleAIScreen} />
        <Stack.Screen name="UrNotAlone" component={UrNotAloneScreen} />
        <Stack.Screen name="VoiceCall" component={VoiceCall} />
        <Stack.Screen name="VoiceCallScreen" component={VoiceCallScreen} />
        <Stack.Screen
          name="PDFViewer"
          component={(props) => (
            <PDFViewer
              fileUri={
                Platform.OS === "web"
                  ? "/assets/sample.pdf" // Path for web
                  : "https://example.com/sample.pdf" // Adjust path for Android
              }
              {...props}
            />
          )}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Styles for the header
const styles = StyleSheet.create({
  header: {
    height: 60,
    paddingHorizontal: 15,
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
});

export default HabitNavigator;
