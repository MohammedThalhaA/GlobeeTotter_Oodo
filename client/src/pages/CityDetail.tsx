import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { citiesAPI } from '../services/api';
import {
    MapPin,
    Star,
    Calendar,
    ChevronLeft,
    Share2,
    Heart,
    CheckCircle2,
    Clock,
    User,
    Bus,
    Home
} from 'lucide-react';
import { Skeleton } from '../components/Skeleton';
import Button from '../components/Button';
import { City } from '../types';

const CityDetail = () => {
    const { id } = useParams<{ id: string }>();
    const [city, setCity] = useState<City | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Overview');

    useEffect(() => {
        const fetchCity = async () => {
            try {
                if (id) {
                    const response = await citiesAPI.getById(parseInt(id));
                    if (response.data.success) {
                        setCity(response.data.data);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch city:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCity();
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

                    {/* Tour Guides */}
                    <div>
                        <h3 className="font-bold text-slate-900 mb-4">Tour Guides</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { name: 'Esther Howard', reviews: '80 reviews', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
                                { name: 'Floyd Miles', reviews: '60 reviews', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' }
                            ].map((guide, i) => (
                                <div key={i} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl">
                                    <img src={guide.img} alt={guide.name} className="w-12 h-12 rounded-full object-cover" />
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-sm">{guide.name}</h4>
                                        <div className="flex items-center gap-1 text-xs text-slate-500">
                                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                            5.0 ({guide.reviews})
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sticky Booking Bar */}
                <div className="sticky bottom-4 bg-white p-4 rounded-2xl shadow-lg border border-slate-100 flex items-center justify-between gap-4 z-20">
                    <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-xl flex-1">
                        <Calendar className="w-5 h-5 text-slate-400" />
                        <span className="text-sm font-medium text-slate-600">20 December - 27 December</span>
                    </div>
                    <Button icon={<CheckCircle2 className="w-5 h-5" />} className="px-8 py-3 rounded-xl shadow-lg shadow-primary-200">
                        Book Now
                    </Button>
                </div>
            </div>

            {/* Sidebar (Right) */}
            <div className="w-full xl:w-80 shrink-0 space-y-6">
                <div className="bg-white p-6 rounded-3xl shadow-card">
                    <h3 className="font-bold text-slate-900 mb-6">Places you may like</h3>
                    <div className="space-y-6">
                        {[
                            { name: 'Pyramids of Giza', loc: 'New York, USA', price: 50, img: 'https://images.unsplash.com/photo-1599386348421-278065b206d2?w=200&h=150&fit=crop' },
                            { name: 'Ubud', loc: 'Bali, Indonesia', price: 60, img: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=200&h=150&fit=crop' },
                            { name: 'Langkawi', loc: 'Malaysia', price: 80, img: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=200&h=150&fit=crop' },
                            { name: 'Grand Palace', loc: 'Bangkok', price: 20, img: 'https://images.unsplash.com/photo-1582468575304-633b4974f1da?w=200&h=150&fit=crop' },
                            { name: 'Pyramids of Giza', loc: 'New York, USA', price: 40, img: 'https://images.unsplash.com/photo-1629215089332-9cb9d363945c?w=200&h=150&fit=crop' }
                        ].map((place, i) => (
                            <Link to="#" key={i} className="flex gap-4 group">
                                <img src={place.img} alt={place.name} className="w-24 h-16 rounded-xl object-cover group-hover:scale-105 transition-transform" />
                                <div>
                                    <h4 className="font-bold text-slate-900 text-sm mb-1">{place.name}</h4>
                                    <p className="text-xs text-slate-400 mb-2">{place.loc}</p>
                                    <div className="flex items-center gap-2">
                                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                        <span className="text-xs font-bold text-slate-700">5.0</span>
                                    </div>
                                    <p className="text-sm font-bold text-primary-600 mt-1">${place.price}/day</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-card">
                    <h3 className="font-bold text-slate-900 mb-6">Nearby Places</h3>
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                                <Home className="w-5 h-5 text-red-500" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 text-sm">School</p>
                                <p className="text-xs text-slate-400">200m away</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                                <Bus className="w-5 h-5 text-red-500" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 text-sm">Bus Stand</p>
                                <p className="text-xs text-slate-400">50m away</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CityDetail;
