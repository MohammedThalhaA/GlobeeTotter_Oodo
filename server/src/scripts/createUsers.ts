import pool from '../config/database';
import bcrypt from 'bcryptjs';

// Create sample users with known credentials
async function createSampleUsers() {
    try {
        console.log('Creating sample users...');

        // Check if admin column exists, if not add it
        try {
            await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE');
            console.log('✓ is_admin column ensured');
        } catch (e) {
            console.log('is_admin column already exists or skipped');
        }

        // Hash passwords
        const adminPassword = await bcrypt.hash('admin123', 10);
        const userPassword = await bcrypt.hash('user123', 10);

        // Create Admin User
        const adminResult = await pool.query(
            `INSERT INTO users (name, email, password_hash, is_admin) 
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (email) DO UPDATE SET 
                password_hash = EXCLUDED.password_hash,
                is_admin = EXCLUDED.is_admin
             RETURNING id, name, email, is_admin`,
            ['Admin User', 'admin@globetrotter.com', adminPassword, true]
        );
        console.log('✓ Admin user created:', adminResult.rows[0]);

        // Create Regular User
        const userResult = await pool.query(
            `INSERT INTO users (name, email, password_hash, is_admin) 
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (email) DO UPDATE SET 
                password_hash = EXCLUDED.password_hash,
                is_admin = EXCLUDED.is_admin
             RETURNING id, name, email, is_admin`,
            ['Test User', 'user@globetrotter.com', userPassword, false]
        );
        console.log('✓ Regular user created:', userResult.rows[0]);

        console.log('\n========================================');
        console.log('  LOGIN CREDENTIALS');
        console.log('========================================');
        console.log('\n👑 ADMIN LOGIN:');
        console.log('   Email:    admin@globetrotter.com');
        console.log('   Password: admin123');
        console.log('\n👤 USER LOGIN:');
        console.log('   Email:    user@globetrotter.com');
        console.log('   Password: user123');
        console.log('========================================\n');

        process.exit(0);
    } catch (error) {
        console.error('Error creating sample users:', error);
        process.exit(1);
    }
}

createSampleUsers();
