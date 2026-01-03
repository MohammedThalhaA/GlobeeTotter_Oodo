import pool from '../config/database';
import dotenv from 'dotenv';
dotenv.config();

const checkData = async () => {
    try {
        console.log('🔍 Verifying Dashboard Data...');

        // 1. Check User
        const userRes = await pool.query("SELECT id, email, name FROM users WHERE email = 'user@globetrotter.com'");
        if (userRes.rows.length === 0) {
            throw new Error('Test user not found! run createUsers.ts');
        }
        const userId = userRes.rows[0].id;
        console.log('✅ Test User found:', userRes.rows[0].email);

        // 2. Check Trips
        const tripsRes = await pool.query(`
            SELECT id, title, start_date, end_date 
            FROM trips 
            WHERE user_id = $1
            ORDER BY start_date
        `, [userId]);

        if (tripsRes.rows.length === 0) {
            throw new Error('No trips found! run seedTrips.ts');
        }
        console.log(`✅ Found ${tripsRes.rows.length} trips:`);
        tripsRes.rows.forEach(t => {
            console.log(`   - ${t.title} (${t.start_date.toISOString().split('T')[0]})`);
        });

        // 3. Check Trip Stops (Cities)
        const stopsRes = await pool.query(`
             SELECT ts.city_name, t.title
             FROM trip_stops ts
             JOIN trips t ON ts.trip_id = t.id
             WHERE t.user_id = $1
        `, [userId]);

        if (stopsRes.rows.length === 0) {
            console.warn('⚠️ Trips have no stops/cities! Dashboard might look incomplete.');
        } else {
            console.log(`✅ Found ${stopsRes.rows.length} city stops linked to trips.`);
        }

        console.log('\n✨ Database is fully populated for the Dashboard!');
        console.log('👉 Please RESTART your server (npm run dev) to load the new credentials and see the data.');
        process.exit(0);

    } catch (error) {
        console.error('❌ Verification failed:', error);
        process.exit(1);
    }
};

checkData();
