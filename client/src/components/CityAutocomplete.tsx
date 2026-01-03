import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, X, Globe } from 'lucide-react';
import { citiesAPI } from '../services/api';
import { type City } from '../types';

interface CityAutocompleteProps {
    label?: string;
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    onSelect: (city: City) => void;
    className?: string;
    required?: boolean;
}

const CityAutocomplete = ({
    label,
    placeholder = 'Search cities...',
    value,
    onChange,
    onSelect,
    className = '',
    required = false,
}: CityAutocompleteProps) => {
    const [suggestions, setSuggestions] = useState<City[]>([]);
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        if (!value.trim()) {
            setSuggestions([]);
            return;
        }

        debounceTimerRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                // 1. Fetch from Local DB
                const localRes = await citiesAPI.getAll({ search: value });
                const localCities = localRes.data.success ? localRes.data.data : [];

                // 2. Fetch from External API (Photon / OSM) if local results are few
                // We always fetch external to ensure "Production Grade" coverage
                let externalCities: City[] = [];
                try {
                    const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(value)}&limit=5&lang=en`);
                    const data = await response.json();

                    externalCities = data.features.map((feature: any, index: number) => ({
                        id: -(index + 1000), // Negative ID to indicate external
                        name: feature.properties.name,
                        country: feature.properties.country || 'Unknown',
                        region: feature.properties.state || feature.properties.city || feature.properties.district,
                        image_url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400&q=80', // Generic City Placeholder
                        avg_daily_cost: undefined,
                        latitude: feature.geometry.coordinates[1],
                        longitude: feature.geometry.coordinates[0],
                    })).filter((city: City) =>
                        // Filter out duplicates that might be in local DB (by name)
                        !localCities.some((local: City) => local.name.toLowerCase() === city.name.toLowerCase())
                    );
                } catch (extError) {
                    console.warn('External API failed', extError);
                }

                // 3. Merge: Local First, then External
                setSuggestions([...localCities, ...externalCities]);
                setShowSuggestions(true);
            } catch (error) {
                console.error('Failed to fetch cities:', error);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [value]);

    const handleSelect = (city: City) => {
        // If it's an external city (negative ID), we might want to just pass the name
        // But the parent component expects a City object.
        // The onSelect prop is (city: City) => void.
        // We pass the full object. The parent logic (AddStop) logic should handle it.
        // Since we checked stopController.ts handles city_name without ID, this is fine.
        // However, we should be careful if the parent relies on city.id > 0.
        // For now, we return the object.

        onChange(city.name);
        onSelect(city);
        setShowSuggestions(false);
        setSuggestions([]);
    };

    const clearInput = () => {
        onChange('');
        setSuggestions([]);
        setShowSuggestions(false);
    };

    return (
        <div className={`relative ${className}`} ref={wrapperRef}>
            {label && (
                <label className="block text-sm font-medium text-slate-700 mb-1.5 whitespace-nowrap">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value);
                        setShowSuggestions(true);
                    }}
                    onFocus={() => {
                        if (value && suggestions.length > 0) setShowSuggestions(true);
                    }}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                    required={required}
                />
                {loading ? (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 animate-spin" />
                ) : value && (
                    <button
                        type="button"
                        onClick={clearInput}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto animate-fade-in-up custom-scrollbar">
                    {suggestions.map((city) => (
                        <button
                            key={city.id}
                            type="button"
                            onClick={() => handleSelect(city)}
                            className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors group"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {city.id < 0 && <Globe className="w-3 h-3 text-slate-400" />}
                                    <p className="font-medium text-slate-900 group-hover:text-primary-600 transition-colors">{city.name}</p>
                                </div>
                                {city.avg_daily_cost && (
                                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                        ~${Math.round(city.avg_daily_cost)}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-500 pl-5">
                                <MapPin className="w-3 h-3" />
                                <span>{city.country}</span>
                                {city.region && <span>• {city.region}</span>}
                            </div>
                        </button>
                    ))}
                    <div className="px-2 py-1 bg-slate-50 text-[10px] text-slate-400 text-center border-t border-slate-100">
                        Powered by GlobeTrotter & OpenStreetMap
                    </div>
                </div>
            )}
        </div>
    );
};

export default CityAutocomplete;
