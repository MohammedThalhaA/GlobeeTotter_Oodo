import { Calendar, MapPin, MoreVertical, Trash2, Edit, Eye } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface TripCardProps {
    trip: {
        id: number;
        title: string;
        description?: string;
        start_date: string;
        end_date: string;
        cover_photo?: string;
        is_public?: boolean;
        stop_count?: number;
        cities?: { city_name: string }[];
    };
    onDelete?: (id: number) => void;
}

const TripCard: React.FC<TripCardProps> = ({ trip, onDelete }) => {
    const [showMenu, setShowMenu] = useState(false);
    const navigate = useNavigate();

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getRandomGradient = (id: number) => {
        const gradients = [
            'from-blue-500 to-purple-600',
            'from-pink-500 to-orange-400',
            'from-green-400 to-cyan-500',
            'from-yellow-400 to-red-500',
            'from-indigo-500 to-pink-500',
            'from-teal-400 to-blue-500',
        ];
        return gradients[id % gradients.length];
    };

    const cityNames = trip.cities
        ?.map((c) => c.city_name)
        .filter(Boolean)
        .slice(0, 3);

    const handleCardClick = () => {
        navigate(`/trips/${trip.id}`);
    };

    return (
        <div
            onClick={handleCardClick}
            className="card group relative animate-fade-in cursor-pointer hover:shadow-lg transition-shadow"
        >
            {/* Cover Image / Gradient */}
            <div className={`h-40 bg-gradient-to-br ${getRandomGradient(trip.id)} relative overflow-hidden`}>
                {trip.cover_photo && (
                    <img
                        src={trip.cover_photo}
                        alt={trip.title}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                {/* Status Badge */}
                {trip.is_public && (
                    <span className="absolute top-3 left-3 badge bg-white/20 backdrop-blur-sm text-white text-xs">
                        Public
                    </span>
                )}

                {/* Actions Menu */}
                <div
                    className="absolute top-3 right-3"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-2 rounded-lg bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                    >
                        <MoreVertical className="w-4 h-4 text-white" />
                    </button>

                    {showMenu && (
                        <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-10 animate-fade-in">
                            <Link
                                to={`/trips/${trip.id}`}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                            >
                                <Eye className="w-4 h-4" />
                                View Details
                            </Link>
                            <Link
                                to={`/trips/${trip.id}/edit`}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                            >
                                <Edit className="w-4 h-4" />
                                Edit Trip
                            </Link>
                            {onDelete && (
                                <button
                                    onClick={() => {
                                        onDelete(trip.id);
                                        setShowMenu(false);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {trip.title}
                </h3>

                {trip.description && (
                    <p className="text-sm text-slate-500 mb-3 line-clamp-2">{trip.description}</p>
                )}

                {/* Cities */}
                {cityNames && cityNames.length > 0 && (
                    <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                        <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0" />
                        <span className="text-sm text-slate-600">
                            {cityNames.join(' → ')}
                            {trip.stop_count && trip.stop_count > 3 && (
                                <span className="text-slate-400"> +{trip.stop_count - 3} more</span>
                            )}
                        </span>
                    </div>
                )}

                {/* Dates */}
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>
                        {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default TripCard;
