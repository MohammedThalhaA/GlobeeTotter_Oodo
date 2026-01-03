import pool from '../config/database';
import * as fs from 'fs';
import * as path from 'path';

const updateCityImages = async () => {
    console.log('🖼️  Updating city images...');

    try {
        const sqlPath = path.join(__dirname, '../models/update_city_images.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        await pool.query(sql);

        // Verify
        const result = await pool.query('SELECT name, image_url FROM cities ORDER BY id');
        console.log('\n✅ City images updated:');
        result.rows.forEach(city => {
            console.log(`   ${city.name}: ${city.image_url ? '✓ Has image' : '✗ No image'}`);
        });

        console.log('\n🎉 Done!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

updateCityImages();
