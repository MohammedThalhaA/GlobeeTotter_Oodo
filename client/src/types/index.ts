export interface City {
    id: number;
    name: string;
    country: string;
    region: string;
    description?: string;
    image_url: string;
    avg_daily_cost?: number;
    popularity_score?: number;
    created_at?: string;
    updated_at?: string;
}

export interface Trip {
    id: number;
    user_id: number;
    name: string;
    start_date: string;
    end_date: string;
    destination?: string;
    budget?: number;
    created_at?: string;
    stop_count?: number;
}

export interface User {
    id: number;
    name: string;
    email: string;
    profile_photo?: string;
    preferences?: {
        currency?: string;
        notifications?: boolean;
        emailUpdates?: boolean;
    };
    is_admin?: boolean;
    created_at?: string;
    updated_at?: string;
}
