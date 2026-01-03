import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { citiesAPI } from '../services/api';
import {
    MapPin,
    Star,
    Heart,
    ChevronLeft,
    Bus,
    Utensils,
    Camera,
    Trees,
    Landmark,
    Wallet,
    Clock,
    Map,
    Plane
} from 'lucide-react';
import { Skeleton } from '../components/Skeleton';
import type { City } from '../types';

const CityDetail = () => {
    const { id } = useParams<{ id: string }>();
    const [city, setCity] = useState<City | null>(null);
    const [relatedCities, setRelatedCities] = useState<City[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Overview');

    useEffect(() => {
        const fetchCityAndRelated = async () => {
            try {
                if (id) {
                    const [cityRes, allCitiesRes] = await Promise.all([
                        citiesAPI.getById(parseInt(id)),
                        citiesAPI.getAll()
                    ]);

                    if (cityRes.data.success) {
                        setCity(cityRes.data.data);
                    }

                    if (allCitiesRes.data.success) {
                        // Filter out current city and get 5 random ones
                        const others = allCitiesRes.data.data
                            .filter((c: City) => c.id !== parseInt(id))
                            .sort(() => 0.5 - Math.random())
                            .slice(0, 5);
                        setRelatedCities(others);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch city details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCityAndRelated();
    }, [id]);

    if (loading) return <div className="p-8"><Skeleton className="h-96 w-full rounded-3xl" /></div>;
    if (!city) return <div className="p-8">City not found</div>;

    return (
        <div className="flex flex-col xl:flex-row gap-8 animate-fade-in">
            {/* Main Content (Left) */}
            <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Link to="/explore" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <ChevronLeft className="w-5 h-5 text-slate-600" />
                        </Link>
                        <h1 className="text-2xl font-bold text-slate-900">{city.name}</h1>
                    </div>
                    <div className="text-xl font-bold text-primary-600">
                        ${city.avg_daily_cost}<span className="text-sm font-normal text-slate-500">/day</span>
                    </div>
                </div>

                {/* Gallery Grid */}
                <div className="grid grid-cols-12 gap-4 h-[400px] mb-8">
                    {/* Main Image */}
                    <div className="col-span-12 md:col-span-8 h-full rounded-3xl overflow-hidden relative group">
                        <img
                            src={city.image_url}
                            alt={city.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <button className="absolute top-4 right-4 p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-red-500 transition-all">
                            <Heart className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Side Images */}
                    <div className="hidden md:grid col-span-4 grid-rows-3 gap-4 h-full">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="rounded-2xl overflow-hidden relative group">
                                <img
                                    src={`https://source.unsplash.com/random/400x300/?${city.name},landmark,${i}`}
                                    alt="Gallery"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-${['1500832304601-863a13774ccf', '1476514525535-07fb3b4ae5f1', '1488646953014-85cb44e25828'][i - 1]}?w=400&h=300&fit=crop`;
                                    }}
                                />
                                {i === 3 && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer hover:bg-black/50 transition-colors">
                                        <span className="text-white font-bold text-lg">+12 Photos</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-1">
                    {['Overview', 'Details', 'Reviews'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${activeTab === tab
                                ? 'bg-primary-600 text-white shadow-lg shadow-primary-200'
                                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="bg-white rounded-3xl p-8 shadow-card mb-8">
                    <p className="text-slate-600 leading-relaxed mb-8">
                        {city.description || 'A light layout ideal for presenting hotel rooms, amenities & much more. A light layout ideal for presenting hotel rooms, amenities and much more. A light layout ideal for presenting hotel rooms, amenities and much more.'}
                        <br /><br />
                        Explore the vibrant streets, historical landmarks, and unique culture of {city.name}. Whether you're looking for adventure or relaxation, this destination has something for everyone.
                    </p>

                    {/* Map Location Placeholder */}
                    <div className="mb-8">
                        <h3 className="font-bold text-slate-900 mb-4">Map Location</h3>
                        <div className="h-48 bg-slate-100 rounded-2xl w-full relative overflow-hidden flex items-center justify-center">
                            <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=300&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                            <div className="relative z-10 bg-white p-4 rounded-xl shadow-lg flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                    <MapPin className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 text-sm">{city.name}, {city.country}</p>
                                    <p className="text-xs text-slate-500">{city.region}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Trip Insights - Replaces Tour Guides & Booking */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                                <Wallet className="w-5 h-5 text-green-600" />
                            </div>
                            <h3 className="font-bold text-slate-900 text-sm mb-1">Estimated Budget</h3>
                            <p className="text-slate-500 text-xs">Based on average traveler spend</p>
                            <p className="text-lg font-bold text-slate-900 mt-2">
                                ${city.avg_daily_cost ? Math.round(city.avg_daily_cost * 1.5) : 150} <span className="text-xs font-normal text-slate-400">/ day</span>
                            </p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                                <Clock className="w-5 h-5 text-blue-600" />
                            </div>
                            <h3 className="font-bold text-slate-900 text-sm mb-1">Suggested Duration</h3>
                            <p className="text-slate-500 text-xs">Ideal time to explore</p>
                            <p className="text-lg font-bold text-slate-900 mt-2">
                                {Math.floor(Math.random() * 3) + 3} - {Math.floor(Math.random() * 3) + 5} Days
                            </p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
                                <Map className="w-5 h-5 text-purple-600" />
                            </div>
                            <h3 className="font-bold text-slate-900 text-sm mb-1">Things to Do</h3>
                            <p className="text-slate-500 text-xs">Top rated activities</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {['Sightseeing', 'Food Tour', 'Hiking'].sort(() => 0.5 - Math.random()).slice(0, 2).map(act => (
                                    <span key={act} className="text-xs font-semibold bg-white border border-slate-200 px-2 py-1 rounded-lg text-slate-600">
                                        {act}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Sidebar (Right) */}
            <div className="w-full xl:w-80 shrink-0 space-y-6">
                <div className="bg-white p-6 rounded-3xl shadow-card">
                    <h3 className="font-bold text-slate-900 mb-6">Places you may like</h3>
                    <div className="space-y-6">
                        {relatedCities.map((place) => (
                            <Link
                                to={`/cities/${place.id}`}
                                key={place.id}
                                className="flex gap-4 group items-center hover:bg-slate-50 p-2 rounded-2xl transition-all"
                            >
                                <div className="w-24 h-20 shrink-0 rounded-xl overflow-hidden shadow-sm">
                                    <img
                                        src={place.image_url}
                                        alt={place.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-bold text-slate-900 text-sm mb-1 truncate group-hover:text-primary-600 transition-colors">
                                        {place.name}
                                    </h4>
                                    <p className="text-xs text-slate-400 mb-2 truncate">{place.country}</p>
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-1.5 bg-yellow-400/10 px-2 py-0.5 rounded-lg">
                                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                            <span className="text-xs font-bold text-slate-700">
                                                {(place.popularity_score || 0) > 0 ? ((place.popularity_score || 0) / 20).toFixed(1) : 'New'}
                                            </span>
                                        </div>
                                        <p className="text-sm font-bold text-primary-600">
                                            ${Math.round(place.avg_daily_cost || 0)}<span className="text-[10px] font-normal text-slate-400">/day</span>
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-card">
                    <h3 className="font-bold text-slate-900 mb-6">Nearby Facilities</h3>
                    <div className="space-y-4">
                        {/* Dynamic Random Nearby Places */}
                        {(() => {
                            const facilities = [
                                { name: 'City Center', icon: <Landmark className="w-4 h-4 text-blue-500" />, bg: 'bg-blue-50' },
                                { name: 'Public Garden', icon: <Trees className="w-4 h-4 text-green-500" />, bg: 'bg-green-50' },
                                { name: 'Food Court', icon: <Utensils className="w-4 h-4 text-orange-500" />, bg: 'bg-orange-50' },
                                { name: 'Bus Station', icon: <Bus className="w-4 h-4 text-red-500" />, bg: 'bg-red-50' },
                                { name: 'Museum', icon: <Camera className="w-4 h-4 text-purple-500" />, bg: 'bg-purple-50' },
                                { name: 'Airport', icon: <Plane className="w-4 h-4 text-sky-500" />, bg: 'bg-sky-50' },
                            ];
                            // Shuffle and pick 3-4 random
                            const randomFacilities = [...facilities].sort(() => 0.5 - Math.random()).slice(0, 4);

                            return randomFacilities.map((fac, idx) => (
                                <div key={idx} className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 ${fac.bg} rounded-xl flex items-center justify-center`}>
                                            {fac.icon}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm group-hover:text-primary-600 transition-colors">{fac.name}</p>
                                            <p className="text-xs text-slate-400">{(Math.random() * 2 + 0.1).toFixed(1)}km away</p>
                                        </div>
                                    </div>
                                </div>
                            ));
                        })()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CityDetail;
