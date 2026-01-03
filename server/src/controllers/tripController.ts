import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest, ApiResponse, Trip } from '../types';

// Create a new trip
export const createTrip = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        const { title, description, start_date, end_date, cover_photo, is_public } = req.body;

        // Validation
        if (!title || !start_date || !end_date) {
            res.status(400).json({
                success: false,
                error: 'Please provide title, start_date, and end_date',
            });
            return;
        }

        // Validate dates
        const start = new Date(start_date);
        const end = new Date(end_date);
        if (end < start) {
            res.status(400).json({
                success: false,
                error: 'End date must be after start date',
            });
            return;
        }

        // Default HD images for trips (Travel, Nature, City themes)
        const defaultImages = [
            'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=2000&q=90', // Mountain lake
            'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=2000&q=90', // Sunset field
            'https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?w=2000&q=90', // NYC
            'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=2000&q=90', // Paris
            'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=2000&q=90', // Tokyo
            'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=2000&q=90', // Venice
            'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=2000&q=90', // Greek Island
            'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=2000&q=90', // Beach
            'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=2000&q=90', // Travel planning
            'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=2000&q=90', // Lake boat
        ];

        const finalCoverPhoto = cover_photo || defaultImages[Math.floor(Math.random() * defaultImages.length)];

        const result = await pool.query(
            `INSERT INTO trips (user_id, title, description, start_date, end_date, cover_photo, is_public)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
            [req.user.id, title, description, start_date, end_date, finalCoverPhoto, is_public || false]
        );

        res.status(201).json({
            success: true,
            message: 'Trip created successfully',
            data: result.rows[0],
        } as ApiResponse<Trip>);
    } catch (error) {
        console.error('Create trip error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Get all trips for the authenticated user
export const getTrips = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        const result = await pool.query(
            `SELECT t.*, 
              COUNT(DISTINCT ts.id) as stop_count,
              COALESCE(json_agg(DISTINCT jsonb_build_object('city_name', ts.city_name)) 
                FILTER (WHERE ts.id IS NOT NULL), '[]') as cities
       FROM trips t
       LEFT JOIN trip_stops ts ON t.id = ts.trip_id
       WHERE t.user_id = $1
       GROUP BY t.id
       ORDER BY t.created_at DESC`,
            [req.user.id]
        );

        res.json({
            success: true,
            data: result.rows,
        } as ApiResponse<Trip[]>);
    } catch (error) {
        console.error('Get trips error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Get a single trip by ID
export const getTrip = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;

        const tripResult = await pool.query(
            `SELECT t.*, u.name as owner_name
       FROM trips t
       JOIN users u ON t.user_id = u.id
       WHERE t.id = $1`,
            [id]
        );

        if (tripResult.rows.length === 0) {
            res.status(404).json({ success: false, error: 'Trip not found' });
            return;
        }

        const trip = tripResult.rows[0];

        // Check authorization
        if (!trip.is_public && (!req.user || req.user.id !== trip.user_id)) {
            res.status(403).json({ success: false, error: 'Access denied' });
            return;
        }

        // Get trip stops with activities
        const stopsResult = await pool.query(
            `SELECT ts.*, 
              c.country, c.avg_daily_cost, c.image_url as city_image,
              COALESCE(json_agg(
                jsonb_build_object(
                  'id', ta.id,
                  'activity_name', ta.activity_name,
                  'scheduled_date', ta.scheduled_date,
                  'scheduled_time', ta.scheduled_time,
                  'custom_cost', ta.custom_cost,
                  'notes', ta.notes,
                  'status', ta.status
                )
              ) FILTER (WHERE ta.id IS NOT NULL), '[]') as activities
       FROM trip_stops ts
       LEFT JOIN cities c ON ts.city_id = c.id
       LEFT JOIN trip_activities ta ON ts.id = ta.trip_stop_id
       WHERE ts.trip_id = $1
       GROUP BY ts.id, c.country, c.avg_daily_cost, c.image_url
       ORDER BY ts.order_index`,
            [id]
        );

        res.json({
            success: true,
            data: {
                ...trip,
                stops: stopsResult.rows,
            },
        } as ApiResponse);
    } catch (error) {
        console.error('Get trip error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Update a trip
export const updateTrip = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        const { id } = req.params;
        const { title, description, start_date, end_date, cover_photo, is_public } = req.body;

        // Check ownership
        const checkResult = await pool.query(
            'SELECT user_id FROM trips WHERE id = $1',
            [id]
        );

        if (checkResult.rows.length === 0) {
            res.status(404).json({ success: false, error: 'Trip not found' });
            return;
        }

        if (checkResult.rows[0].user_id !== req.user.id) {
            res.status(403).json({ success: false, error: 'Not authorized' });
            return;
        }

        const result = await pool.query(
            `UPDATE trips 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           start_date = COALESCE($3, start_date),
           end_date = COALESCE($4, end_date),
           cover_photo = COALESCE($5, cover_photo),
           is_public = COALESCE($6, is_public),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
            [title, description, start_date, end_date, cover_photo, is_public, id]
        );

        res.json({
            success: true,
            message: 'Trip updated successfully',
            data: result.rows[0],
        } as ApiResponse<Trip>);
    } catch (error) {
        console.error('Update trip error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Delete a trip
export const deleteTrip = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        const { id } = req.params;

        // Check ownership
        const checkResult = await pool.query(
            'SELECT user_id FROM trips WHERE id = $1',
            [id]
        );

        if (checkResult.rows.length === 0) {
            res.status(404).json({ success: false, error: 'Trip not found' });
            return;
        }

        if (checkResult.rows[0].user_id !== req.user.id) {
            res.status(403).json({ success: false, error: 'Not authorized' });
            return;
        }

        await pool.query('DELETE FROM trips WHERE id = $1', [id]);

        res.json({
            success: true,
            message: 'Trip deleted successfully',
        } as ApiResponse);
    } catch (error) {
        console.error('Delete trip error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Get recent trips for dashboard
export const getRecentTrips = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        const result = await pool.query(
            `SELECT t.*, COUNT(DISTINCT ts.id) as stop_count
       FROM trips t
       LEFT JOIN trip_stops ts ON t.id = ts.trip_id
       WHERE t.user_id = $1 AND t.start_date >= CURRENT_DATE
       GROUP BY t.id
       ORDER BY t.start_date ASC
       LIMIT 4`,
            [req.user.id]
        );

        res.json({
            success: true,
            data: result.rows,
        } as ApiResponse<Trip[]>);
    } catch (error) {
        console.error('Get recent trips error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Get trip statistics for dashboard
export const getTripStats = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        const result = await pool.query(
            `SELECT 
        COUNT(*) as total_trips,
        COUNT(CASE WHEN start_date > CURRENT_DATE THEN 1 END) as upcoming_trips,
        COUNT(CASE WHEN start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE THEN 1 END) as ongoing_trips,
        COUNT(CASE WHEN end_date < CURRENT_DATE THEN 1 END) as past_trips
       FROM trips
       WHERE user_id = $1`,
            [req.user.id]
        );

        res.json({
            success: true,
            data: result.rows[0],
        } as ApiResponse);
    } catch (error) {
        console.error('Get trip stats error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Clone a trip (copy to user's account)
export const cloneTrip = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        const { id } = req.params;

        // Get original trip
        const tripResult = await pool.query(
            'SELECT * FROM trips WHERE id = $1',
            [id]
        );

        if (tripResult.rows.length === 0) {
            res.status(404).json({ success: false, error: 'Trip not found' });
            return;
        }

        const originalTrip = tripResult.rows[0];

        // Check if trip is public or owned by user
        if (!originalTrip.is_public && originalTrip.user_id !== req.user.id) {
            res.status(403).json({ success: false, error: 'Cannot clone private trip' });
            return;
        }

        // Create new trip
        const newTripResult = await pool.query(
            `INSERT INTO trips (user_id, title, description, start_date, end_date, cover_photo, is_public)
            VALUES ($1, $2, $3, $4, $5, $6, FALSE)
            RETURNING *`,
            [
                req.user.id,
                `${originalTrip.title} (Copy)`,
                originalTrip.description,
                originalTrip.start_date,
                originalTrip.end_date,
                originalTrip.cover_photo
            ]
        );

        const newTrip = newTripResult.rows[0];

        // Clone stops
        const stopsResult = await pool.query(
            'SELECT * FROM trip_stops WHERE trip_id = $1 ORDER BY order_index',
            [id]
        );

        for (const stop of stopsResult.rows) {
            const newStopResult = await pool.query(
                `INSERT INTO trip_stops (trip_id, city_id, city_name, start_date, end_date, order_index, notes)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id`,
                [newTrip.id, stop.city_id, stop.city_name, stop.start_date, stop.end_date, stop.order_index, stop.notes]
            );

            const newStopId = newStopResult.rows[0].id;

            // Clone activities for this stop
            const activitiesResult = await pool.query(
                'SELECT * FROM trip_activities WHERE trip_stop_id = $1',
                [stop.id]
            );

            for (const activity of activitiesResult.rows) {
                await pool.query(
                    `INSERT INTO trip_activities (trip_stop_id, activity_id, activity_name, scheduled_date, scheduled_time, custom_cost, notes, status)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                    [newStopId, activity.activity_id, activity.activity_name, activity.scheduled_date, activity.scheduled_time, activity.custom_cost, activity.notes, 'planned']
                );
            }
        }

        res.status(201).json({
            success: true,
            message: 'Trip cloned successfully',
            data: newTrip,
        } as ApiResponse<Trip>);
    } catch (error) {
        console.error('Clone trip error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
