import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { tripsAPI, citiesAPI } from '../services/api';
import {
    ChevronRight,
    Plane,
    Bus,
    Ship,
    Car,
    Plus,
    Filter,
    ArrowUpRight,
    Calendar,
    MapPin,
    Star,
    Heart
} from 'lucide-react';
import { DashboardSkeleton } from '../components/Skeleton';
import type { City } from '../types';

const Dashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [upcomingTrips, setUpcomingTrips] = useState<any[]>([]);
    const [popularCities, setPopularCities] = useState<City[]>([]);

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
                                            ${Math.round(2000)} {/* Placeholder budget */}
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
                                        <div className="flex-1 overflow-hidden rounded-xl h-24">
                                            <img
                                                src={`https://source.unsplash.com/random/400x300/?${(trip.title || 'city').split(' ')[0]},city`}
                                                alt="Trip"
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop';
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

                {/* 2. Top Tour Agencies + Transportation (Middle & Right) */}
                <div className="col-span-12 lg:col-span-12 xl:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Top 3 Tour Agencies */}
                    <div className="bg-white p-6 rounded-3xl shadow-card h-fit">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-slate-900">Top 3 Tour Agencies</h3>
                        </div>
                        <div className="space-y-4">
                            {[
                                { name: 'Abz Tour Ltd.', loc: 'Dhaka, Bangladesh', img: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=100&h=100&fit=crop' },
                                { name: 'Tourp', loc: 'New York, USA', img: 'https://images.unsplash.com/photo-1571896349842-68c6d31d157a?w=100&h=100&fit=crop' },
                                { name: 'ManaTrip', loc: 'London, England', img: 'https://images.unsplash.com/photo-1549144511-3005a2b13824?w=100&h=100&fit=crop' }
                            ].map((agency, i) => (
                                <div key={i} className="flex items-center gap-4 group cursor-pointer">
                                    <img src={agency.img} alt={agency.name} className="w-12 h-12 rounded-xl object-cover" />
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-900 text-sm">{agency.name}</h4>
                                        <p className="text-xs text-slate-400">{agency.loc}</p>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary-600 transition-colors">
                                        <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Transportation */}
                    <div className="bg-white p-6 rounded-3xl shadow-card h-fit">
                        <h3 className="font-bold text-slate-900 mb-6">Transportation</h3>
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { icon: Plane, label: 'Flight' },
                                { icon: Bus, label: 'Bus' },
                                { icon: Ship, label: 'Boat' },
                                { icon: Car, label: 'Car' },
                                { icon: Plus, label: 'Add', primary: true }
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col items-center gap-2 cursor-pointer group">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${item.primary
                                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-200'
                                        : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100 group-hover:text-primary-600'
                                        }`}>
                                        <item.icon className="w-6 h-6" />
                                    </div>
                                    <span className="text-xs font-medium text-slate-500">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Hotel Booking Table */}
                    <div className="col-span-1 md:col-span-2 bg-white p-6 rounded-3xl shadow-card">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-slate-900">Recent Hotel Booking</h3>
                            <div className="flex items-center gap-2 text-xs text-slate-500 border border-slate-200 px-3 py-1 rounded-full cursor-pointer hover:bg-slate-50">
                                <Filter className="w-3 h-3" />
                                <span>Filter</span>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-400 uppercase bg-slate-50/50">
                                    <tr>
                                        <th className="px-4 py-3 rounded-l-xl">SL</th>
                                        <th className="px-4 py-3">Hotel</th>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Total</th>
                                        <th className="px-4 py-3 rounded-r-xl">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {[
                                        { sl: '01', hotel: 'Hotel Abtrip', date: '20 Dec, 2023', time: '11:44', total: '150$', status: 'Confirmed', statusColor: 'bg-green-100 text-green-600' },
                                        { sl: '02', hotel: 'Bbntrip Hotel', date: '21 Dec, 2023', time: '11:44', total: '50$', status: 'Pending', statusColor: 'bg-orange-100 text-orange-600' }
                                    ].map((row, i) => (
                                        <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="px-4 py-4 text-slate-400">{row.sl}</td>
                                            <td className="px-4 py-4 font-semibold text-slate-900">{row.hotel}</td>
                                            <td className="px-4 py-4">
                                                <div className="text-slate-900">{row.date}</div>
                                                <div className="text-xs text-slate-400">{row.time}</div>
                                            </td>
                                            <td className="px-4 py-4 font-bold text-slate-900">{row.total}</td>
                                            <td className="px-4 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${row.statusColor}`}>
                                                    {row.status}
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

            {/* Bottom Row: Cities Grid */}
            <div className="space-y-6">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-1">
                    {['Most Popular', 'Special offer', 'Near Me'].map((tab, i) => (
                        <button
                            key={tab}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${i === 0
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
                    {popularCities.map((city) => (
                        <Link to={`/cities/${city.id}`} key={city.id} className="group block bg-white rounded-3xl p-3 shadow-card hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="relative h-48 rounded-2xl overflow-hidden mb-4">
                                <img src={city.image_url} alt={city.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <button className="absolute top-3 right-3 w-8 h-8 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white text-white hover:text-red-500 transition-colors">
                                    <Heart className="w-4 h-4" />
                                </button>
                                <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                                    {Math.floor(Math.random() * 5) + 2} Offers
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
