import pool from '../config/database';
import dotenv from 'dotenv';
dotenv.config();

const seedTrips = async () => {
    try {
        console.log('🌱 Seeding trips...');

        // 1. Get User ID
        const userRes = await pool.query("SELECT id FROM users WHERE email = 'user@globetrotter.com'");
        if (userRes.rows.length === 0) {
            console.error('❌ User not found. Run createUsers.ts first.');
            process.exit(1);
        }
        const userId = userRes.rows[0].id;

        // 2. Get City IDs
        const parisRes = await pool.query("SELECT id FROM cities WHERE name = 'Paris'");
        const tokyoRes = await pool.query("SELECT id FROM cities WHERE name = 'Tokyo'");
        const nycRes = await pool.query("SELECT id FROM cities WHERE name = 'New York'");

        const parisId = parisRes.rows[0]?.id;
        const tokyoId = tokyoRes.rows[0]?.id;
        const nycId = nycRes.rows[0]?.id;

        // 3. Insert Trips
        // Upcoming Trip
        const upcomingStart = new Date();
        upcomingStart.setDate(upcomingStart.getDate() + 30);
        const upcomingEnd = new Date(upcomingStart);
        upcomingEnd.setDate(upcomingEnd.getDate() + 7);

        const trip1 = await pool.query(`
            INSERT INTO trips (user_id, title, description, start_date, end_date, cover_photo, is_public)
            VALUES ($1, 'European Summer', 'Dream vacation to Paris', $2, $3, 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=2000&q=90', true)
            RETURNING id
        `, [userId, upcomingStart, upcomingEnd]);

        if (parisId) {
            await pool.query(`
                INSERT INTO trip_stops (trip_id, city_id, city_name, start_date, end_date, order_index)
                VALUES ($1, $2, 'Paris', $3, $4, 0)
            `, [trip1.rows[0].id, parisId, upcomingStart, upcomingEnd]);
        }

        // Ongoing Trip
        const ongoingStart = new Date();
        ongoingStart.setDate(ongoingStart.getDate() - 2);
        const ongoingEnd = new Date();
        ongoingEnd.setDate(ongoingEnd.getDate() + 5);

        const trip2 = await pool.query(`
            INSERT INTO trips (user_id, title, description, start_date, end_date, cover_photo, is_public)
            VALUES ($1, 'Japan Adventure', 'Exploring Tokyo', $2, $3, 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=2000&q=90', false)
            RETURNING id
        `, [userId, ongoingStart, ongoingEnd]);

        if (tokyoId) {
            await pool.query(`
                INSERT INTO trip_stops (trip_id, city_id, city_name, start_date, end_date, order_index)
                VALUES ($1, $2, 'Tokyo', $3, $4, 0)
            `, [trip2.rows[0].id, tokyoId, ongoingStart, ongoingEnd]);
        }

        // Past Trip
        const pastStart = new Date();
        pastStart.setDate(pastStart.getDate() - 30);
        const pastEnd = new Date();
        pastEnd.setDate(pastEnd.getDate() - 25);

        const trip3 = await pool.query(`
            INSERT INTO trips (user_id, title, description, start_date, end_date, cover_photo, is_public)
            VALUES ($1, 'NYC Business', 'Work trip', $2, $3, 'https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?w=2000&q=90', false)
            RETURNING id
        `, [userId, pastStart, pastEnd]);

        if (nycId) {
            await pool.query(`
                INSERT INTO trip_stops (trip_id, city_id, city_name, start_date, end_date, order_index)
                VALUES ($1, $2, 'New York', $3, $4, 0)
            `, [trip3.rows[0].id, nycId, pastStart, pastEnd]);
        }

        console.log('✅ Trips seeded successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding trips:', error);
        process.exit(1);
    }
};

seedTrips();
