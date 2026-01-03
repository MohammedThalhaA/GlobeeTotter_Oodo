import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import { AuthRequest, ApiResponse, AuthResponse, User } from '../types';

// Register a new user
export const register = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const { name, email, password } = req.body;

        // Validation
        if (!name || !email || !password) {
            res.status(400).json({
                success: false,
                error: 'Please provide name, email, and password',
            } as ApiResponse);
            return;
        }

        if (password.length < 6) {
            res.status(400).json({
                success: false,
                error: 'Password must be at least 6 characters',
            } as ApiResponse);
            return;
        }

        // Check if user exists
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (existingUser.rows.length > 0) {
            res.status(400).json({
                success: false,
                error: 'User with this email already exists',
            } as ApiResponse);
            return;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Create user
        const result = await pool.query(
            `INSERT INTO users (name, email, password_hash, is_admin) 
       VALUES ($1, $2, $3, FALSE) 
       RETURNING id, name, email, profile_photo, preferences, is_admin, created_at`,
            [name, email.toLowerCase(), password_hash]
        );

        const user = result.rows[0];

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name, is_admin: user.is_admin || false },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: { token, user },
        } as ApiResponse<AuthResponse>);
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error during registration',
        } as ApiResponse);
    }
};

// Login user
export const login = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            res.status(400).json({
                success: false,
                error: 'Please provide email and password',
            } as ApiResponse);
            return;
        }

        // Find user
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (result.rows.length === 0) {
            res.status(401).json({
                success: false,
                error: 'Invalid credentials',
            } as ApiResponse);
            return;
        }

        const user: User = result.rows[0];

        // Check password
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            res.status(401).json({
                success: false,
                error: 'Invalid credentials',
            } as ApiResponse);
            return;
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name, is_admin: user.is_admin || false },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        // Remove password from response
        const { password_hash, ...userWithoutPassword } = user;

        res.json({
            success: true,
            message: 'Login successful',
            data: { token, user: userWithoutPassword },
        } as ApiResponse<AuthResponse>);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error during login',
        } as ApiResponse);
    }
};

// Get current user profile
export const getProfile = async (
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
            'SELECT id, name, email, profile_photo, preferences, is_admin, created_at FROM users WHERE id = $1',
            [req.user.id]
        );

        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                error: 'User not found',
            } as ApiResponse);
            return;
        }

        res.json({
            success: true,
            data: result.rows[0],
        } as ApiResponse);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
        } as ApiResponse);
    }
};

// Update user profile
export const updateProfile = async (
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

        const { name, profile_photo, preferences } = req.body;

        const result = await pool.query(
            `UPDATE users 
       SET name = COALESCE($1, name),
           profile_photo = COALESCE($2, profile_photo),
           preferences = COALESCE($3, preferences),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, name, email, profile_photo, preferences, created_at, updated_at`,
            [name, profile_photo, preferences, req.user.id]
        );

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: result.rows[0],
        } as ApiResponse);
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
        } as ApiResponse);
    }
};
