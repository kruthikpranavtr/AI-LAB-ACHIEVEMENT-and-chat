require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Project = require('../models/Project');
const User = require('../models/User');
const projectsData = require('./projects');

const seedDatabase = async () => {
  try {
    console.log('===========================================================');
    console.log('🌱 STARTING AI CLUB PROJECT DATABASE SEEDING');
    console.log('===========================================================');

    // 1. Connect to MongoDB
    await connectDB();

    // 2. Seed / Upsert Projects
    console.log(`[Seed] Processing ${projectsData.length} projects from projects.html...`);
    let createdCount = 0;
    let updatedCount = 0;

    for (const item of projectsData) {
      // Find by numeric id or title
      const existing = await Project.findOne({
        $or: [{ id: item.id }, { title: item.title }],
      });

      if (existing) {
        // Update existing to prevent duplicates
        await Project.updateOne({ _id: existing._id }, { $set: item });
        updatedCount++;
      } else {
        // Create new
        await Project.create(item);
        createdCount++;
      }
    }

    console.log(`✓ Projects Seeding Complete: ${createdCount} created, ${updatedCount} verified/updated.`);
    console.log(`✓ Total Projects in Database: ${await Project.countDocuments()}`);

    // 3. Optional: Seed Default Admin User if none exists
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@ai-lab.siet.ac.in';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@AILab2026';
      await User.create({
        name: 'AI Lab Lead Administrator',
        email: adminEmail,
        password: defaultPassword,
        role: 'admin',
        isActive: true,
      });
      console.log(`✓ Default Admin Created: ${adminEmail} (password: ${defaultPassword})`);
    } else {
      // Ensure admin has role 'admin'
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
      }
      console.log(`✓ Admin user verified: ${adminEmail} (role: admin)`);
    }

    console.log('===========================================================');
    console.log('🎉 SEEDING COMPLETED SUCCESSFULLY WITH ZERO DUPLICATES');
    console.log('===========================================================');

    process.exit(0);
  } catch (error) {
    console.error('Fatal Error during project seeding:', error);
    process.exit(1);
  }
};

seedDatabase();
