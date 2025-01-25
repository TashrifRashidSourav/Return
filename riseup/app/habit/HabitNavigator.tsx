import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import StoryFeedScreen from './StoryFeedScreen';
import StoryDetailScreen from './StoryDetailScreen';
import WriteStoryScreen from './WriteStoryScreen';
import DonationScreen from './donation';
import PostCreateScreen from './postcreate';
import RoutineManagerScreen from './RoutineManagerScreen';
import ScheduleAIScreen from './scheduleai';
import UrNotAloneScreen from './urnotalone';

const Stack = createStackNavigator();

export default function HabitNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="StoryFeed" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="StoryFeed" component={StoryFeedScreen} />
        <Stack.Screen name="StoryDetail" component={StoryDetailScreen} />
        <Stack.Screen name="WriteStory" component={WriteStoryScreen} />
        <Stack.Screen name="Donation" component={DonationScreen} />
        <Stack.Screen name="PostCreate" component={PostCreateScreen} />
        <Stack.Screen name="RoutineManager" component={RoutineManagerScreen} />
        <Stack.Screen name="ScheduleAI" component={ScheduleAIScreen} />
        <Stack.Screen name="UrNotAlone" component={UrNotAloneScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
