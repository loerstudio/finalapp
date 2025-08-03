#!/usr/bin/env node

/**
 * Appwrite Auto-Setup Script for SPC Fitness
 * 
 * Questo script configura automaticamente:
 * - Database e collezioni
 * - Storage buckets
 * - API keys
 * - Permissions
 */

const { Client, Databases, Storage, ID, Permission, Role } = require('appwrite');

// Configuration
const APPWRITE_ENDPOINT = 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = 'fra-spc-fitness-app'; // Real project ID from console
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || 'your-api-key-here'; // Update this with your real API key

// Initialize client
const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

// Only set API key if provided
if (APPWRITE_API_KEY && APPWRITE_API_KEY !== 'your-api-key-here') {
  client.setKey(APPWRITE_API_KEY);
}

const databases = new Databases(client);
const storage = new Storage(client);

// Database and Storage IDs
const DATABASE_ID = 'spc-database';
const STORAGE_ID = 'spc-storage';

// Collections configuration
const COLLECTIONS = {
  users: {
    name: 'Users',
    attributes: [
      { key: 'email', type: 'string', required: true, array: false },
      { key: 'first_name', type: 'string', required: true, array: false },
      { key: 'last_name', type: 'string', required: true, array: false },
      { key: 'role', type: 'string', required: true, array: false, enum: ['client', 'coach'] },
      { key: 'avatar_url', type: 'string', required: false, array: false },
      { key: 'phone', type: 'string', required: false, array: false },
      { key: 'is_verified', type: 'boolean', required: true, array: false },
      { key: 'specializations', type: 'string', required: false, array: true }
    ]
  },
  clients: {
    name: 'Clients',
    attributes: [
      { key: 'user_id', type: 'string', required: true, array: false },
      { key: 'coach_id', type: 'string', required: true, array: false },
      { key: 'has_nutrition_plan', type: 'boolean', required: true, array: false },
      { key: 'subscription_type', type: 'string', required: true, array: false, enum: ['basic', 'premium'] },
      { key: 'goals', type: 'string', required: false, array: true },
      { key: 'notes', type: 'string', required: false, array: false }
    ]
  },
  chat_messages: {
    name: 'Chat Messages',
    attributes: [
      { key: 'sender_id', type: 'string', required: true, array: false },
      { key: 'receiver_id', type: 'string', required: true, array: false },
      { key: 'message_type', type: 'string', required: true, array: false, enum: ['text', 'image', 'workout_share', 'nutrition_share'] },
      { key: 'content', type: 'string', required: true, array: false },
      { key: 'image_url', type: 'string', required: false, array: false },
      { key: 'metadata', type: 'string', required: false, array: false },
      { key: 'read_at', type: 'string', required: false, array: false }
    ]
  },
  workout_programs: {
    name: 'Workout Programs',
    attributes: [
      { key: 'name', type: 'string', required: true, array: false },
      { key: 'description', type: 'string', required: false, array: false },
      { key: 'coach_id', type: 'string', required: true, array: false },
      { key: 'client_id', type: 'string', required: true, array: false },
      { key: 'is_active', type: 'boolean', required: true, array: false }
    ]
  },
  nutrition_plans: {
    name: 'Nutrition Plans',
    attributes: [
      { key: 'name', type: 'string', required: true, array: false },
      { key: 'description', type: 'string', required: false, array: false },
      { key: 'coach_id', type: 'string', required: true, array: false },
      { key: 'client_id', type: 'string', required: true, array: false },
      { key: 'daily_calories', type: 'integer', required: true, array: false },
      { key: 'daily_protein', type: 'double', required: true, array: false },
      { key: 'daily_carbs', type: 'double', required: true, array: false },
      { key: 'daily_fats', type: 'double', required: true, array: false },
      { key: 'is_active', type: 'boolean', required: true, array: false }
    ]
  },
  food_logs: {
    name: 'Food Logs',
    attributes: [
      { key: 'client_id', type: 'string', required: true, array: false },
      { key: 'food_id', type: 'string', required: true, array: false },
      { key: 'quantity_grams', type: 'double', required: true, array: false },
      { key: 'meal_type', type: 'string', required: true, array: false, enum: ['breakfast', 'lunch', 'dinner', 'snack'] },
      { key: 'logged_at', type: 'string', required: true, array: false }
    ]
  },
  exercises: {
    name: 'Exercises',
    attributes: [
      { key: 'name', type: 'string', required: true, array: false },
      { key: 'description', type: 'string', required: false, array: false },
      { key: 'muscle_groups', type: 'string', required: true, array: true },
      { key: 'equipment', type: 'string', required: false, array: true },
      { key: 'difficulty_level', type: 'string', required: true, array: false, enum: ['beginner', 'intermediate', 'advanced'] },
      { key: 'video_url', type: 'string', required: false, array: false },
      { key: 'instructions', type: 'string', required: false, array: true },
      { key: 'tips', type: 'string', required: false, array: true }
    ]
  },
  workout_sessions: {
    name: 'Workout Sessions',
    attributes: [
      { key: 'client_id', type: 'string', required: true, array: false },
      { key: 'program_id', type: 'string', required: true, array: false },
      { key: 'week_id', type: 'string', required: true, array: false },
      { key: 'day_id', type: 'string', required: true, array: false },
      { key: 'started_at', type: 'string', required: true, array: false },
      { key: 'completed_at', type: 'string', required: false, array: false },
      { key: 'status', type: 'string', required: true, array: false, enum: ['in_progress', 'completed', 'skipped'] }
    ]
  },
  nutrition_foods: {
    name: 'Nutrition Foods',
    attributes: [
      { key: 'name', type: 'string', required: true, array: false },
      { key: 'calories_per_100g', type: 'double', required: true, array: false },
      { key: 'protein_per_100g', type: 'double', required: true, array: false },
      { key: 'carbs_per_100g', type: 'double', required: true, array: false },
      { key: 'fats_per_100g', type: 'double', required: true, array: false },
      { key: 'fiber_per_100g', type: 'double', required: false, array: false },
      { key: 'sugar_per_100g', type: 'double', required: false, array: false },
      { key: 'sodium_per_100g', type: 'double', required: false, array: false },
      { key: 'barcode', type: 'string', required: false, array: false },
      { key: 'image_url', type: 'string', required: false, array: false }
    ]
  },
  progress_goals: {
    name: 'Progress Goals',
    attributes: [
      { key: 'client_id', type: 'string', required: true, array: false },
      { key: 'goal_type', type: 'string', required: true, array: false, enum: ['weight_loss', 'weight_gain', 'muscle_gain', 'strength', 'endurance', 'custom'] },
      { key: 'title', type: 'string', required: true, array: false },
      { key: 'description', type: 'string', required: false, array: false },
      { key: 'target_value', type: 'double', required: true, array: false },
      { key: 'current_value', type: 'double', required: true, array: false },
      { key: 'unit', type: 'string', required: true, array: false },
      { key: 'target_date', type: 'string', required: true, array: false },
      { key: 'is_achieved', type: 'boolean', required: true, array: false },
      { key: 'before_photo', type: 'string', required: false, array: false },
      { key: 'after_photo', type: 'string', required: false, array: false }
    ]
  }
};

async function setupAppwrite() {
  console.log('🚀 Starting Appwrite setup for SPC Fitness...\n');

  if (APPWRITE_API_KEY === 'your-api-key-here') {
    console.log('⚠️ API Key not provided. Please:');
    console.log('1. Create project in Appwrite console');
    console.log('2. Create API key with all permissions');
    console.log('3. Update APPWRITE_API_KEY in this script');
    console.log('4. Run this script again');
    return;
  }

  try {
    // 1. Create Database
    console.log('📊 Creating database...');
    try {
      await databases.create(DATABASE_ID, 'SPC Fitness Database');
      console.log('✅ Database created successfully');
    } catch (error) {
      if (error.code === 409) {
        console.log('ℹ️ Database already exists');
      } else {
        throw error;
      }
    }

    // 2. Create Storage Bucket
    console.log('📁 Creating storage bucket...');
    try {
      await storage.createBucket(STORAGE_ID, 'SPC Storage', ['image/*', 'video/*']);
      console.log('✅ Storage bucket created successfully');
    } catch (error) {
      if (error.code === 409) {
        console.log('ℹ️ Storage bucket already exists');
      } else {
        throw error;
      }
    }

    // 3. Create Collections
    console.log('🗂️ Creating collections...');
    for (const [collectionId, config] of Object.entries(COLLECTIONS)) {
      try {
        await databases.createCollection(
          DATABASE_ID,
          collectionId,
          config.name,
          [
            Permission.create(Role.any()),
            Permission.read(Role.any()),
            Permission.update(Role.any()),
            Permission.delete(Role.any())
          ]
        );
        console.log(`✅ Collection '${config.name}' created`);

        // Create attributes
        for (const attr of config.attributes) {
          try {
            if (attr.type === 'string') {
              await databases.createStringAttribute(DATABASE_ID, collectionId, attr.key, attr.required, attr.array, attr.enum);
            } else if (attr.type === 'integer') {
              await databases.createIntegerAttribute(DATABASE_ID, collectionId, attr.key, attr.required, attr.array);
            } else if (attr.type === 'double') {
              await databases.createFloatAttribute(DATABASE_ID, collectionId, attr.key, attr.required, attr.array);
            } else if (attr.type === 'boolean') {
              await databases.createBooleanAttribute(DATABASE_ID, collectionId, attr.key, attr.required, attr.array);
            }
          } catch (attrError) {
            if (attrError.code !== 409) {
              console.log(`⚠️ Attribute '${attr.key}' already exists or error:`, attrError.message);
            }
          }
        }
      } catch (error) {
        if (error.code === 409) {
          console.log(`ℹ️ Collection '${config.name}' already exists`);
        } else {
          console.log(`❌ Error creating collection '${config.name}':`, error.message);
        }
      }
    }

    console.log('\n🎉 Appwrite setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Update src/services/appwrite.ts with your real API key');
    console.log('2. Test the app: npx expo start --ios');
    console.log('3. Create test users and data');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure you have created the project in Appwrite console');
    console.log('2. Update APPWRITE_PROJECT_ID and APPWRITE_API_KEY in this script');
    console.log('3. Ensure your API key has the necessary permissions');
  }
}

// Run setup
setupAppwrite(); 