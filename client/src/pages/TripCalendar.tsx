import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { stopsAPI, tripsAPI } from '../services/api';
import Button from '../components/Button';
import {
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    MapPin,
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
    start_date: string;
    end_date: string;
    activities: Activity[];
}

interface Trip {
    id: number;
    title: string;
    start_date: string;
    end_date: string;
}

const COLORS = [
    'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
    'bg-pink-100 text-pink-800 border-pink-200 hover:bg-pink-200',
    'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
    'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200',
    'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200',
    'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200',
];

const TripCalendar = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const tripId = Number(id);

    const [trip, setTrip] = useState<Trip | null>(null);
    const [stops, setStops] = useState<Stop[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tripRes, stopsRes] = await Promise.all([
                    tripsAPI.getById(tripId),
                    stopsAPI.getAll(tripId),
                ]);
                if (tripRes.data.success) {
                    setTrip(tripRes.data.data);
                    setCurrentMonth(new Date(tripRes.data.data.start_date));
                }
                if (stopsRes.data.success) setStops(stopsRes.data.data);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [tripId]);

    // Build city color map
    const cityColors = useMemo(() => {
        const map = new Map<string, string>();
        stops.forEach((stop, idx) => {
            if (!map.has(stop.city_name)) {
                map.set(stop.city_name, COLORS[idx % COLORS.length]);
            }
        });
        return map;
    }, [stops]);

    // Get city for a date
    const getCityForDate = (date: Date) => {
        for (const stop of stops) {
            const start = new Date(stop.start_date);
            const end = new Date(stop.end_date);
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            if (date >= start && date <= end) {
                return stop.city_name;
            }
        }
        return null;
    };

    // Get activities for a date
    const getActivitiesForDate = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        const activities: Activity[] = [];
        stops.forEach((stop) => {
            stop.activities.forEach((activity) => {
                if (activity.scheduled_date) {
                    const actDate = new Date(activity.scheduled_date).toISOString().split('T')[0];
                    if (actDate === dateStr) {
                        activities.push(activity);
                    }
                }
            });
        });
        return activities;
    };

    // Generate calendar days
    const generateCalendarDays = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDay = firstDay.getDay();
        const totalDays = lastDay.getDate();

        const days: (Date | null)[] = [];

        // Padding for first week
        for (let i = 0; i < startDay; i++) {
            days.push(null);
        }

        // Actual days
        for (let i = 1; i <= totalDays; i++) {
            days.push(new Date(year, month, i));
        }

        return days;
    };

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const isInTripRange = (date: Date) => {
        if (!trip) return false;
        const start = new Date(trip.start_date);
        const end = new Date(trip.end_date);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return date >= start && date <= end;
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    if (!trip) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-500">Trip not found</p>
            </div>
        );
    }

    const calendarDays = generateCalendarDays();
    const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            {/* Header - Sticky */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm backdrop-blur-md bg-white/90">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors group"
                            >
                                <ArrowLeft className="w-5 h-5 text-slate-500 group-hover:text-primary-600 transition-colors" />
                            </button>
                            <div>
                                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Trip Calendar</p>
                                <h1 className="text-xl font-bold text-slate-900">{trip.title}</h1>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={prevMonth}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors border border-slate-200 hover:border-primary-200 hover:text-primary-600"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 min-w-[160px] justify-center bg-slate-100 px-4 py-1.5 rounded-full">
                                <CalendarIcon className="w-4 h-4 text-primary-500" />
                                {monthName}
                            </h2>
                            <button
                                onClick={nextMonth}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors border border-slate-200 hover:border-primary-200 hover:text-primary-600"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Legend */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-card p-6 sticky top-28 transition-transform duration-500 hover:shadow-lg">
                            <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-primary-500" />
                                Destinations
                            </h2>
                            {stops.length === 0 ? (
                                <p className="text-slate-400 text-sm">No stops added</p>
                            ) : (
                                <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                    {stops.map((stop) => (
                                        <div key={stop.id} className="group flex items-start gap-3 p-3 hover:bg-slate-50 rounded-xl transition-all duration-300 border border-transparent hover:border-slate-100 shadow-sm hover:shadow-md cursor-default">
                                            <div className={`w-3 h-3 rounded-full mt-1.5 shadow-sm ${cityColors.get(stop.city_name)?.split(' ')[0].replace('bg-', 'bg-')}`} />
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm group-hover:text-primary-600 transition-colors">{stop.city_name}</p>
                                                <p className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-1">
                                                    <CalendarIcon className="w-3 h-3" />
                                                    {new Date(stop.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
                                                    {new Date(stop.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <hr className="my-6 border-slate-100" />

                            <div className="space-y-3">
                                <Link to={`/trips/${tripId}/edit`} className="block w-full">
                                    <Button variant="secondary" className="w-full flex items-center justify-center gap-2 group hover:bg-primary-50 hover:text-primary-700 hover:border-primary-200">
                                        Edit Itinerary
                                    </Button>
                                </Link>
                                <Link to={`/trips/${tripId}/budget`} className="block w-full">
                                    <Button variant="secondary" className="w-full flex items-center justify-center gap-2 group hover:bg-primary-50 hover:text-primary-700 hover:border-primary-200">
                                        View Budget
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Calendar */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-2xl shadow-card p-8 transition-all hover:shadow-xl duration-500">
                            {/* Day Headers */}
                            <div className="grid grid-cols-7 gap-4 mb-4 border-b border-slate-100 pb-4">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                    <div key={day} className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 gap-4">
                                {calendarDays.map((day, idx) => {
                                    if (!day) {
                                        return <div key={`empty-${idx}`} className="aspect-square bg-slate-50/30 rounded-2xl" />;
                                    }

                                    const city = getCityForDate(day);
                                    const activities = getActivitiesForDate(day);
                                    const inTrip = isInTripRange(day);
                                    const today = isToday(day);

                                    return (
                                        <div
                                            key={day.toISOString()}
                                            className={`
                                                aspect-square p-2 rounded-2xl border-2 transition-all duration-300 relative group overflow-hidden
                                                ${inTrip
                                                    ? city
                                                        ? `${cityColors.get(city)} shadow-sm hover:scale-105 hover:shadow-lg hover:z-10`
                                                        : 'bg-slate-50 border-slate-200'
                                                    : 'border-transparent hover:bg-slate-50'
                                                } 
                                                ${today ? 'ring-4 ring-primary-100 border-primary-500' : ''}
                                            `}
                                        >
                                            <div className="h-full flex flex-col justify-between relative z-10">
                                                <span className={`text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full ${today ? 'bg-primary-600 text-white' : inTrip ? 'text-slate-800' : 'text-slate-400'
                                                    }`}>
                                                    {day.getDate()}
                                                </span>

                                                <div className="space-y-1">
                                                    {city && (
                                                        <span className="text-[10px] font-bold uppercase tracking-tight line-clamp-1 opacity-80 group-hover:opacity-100">
                                                            {city}
                                                        </span>
                                                    )}
                                                    {activities.length > 0 && (
                                                        <div className="flex -space-x-1 overflow-hidden py-0.5">
                                                            {activities.slice(0, 3).map((_, i) => (
                                                                <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-900/40 ring-1 ring-white" />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Hover activity count overlay */}
                                            {activities.length > 0 && (
                                                <div className="absolute inset-x-0 bottom-0 p-2 bg-white/90 backdrop-blur-sm translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                                    <p className="text-[10px] mobile:text-[9px] font-bold text-center text-slate-800">
                                                        {activities.length} Activities
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TripCalendar;
