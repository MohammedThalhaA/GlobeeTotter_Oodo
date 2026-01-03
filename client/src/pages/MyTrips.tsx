import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tripsAPI } from '../services/api';
import TripCard from '../components/TripCard';
import Button from '../components/Button';
import { Plus, Search, Filter, Loader2, Map } from 'lucide-react';

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

const MyTrips = () => {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
    const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

    useEffect(() => {
        fetchTrips();
    }, []);

    useEffect(() => {
        filterTrips();
    }, [trips, searchQuery, filter]);

    const fetchTrips = async () => {
        try {
            const response = await tripsAPI.getAll();
            if (response.data.success) {
                setTrips(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch trips:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterTrips = () => {
        let result = [...trips];

        // Search filter
        if (searchQuery) {
            result = result.filter(
                (trip) =>
                    trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    trip.description?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Date filter
        const today = new Date();
        if (filter === 'upcoming') {
            result = result.filter((trip) => new Date(trip.start_date) > today);
        } else if (filter === 'past') {
            result = result.filter((trip) => new Date(trip.end_date) < today);
        }

        setFilteredTrips(result);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this trip?')) return;

        setDeleteLoading(id);
        try {
            await tripsAPI.delete(id);
            setTrips(trips.filter((t) => t.id !== id));
        } catch (error) {
            console.error('Failed to delete trip:', error);
        } finally {
            setDeleteLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">My Trips</h1>
                        <p className="text-slate-500 mt-1">
                            {trips.length} {trips.length === 1 ? 'trip' : 'trips'} planned
                        </p>
                    </div>
                    <Link to="/trips/create">
                        <Button icon={<Plus className="w-5 h-5" />}>Create New Trip</Button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-card p-4 mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search trips..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:border-primary-500 focus:bg-white focus:outline-none transition-all"
                            />
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
                            <Filter className="w-5 h-5 text-slate-400 ml-3" />
                            {(['all', 'upcoming', 'past'] as const).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${filter === f
                                            ? 'bg-white text-primary-600 shadow-sm'
                                            : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                >
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Trips Grid */}
                {filteredTrips.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTrips.map((trip) => (
                            <div key={trip.id} className={deleteLoading === trip.id ? 'opacity-50' : ''}>
                                <TripCard trip={trip} onDelete={handleDelete} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-card">
                        <div className="w-20 h-20 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Map className="w-10 h-10 text-primary-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">
                            {searchQuery || filter !== 'all' ? 'No trips found' : 'No trips yet'}
                        </h3>
                        <p className="text-slate-500 mb-6 max-w-md mx-auto">
                            {searchQuery || filter !== 'all'
                                ? 'Try adjusting your search or filters'
                                : 'Create your first trip and start planning your adventure!'}
                        </p>
                        {!searchQuery && filter === 'all' && (
                            <Link to="/trips/create">
                                <Button icon={<Plus className="w-5 h-5" />}>Create Your First Trip</Button>
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyTrips;
