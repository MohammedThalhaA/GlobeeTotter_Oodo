import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';
import pool from '../config/database';

dotenv.config();

const initDatabase = async () => {
    try {
        console.log('🔄 Initializing database...');

        // Read schema file
        const schemaPath = join(__dirname, '../models/schema.sql');
        const schema = readFileSync(schemaPath, 'utf-8');

        // Execute schema
        await pool.query(schema);

        console.log('✅ Database initialized successfully!');
        console.log('📊 Tables created: users, trips, cities, trip_stops, activities, trip_activities');
        console.log('🌍 Sample cities and activities added');

        process.exit(0);
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        process.exit(1);
    }
};

initDatabase();
