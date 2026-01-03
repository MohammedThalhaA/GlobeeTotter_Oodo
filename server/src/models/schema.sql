-- GlobeTrotter Database Schema
-- PostgreSQL

-- Drop tables if they exist (for fresh setup)
DROP TABLE IF EXISTS trip_activities CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS trip_stops CASCADE;
DROP TABLE IF EXISTS trips CASCADE;
DROP TABLE IF EXISTS cities CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profile_photo TEXT,
    preferences JSONB DEFAULT '{}',
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trips table
CREATE TABLE trips (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    cover_photo TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Cities table (master data)
CREATE TABLE cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    region VARCHAR(100),
    avg_daily_cost DECIMAL(10, 2),
    popularity_score INTEGER DEFAULT 0,
    image_url TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trip stops (cities within a trip)
CREATE TABLE trip_stops (
    id SERIAL PRIMARY KEY,
    trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    city_id INTEGER REFERENCES cities(id),
    city_name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Activities table (master data for activities per city)
CREATE TABLE activities (
    id SERIAL PRIMARY KEY,
    city_id INTEGER REFERENCES cities(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    estimated_cost DECIMAL(10, 2),
    duration INTEGER, -- in minutes
    description TEXT,
    image_url TEXT,
    rating DECIMAL(2, 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trip activities (activities assigned to a trip stop)
CREATE TABLE trip_activities (
    id SERIAL PRIMARY KEY,
    trip_stop_id INTEGER NOT NULL REFERENCES trip_stops(id) ON DELETE CASCADE,
    activity_id INTEGER REFERENCES activities(id),
    activity_name VARCHAR(255) NOT NULL,
    scheduled_date DATE,
    scheduled_time TIME,
    custom_cost DECIMAL(10, 2),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'planned',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX idx_trips_user_id ON trips(user_id);
CREATE INDEX idx_trip_stops_trip_id ON trip_stops(trip_id);
CREATE INDEX idx_trip_activities_trip_stop_id ON trip_activities(trip_stop_id);
CREATE INDEX idx_activities_city_id ON activities(city_id);
CREATE INDEX idx_cities_country ON cities(country);

-- Insert some sample cities with HD Unsplash images
INSERT INTO cities (name, country, region, avg_daily_cost, popularity_score, description, image_url) VALUES
('Paris', 'France', 'Europe', 150.00, 95, 'The City of Light, known for Eiffel Tower, Louvre, and romantic ambiance', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&h=800&fit=crop&q=90'),
('Tokyo', 'Japan', 'Asia', 120.00, 92, 'A blend of ultramodern and traditional, from neon-lit skyscrapers to historic temples', 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&h=800&fit=crop&q=90'),
('New York', 'USA', 'North America', 200.00, 94, 'The city that never sleeps, iconic skyline and endless entertainment', 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200&h=800&fit=crop&q=90'),
('Rome', 'Italy', 'Europe', 130.00, 90, 'Ancient history meets vibrant culture in the Eternal City', 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200&h=800&fit=crop&q=90'),
('Barcelona', 'Spain', 'Europe', 110.00, 88, 'Gaudi architecture, beautiful beaches, and Mediterranean vibes', 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1200&h=800&fit=crop&q=90'),
('Bali', 'Indonesia', 'Asia', 60.00, 85, 'Tropical paradise with temples, rice terraces, and stunning beaches', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&h=800&fit=crop&q=90'),
('Dubai', 'UAE', 'Middle East', 180.00, 87, 'Luxury shopping, ultramodern architecture, and desert adventures', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&h=800&fit=crop&q=90'),
('Sydney', 'Australia', 'Oceania', 160.00, 86, 'Iconic Opera House, beautiful harbors, and vibrant culture', 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1200&h=800&fit=crop&q=90'),
('London', 'UK', 'Europe', 170.00, 93, 'Historic landmarks, world-class museums, and British charm', 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&h=800&fit=crop&q=90'),
('Singapore', 'Singapore', 'Asia', 140.00, 89, 'Futuristic city-state with incredible food and Gardens by the Bay', 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&h=800&fit=crop&q=90');

-- Insert sample activities for Paris
INSERT INTO activities (city_id, name, category, estimated_cost, duration, description) VALUES
(1, 'Eiffel Tower Visit', 'sightseeing', 25.00, 180, 'Iconic iron lattice tower with stunning city views'),
(1, 'Louvre Museum', 'culture', 17.00, 240, 'World''s largest art museum, home to Mona Lisa'),
(1, 'Seine River Cruise', 'sightseeing', 15.00, 60, 'Scenic boat ride along the River Seine'),
(1, 'Croissant & Coffee at Café de Flore', 'food', 12.00, 45, 'Classic Parisian café experience');

-- Insert sample activities for Tokyo
INSERT INTO activities (city_id, name, category, estimated_cost, duration, description) VALUES
(2, 'Senso-ji Temple Visit', 'culture', 0.00, 90, 'Ancient Buddhist temple in Asakusa'),
(2, 'Shibuya Crossing Experience', 'sightseeing', 0.00, 30, 'World''s busiest pedestrian crossing'),
(2, 'Tsukiji Outer Market Food Tour', 'food', 40.00, 120, 'Fresh sushi and Japanese street food'),
(2, 'Tokyo Skytree Observation', 'sightseeing', 18.00, 60, 'Panoramic views from the tallest tower');
