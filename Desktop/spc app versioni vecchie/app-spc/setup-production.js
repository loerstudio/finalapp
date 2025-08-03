const { Client, Databases, Storage, ID, Query, Permission, Role } = require('node-appwrite');

// Production Appwrite Configuration
const APPWRITE_ENDPOINT = 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = 'spc-fitness-app';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || 'your-production-api-key';

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY);

const databases = new Databases(client);
const storage = new Storage(client);

// Database and Storage IDs
const DATABASE_ID = 'spc-database';
const STORAGE_ID = 'spc-storage';

// Collections schema for production
const COLLECTIONS = {
  USERS: {
    id: 'users',
    name: 'Users',
    attributes: [
      { key: 'email', type: 'string', required: true, array: false },
      { key: 'first_name', type: 'string', required: true, array: false },
      { key: 'last_name', type: 'string', required: true, array: false },
      { key: 'role', type: 'string', required: true, array: false },
      { key: 'phone', type: 'string', required: false, array: false },
      { key: 'avatar_url', type: 'string', required: false, array: false },
      { key: 'is_verified', type: 'boolean', required: true, array: false },
      { key: 'specializations', type: 'string', required: false, array: true },
      { key: 'has_nutrition_plan', type: 'boolean', required: true, array: false },
      { key: 'created_at', type: 'datetime', required: true, array: false },
      { key: 'updated_at', type: 'datetime', required: true, array: false }
    ]
  },
  CLIENTS: {
    id: 'clients',
    name: 'Clients',
    attributes: [
      { key: 'user_id', type: 'string', required: true, array: false },
      { key: 'coach_id', type: 'string', required: true, array: false },
      { key: 'has_nutrition_plan', type: 'boolean', required: true, array: false },
      { key: 'subscription_type', type: 'string', required: true, array: false },
      { key: 'goals', type: 'string', required: false, array: true },
      { key: 'notes', type: 'string', required: false, array: false },
      { key: 'created_at', type: 'datetime', required: true, array: false },
      { key: 'updated_at', type: 'datetime', required: true, array: false }
    ]
  },
  WORKOUT_PROGRAMS: {
    id: 'workout_programs',
    name: 'Workout Programs',
    attributes: [
      { key: 'name', type: 'string', required: true, array: false },
      { key: 'description', type: 'string', required: false, array: false },
      { key: 'coach_id', type: 'string', required: true, array: false },
      { key: 'client_id', type: 'string', required: true, array: false },
      { key: 'is_active', type: 'boolean', required: true, array: false },
      { key: 'weeks', type: 'string', required: false, array: false }, // JSON string
      { key: 'created_at', type: 'datetime', required: true, array: false },
      { key: 'updated_at', type: 'datetime', required: true, array: false }
    ]
  },
  EXERCISES: {
    id: 'exercises',
    name: 'Exercises',
    attributes: [
      { key: 'name', type: 'string', required: true, array: false },
      { key: 'description', type: 'string', required: true, array: false },
      { key: 'muscle_groups', type: 'string', required: true, array: true },
      { key: 'equipment', type: 'string', required: true, array: true },
      { key: 'difficulty_level', type: 'string', required: true, array: false },
      { key: 'video_url', type: 'string', required: false, array: false },
      { key: 'evolution_fit_id', type: 'string', required: false, array: false },
      { key: 'instructions', type: 'string', required: true, array: true },
      { key: 'tips', type: 'string', required: false, array: true },
      { key: 'created_at', type: 'datetime', required: true, array: false },
      { key: 'updated_at', type: 'datetime', required: true, array: false }
    ]
  },
  CHAT_MESSAGES: {
    id: 'chat_messages',
    name: 'Chat Messages',
    attributes: [
      { key: 'sender_id', type: 'string', required: true, array: false },
      { key: 'receiver_id', type: 'string', required: true, array: false },
      { key: 'message_type', type: 'string', required: true, array: false },
      { key: 'content', type: 'string', required: true, array: false },
      { key: 'image_url', type: 'string', required: false, array: false },
      { key: 'metadata', type: 'string', required: false, array: false }, // JSON string
      { key: 'read_at', type: 'datetime', required: false, array: false },
      { key: 'created_at', type: 'datetime', required: true, array: false },
      { key: 'updated_at', type: 'datetime', required: true, array: false }
    ]
  },
  NUTRITION_PLANS: {
    id: 'nutrition_plans',
    name: 'Nutrition Plans',
    attributes: [
      { key: 'name', type: 'string', required: true, array: false },
      { key: 'description', type: 'string', required: false, array: false },
      { key: 'coach_id', type: 'string', required: true, array: false },
      { key: 'client_id', type: 'string', required: true, array: false },
      { key: 'daily_calories', type: 'integer', required: true, array: false },
      { key: 'daily_protein', type: 'integer', required: true, array: false },
      { key: 'daily_carbs', type: 'integer', required: true, array: false },
      { key: 'daily_fats', type: 'integer', required: true, array: false },
      { key: 'is_active', type: 'boolean', required: true, array: false },
      { key: 'meals', type: 'string', required: false, array: false }, // JSON string
      { key: 'created_at', type: 'datetime', required: true, array: false },
      { key: 'updated_at', type: 'datetime', required: true, array: false }
    ]
  },
  NUTRITION_FOODS: {
    id: 'nutrition_foods',
    name: 'Nutrition Foods',
    attributes: [
      { key: 'name', type: 'string', required: true, array: false },
      { key: 'calories_per_100g', type: 'integer', required: true, array: false },
      { key: 'protein_per_100g', type: 'float', required: true, array: false },
      { key: 'carbs_per_100g', type: 'float', required: true, array: false },
      { key: 'fats_per_100g', type: 'float', required: true, array: false },
      { key: 'fiber_per_100g', type: 'float', required: false, array: false },
      { key: 'sugar_per_100g', type: 'float', required: false, array: false },
      { key: 'sodium_per_100g', type: 'float', required: false, array: false },
      { key: 'barcode', type: 'string', required: false, array: false },
      { key: 'image_url', type: 'string', required: false, array: false },
      { key: 'created_at', type: 'datetime', required: true, array: false },
      { key: 'updated_at', type: 'datetime', required: true, array: false }
    ]
  },
  FOOD_LOGS: {
    id: 'food_logs',
    name: 'Food Logs',
    attributes: [
      { key: 'client_id', type: 'string', required: true, array: false },
      { key: 'food_id', type: 'string', required: true, array: false },
      { key: 'quantity_grams', type: 'integer', required: true, array: false },
      { key: 'meal_type', type: 'string', required: true, array: false },
      { key: 'logged_at', type: 'datetime', required: true, array: false },
      { key: 'created_at', type: 'datetime', required: true, array: false }
    ]
  },
  PROGRESS_GOALS: {
    id: 'progress_goals',
    name: 'Progress Goals',
    attributes: [
      { key: 'client_id', type: 'string', required: true, array: false },
      { key: 'goal_type', type: 'string', required: true, array: false },
      { key: 'title', type: 'string', required: true, array: false },
      { key: 'description', type: 'string', required: false, array: false },
      { key: 'target_value', type: 'float', required: true, array: false },
      { key: 'current_value', type: 'float', required: true, array: false },
      { key: 'unit', type: 'string', required: true, array: false },
      { key: 'target_date', type: 'datetime', required: true, array: false },
      { key: 'is_achieved', type: 'boolean', required: true, array: false },
      { key: 'progress_updates', type: 'string', required: false, array: false }, // JSON string
      { key: 'before_photo', type: 'string', required: false, array: false },
      { key: 'after_photo', type: 'string', required: false, array: false },
      { key: 'created_at', type: 'datetime', required: true, array: false },
      { key: 'updated_at', type: 'datetime', required: true, array: false }
    ]
  },
  WORKOUT_SESSIONS: {
    id: 'workout_sessions',
    name: 'Workout Sessions',
    attributes: [
      { key: 'client_id', type: 'string', required: true, array: false },
      { key: 'program_id', type: 'string', required: true, array: false },
      { key: 'week_id', type: 'string', required: true, array: false },
      { key: 'day_id', type: 'string', required: true, array: false },
      { key: 'started_at', type: 'datetime', required: true, array: false },
      { key: 'completed_at', type: 'datetime', required: false, array: false },
      { key: 'status', type: 'string', required: true, array: false },
      { key: 'exercises', type: 'string', required: false, array: false }, // JSON string
      { key: 'feedback', type: 'string', required: false, array: false }, // JSON string
      { key: 'created_at', type: 'datetime', required: true, array: false },
      { key: 'updated_at', type: 'datetime', required: true, array: false }
    ]
  }
};

async function setupProduction() {
  try {
    console.log('🚀 Setting up SPC Fitness for PRODUCTION...');
    
    if (!APPWRITE_API_KEY || APPWRITE_API_KEY === 'your-production-api-key') {
      throw new Error('Please set APPWRITE_API_KEY environment variable');
    }

    // Create database
    console.log('📊 Creating database...');
    try {
      await databases.create(DATABASE_ID, 'SPC Fitness Database');
      console.log('✅ Database created');
    } catch (error) {
      if (error.code === 409) {
        console.log('✅ Database already exists');
      } else {
        throw error;
      }
    }

    // Create storage bucket
    console.log('📦 Creating storage bucket...');
    try {
      await storage.createBucket(STORAGE_ID, 'SPC Storage', ['image/*', 'video/*'], true);
      console.log('✅ Storage bucket created');
    } catch (error) {
      if (error.code === 409) {
        console.log('✅ Storage bucket already exists');
      } else {
        throw error;
      }
    }

    // Create collections
    console.log('📋 Creating collections...');
    for (const [key, collection] of Object.entries(COLLECTIONS)) {
      try {
        console.log(`Creating collection: ${collection.name}`);
        
        // Create collection
        await databases.createCollection(DATABASE_ID, collection.id, collection.name);
        
        // Create attributes
        for (const attr of collection.attributes) {
          try {
            if (attr.type === 'string') {
              await databases.createStringAttribute(DATABASE_ID, collection.id, attr.key, attr.required, attr.array);
            } else if (attr.type === 'integer') {
              await databases.createIntegerAttribute(DATABASE_ID, collection.id, attr.key, attr.required, attr.array);
            } else if (attr.type === 'float') {
              await databases.createFloatAttribute(DATABASE_ID, collection.id, attr.key, attr.required, attr.array);
            } else if (attr.type === 'boolean') {
              await databases.createBooleanAttribute(DATABASE_ID, collection.id, attr.key, attr.required, attr.array);
            } else if (attr.type === 'datetime') {
              await databases.createDatetimeAttribute(DATABASE_ID, collection.id, attr.key, attr.required, attr.array);
            }
          } catch (attrError) {
            if (attrError.code === 409) {
              console.log(`  ✅ Attribute ${attr.key} already exists`);
            } else {
              console.error(`  ❌ Error creating attribute ${attr.key}:`, attrError.message);
            }
          }
        }
        
        console.log(`✅ Collection ${collection.name} created`);
      } catch (error) {
        if (error.code === 409) {
          console.log(`✅ Collection ${collection.name} already exists`);
        } else {
          console.error(`❌ Error creating collection ${collection.name}:`, error.message);
        }
      }
    }

    console.log('🎉 PRODUCTION SETUP COMPLETED!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Configure email templates in Appwrite console');
    console.log('2. Set up email provider (SendGrid, Mailgun, etc.)');
    console.log('3. Configure webhooks for real-time features');
    console.log('4. Set up custom domains');
    console.log('5. Configure security rules');
    console.log('');
    console.log('🚀 Your app is ready for App Store and Play Store!');

  } catch (error) {
    console.error('❌ Production setup failed:', error);
    process.exit(1);
  }
}

// Run setup
setupProduction(); 