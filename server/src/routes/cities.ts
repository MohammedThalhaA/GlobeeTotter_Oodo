import { Router, Response } from 'express';
import pool from '../config/database';
import { AuthRequest, ApiResponse } from '../types';

const router = Router();

// Get all cities
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { search, country, region, sort } = req.query;

        let query = 'SELECT * FROM cities WHERE 1=1';
        const params: any[] = [];
        let paramIndex = 1;

        if (search) {
            query += ` AND (name ILIKE $${paramIndex} OR country ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        if (country) {
            query += ` AND country = $${paramIndex}`;
            params.push(country);
            paramIndex++;
        }

        if (region) {
            query += ` AND region = $${paramIndex}`;
            params.push(region);
            paramIndex++;
        }

        // Sorting
        if (sort === 'popularity') {
            query += ' ORDER BY popularity_score DESC';
        } else if (sort === 'cost_low') {
            query += ' ORDER BY avg_daily_cost ASC';
        } else if (sort === 'cost_high') {
            query += ' ORDER BY avg_daily_cost DESC';
        } else {
            query += ' ORDER BY name ASC';
        }

        const result = await pool.query(query, params);

        res.json({
            success: true,
            data: result.rows,
        } as ApiResponse);
    } catch (error) {
        console.error('Get cities error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Get popular cities
router.get('/popular', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const result = await pool.query(
            'SELECT * FROM cities ORDER BY popularity_score DESC LIMIT 6'
        );

        res.json({
            success: true,
            data: result.rows,
        } as ApiResponse);
    } catch (error) {
        console.error('Get popular cities error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Get single city with activities
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const cityResult = await pool.query('SELECT * FROM cities WHERE id = $1', [id]);

        if (cityResult.rows.length === 0) {
            res.status(404).json({ success: false, error: 'City not found' });
            return;
        }

        const activitiesResult = await pool.query(
            'SELECT * FROM activities WHERE city_id = $1 ORDER BY category, name',
            [id]
        );

        res.json({
            success: true,
            data: {
                ...cityResult.rows[0],
                activities: activitiesResult.rows,
            },
        } as ApiResponse);
    } catch (error) {
        console.error('Get city error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Get countries list
router.get('/meta/countries', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const result = await pool.query(
            'SELECT DISTINCT country FROM cities ORDER BY country'
        );

        res.json({
            success: true,
            data: result.rows.map(r => r.country),
        } as ApiResponse);
    } catch (error) {
        console.error('Get countries error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

export default router;
