import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/user.js';
import Availability from './models/availability.js';
import Appointment from './models/appointment.js';
import Rating from './models/rating.js';
import Chat from './models/chat.js';
import connectDB from './config/db.js';

// Load environment variables
dotenv.config();

const cleanDoctors = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log('🧹 Starting doctor data cleanup...');

    // Find all doctors
    const doctors = await User.find({ role: 'doctor' });
    console.log(`Found ${doctors.length} doctors in total.`);

    let deletedCount = 0;

    for (const doctor of doctors) {
      const availabilityCount = await Availability.countDocuments({ doctor: doctor._id });

      // Check if doctor has availability or is test/random data
      const isTestData = doctor.email.toLowerCase().includes('test') ||
                        doctor.email.toLowerCase().includes('random') ||
                        doctor.email.toLowerCase().includes('example') ||
                        doctor.name.toLowerCase().includes('test') ||
                        doctor.name.toLowerCase().includes('random');

      if (availabilityCount === 0 || isTestData) {
        console.log(`Removing doctor: ${doctor.name} (${doctor.email}) - Availability: ${availabilityCount}, Test data: ${isTestData}`);

        // Remove related data
        await Appointment.deleteMany({ doctor: doctor._id });
        await Rating.deleteMany({ doctor: doctor._id });
        await Chat.deleteMany({ participants: doctor._id });
        await Availability.deleteMany({ doctor: doctor._id });

        // Remove the doctor
        await User.deleteOne({ _id: doctor._id });

        deletedCount++;
      }
    }

    console.log(`✅ Cleanup complete. Removed ${deletedCount} doctors.`);

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed.');
  }
};

// Run the cleanup
cleanDoctors();