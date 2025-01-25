import mongoose from 'mongoose';
import User from '../models/user'; // Adjust the path to your User model

const updateUsersWithDefaultProfilePicture = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/your-database-name'); // Replace with your actual MongoDB URI

    console.log('Connected to the database.');

    // Add a default profile picture to users without a profilePicture field
    const result = await User.updateMany(
      { profilePicture: { $exists: false } }, // Condition: Users without profilePicture
      { $set: { profilePicture: '/uploads/default-profile.png' } } // Set default profile picture
    );

    console.log(
      `${result.modifiedCount} users updated with default profile pictures.` // Use modifiedCount instead of nModified
    );

    // Disconnect from the database
    await mongoose.disconnect();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error updating users:', error);
    process.exit(1);
  }
};

// Execute the migration
updateUsersWithDefaultProfilePicture();
