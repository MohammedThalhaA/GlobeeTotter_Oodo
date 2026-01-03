import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { favoritesAPI } from '../services/api';
import { formatCurrency } from '../utils/currency';
import { Star, MapPin, Heart, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DashboardSkeleton } from '../components/Skeleton';
import type { City } from '../types';

const Favorites = () => {
    const { user } = useAuth();
    const [favorites, setFavorites] = useState<City[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFavorites();
    }, []);

    const fetchFavorites = async () => {
        try {
            const res = await favoritesAPI.getAll();
            if (res.data.success) {
                setFavorites(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch favorites:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFavorite = async (e: React.MouseEvent, cityId: number) => {
        e.preventDefault(); // Prevent navigation
        try {
            await favoritesAPI.remove(cityId);
            setFavorites(favorites.filter(city => city.id !== cityId));
        } catch (error) {
            console.error('Failed to remove favorite:', error);
        }
    };

    if (loading) return <DashboardSkeleton />;

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Your Wishlist</h1>
                    <p className="text-slate-500 mt-1">Destinations you've saved for later</p>
                </div>
                <div className="bg-rose-50 text-rose-600 px-4 py-2 rounded-full font-bold text-sm">
                    {favorites.length} Saved Places
                </div>
            </div>

            {favorites.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {favorites.map((city) => (
                        <Link
                            to={`/cities/${city.id}`}
                            key={city.id}
                            className="group block bg-white rounded-3xl p-3 shadow-card hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="relative h-48 rounded-2xl overflow-hidden mb-4">
                                <img
                                    src={city.image_url}
                                    alt={city.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <button
                                    onClick={(e) => handleRemoveFavorite(e, city.id)}
                                    className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-colors shadow-sm"
                                    title="Remove from favorites"
                                >
                                    <Heart className="w-4 h-4 fill-rose-500" />
                                </button>
                                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-slate-900 text-[10px] font-bold px-2 py-1 rounded-lg">
                                    Saved {new Date(city.created_at || Date.now()).toLocaleDateString()}
                                </div>
                            </div>

                            <div className="px-2 pb-2">
                                <h3 className="font-bold text-slate-900 text-lg mb-1">{city.name}</h3>

                                <div className="flex items-center justify-between mb-2">
                                    <div className="text-primary-600 font-bold">
                                        {formatCurrency(Math.round(city.avg_daily_cost || 100), user?.preferences?.currency)}<span className="text-xs text-slate-400 font-normal">/day</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                        4.9 <span className="text-slate-400 font-normal">({city.popularity_score} reviews)</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 text-xs text-slate-400">
                                    <MapPin className="w-3 h-3" />
                                    <span className="truncate">{city.country}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart className="w-8 h-8 text-rose-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">No favorites yet</h3>
                    <p className="text-slate-400 mb-6 max-w-md mx-auto">
                        Start exploring amazing destinations and save your favorites here to plan your future trips.
                    </p>
                    <Link to="/explore" className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200">
                        Explore Destinations <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            )}
        </div>
    );
};

export default Favorites;
