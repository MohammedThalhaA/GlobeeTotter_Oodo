import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { tripsAPI } from '../services/api';
import Button from '../components/Button';
import ShareModal from '../components/ShareModal';
import {
    ArrowLeft,
    Calendar,
    MapPin,
    Globe,
    Edit,
    Trash2,
    Share2,
    Loader2,
    Clock,
    DollarSign,
} from 'lucide-react';

interface TripStop {
    id: number;
    city_name: string;
    country?: string;
    start_date: string;
    end_date: string;
    avg_daily_cost?: number;
    activities: {
        id: number;
        activity_name: string;
        scheduled_date?: string;
        custom_cost?: number;
        status: string;
    }[];
}

interface TripDetails {
    id: number;
    title: string;
    description?: string;
    start_date: string;
    end_date: string;
    cover_photo?: string;
    is_public: boolean;
    owner_name: string;
    user_id: number;
    stops: TripStop[];
}

const TripDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [trip, setTrip] = useState<TripDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);

    useEffect(() => {
        const fetchTrip = async () => {
            try {
                const response = await tripsAPI.getById(Number(id));
                if (response.data.success) {
                    setTrip(response.data.data);
                }
            } catch (err) {
                setError('Failed to load trip details');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchTrip();
    }, [id]);

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this trip?')) return;

        setDeleteLoading(true);
        try {
            await tripsAPI.delete(Number(id));
            navigate('/trips');
        } catch (err) {
            console.error('Failed to delete trip:', err);
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleShare = async () => {
        const shareUrl = `${window.location.origin}/share/${id}`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: trip?.title || 'Check out my trip!',
                    text: `Check out this trip to ${trip?.stops[0]?.city_name || 'an amazing destination'}!`,
                    url: shareUrl,
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            setShowShareModal(true);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getDuration = (start: string, end: string) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        return `${days} day${days !== 1 ? 's' : ''}`;
    };

    const getRandomGradient = (idx: number) => {
        const gradients = [
            'from-blue-500 to-purple-600',
            'from-pink-500 to-orange-400',
            'from-green-400 to-cyan-500',
            'from-yellow-400 to-red-500',
            'from-indigo-500 to-pink-500',
        ];
        return gradients[idx % gradients.length];
    };

    const calculateBudget = (stops: TripStop[] = []) => {
        let total = 0;
        stops.forEach(stop => {
            // Daily costs
            const days = Math.ceil((new Date(stop.end_date).getTime() - new Date(stop.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1;
            total += (stop.avg_daily_cost || 0) * days;

            // Activity costs
            if (stop.activities) {
                stop.activities.forEach(activity => {
                    total += Number(activity.custom_cost || 0);
                });
            }
        });
        return total;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    if (error || !trip) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error || 'Trip not found'}</p>
                    <Button onClick={() => navigate('/trips')}>Back to Trips</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Section */}
            <div className={`relative h-64 md:h-80 bg-gradient-to-br ${getRandomGradient(trip.id)}`}>
                {trip.cover_photo && (
                    <img
                        src={trip.cover_photo}
                        alt={trip.title}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                <div className="absolute inset-0 flex flex-col justify-end max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute top-6 left-4 sm:left-6 lg:left-8 flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back
                    </button>

                    {trip.is_public && (
                        <span className="badge bg-white/20 backdrop-blur-sm text-white text-sm mb-4 self-start">
                            <Globe className="w-4 h-4 mr-1" />
                            Public Trip
                        </span>
                    )}

                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{trip.title}</h1>

                    <div className="flex flex-wrap items-center gap-4 text-white/80">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(trip.start_date)} - {formatDate(trip.end_date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{getDuration(trip.start_date, trip.end_date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{trip.stops?.length || 0} {trip.stops?.length === 1 ? 'stop' : 'stops'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Description */}
                        {trip.description && (
                            <div className="bg-white rounded-2xl shadow-card p-6">
                                <h2 className="text-lg font-semibold text-slate-900 mb-3">About This Trip</h2>
                                <p className="text-slate-600 leading-relaxed">{trip.description}</p>
                            </div>
                        )}

                        {/* Itinerary */}
                        <div className="bg-white rounded-2xl shadow-card p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-slate-900">Itinerary</h2>
                                <Link to={`/trips/${trip.id}/edit`}>
                                    <Button variant="secondary" size="sm" icon={<Edit className="w-4 h-4" />}>
                                        Edit
                                    </Button>
                                </Link>
                            </div>

                            {trip.stops && trip.stops.length > 0 ? (
                                <div className="space-y-4">
                                    {trip.stops.map((stop, index) => (
                                        <div
                                            key={stop.id}
                                            className="relative pl-8 pb-6 border-l-2 border-primary-200 last:border-l-0 last:pb-0"
                                        >
                                            {/* Timeline dot */}
                                            <div className="absolute -left-2.5 top-0 w-5 h-5 bg-primary-500 rounded-full border-4 border-white shadow" />

                                            <div className="bg-slate-50 rounded-xl p-4 ml-2">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <h3 className="font-semibold text-slate-900">{stop.city_name}</h3>
                                                        {stop.country && (
                                                            <p className="text-sm text-slate-500">{stop.country}</p>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-primary-600 font-medium bg-primary-100 px-2 py-1 rounded-full">
                                                        Stop {index + 1}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-600">
                                                    {formatDate(stop.start_date)} - {formatDate(stop.end_date)}
                                                </p>

                                                {/* Activities */}
                                                {stop.activities.length > 0 && (
                                                    <div className="mt-3 space-y-2">
                                                        {stop.activities.map((activity) => (
                                                            <div
                                                                key={activity.id}
                                                                className="flex items-center gap-2 text-sm"
                                                            >
                                                                <span className="w-1.5 h-1.5 bg-accent-500 rounded-full" />
                                                                <span className="text-slate-700">{activity.activity_name}</span>
                                                                {activity.custom_cost && (
                                                                    <span className="text-slate-400">
                                                                        (${activity.custom_cost})
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-500">No stops added yet</p>
                                    <p className="text-sm text-slate-400">Start building your itinerary!</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Actions */}
                        <div className="bg-white rounded-2xl shadow-card p-6">
                            <h3 className="font-semibold text-slate-900 mb-4">Actions</h3>
                            <div className="space-y-3">
                                <Link to={`/trips/${trip.id}/edit`} className="block">
                                    <Button variant="secondary" className="w-full" icon={<Edit className="w-4 h-4" />}>
                                        Edit Trip
                                    </Button>
                                </Link>
                                <Link to={`/trips/${trip.id}/budget`} className="block">
                                    <Button variant="secondary" className="w-full" icon={<DollarSign className="w-4 h-4" />}>
                                        View Budget
                                    </Button>
                                </Link>
                                <Link to={`/trips/${trip.id}/calendar`} className="block">
                                    <Button variant="secondary" className="w-full" icon={<Calendar className="w-4 h-4" />}>
                                        Calendar View
                                    </Button>
                                </Link>
                                <Button
                                    variant="secondary"
                                    className="w-full"
                                    icon={<Share2 className="w-4 h-4" />}
                                    onClick={handleShare}
                                >
                                    Share Trip
                                </Button>
                                <Button
                                    variant="danger"
                                    className="w-full"
                                    icon={<Trash2 className="w-4 h-4" />}
                                    loading={deleteLoading}
                                    onClick={handleDelete}
                                >
                                    Delete Trip
                                </Button>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-white rounded-2xl shadow-card p-6">
                            <h3 className="font-semibold text-slate-900 mb-4">Trip Summary</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500">Duration</span>
                                    <span className="font-medium text-slate-900">
                                        {getDuration(trip.start_date, trip.end_date)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500">Destinations</span>
                                    <span className="font-medium text-slate-900">{trip.stops?.length || 0}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500">Activities</span>
                                    <span className="font-medium text-slate-900">
                                        {(trip.stops || []).reduce((acc, stop) => acc + (stop.activities?.length || 0), 0)}
                                    </span>
                                </div>
                                <hr className="border-slate-100" />
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500 flex items-center gap-1">
                                        <DollarSign className="w-4 h-4" />
                                        Est. Budget
                                    </span>
                                    <span className="font-medium text-slate-900">
                                        ${calculateBudget(trip.stops).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {trip && (
                <ShareModal
                    isOpen={showShareModal}
                    onClose={() => setShowShareModal(false)}
                    title={trip.title}
                    url={`${window.location.origin}/share/${id}`}
                />
            )}
        </div>
    );
};

export default TripDetail;
