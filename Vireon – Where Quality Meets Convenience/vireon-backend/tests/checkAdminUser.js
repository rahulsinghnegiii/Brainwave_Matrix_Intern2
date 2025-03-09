import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';

dotenv.config();

const checkAndFixAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find admin user
    const adminUser = await User.findOne({ email: 'admin@test.com' });
    
    if (adminUser) {
      console.log('Current admin user:', {
        email: adminUser.email,
        role: adminUser.role,
        id: adminUser._id
      });

      // Update to admin role if not already
      if (adminUser.role !== 'admin') {
        adminUser.role = 'admin';
        await adminUser.save();
        console.log('Updated user to admin role');
      }
    } else {
      console.log('Admin user not found');
    }

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');

  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
};

checkAndFixAdmin(); 