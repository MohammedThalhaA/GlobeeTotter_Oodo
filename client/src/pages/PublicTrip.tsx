import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { tripsAPI, stopsAPI } from '../services/api';
import Button from '../components/Button';
import ShareModal from '../components/ShareModal';
import {
    Globe,
    Calendar,
    MapPin,
    Clock,
    DollarSign,
    Share2,
    Copy,
    Check,
    Loader2,
} from 'lucide-react';

interface Activity {
    id: number;
    activity_name: string;
    scheduled_date?: string;
    scheduled_time?: string;
    custom_cost?: number;
}

interface Stop {
    id: number;
    city_name: string;
    country?: string;
    start_date: string;
    end_date: string;
    activities: Activity[];
}

interface Trip {
    id: number;
    title: string;
    description?: string;
    start_date: string;
    end_date: string;
    cover_photo?: string;
    is_public: boolean;
    owner_name: string;
}

const PublicTrip = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const tripId = Number(id);

    const [trip, setTrip] = useState<Trip | null>(null);
    const [stops, setStops] = useState<Stop[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showShareModal, setShowShareModal] = useState(false);
    const [cloning, setCloning] = useState(false);
    const [cloneSuccess, setCloneSuccess] = useState(false);

    const handleCloneTrip = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            // Redirect to login if not authenticated
            navigate('/login');
            return;
        }

        setCloning(true);
        try {
            const response = await tripsAPI.clone(tripId);
            if (response.data.success) {
                setCloneSuccess(true);
                setTimeout(() => {
                    navigate(`/trips/${response.data.data.id}`);
                }, 1500);
            }
        } catch (err) {
            console.error('Failed to clone trip:', err);
            alert('Failed to clone trip. Please try again.');
        } finally {
            setCloning(false);
        }
    };

    useEffect(() => {
        const fetchTrip = async () => {
            try {
                const [tripRes, stopsRes] = await Promise.all([
                    tripsAPI.getById(tripId),
                    stopsAPI.getAll(tripId),
                ]);
                if (tripRes.data.success) {
                    const tripData = tripRes.data.data;
                    if (!tripData.is_public) {
                        setError('This trip is private');
                    } else {
                        setTrip(tripData);
                    }
                }
                if (stopsRes.data.success) setStops(stopsRes.data.data);
            } catch (err) {
                console.error('Failed to fetch trip:', err);
                setError('Trip not found');
            } finally {
                setLoading(false);
            }
        };

        fetchTrip();
    }, [tripId]);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: trip?.title || 'Check out my trip!',
                    text: `Check out this trip to ${stops[0]?.city_name || 'an amazing destination'}!`,
                    url: window.location.href,
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
        ];
        return gradients[idx % gradients.length];
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    if (error || !trip) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center max-w-md mx-auto p-8">
                    <Globe className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-slate-900 mb-2">
                        {error || 'Trip not found'}
                    </h2>
                    <p className="text-slate-500 mb-6">
                        This trip may be private or no longer exists.
                    </p>
                    <Link to="/login">
                        <Button>Sign in to view more trips</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero */}
            <div className={`relative h-72 bg-gradient-to-br ${getRandomGradient(trip.id)}`}>
                {trip.cover_photo && (
                    <img
                        src={trip.cover_photo}
                        alt={trip.title}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                <div className="absolute inset-0 flex flex-col justify-end max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
                    <div className="flex items-center gap-2 text-white/80 mb-2">
                        <Globe className="w-4 h-4" />
                        <span className="text-sm">Public Itinerary</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{trip.title}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
                        <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {getDuration(trip.start_date, trip.end_date)}
                        </span>
                        <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {stops.length} destinations
                        </span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                            <h2 className="text-lg font-semibold text-slate-900 mb-6">Itinerary</h2>

                            {stops.length === 0 ? (
                                <p className="text-slate-400 text-center py-8">No destinations yet</p>
                            ) : (
                                <div className="space-y-6">
                                    {stops.map((stop, index) => (
                                        <div key={stop.id} className="relative pl-8">
                                            {/* Timeline */}
                                            {index < stops.length - 1 && (
                                                <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-primary-200" />
                                            )}
                                            <div className="absolute left-0 top-1 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                {index + 1}
                                            </div>

                                            <div className="bg-slate-50 rounded-xl p-4">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h3 className="font-semibold text-slate-900">{stop.city_name}</h3>
                                                        {stop.country && (
                                                            <p className="text-sm text-slate-500">{stop.country}</p>
                                                        )}
                                                    </div>
                                                    <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                                                        {getDuration(stop.start_date, stop.end_date)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-600 mt-2">
                                                    {formatDate(stop.start_date)} - {formatDate(stop.end_date)}
                                                </p>

                                                {/* Activities */}
                                                {stop.activities.length > 0 && (
                                                    <div className="mt-4 space-y-2">
                                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                            Planned Activities
                                                        </p>
                                                        {stop.activities.map((activity) => (
                                                            <div
                                                                key={activity.id}
                                                                className="flex items-center justify-between bg-white rounded-lg p-2 border border-slate-200"
                                                            >
                                                                <span className="text-sm text-slate-700">{activity.activity_name}</span>
                                                                {activity.custom_cost && (
                                                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                                                        <DollarSign className="w-3 h-3" />
                                                                        {activity.custom_cost}
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
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Share Card */}
                        <div className="bg-white rounded-2xl shadow-card p-6">
                            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <Share2 className="w-5 h-5 text-primary-500" />
                                Share This Trip
                            </h3>
                            <p className="text-sm text-slate-500 mb-4">
                                Share this itinerary with friends and family
                            </p>
                            <Button
                                onClick={handleShare}
                                variant="secondary"
                                className="w-full"
                                icon={<Share2 className="w-4 h-4" />}
                            >
                                Share Trip
                            </Button>
                        </div>

                        {/* Clone Trip CTA */}
                        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
                            <h3 className="font-bold text-lg mb-2">Love this itinerary?</h3>
                            <p className="text-primary-100 text-sm mb-4">
                                Clone it to your account and customize it for your own adventure!
                            </p>
                            <Button
                                onClick={handleCloneTrip}
                                loading={cloning}
                                variant="secondary"
                                className={`w-full ${cloneSuccess ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-white text-primary-600 hover:bg-primary-50'}`}
                                icon={cloneSuccess ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            >
                                {cloneSuccess ? 'Cloned! Redirecting...' : 'Clone This Trip'}
                            </Button>
                            <p className="text-primary-200 text-xs mt-2 text-center">
                                {localStorage.getItem('token') ? 'Saves to your account' : 'Login required'}
                            </p>
                        </div>

                        {/* Trip Stats */}
                        <div className="bg-white rounded-2xl shadow-card p-6">
                            <h3 className="font-semibold text-slate-900 mb-4">Trip Overview</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Duration</span>
                                    <span className="font-medium">{getDuration(trip.start_date, trip.end_date)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Destinations</span>
                                    <span className="font-medium">{stops.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Activities</span>
                                    <span className="font-medium">
                                        {stops.reduce((acc, s) => acc + s.activities.length, 0)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Created by</span>
                                    <span className="font-medium">{trip.owner_name || 'Traveler'}</span>
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
                    url={window.location.href}
                />
            )}
        </div>
    );
};

export default PublicTrip;
