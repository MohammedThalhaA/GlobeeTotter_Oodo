import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest, ApiResponse } from '../types';

// Add a stop to a trip
export const addStop = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        const { tripId } = req.params;
        const { city_id, city_name, start_date, end_date, notes } = req.body;

        // Verify trip ownership
        const tripCheck = await pool.query(
            'SELECT user_id FROM trips WHERE id = $1',
            [tripId]
        );

        if (tripCheck.rows.length === 0) {
            res.status(404).json({ success: false, error: 'Trip not found' });
            return;
        }

        if (tripCheck.rows[0].user_id !== req.user.id) {
            res.status(403).json({ success: false, error: 'Not authorized' });
            return;
        }

        // Get the next order index
        const orderResult = await pool.query(
            'SELECT COALESCE(MAX(order_index), -1) + 1 as next_order FROM trip_stops WHERE trip_id = $1',
            [tripId]
        );
        const orderIndex = orderResult.rows[0].next_order;

        const result = await pool.query(
            `INSERT INTO trip_stops (trip_id, city_id, city_name, start_date, end_date, order_index, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
            [tripId, city_id || null, city_name, start_date, end_date, orderIndex, notes]
        );

        res.status(201).json({
            success: true,
            message: 'Stop added successfully',
            data: result.rows[0],
        } as ApiResponse);
    } catch (error) {
        console.error('Add stop error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Update a stop
export const updateStop = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        const { tripId, stopId } = req.params;
        const { city_name, start_date, end_date, notes } = req.body;

        // Verify ownership
        const check = await pool.query(
            `SELECT ts.id FROM trip_stops ts
       JOIN trips t ON ts.trip_id = t.id
       WHERE ts.id = $1 AND t.id = $2 AND t.user_id = $3`,
            [stopId, tripId, req.user.id]
        );

        if (check.rows.length === 0) {
            res.status(404).json({ success: false, error: 'Stop not found or not authorized' });
            return;
        }

        const result = await pool.query(
            `UPDATE trip_stops 
       SET city_name = COALESCE($1, city_name),
           start_date = COALESCE($2, start_date),
           end_date = COALESCE($3, end_date),
           notes = COALESCE($4, notes)
       WHERE id = $5
       RETURNING *`,
            [city_name, start_date, end_date, notes, stopId]
        );

        res.json({
            success: true,
            message: 'Stop updated successfully',
            data: result.rows[0],
        } as ApiResponse);
    } catch (error) {
        console.error('Update stop error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Delete a stop
export const deleteStop = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        const { tripId, stopId } = req.params;

        // Verify ownership
        const check = await pool.query(
            `SELECT ts.id, ts.order_index FROM trip_stops ts
       JOIN trips t ON ts.trip_id = t.id
       WHERE ts.id = $1 AND t.id = $2 AND t.user_id = $3`,
            [stopId, tripId, req.user.id]
        );

        if (check.rows.length === 0) {
            res.status(404).json({ success: false, error: 'Stop not found or not authorized' });
            return;
        }

        const deletedOrder = check.rows[0].order_index;

        // Delete the stop
        await pool.query('DELETE FROM trip_stops WHERE id = $1', [stopId]);

        // Reorder remaining stops
        await pool.query(
            `UPDATE trip_stops 
       SET order_index = order_index - 1 
       WHERE trip_id = $1 AND order_index > $2`,
            [tripId, deletedOrder]
        );

        res.json({
            success: true,
            message: 'Stop deleted successfully',
        } as ApiResponse);
    } catch (error) {
        console.error('Delete stop error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Reorder stops
export const reorderStops = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        const { tripId } = req.params;
        const { stopIds } = req.body; // Array of stop IDs in new order

        if (!Array.isArray(stopIds)) {
            res.status(400).json({ success: false, error: 'stopIds must be an array' });
            return;
        }

        // Verify trip ownership
        const tripCheck = await pool.query(
            'SELECT user_id FROM trips WHERE id = $1',
            [tripId]
        );

        if (tripCheck.rows.length === 0 || tripCheck.rows[0].user_id !== req.user.id) {
            res.status(403).json({ success: false, error: 'Not authorized' });
            return;
        }

        // Update order for each stop
        const updatePromises = stopIds.map((stopId: number, index: number) =>
            pool.query(
                'UPDATE trip_stops SET order_index = $1 WHERE id = $2 AND trip_id = $3',
                [index, stopId, tripId]
            )
        );

        await Promise.all(updatePromises);

        // Fetch updated stops
        const result = await pool.query(
            'SELECT * FROM trip_stops WHERE trip_id = $1 ORDER BY order_index',
            [tripId]
        );

        res.json({
            success: true,
            message: 'Stops reordered successfully',
            data: result.rows,
        } as ApiResponse);
    } catch (error) {
        console.error('Reorder stops error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Get stops for a trip
export const getStops = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { tripId } = req.params;

        const result = await pool.query(
            `SELECT ts.*, c.country, c.avg_daily_cost, c.image_url as city_image,
              COALESCE(json_agg(
                jsonb_build_object(
                  'id', ta.id,
                  'activity_id', ta.activity_id,
                  'activity_name', ta.activity_name,
                  'scheduled_date', ta.scheduled_date,
                  'scheduled_time', ta.scheduled_time,
                  'custom_cost', ta.custom_cost,
                  'notes', ta.notes,
                  'status', ta.status
                ) ORDER BY ta.scheduled_date, ta.scheduled_time
              ) FILTER (WHERE ta.id IS NOT NULL), '[]') as activities
       FROM trip_stops ts
       LEFT JOIN cities c ON ts.city_id = c.id
       LEFT JOIN trip_activities ta ON ts.id = ta.trip_stop_id
       WHERE ts.trip_id = $1
       GROUP BY ts.id, c.country, c.avg_daily_cost, c.image_url
       ORDER BY ts.order_index`,
            [tripId]
        );

        res.json({
            success: true,
            data: result.rows,
        } as ApiResponse);
    } catch (error) {
        console.error('Get stops error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
