import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { citiesAPI } from '../services/api';
import Button from '../components/Button';
import StyledDropdown from '../components/StyledDropdown';
import {
    Search,
    MapPin,
    TrendingUp,
    DollarSign,
    Loader2,
    Globe,
    X,
} from 'lucide-react';

interface City {
    id: number;
    name: string;
    country: string;
    region?: string;
    avg_daily_cost: number;
    popularity_score: number;
    image_url?: string;
    description?: string;
}

const CitySearch = () => {
    const [cities, setCities] = useState<City[]>([]);
    const [countries, setCountries] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCountry, setSelectedCountry] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'popularity' | 'cost_low' | 'cost_high'>('popularity');
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    useEffect(() => {
        fetchCountries();
    }, []);

    const fetchCities = useCallback(async () => {
        setLoading(true);
        try {
            const res = await citiesAPI.getAll({
                search: searchQuery || undefined,
                country: selectedCountry || undefined,
                sort: sortBy,
            });
            if (res.data.success) setCities(res.data.data);
        } catch (error) {
            console.error('Failed to fetch cities:', error);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, selectedCountry, sortBy]);

    const fetchCountries = async () => {
        try {
            const res = await citiesAPI.getCountries();
            if (res.data.success) setCountries(res.data.data);
        } catch (error) {
            console.error('Failed to fetch countries:', error);
        }
    };

    useEffect(() => {
        const timer = setTimeout(fetchCities, 300);
        return () => clearTimeout(timer);
    }, [fetchCities]);

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

    // Prepare country options for dropdown
    const countryOptions = [
        { value: '', label: 'All Countries' },
        ...countries.map((c) => ({ value: c, label: c })),
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero */}
            <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center">
                            <Globe className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Explore Destinations</h1>
                            <p className="text-primary-100">Discover amazing cities around the world</p>
                        </div>
                    </div>

                    {/* Animated Search Bar */}
                    <div className="relative max-w-2xl mt-8">
                        <div
                            className={`flex items-center bg-white rounded-2xl shadow-lg transition-all duration-300 ${isSearchFocused ? 'ring-4 ring-white/30' : ''
                                }`}
                        >
                            <Search className="ml-4 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search cities or countries..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => setIsSearchFocused(false)}
                                className="flex-1 px-4 py-4 bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="mr-4 p-1 hover:bg-slate-100 rounded-full transition-colors"
                                >
                                    <X className="w-4 h-4 text-slate-400" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-card p-4 mb-8">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        {/* Country Dropdown */}
                        <div className="flex items-center gap-3 flex-1">
                            <span className="text-sm font-medium text-slate-600">Filter:</span>
                            <StyledDropdown
                                options={countryOptions}
                                value={selectedCountry}
                                onChange={setSelectedCountry}
                                placeholder="All Countries"
                                className="w-48"
                            />
                        </div>

                        {/* Sort Pills */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-500">Sort:</span>
                            <div className="flex bg-slate-100 rounded-xl p-1">
                                {[
                                    { value: 'popularity', label: 'Popular', icon: TrendingUp },
                                    { value: 'cost_low', label: 'Price ↑', icon: DollarSign },
                                    { value: 'cost_high', label: 'Price ↓', icon: DollarSign },
                                ].map(({ value, label }) => (
                                    <button
                                        key={value}
                                        onClick={() => setSortBy(value as typeof sortBy)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${sortBy === value
                                            ? 'bg-white text-primary-600 shadow-sm'
                                            : 'text-slate-600 hover:text-slate-900'
                                            }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                    </div>
                ) : cities.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-card">
                        <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">No cities found</h3>
                        <p className="text-slate-500">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {cities.map((city) => (
                            <Link
                                key={city.id}
                                to={`/cities/${city.id}`}
                                className="group card overflow-hidden hover:shadow-xl transition-shadow duration-300"
                            >
                                {/* Image */}
                                <div className={`h-48 bg-gradient-to-br ${getRandomGradient(city.id)} relative overflow-hidden`}>
                                    {city.image_url && (
                                        <img
                                            src={city.image_url}
                                            alt={city.name}
                                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                                    {/* Popularity Badge */}
                                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1">
                                        <TrendingUp className="w-3 h-3 text-white" />
                                        <span className="text-xs text-white font-medium">{city.popularity_score}</span>
                                    </div>

                                    {/* City Name */}
                                    <div className="absolute bottom-3 left-4 right-4">
                                        <h3 className="text-xl font-bold text-white group-hover:text-primary-200 transition-colors">
                                            {city.name}
                                        </h3>
                                        <div className="flex items-center gap-1 text-white/80 text-sm">
                                            <MapPin className="w-3.5 h-3.5" />
                                            {city.country}
                                        </div>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-500">Avg. daily cost</p>
                                            <p className="text-lg font-bold text-slate-900">${city.avg_daily_cost}</p>
                                        </div>
                                        <Button variant="secondary" size="sm">
                                            View
                                        </Button>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CitySearch;
