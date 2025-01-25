export type RootParamList = {
  Home: undefined; // Route with no parameters
  Post: undefined;
  Profile: undefined;
  'habit/postcreate': undefined;
  'habit/donation': undefined;
  'habit/scheduleai': undefined;
  'habit/RoutineManagerScreen': undefined;
  'habit/urnotalone': undefined;
  'habit/StoryFeedScreen': undefined;
  // Updated Routes for Stories
  StoryFeed: undefined; // No parameters for StoryFeed
  StoryDetail: { storyId: string }; // Accepts `storyId` as a parameter
  WriteStory: undefined; // No parameters for WriteStory

  // Additional Routes for Habit Screens
  Donation: undefined;
  PostCreate: undefined;
  RoutineManager: undefined;
  ScheduleAI: undefined;
  UrNotAlone: undefined;
};

export interface Story {
  _id: string; // Matches the `_id` field from MongoDB
  title: string;
  author: {
    name: string;
    email: string;
    profilePicture?: string; // Optional profile picture URL
  };
  content: string;
  likes: number; // Number of likes the story has
  createdAt?: string; // Optional timestamp of when the story was created
}
