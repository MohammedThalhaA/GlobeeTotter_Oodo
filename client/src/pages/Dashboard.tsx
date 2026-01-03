import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tripsAPI, citiesAPI } from '../services/api';
import TripCard from '../components/TripCard';
import Button from '../components/Button';
import {
    Plus,
    Map,
    Calendar,
    Plane,
    MapPin,
    TrendingUp,
    Loader2,
} from 'lucide-react';

interface Trip {
    id: number;
    title: string;
    description?: string;
    start_date: string;
    end_date: string;
    cover_photo?: string;
    is_public?: boolean;
    stop_count?: number;
    cities?: { city_name: string }[];
}

interface Stats {
    total_trips: string;
    upcoming_trips: string;
    ongoing_trips: string;
    past_trips: string;
}

interface City {
    id: number;
    name: string;
    country: string;
    avg_daily_cost: number;
    popularity_score: number;
    image_url?: string;
}

const Dashboard = () => {
    const { user } = useAuth();
    const [recentTrips, setRecentTrips] = useState<Trip[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [popularCities, setPopularCities] = useState<City[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [tripsRes, statsRes, citiesRes] = await Promise.all([
                    tripsAPI.getRecent(),
                    tripsAPI.getStats(),
                    citiesAPI.getPopular(),
                ]);

                if (tripsRes.data.success) setRecentTrips(tripsRes.data.data);
                if (statsRes.data.success) setStats(statsRes.data.data);
                if (citiesRes.data.success) setPopularCities(citiesRes.data.data);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    const statCards = [
        { label: 'Total Trips', value: stats?.total_trips || 0, icon: Map, color: 'bg-blue-500' },
        { label: 'Upcoming', value: stats?.upcoming_trips || 0, icon: Calendar, color: 'bg-green-500' },
        { label: 'Ongoing', value: stats?.ongoing_trips || 0, icon: Plane, color: 'bg-amber-500' },
        { label: 'Completed', value: stats?.past_trips || 0, icon: TrendingUp, color: 'bg-purple-500' },
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">
                                {getGreeting()}, {user?.name?.split(' ')[0]}! ✨
                            </h1>
                            <p className="text-primary-100 text-lg">
                                Ready to plan your next adventure?
                            </p>
                        </div>
                        <Link to="/trips/create">
                            <Button
                                variant="secondary"
                                icon={<Plus className="w-5 h-5" />}
                                className="bg-white text-primary-700 hover:bg-primary-50"
                            >
                                Plan New Trip
                            </Button>
                        </Link>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                        {statCards.map(({ label, value, icon: Icon, color }) => (
                            <div
                                key={label}
                                className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10"
                            >
                                <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}>
                                    <Icon className="w-5 h-5 text-white" />
                                </div>
                                <p className="text-3xl font-bold">{value}</p>
                                <p className="text-primary-200 text-sm">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Recent Trips */}
                <section className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-slate-900">Recent Trips</h2>
                        <Link to="/trips" className="text-primary-600 hover:text-primary-700 font-medium">
                            View All →
                        </Link>
                    </div>

                    {recentTrips.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {recentTrips.map((trip) => (
                                <TripCard key={trip.id} trip={trip} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white rounded-2xl shadow-card">
                            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Map className="w-8 h-8 text-primary-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-2">No trips yet</h3>
                            <p className="text-slate-500 mb-6">Start planning your first adventure!</p>
                            <Link to="/trips/create">
                                <Button icon={<Plus className="w-5 h-5" />}>Create Your First Trip</Button>
                            </Link>
                        </div>
                    )}
                </section>

                {/* Popular Destinations */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-slate-900">Popular Destinations</h2>
                        <Link to="/explore" className="text-primary-600 hover:text-primary-700 font-medium">
                            Explore All →
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {popularCities.map((city) => (
                            <div
                                key={city.id}
                                className="group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer"
                            >
                                {city.image_url ? (
                                    <img
                                        src={city.image_url}
                                        alt={city.name}
                                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-accent-500" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                <div className="absolute inset-0 flex flex-col justify-end p-4">
                                    <div className="flex items-center gap-1 text-white/80 text-xs mb-1">
                                        <MapPin className="w-3 h-3" />
                                        {city.country}
                                    </div>
                                    <h3 className="text-white font-bold text-lg group-hover:text-primary-200 transition-colors">
                                        {city.name}
                                    </h3>
                                    <p className="text-white/70 text-sm">
                                        ~${city.avg_daily_cost}/day
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Dashboard;
