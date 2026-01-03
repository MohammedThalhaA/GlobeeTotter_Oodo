import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { citiesAPI, tripsAPI, stopsAPI } from '../services/api';
import Button from '../components/Button';
import {
    ArrowLeft,
    MapPin,
    DollarSign,
    TrendingUp,
    Clock,
    Tag,
    Plus,
    Loader2,
    X,
    Calendar,
} from 'lucide-react';

interface Activity {
    id: number;
    name: string;
    category: string;
    estimated_cost: number;
    duration: number;
    description?: string;
}

interface City {
    id: number;
    name: string;
    country: string;
    region?: string;
    avg_daily_cost: number;
    popularity_score: number;
    description?: string;
    activities: Activity[];
    image_url?: string;
}

interface Trip {
    id: number;
    title: string;
    start_date: string;
    end_date: string;
}

const CityDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const cityId = Number(id);

    const [city, setCity] = useState<City | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Add to trip modal
    const [showAddToTrip, setShowAddToTrip] = useState(false);
    const [trips, setTrips] = useState<Trip[]>([]);
    const [selectedTrip, setSelectedTrip] = useState<number | null>(null);
    const [stopDates, setStopDates] = useState({ start_date: '', end_date: '' });
    const [addingToTrip, setAddingToTrip] = useState(false);

    useEffect(() => {
        fetchCity();
    }, [cityId]);

    const fetchCity = async () => {
        try {
            const res = await citiesAPI.getById(cityId);
            if (res.data.success) setCity(res.data.data);
        } catch (error) {
            console.error('Failed to fetch city:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTrips = async () => {
        try {
            const res = await tripsAPI.getAll();
            if (res.data.success) setTrips(res.data.data);
        } catch (error) {
            console.error('Failed to fetch trips:', error);
        }
    };

    const handleOpenAddToTrip = () => {
        setShowAddToTrip(true);
        fetchTrips();
    };

    const handleAddToTrip = async () => {
        if (!selectedTrip || !stopDates.start_date || !stopDates.end_date || !city) return;

        setAddingToTrip(true);
        try {
            await stopsAPI.add(selectedTrip, {
                city_id: city.id,
                city_name: city.name,
                start_date: stopDates.start_date,
                end_date: stopDates.end_date,
            });
            setShowAddToTrip(false);
            navigate(`/trips/${selectedTrip}/edit`);
        } catch (error) {
            console.error('Failed to add to trip:', error);
        } finally {
            setAddingToTrip(false);
        }
    };

    const categories = city?.activities
        ? [...new Set(city.activities.map((a) => a.category))]
        : [];

    const filteredActivities = selectedCategory
        ? city?.activities.filter((a) => a.category === selectedCategory)
        : city?.activities;

    const getRandomGradient = (idx: number) => {
        const gradients = [
            'from-blue-500 to-purple-600',
            'from-pink-500 to-orange-400',
            'from-green-400 to-cyan-500',
        ];
        return gradients[idx % gradients.length];
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            sightseeing: 'bg-blue-100 text-blue-700',
            food: 'bg-orange-100 text-orange-700',
            culture: 'bg-purple-100 text-purple-700',
            adventure: 'bg-green-100 text-green-700',
            shopping: 'bg-pink-100 text-pink-700',
        };
        return colors[category] || 'bg-slate-100 text-slate-700';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    if (!city) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-500">City not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero */}
            <div className="relative h-72 overflow-hidden">
                {city.image_url ? (
                    <img
                        src={city.image_url}
                        alt={city.name}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                ) : (
                    <div className={`absolute inset-0 bg-gradient-to-br ${getRandomGradient(city.id)}`} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute top-6 left-4 sm:left-6 lg:left-8 flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back
                    </button>

                    <div className="flex items-end justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-white/80 mb-2">
                                <MapPin className="w-4 h-4" />
                                <span>{city.country}</span>
                                {city.region && (
                                    <>
                                        <span className="text-white/50">•</span>
                                        <span>{city.region}</span>
                                    </>
                                )}
                            </div>
                            <h1 className="text-4xl font-bold text-white">{city.name}</h1>
                        </div>

                        <Button
                            onClick={handleOpenAddToTrip}
                            icon={<Plus className="w-5 h-5" />}
                            className="hidden md:flex"
                        >
                            Add to Trip
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Description */}
                        {city.description && (
                            <div className="bg-white rounded-2xl shadow-card p-6">
                                <h2 className="text-lg font-semibold text-slate-900 mb-3">About</h2>
                                <p className="text-slate-600 leading-relaxed">{city.description}</p>
                            </div>
                        )}

                        {/* Activities */}
                        <div className="bg-white rounded-2xl shadow-card p-6">
                            <h2 className="text-lg font-semibold text-slate-900 mb-4">
                                Things to Do ({city.activities.length})
                            </h2>

                            {/* Category Filter */}
                            {categories.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-6">
                                    <button
                                        onClick={() => setSelectedCategory(null)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === null
                                            ? 'bg-primary-500 text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                    >
                                        All
                                    </button>
                                    {categories.map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all ${selectedCategory === cat
                                                ? 'bg-primary-500 text-white'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Activity List */}
                            {filteredActivities && filteredActivities.length > 0 ? (
                                <div className="space-y-4">
                                    {filteredActivities.map((activity) => (
                                        <div
                                            key={activity.id}
                                            className="p-4 border border-slate-200 rounded-xl hover:border-primary-200 hover:bg-primary-50/30 transition-all"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-slate-900">{activity.name}</h3>
                                                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500">
                                                        <span className={`badge ${getCategoryColor(activity.category)} capitalize`}>
                                                            <Tag className="w-3 h-3 mr-1" />
                                                            {activity.category}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <DollarSign className="w-4 h-4" />
                                                            ${activity.estimated_cost}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-4 h-4" />
                                                            {activity.duration} min
                                                        </span>
                                                    </div>
                                                    {activity.description && (
                                                        <p className="text-sm text-slate-500 mt-2">{activity.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-400 text-center py-8">No activities found</p>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Stats */}
                        <div className="bg-white rounded-2xl shadow-card p-6">
                            <h3 className="font-semibold text-slate-900 mb-4">City Info</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <DollarSign className="w-5 h-5" />
                                        <span>Avg. Daily Cost</span>
                                    </div>
                                    <span className="text-lg font-bold text-slate-900">${city.avg_daily_cost}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <TrendingUp className="w-5 h-5" />
                                        <span>Popularity</span>
                                    </div>
                                    <span className="text-lg font-bold text-slate-900">{city.popularity_score}/100</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <MapPin className="w-5 h-5" />
                                        <span>Activities</span>
                                    </div>
                                    <span className="text-lg font-bold text-slate-900">{city.activities.length}</span>
                                </div>
                            </div>

                            <hr className="my-4 border-slate-100" />

                            <Button
                                onClick={handleOpenAddToTrip}
                                icon={<Plus className="w-5 h-5" />}
                                className="w-full"
                            >
                                Add to Trip
                            </Button>
                        </div>

                        {/* Cost Breakdown */}
                        <div className="bg-white rounded-2xl shadow-card p-6">
                            <h3 className="font-semibold text-slate-900 mb-4">Est. Daily Budget</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Accommodation</span>
                                    <span className="font-medium">${Math.round(city.avg_daily_cost * 0.4)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Food</span>
                                    <span className="font-medium">${Math.round(city.avg_daily_cost * 0.25)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Activities</span>
                                    <span className="font-medium">${Math.round(city.avg_daily_cost * 0.2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Transport</span>
                                    <span className="font-medium">${Math.round(city.avg_daily_cost * 0.15)}</span>
                                </div>
                                <hr className="border-slate-100" />
                                <div className="flex justify-between text-base">
                                    <span className="font-semibold text-slate-900">Total</span>
                                    <span className="font-bold text-primary-600">${city.avg_daily_cost}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Add Button */}
            <div className="fixed bottom-4 left-4 right-4 md:hidden">
                <Button
                    onClick={handleOpenAddToTrip}
                    icon={<Plus className="w-5 h-5" />}
                    className="w-full"
                >
                    Add to Trip
                </Button>
            </div>

            {/* Add to Trip Modal */}
            {showAddToTrip && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-fade-in">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold">Add {city.name} to Trip</h3>
                            <button
                                onClick={() => setShowAddToTrip(false)}
                                className="p-2 hover:bg-slate-100 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Trip Selection */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Select Trip
                                </label>
                                {trips.length === 0 ? (
                                    <p className="text-sm text-slate-500 py-4">
                                        No trips found.{' '}
                                        <button
                                            onClick={() => navigate('/trips/create')}
                                            className="text-primary-600 hover:underline"
                                        >
                                            Create one first
                                        </button>
                                    </p>
                                ) : (
                                    <div className="space-y-2 max-h-48 overflow-auto">
                                        {trips.map((trip) => (
                                            <button
                                                key={trip.id}
                                                onClick={() => {
                                                    setSelectedTrip(trip.id);
                                                    setStopDates({
                                                        start_date: trip.start_date,
                                                        end_date: trip.start_date,
                                                    });
                                                }}
                                                className={`w-full text-left p-3 rounded-lg border-2 transition-all ${selectedTrip === trip.id
                                                    ? 'border-primary-500 bg-primary-50'
                                                    : 'border-slate-200 hover:border-slate-300'
                                                    }`}
                                            >
                                                <p className="font-medium text-slate-900">{trip.title}</p>
                                                <p className="text-xs text-slate-500">
                                                    {new Date(trip.start_date).toLocaleDateString()} -{' '}
                                                    {new Date(trip.end_date).toLocaleDateString()}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Dates */}
                            {selectedTrip && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                            <Calendar className="w-4 h-4 inline mr-1" />
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            value={stopDates.start_date}
                                            onChange={(e) => setStopDates({ ...stopDates, start_date: e.target.value })}
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                            <Calendar className="w-4 h-4 inline mr-1" />
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            value={stopDates.end_date}
                                            onChange={(e) => setStopDates({ ...stopDates, end_date: e.target.value })}
                                            min={stopDates.start_date}
                                            className="input-field"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 mt-6">
                            <Button variant="secondary" onClick={() => setShowAddToTrip(false)} className="flex-1">
                                Cancel
                            </Button>
                            <Button
                                onClick={handleAddToTrip}
                                loading={addingToTrip}
                                disabled={!selectedTrip || !stopDates.start_date || !stopDates.end_date}
                                className="flex-1"
                            >
                                Add to Trip
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CityDetail;
