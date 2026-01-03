import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { tripsAPI, citiesAPI } from '../services/api';
import { formatCurrency } from '../utils/currency';
import TravelWidgets from '../components/TravelWidgets';
import {
    ChevronRight,
    Calendar,
    MapPin,
    Heart,
    Map as MapIcon,
    Star
} from 'lucide-react';
import { DashboardSkeleton } from '../components/Skeleton';
import type { City } from '../types';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [upcomingTrips, setUpcomingTrips] = useState<any[]>([]);
    const [popularCities, setPopularCities] = useState<City[]>([]);
    const [activeTab, setActiveTab] = useState('Most Popular');

    // Mock data for other tabs based on duplicates/modifications of existing data for demo purposes
    const getTabContent = () => {
        if (activeTab === 'Special offer') {
            return popularCities.map(city => ({
                ...city,
                id: `special-${city.id}`, // Unique keys
                avg_daily_cost: (city.avg_daily_cost || 100) * 0.8 // 20% discount
            }));
        }
        if (activeTab === 'Near Me') {
            return popularCities.slice(0, 3).map(city => ({
                ...city,
                id: `near-${city.id}`, // Unique keys
                country: '50km away' // Mock distance
            }));
        }
        return popularCities;
    };

    const displayCities = getTabContent();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tripsRes, citiesRes] = await Promise.all([
                    tripsAPI.getAll(),
                    citiesAPI.getAll()
                ]);

                if (tripsRes.data.success) {
                    // Sort by newest and take first 2
                    setUpcomingTrips(tripsRes.data.data.slice(0, 2));
                }

                if (citiesRes.data.success) {
                    // Sort by popularity and take 4
                    setPopularCities(citiesRes.data.data
                        .sort((a: City, b: City) => (b.popularity_score || 0) - (a.popularity_score || 0))
                        .slice(0, 4)
                    );
                }
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <DashboardSkeleton />;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Top Row: Upcoming Trips + Widgets */}
            <div className="grid grid-cols-12 gap-8">
                {/* 1. Upcoming Trip List (Left - Wider) */}
                <div className="col-span-12 lg:col-span-12 xl:col-span-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900">Upcoming Trip List</h2>
                        <div className="flex gap-2">
                            <button className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600"><ChevronRight className="w-5 h-5 rotate-180" /></button>
                            <button className="p-1 bg-primary-600 rounded text-white shadow-lg shadow-primary-200"><ChevronRight className="w-5 h-5" /></button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {upcomingTrips.length > 0 ? (
                            upcomingTrips.map((trip) => (
                                <div key={trip.id} className="bg-white p-5 rounded-3xl shadow-card hover:shadow-lg transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-lg">{trip.title}</h3>
                                            <p className="text-slate-400 text-sm">
                                                {trip.cities && trip.cities.length > 0
                                                    ? trip.cities[0].city_name
                                                    : (trip.description || 'Global Adventure')}
                                            </p>
                                        </div>
                                        <span className="text-primary-600 font-bold bg-primary-50 px-3 py-1 rounded-full text-sm">
                                            {formatCurrency(trip.budget || 0, user?.currency)}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            <span>
                                                {new Date(trip.start_date).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl">
                                            <MapPin className="w-4 h-4 text-slate-400" />
                                            <span>{trip.stop_count || 0} Stops</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <div className="flex-1 overflow-hidden rounded-xl h-24">
                                            <img
                                                src={trip.cover_photo || `https://source.unsplash.com/random/400x300/?${(trip.title || 'travel').split(' ')[0]},travel`}
                                                alt={trip.title}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&h=300&fit=crop';
                                                }}
                                            />
                                        </div>
                                        <div className="w-24 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-medium text-xs cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => navigate(`/trips/${trip.id}`)}>
                                            + View
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white p-8 rounded-3xl shadow-card text-center border-2 border-dashed border-slate-200">
                                <h3 className="text-slate-900 font-bold mb-2">No upcoming trips</h3>
                                <p className="text-slate-400 mb-4">Start planning your next adventure!</p>
                                <Link to="/trips/create" className="text-primary-600 font-semibold hover:underline">Create a Trip</Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Right Side - Widgets & Recent Trips */}
                <div className="col-span-12 xl:col-span-7 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Travel Toolkit Widget */}
                        <div className="h-[320px]">
                            <TravelWidgets nextTrip={upcomingTrips[0]} userCurrency={user?.currency} />
                        </div>

                        {/* Recently Explored Map */}
                        <div
                            className="bg-white p-6 rounded-3xl shadow-card h-fit relative overflow-hidden group cursor-pointer transition-transform hover:scale-[1.02]"
                            onClick={() => navigate('/explore')}
                        >
                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <h3 className="font-bold text-slate-900">Recently Explored</h3>
                                <button className="p-2 bg-white/80 backdrop-blur-sm rounded-full transition-colors hover:bg-white shadow-sm"><MapIcon className="w-5 h-5 text-primary-600" /></button>
                            </div>

                            <div className="relative h-64 w-full bg-blue-50 rounded-2xl overflow-hidden border border-slate-100 shadow-inner">
                                {/* Map Background (Colorful) */}
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/World_map_blank_without_borders.svg/2000px-World_map_blank_without_borders.svg.png"
                                    alt="World Map"
                                    className="w-full h-full object-cover opacity-60 mix-blend-multiply filter sepia hue-rotate-180 saturate-200"
                                />

                                {/* Location Pins */}
                                {[
                                    { x: '20%', y: '30%', label: 'New York', color: 'bg-red-500' },
                                    { x: '45%', y: '25%', label: 'Paris', color: 'bg-indigo-500' },
                                    { x: '75%', y: '40%', label: 'Tokyo', color: 'bg-green-500' },
                                    { x: '55%', y: '60%', label: 'Cape Town', color: 'bg-yellow-500' }
                                ].map((pin, i) => (
                                    <div
                                        key={i}
                                        className={`absolute w-4 h-4 ${pin.color} rounded-full border-2 border-white shadow-lg animate-bounce hover:scale-150 transition-transform`}
                                        style={{ top: pin.y, left: pin.x, animationDelay: `${i * 0.2}s` }}
                                        title={pin.label}
                                    ></div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity Card (Merged Tables) */}
                    <div className="bg-white p-6 rounded-3xl shadow-card space-y-8">
                        {/* Recent Trips Table */}
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-slate-900">Recent Trips</h3>
                                <button className="text-xs text-primary-600 font-bold hover:underline">View All</button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-slate-400 uppercase bg-slate-50/50">
                                        <tr>
                                            <th className="px-4 py-3 rounded-l-xl">Trip Destination</th>
                                            <th className="px-4 py-3">Date</th>
                                            <th className="px-4 py-3 rounded-r-xl text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {[
                                            { title: 'Swiss Alps Adventure', date: '12-18 Oct 2023', image: 'https://images.unsplash.com/photo-1531310197839-ccf54634509e?w=100&h=100&fit=crop', status: 'Completed', statusColor: 'text-green-600 bg-green-50' },
                                            { title: 'Kyoto Cultural Tour', date: '25-30 Sep 2023', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=100&h=100&fit=crop', status: 'Completed', statusColor: 'text-green-600 bg-green-50' },
                                            { title: 'Bali Beach Escape', date: '10-25 Aug 2023', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=100&h=100&fit=crop', status: 'Completed', statusColor: 'text-green-600 bg-green-50' }
                                        ].map((trip, i) => (
                                            <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <img src={trip.image} alt={trip.title} className="w-10 h-10 rounded-lg object-cover" />
                                                        <span className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{trip.title}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-slate-500">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-3 h-3 text-slate-400" />
                                                        {trip.date}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${trip.statusColor}`}>
                                                        {trip.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>


                    </div>
                </div>
            </div>

            {/* Bottom Row: Cities Grid */}
            <div className="space-y-6">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-1">
                    {['Most Popular', 'Special offer', 'Near Me'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab
                                ? 'bg-primary-600 text-white shadow-lg shadow-primary-200'
                                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                    <div className="ml-auto">
                        <Link to="/explore" className="flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-primary-600 transition-colors">
                            See All
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {displayCities.map((city) => (
                        <Link to={`/cities/${city.id.toString().replace('special-', '').replace('near-', '')}`} key={city.id} className="group block bg-white rounded-3xl p-3 shadow-card hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="relative h-48 rounded-2xl overflow-hidden mb-4">
                                <img src={city.image_url} alt={city.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <button className="absolute top-3 right-3 w-8 h-8 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white text-white hover:text-red-500 transition-colors">
                                    <Heart className="w-4 h-4" />
                                </button>
                                <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                                    {activeTab === 'Special offer' ? 'Special Deal!' : (Math.floor(Math.random() * 5) + 2 + ' Offers')}
                                </div>
                            </div>

                            <div className="px-2 pb-2">
                                <h3 className="font-bold text-slate-900 text-lg mb-1">{city.name}</h3>

                                <div className="flex items-center justify-between mb-2">
                                    <div className="text-primary-600 font-bold">
                                        ${Math.round(city.avg_daily_cost || 100)}<span className="text-xs text-slate-400 font-normal">/day</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                        4.9 <span className="text-slate-400 font-normal">({city.popularity_score} reviews)</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 text-xs text-slate-400">
                                    <MapPin className="w-3 h-3" />
                                    <span className="truncate max-w-[200px]">{city.country}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
