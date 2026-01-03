import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest, ApiResponse } from '../types';

// Get budget breakdown for a trip
export const getTripBudget = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { tripId } = req.params;

        // Get trip info
        const tripResult = await pool.query(
            'SELECT id, title, start_date, end_date, user_id, is_public FROM trips WHERE id = $1',
            [tripId]
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

        // Get all activities with costs
        const activitiesResult = await pool.query(
            `SELECT 
        ta.id,
        ta.activity_name,
        ta.custom_cost,
        ta.scheduled_date,
        ts.city_name,
        ts.start_date as stop_start,
        ts.end_date as stop_end,
        a.category,
        a.estimated_cost as default_cost
       FROM trip_activities ta
       JOIN trip_stops ts ON ta.trip_stop_id = ts.id
       LEFT JOIN activities a ON ta.activity_id = a.id
       WHERE ts.trip_id = $1
       ORDER BY ta.scheduled_date`,
            [tripId]
        );

        // Get city average daily costs
        const cityCostsResult = await pool.query(
            `SELECT 
        ts.city_name,
        ts.start_date,
        ts.end_date,
        c.avg_daily_cost
       FROM trip_stops ts
       LEFT JOIN cities c ON ts.city_id = c.id
       WHERE ts.trip_id = $1
       ORDER BY ts.order_index`,
            [tripId]
        );

        // Calculate costs
        const activities = activitiesResult.rows;
        const stops = cityCostsResult.rows;

        // Total activity costs
        const activityTotal = activities.reduce((sum, a) => {
            const cost = a.custom_cost || a.default_cost || 0;
            return sum + Number(cost);
        }, 0);

        // Category breakdown
        const categoryBreakdown: Record<string, number> = {};
        activities.forEach((a) => {
            const category = a.category || 'other';
            const cost = a.custom_cost || a.default_cost || 0;
            categoryBreakdown[category] = (categoryBreakdown[category] || 0) + Number(cost);
        });

        // City costs (estimated based on avg_daily_cost)
        const cityBreakdown: Record<string, { days: number; cost: number }> = {};
        let accommodationTotal = 0;
        let transportTotal = 0;

        stops.forEach((stop) => {
            const start = new Date(stop.start_date);
            const end = new Date(stop.end_date);
            const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            const dailyCost = stop.avg_daily_cost || 100;

            cityBreakdown[stop.city_name] = {
                days,
                cost: days * dailyCost,
            };

            // Estimate accommodation (40% of daily cost)
            accommodationTotal += days * dailyCost * 0.4;
            // Estimate transport between cities
            transportTotal += 50; // flat rate per city
        });

        // Daily breakdown
        const tripStart = new Date(trip.start_date);
        const tripEnd = new Date(trip.end_date);
        const totalDays = Math.ceil((tripEnd.getTime() - tripStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        const dailyCosts: { date: string; cost: number; activities: string[] }[] = [];
        for (let i = 0; i < totalDays; i++) {
            const date = new Date(tripStart);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];

            const dayActivities = activities.filter(
                (a) => a.scheduled_date && a.scheduled_date.toISOString().split('T')[0] === dateStr
            );

            const dayCost = dayActivities.reduce((sum, a) => {
                return sum + Number(a.custom_cost || a.default_cost || 0);
            }, 0);

            dailyCosts.push({
                date: dateStr,
                cost: dayCost + (accommodationTotal / totalDays), // Add daily accommodation
                activities: dayActivities.map((a) => a.activity_name),
            });
        }

        // Grand total
        const grandTotal = activityTotal + accommodationTotal + transportTotal;

        res.json({
            success: true,
            data: {
                tripId: trip.id,
                tripTitle: trip.title,
                totalDays,
                grandTotal: Math.round(grandTotal),
                breakdown: {
                    activities: Math.round(activityTotal),
                    accommodation: Math.round(accommodationTotal),
                    transport: Math.round(transportTotal),
                },
                categoryBreakdown: Object.entries(categoryBreakdown).map(([category, cost]) => ({
                    category,
                    cost: Math.round(cost as number),
                })),
                cityBreakdown: Object.entries(cityBreakdown).map(([city, data]) => ({
                    city,
                    days: data.days,
                    cost: Math.round(data.cost),
                })),
                dailyCosts: dailyCosts.map((d) => ({
                    ...d,
                    cost: Math.round(d.cost),
                })),
            },
        } as ApiResponse);
    } catch (error) {
        console.error('Get trip budget error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
