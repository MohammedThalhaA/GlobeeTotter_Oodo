import dotenv from 'dotenv';
import pool from '../config/database';

dotenv.config();

const addFavoritesTable = async () => {
    try {
        console.log('🔄 Adding favorites table...');

        const query = `
            CREATE TABLE IF NOT EXISTS favorites (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, city_id)
            );
            
            CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
        `;

        await pool.query(query);

        console.log('✅ Favorites table added successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to add favorites table:', error);
        process.exit(1);
    }
};

addFavoritesTable();
