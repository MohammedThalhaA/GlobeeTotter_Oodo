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

// In-memory token store (for demo - use Redis/DB in production)
const resetTokens: Map<string, { email: string; expires: Date }> = new Map();

// Forgot Password - Generate reset token
export const forgotPassword = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const { email } = req.body;

        if (!email) {
            res.status(400).json({
                success: false,
                error: 'Please provide an email address',
            } as ApiResponse);
            return;
        }

        // Check if user exists
        const result = await pool.query(
            'SELECT id, email FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        // Always return success to prevent email enumeration
        if (result.rows.length === 0) {
            res.json({
                success: true,
                message: 'If an account exists, a reset link has been sent',
            } as ApiResponse);
            return;
        }

        // Generate reset token
        const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
        const expires = new Date(Date.now() + 3600000); // 1 hour

        resetTokens.set(token, { email: email.toLowerCase(), expires });

        // In production, send email here. For demo, log to console.
        console.log('='.repeat(50));
        console.log('PASSWORD RESET TOKEN GENERATED');
        console.log(`Email: ${email}`);
        console.log(`Token: ${token}`);
        console.log(`Reset URL: http://localhost:5173/reset-password?token=${token}`);
        console.log('='.repeat(50));

        res.json({
            success: true,
            message: 'If an account exists, a reset link has been sent',
            // Include token in dev mode for testing
            data: process.env.NODE_ENV !== 'production' ? { token } : undefined,
        } as ApiResponse);
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
        } as ApiResponse);
    }
};

// Reset Password - Validate token and update password
export const resetPassword = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            res.status(400).json({
                success: false,
                error: 'Please provide token and new password',
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

        // Validate token
        const tokenData = resetTokens.get(token);
        if (!tokenData || tokenData.expires < new Date()) {
            res.status(400).json({
                success: false,
                error: 'Invalid or expired reset token',
            } as ApiResponse);
            return;
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        console.log('='.repeat(50));
        console.log('PASSWORD RESET ATTEMPT');
        console.log(`Email: ${tokenData.email}`);
        console.log(`Token: ${token}`);

        // Update password
        const updateResult = await pool.query(
            'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id, email',
            [password_hash, tokenData.email]
        );

        console.log(`Rows affected: ${updateResult.rowCount}`);
        if (updateResult.rows.length > 0) {
            console.log(`Updated user: ID=${updateResult.rows[0].id}, Email=${updateResult.rows[0].email}`);
        } else {
            console.log('WARNING: No user was updated!');
        }
        console.log('='.repeat(50));

        // Remove used token
        resetTokens.delete(token);

        res.json({
            success: true,
            message: 'Password reset successfully. You can now login.',
        } as ApiResponse);
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
        } as ApiResponse);
    }
};

// Delete Account
export const deleteAccount = async (
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

        const { password } = req.body;

        if (!password) {
            res.status(400).json({
                success: false,
                error: 'Please provide your password to confirm account deletion',
            } as ApiResponse);
            return;
        }

        // Verify password
        const userResult = await pool.query(
            'SELECT password_hash FROM users WHERE id = $1',
            [req.user.id]
        );

        if (userResult.rows.length === 0) {
            res.status(404).json({
                success: false,
                error: 'User not found',
            } as ApiResponse);
            return;
        }

        const isMatch = await bcrypt.compare(password, userResult.rows[0].password_hash);
        if (!isMatch) {
            res.status(401).json({
                success: false,
                error: 'Invalid password',
            } as ApiResponse);
            return;
        }

        // Delete user (CASCADE will handle trips, stops, activities)
        await pool.query('DELETE FROM users WHERE id = $1', [req.user.id]);

        res.json({
            success: true,
            message: 'Account deleted successfully',
        } as ApiResponse);
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
        } as ApiResponse);
    }
};

// Change Password (for authenticated users from Profile)
export const changePassword = async (
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

        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            res.status(400).json({
                success: false,
                error: 'Please provide current password and new password',
            } as ApiResponse);
            return;
        }

        if (newPassword.length < 6) {
            res.status(400).json({
                success: false,
                error: 'New password must be at least 6 characters',
            } as ApiResponse);
            return;
        }

        // Get current user's password hash
        const userResult = await pool.query(
            'SELECT password_hash FROM users WHERE id = $1',
            [req.user.id]
        );

        if (userResult.rows.length === 0) {
            res.status(404).json({
                success: false,
                error: 'User not found',
            } as ApiResponse);
            return;
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
        if (!isMatch) {
            res.status(401).json({
                success: false,
                error: 'Current password is incorrect',
            } as ApiResponse);
            return;
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const newPasswordHash = await bcrypt.hash(newPassword, salt);

        // Update password
        await pool.query(
            'UPDATE users SET password_hash = $1 WHERE id = $2',
            [newPasswordHash, req.user.id]
        );

        console.log(`Password changed for user ID: ${req.user.id}`);

        res.json({
            success: true,
            message: 'Password changed successfully',
        } as ApiResponse);
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
        } as ApiResponse);
    }
};
