import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest, ApiResponse } from '../types';

// Get admin analytics data
export const getAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // Check if user is admin (for now, allow all authenticated users)
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Unauthorized' });
            return;
        }

        // Get total users count
        const usersResult = await pool.query('SELECT COUNT(*) as count FROM users');
        const totalUsers = parseInt(usersResult.rows[0].count);

        // Get users registered this month
        const newUsersResult = await pool.query(
            `SELECT COUNT(*) as count FROM users 
       WHERE created_at >= date_trunc('month', CURRENT_DATE)`
        );
        const newUsersThisMonth = parseInt(newUsersResult.rows[0].count);

        // Get total trips count
        const tripsResult = await pool.query('SELECT COUNT(*) as count FROM trips');
        const totalTrips = parseInt(tripsResult.rows[0].count);

        // Get trips created this week
        const weeklyTripsResult = await pool.query(
            `SELECT COUNT(*) as count FROM trips 
       WHERE created_at >= date_trunc('week', CURRENT_DATE)`
        );
        const tripsThisWeek = parseInt(weeklyTripsResult.rows[0].count);

        // Get total cities count
        const citiesResult = await pool.query('SELECT COUNT(*) as count FROM cities');
        const totalCities = parseInt(citiesResult.rows[0].count);

        // Get total activities count
        const activitiesResult = await pool.query('SELECT COUNT(*) as count FROM activities');
        const totalActivities = parseInt(activitiesResult.rows[0].count);

        // Get popular cities (most added to trips)
        const popularCitiesResult = await pool.query(
            `SELECT c.id, c.name, c.country, c.image_url, COUNT(ts.id) as trip_count
       FROM cities c
       LEFT JOIN trip_stops ts ON c.id = ts.city_id
       GROUP BY c.id, c.name, c.country, c.image_url
       ORDER BY trip_count DESC
       LIMIT 5`
        );

        // Get recent trips
        const recentTripsResult = await pool.query(
            `SELECT t.id, t.title, t.start_date, t.end_date, u.name as user_name, t.created_at
       FROM trips t
       JOIN users u ON t.user_id = u.id
       ORDER BY t.created_at DESC
       LIMIT 10`
        );

        // Get trip status breakdown
        const statusResult = await pool.query(
            `SELECT 
        COUNT(*) FILTER (WHERE start_date > CURRENT_DATE) as upcoming,
        COUNT(*) FILTER (WHERE start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE) as ongoing,
        COUNT(*) FILTER (WHERE end_date < CURRENT_DATE) as completed
       FROM trips`
        );

        // Get public vs private trips
        const visibilityResult = await pool.query(
            `SELECT 
        COUNT(*) FILTER (WHERE is_public = true) as public_trips,
        COUNT(*) FILTER (WHERE is_public = false OR is_public IS NULL) as private_trips
       FROM trips`
        );

        // Get monthly trip trend (last 6 months)
        const trendResult = await pool.query(
            `SELECT 
        to_char(date_trunc('month', created_at), 'Mon') as month,
        COUNT(*) as count
       FROM trips
       WHERE created_at >= CURRENT_DATE - INTERVAL '6 months'
       GROUP BY date_trunc('month', created_at)
       ORDER BY date_trunc('month', created_at)`
        );

        res.json({
            success: true,
            data: {
                overview: {
                    totalUsers,
                    newUsersThisMonth,
                    totalTrips,
                    tripsThisWeek,
                    totalCities,
                    totalActivities,
                },
                tripStatus: {
                    upcoming: parseInt(statusResult.rows[0].upcoming) || 0,
                    ongoing: parseInt(statusResult.rows[0].ongoing) || 0,
                    completed: parseInt(statusResult.rows[0].completed) || 0,
                },
                tripVisibility: {
                    public: parseInt(visibilityResult.rows[0].public_trips) || 0,
                    private: parseInt(visibilityResult.rows[0].private_trips) || 0,
                },
                popularCities: popularCitiesResult.rows,
                recentTrips: recentTripsResult.rows,
                monthlyTrend: trendResult.rows,
            },
        } as ApiResponse);
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
