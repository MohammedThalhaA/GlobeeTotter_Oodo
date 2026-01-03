import { Request } from 'express';

// User types
export interface User {
    id: number;
    name: string;
    email: string;
    password_hash: string;
    profile_photo?: string;
    preferences?: Record<string, any>;
    is_admin?: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface UserPayload {
    id: number;
    email: string;
    name: string;
    is_admin?: boolean;
}

export interface AuthRequest extends Request {
    user?: UserPayload;
}

// Trip types
export interface Trip {
    id: number;
    user_id: number;
    title: string;
    description?: string;
    start_date: Date;
    end_date: Date;
    cover_photo?: string;
    is_public: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface TripStop {
    id: number;
    trip_id: number;
    city_id?: number;
    city_name: string;
    start_date: Date;
    end_date: Date;
    order_index: number;
    notes?: string;
    created_at: Date;
}

export interface City {
    id: number;
    name: string;
    country: string;
    region?: string;
    avg_daily_cost?: number;
    popularity_score: number;
    image_url?: string;
    description?: string;
    created_at: Date;
}

export interface Activity {
    id: number;
    city_id?: number;
    name: string;
    category: string;
    estimated_cost?: number;
    duration?: number;
    description?: string;
    image_url?: string;
    rating?: number;
    created_at: Date;
}

export interface TripActivity {
    id: number;
    trip_stop_id: number;
    activity_id?: number;
    activity_name: string;
    scheduled_date?: Date;
    scheduled_time?: string;
    custom_cost?: number;
    notes?: string;
    status: string;
    created_at: Date;
}

// API Response types
export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
}

// Auth types
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    user: Omit<User, 'password_hash'>;
}
