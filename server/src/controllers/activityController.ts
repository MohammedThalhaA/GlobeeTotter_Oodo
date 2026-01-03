import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest, ApiResponse } from '../types';

// Search activities
export const searchActivities = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { city_id, category, search, min_cost, max_cost } = req.query;

        let query = 'SELECT * FROM activities WHERE 1=1';
        const params: (string | number)[] = [];
        let paramIndex = 1;

        if (city_id) {
            query += ` AND city_id = $${paramIndex}`;
            params.push(Number(city_id));
            paramIndex++;
        }

        if (category) {
            query += ` AND category = $${paramIndex}`;
            params.push(String(category));
            paramIndex++;
        }

        if (search) {
            query += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        if (min_cost) {
            query += ` AND estimated_cost >= $${paramIndex}`;
            params.push(Number(min_cost));
            paramIndex++;
        }

        if (max_cost) {
            query += ` AND estimated_cost <= $${paramIndex}`;
            params.push(Number(max_cost));
            paramIndex++;
        }

        query += ' ORDER BY category, name';

        const result = await pool.query(query, params);

        res.json({
            success: true,
            data: result.rows,
        } as ApiResponse);
    } catch (error) {
        console.error('Search activities error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Get activity categories
export const getCategories = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const result = await pool.query(
            'SELECT DISTINCT category FROM activities ORDER BY category'
        );

        res.json({
            success: true,
            data: result.rows.map(r => r.category),
        } as ApiResponse);
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Add activity to a trip stop
export const addActivityToStop = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        const { stopId } = req.params;
        const { activity_id, activity_name, scheduled_date, scheduled_time, custom_cost, notes } = req.body;

        // Verify stop ownership through trip
        const check = await pool.query(
            `SELECT ts.id FROM trip_stops ts
       JOIN trips t ON ts.trip_id = t.id
       WHERE ts.id = $1 AND t.user_id = $2`,
            [stopId, req.user.id]
        );

        if (check.rows.length === 0) {
            res.status(404).json({ success: false, error: 'Stop not found or not authorized' });
            return;
        }

        const result = await pool.query(
            `INSERT INTO trip_activities (trip_stop_id, activity_id, activity_name, scheduled_date, scheduled_time, custom_cost, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
            [stopId, activity_id || null, activity_name, scheduled_date, scheduled_time, custom_cost, notes]
        );

        res.status(201).json({
            success: true,
            message: 'Activity added to stop',
            data: result.rows[0],
        } as ApiResponse);
    } catch (error) {
        console.error('Add activity to stop error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Update a trip activity
export const updateTripActivity = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        const { id } = req.params;
        const { activity_name, scheduled_date, scheduled_time, custom_cost, notes, status } = req.body;

        // Verify ownership
        const check = await pool.query(
            `SELECT ta.id FROM trip_activities ta
       JOIN trip_stops ts ON ta.trip_stop_id = ts.id
       JOIN trips t ON ts.trip_id = t.id
       WHERE ta.id = $1 AND t.user_id = $2`,
            [id, req.user.id]
        );

        if (check.rows.length === 0) {
            res.status(404).json({ success: false, error: 'Activity not found or not authorized' });
            return;
        }

        const result = await pool.query(
            `UPDATE trip_activities 
       SET activity_name = COALESCE($1, activity_name),
           scheduled_date = COALESCE($2, scheduled_date),
           scheduled_time = COALESCE($3, scheduled_time),
           custom_cost = COALESCE($4, custom_cost),
           notes = COALESCE($5, notes),
           status = COALESCE($6, status)
       WHERE id = $7
       RETURNING *`,
            [activity_name, scheduled_date, scheduled_time, custom_cost, notes, status, id]
        );

        res.json({
            success: true,
            message: 'Activity updated',
            data: result.rows[0],
        } as ApiResponse);
    } catch (error) {
        console.error('Update trip activity error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Remove activity from trip
export const removeTripActivity = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        const { id } = req.params;

        // Verify ownership
        const check = await pool.query(
            `SELECT ta.id FROM trip_activities ta
       JOIN trip_stops ts ON ta.trip_stop_id = ts.id
       JOIN trips t ON ts.trip_id = t.id
       WHERE ta.id = $1 AND t.user_id = $2`,
            [id, req.user.id]
        );

        if (check.rows.length === 0) {
            res.status(404).json({ success: false, error: 'Activity not found or not authorized' });
            return;
        }

        await pool.query('DELETE FROM trip_activities WHERE id = $1', [id]);

        res.json({
            success: true,
            message: 'Activity removed',
        } as ApiResponse);
    } catch (error) {
        console.error('Remove trip activity error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
