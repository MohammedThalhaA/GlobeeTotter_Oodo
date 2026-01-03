import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest, ApiResponse } from '../types';

// Get all favorites for the current user
export const getFavorites = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Not authenticated',
            } as ApiResponse);
            return;
        }

        const result = await pool.query(
            `SELECT c.*, f.created_at as favorited_at 
             FROM favorites f
             JOIN cities c ON f.city_id = c.id
             WHERE f.user_id = $1
             ORDER BY f.created_at DESC`,
            [req.user.id]
        );

        res.json({
            success: true,
            data: result.rows,
        } as ApiResponse);
    } catch (error) {
        console.error('Get favorites error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
        } as ApiResponse);
    }
};

// Add a city to favorites
export const addFavorite = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Not authenticated',
            } as ApiResponse);
            return;
        }

        const { cityId } = req.body;

        if (!cityId) {
            res.status(400).json({
                success: false,
                error: 'City ID is required',
            } as ApiResponse);
            return;
        }

        // Check if already favorites
        const existing = await pool.query(
            'SELECT id FROM favorites WHERE user_id = $1 AND city_id = $2',
            [req.user.id, cityId]
        );

        if (existing.rows.length > 0) {
            res.status(400).json({
                success: false,
                error: 'City is already in favorites',
            } as ApiResponse);
            return;
        }

        await pool.query(
            'INSERT INTO favorites (user_id, city_id) VALUES ($1, $2)',
            [req.user.id, cityId]
        );

        res.status(201).json({
            success: true,
            message: 'Added to favorites',
        } as ApiResponse);
    } catch (error) {
        console.error('Add favorite error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
        } as ApiResponse);
    }
};

// Remove a city from favorites
export const removeFavorite = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Not authenticated',
            } as ApiResponse);
            return;
        }

        const { cityId } = req.params;

        if (!cityId) {
            res.status(400).json({
                success: false,
                error: 'City ID is required',
            } as ApiResponse);
            return;
        }

        await pool.query(
            'DELETE FROM favorites WHERE user_id = $1 AND city_id = $2',
            [req.user.id, cityId]
        );

        res.json({
            success: true,
            message: 'Removed from favorites',
        } as ApiResponse);
    } catch (error) {
        console.error('Remove favorite error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
        } as ApiResponse);
    }
};
