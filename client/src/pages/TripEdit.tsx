import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tripsAPI, stopsAPI, citiesAPI, activitiesAPI } from '../services/api';
import Button from '../components/Button';
import Input from '../components/Input';
import {
    ArrowLeft,
    Save,
    Plus,
    GripVertical,
    Trash2,
    MapPin,
    Calendar,
    ChevronDown,
    ChevronUp,
    Loader2,
    X,
    Search,
} from 'lucide-react';

interface Activity {
    id: number;
    activity_name: string;
    scheduled_date?: string;
    scheduled_time?: string;
    custom_cost?: number;
    notes?: string;
    status: string;
}

interface Stop {
    id: number;
    city_name: string;
    city_id?: number;
    country?: string;
    start_date: string;
    end_date: string;
    order_index: number;
    notes?: string;
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
}

interface City {
    id: number;
    name: string;
    country: string;
    avg_daily_cost: number;
}

interface ActivityOption {
    id: number;
    name: string;
    category: string;
    estimated_cost: number;
    duration: number;
}

const TripEdit = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const tripId = Number(id);

    const [trip, setTrip] = useState<Trip | null>(null);
    const [stops, setStops] = useState<Stop[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [expandedStop, setExpandedStop] = useState<number | null>(null);

    // Modal states
    const [showAddStop, setShowAddStop] = useState(false);
    const [showAddActivity, setShowAddActivity] = useState<number | null>(null);
    const [cities, setCities] = useState<City[]>([]);
    const [citySearch, setCitySearch] = useState('');
    const [activities, setActivities] = useState<ActivityOption[]>([]);

    // Drag state
    const [draggedStop, setDraggedStop] = useState<number | null>(null);

    // Add stop form
    const [newStop, setNewStop] = useState({
        city_name: '',
        city_id: null as number | null,
        start_date: '',
        end_date: '',
        notes: '',
    });

    // Add activity form
    const [newActivity, setNewActivity] = useState({
        activity_name: '',
        scheduled_date: '',
        scheduled_time: '',
        custom_cost: '',
        notes: '',
    });

    useEffect(() => {
        fetchTripData();
    }, [tripId]);

    const fetchTripData = async () => {
        try {
            const [tripRes, stopsRes] = await Promise.all([
                tripsAPI.getById(tripId),
                stopsAPI.getAll(tripId),
            ]);
            if (tripRes.data.success) setTrip(tripRes.data.data);
            if (stopsRes.data.success) setStops(stopsRes.data.data);
        } catch (error) {
            console.error('Failed to fetch trip:', error);
        } finally {
            setLoading(false);
        }
    };

    const searchCities = useCallback(async (query: string) => {
        if (query.length < 2) {
            setCities([]);
            return;
        }
        try {
            const res = await citiesAPI.getAll({ search: query });
            if (res.data.success) setCities(res.data.data);
        } catch (error) {
            console.error('Failed to search cities:', error);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => searchCities(citySearch), 300);
        return () => clearTimeout(timer);
    }, [citySearch, searchCities]);

    const handleSaveTrip = async () => {
        if (!trip) return;
        setSaving(true);
        try {
            await tripsAPI.update(tripId, {
                title: trip.title,
                description: trip.description,
                start_date: trip.start_date,
                end_date: trip.end_date,
                is_public: trip.is_public,
            });
            navigate(`/trips/${tripId}`);
        } catch (error) {
            console.error('Failed to save trip:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleAddStop = async () => {
        if (!newStop.city_name || !newStop.start_date || !newStop.end_date) return;
        try {
            const res = await stopsAPI.add(tripId, {
                city_id: newStop.city_id || undefined,
                city_name: newStop.city_name,
                start_date: newStop.start_date,
                end_date: newStop.end_date,
                notes: newStop.notes || undefined,
            });
            if (res.data.success) {
                setStops([...stops, { ...res.data.data, activities: [] }]);
                setShowAddStop(false);
                setNewStop({ city_name: '', city_id: null, start_date: '', end_date: '', notes: '' });
                setCitySearch('');
            }
        } catch (error) {
            console.error('Failed to add stop:', error);
        }
    };

    const handleDeleteStop = async (stopId: number) => {
        if (!window.confirm('Delete this stop and all its activities?')) return;
        try {
            await stopsAPI.delete(tripId, stopId);
            setStops(stops.filter((s) => s.id !== stopId));
        } catch (error) {
            console.error('Failed to delete stop:', error);
        }
    };

    const handleDragStart = (stopId: number) => {
        setDraggedStop(stopId);
    };

    const handleDragOver = (e: React.DragEvent, targetId: number) => {
        e.preventDefault();
        if (draggedStop === null || draggedStop === targetId) return;

        const newStops = [...stops];
        const draggedIndex = newStops.findIndex((s) => s.id === draggedStop);
        const targetIndex = newStops.findIndex((s) => s.id === targetId);

        const [draggedItem] = newStops.splice(draggedIndex, 1);
        newStops.splice(targetIndex, 0, draggedItem);

        setStops(newStops);
    };

    const handleDragEnd = async () => {
        if (draggedStop === null) return;
        const stopIds = stops.map((s) => s.id);
        try {
            await stopsAPI.reorder(tripId, stopIds);
        } catch (error) {
            console.error('Failed to reorder:', error);
            fetchTripData(); // Revert on error
        }
        setDraggedStop(null);
    };

    const loadActivitiesForCity = async (cityId: number | undefined) => {
        if (!cityId) {
            setActivities([]);
            return;
        }
        try {
            const res = await activitiesAPI.search({ city_id: cityId });
            if (res.data.success) setActivities(res.data.data);
        } catch (error) {
            console.error('Failed to load activities:', error);
        }
    };

    const handleOpenAddActivity = (stop: Stop) => {
        setShowAddActivity(stop.id);
        setNewActivity({ activity_name: '', scheduled_date: stop.start_date, scheduled_time: '', custom_cost: '', notes: '' });
        loadActivitiesForCity(stop.city_id);
    };

    const handleAddActivity = async () => {
        if (!showAddActivity || !newActivity.activity_name) return;
        try {
            const res = await activitiesAPI.addToStop(showAddActivity, {
                activity_name: newActivity.activity_name,
                scheduled_date: newActivity.scheduled_date || undefined,
                scheduled_time: newActivity.scheduled_time || undefined,
                custom_cost: newActivity.custom_cost ? Number(newActivity.custom_cost) : undefined,
                notes: newActivity.notes || undefined,
            });
            if (res.data.success) {
                setStops(stops.map((s) =>
                    s.id === showAddActivity
                        ? { ...s, activities: [...s.activities, res.data.data] }
                        : s
                ));
                setShowAddActivity(null);
                setNewActivity({ activity_name: '', scheduled_date: '', scheduled_time: '', custom_cost: '', notes: '' });
            }
        } catch (error) {
            console.error('Failed to add activity:', error);
        }
    };

    const handleDeleteActivity = async (stopId: number, activityId: number) => {
        try {
            await activitiesAPI.remove(activityId);
            setStops(stops.map((s) =>
                s.id === stopId
                    ? { ...s, activities: s.activities.filter((a) => a.id !== activityId) }
                    : s
            ));
        } catch (error) {
            console.error('Failed to delete activity:', error);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
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

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-16 z-40">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">Edit Trip</h1>
                                <p className="text-sm text-slate-500">{trip.title}</p>
                            </div>
                        </div>
                        <Button onClick={handleSaveTrip} loading={saving} icon={<Save className="w-4 h-4" />}>
                            Save Changes
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Trip Details Section */}
                <section className="bg-white rounded-2xl shadow-card p-6 mb-8">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Trip Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Trip Name"
                            value={trip.title}
                            onChange={(e) => setTrip({ ...trip, title: e.target.value })}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Start Date</label>
                                <input
                                    type="date"
                                    value={trip.start_date}
                                    onChange={(e) => setTrip({ ...trip, start_date: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">End Date</label>
                                <input
                                    type="date"
                                    value={trip.end_date}
                                    onChange={(e) => setTrip({ ...trip, end_date: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                        <textarea
                            value={trip.description || ''}
                            onChange={(e) => setTrip({ ...trip, description: e.target.value })}
                            rows={3}
                            className="input-field resize-none"
                            placeholder="Describe your trip..."
                        />
                    </div>
                </section>

                {/* Stops Section */}
                <section className="bg-white rounded-2xl shadow-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-slate-900">
                            Itinerary ({stops.length} {stops.length === 1 ? 'stop' : 'stops'})
                        </h2>
                        <Button
                            variant="secondary"
                            size="sm"
                            icon={<Plus className="w-4 h-4" />}
                            onClick={() => setShowAddStop(true)}
                        >
                            Add Stop
                        </Button>
                    </div>

                    {stops.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                            <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500">No stops yet</p>
                            <p className="text-sm text-slate-400 mb-4">Add cities to your itinerary</p>
                            <Button
                                variant="primary"
                                size="sm"
                                icon={<Plus className="w-4 h-4" />}
                                onClick={() => setShowAddStop(true)}
                            >
                                Add First Stop
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {stops.map((stop, index) => (
                                <div
                                    key={stop.id}
                                    draggable
                                    onDragStart={() => handleDragStart(stop.id)}
                                    onDragOver={(e) => handleDragOver(e, stop.id)}
                                    onDragEnd={handleDragEnd}
                                    className={`border-2 rounded-xl transition-all ${draggedStop === stop.id
                                            ? 'border-primary-400 bg-primary-50 opacity-50'
                                            : 'border-slate-200 bg-white hover:border-slate-300'
                                        }`}
                                >
                                    {/* Stop Header */}
                                    <div className="flex items-center gap-3 p-4">
                                        <div className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600">
                                            <GripVertical className="w-5 h-5" />
                                        </div>
                                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold text-sm">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-slate-900 truncate">{stop.city_name}</h3>
                                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {formatDate(stop.start_date)} - {formatDate(stop.end_date)}
                                                {stop.country && (
                                                    <>
                                                        <span className="text-slate-300">•</span>
                                                        <span>{stop.country}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleOpenAddActivity(stop)}
                                                className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                                title="Add Activity"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setExpandedStop(expandedStop === stop.id ? null : stop.id)}
                                                className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                                            >
                                                {expandedStop === stop.id ? (
                                                    <ChevronUp className="w-4 h-4" />
                                                ) : (
                                                    <ChevronDown className="w-4 h-4" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteStop(stop.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expanded Activities */}
                                    {expandedStop === stop.id && (
                                        <div className="border-t border-slate-200 p-4 bg-slate-50">
                                            {stop.activities.length === 0 ? (
                                                <p className="text-sm text-slate-400 text-center py-4">
                                                    No activities yet.{' '}
                                                    <button
                                                        onClick={() => handleOpenAddActivity(stop)}
                                                        className="text-primary-600 hover:underline"
                                                    >
                                                        Add one
                                                    </button>
                                                </p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {stop.activities.map((activity) => (
                                                        <div
                                                            key={activity.id}
                                                            className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200"
                                                        >
                                                            <div>
                                                                <p className="font-medium text-slate-900">{activity.activity_name}</p>
                                                                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                                                    {activity.scheduled_time && <span>{activity.scheduled_time}</span>}
                                                                    {activity.custom_cost && <span>${activity.custom_cost}</span>}
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => handleDeleteActivity(stop.id, activity.id)}
                                                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            {/* Add Stop Modal */}
            {showAddStop && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-fade-in">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold">Add Stop</h3>
                            <button
                                onClick={() => {
                                    setShowAddStop(false);
                                    setCitySearch('');
                                    setCities([]);
                                }}
                                className="p-2 hover:bg-slate-100 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* City Search */}
                            <div className="relative">
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    City *
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search cities..."
                                        value={citySearch}
                                        onChange={(e) => {
                                            setCitySearch(e.target.value);
                                            setNewStop({ ...newStop, city_name: e.target.value, city_id: null });
                                        }}
                                        className="input-field pl-10"
                                    />
                                </div>
                                {cities.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-auto">
                                        {cities.map((city) => (
                                            <button
                                                key={city.id}
                                                onClick={() => {
                                                    setNewStop({ ...newStop, city_name: city.name, city_id: city.id });
                                                    setCitySearch(city.name);
                                                    setCities([]);
                                                }}
                                                className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0"
                                            >
                                                <p className="font-medium text-slate-900">{city.name}</p>
                                                <p className="text-sm text-slate-500">{city.country} • ~${city.avg_daily_cost}/day</p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Start Date *</label>
                                    <input
                                        type="date"
                                        value={newStop.start_date}
                                        onChange={(e) => setNewStop({ ...newStop, start_date: e.target.value })}
                                        min={trip.start_date}
                                        max={trip.end_date}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">End Date *</label>
                                    <input
                                        type="date"
                                        value={newStop.end_date}
                                        onChange={(e) => setNewStop({ ...newStop, end_date: e.target.value })}
                                        min={newStop.start_date || trip.start_date}
                                        max={trip.end_date}
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
                                <textarea
                                    value={newStop.notes}
                                    onChange={(e) => setNewStop({ ...newStop, notes: e.target.value })}
                                    rows={2}
                                    className="input-field resize-none"
                                    placeholder="Optional notes..."
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <Button variant="secondary" onClick={() => setShowAddStop(false)} className="flex-1">
                                Cancel
                            </Button>
                            <Button
                                onClick={handleAddStop}
                                disabled={!newStop.city_name || !newStop.start_date || !newStop.end_date}
                                className="flex-1"
                            >
                                Add Stop
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Activity Modal */}
            {showAddActivity && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-fade-in max-h-[90vh] overflow-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold">Add Activity</h3>
                            <button
                                onClick={() => setShowAddActivity(null)}
                                className="p-2 hover:bg-slate-100 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Suggested Activities */}
                        {activities.length > 0 && (
                            <div className="mb-6">
                                <p className="text-sm font-medium text-slate-700 mb-2">Suggested Activities</p>
                                <div className="space-y-2 max-h-40 overflow-auto">
                                    {activities.slice(0, 5).map((activity) => (
                                        <button
                                            key={activity.id}
                                            onClick={() => setNewActivity({
                                                ...newActivity,
                                                activity_name: activity.name,
                                                custom_cost: String(activity.estimated_cost || ''),
                                            })}
                                            className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
                                        >
                                            <p className="font-medium text-slate-900">{activity.name}</p>
                                            <p className="text-xs text-slate-500">
                                                {activity.category} • ${activity.estimated_cost} • {activity.duration}min
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <Input
                                label="Activity Name *"
                                value={newActivity.activity_name}
                                onChange={(e) => setNewActivity({ ...newActivity, activity_name: e.target.value })}
                                placeholder="e.g., Visit Eiffel Tower"
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Date</label>
                                    <input
                                        type="date"
                                        value={newActivity.scheduled_date}
                                        onChange={(e) => setNewActivity({ ...newActivity, scheduled_date: e.target.value })}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Time</label>
                                    <input
                                        type="time"
                                        value={newActivity.scheduled_time}
                                        onChange={(e) => setNewActivity({ ...newActivity, scheduled_time: e.target.value })}
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            <Input
                                label="Cost ($)"
                                type="number"
                                value={newActivity.custom_cost}
                                onChange={(e) => setNewActivity({ ...newActivity, custom_cost: e.target.value })}
                                placeholder="0.00"
                            />
                        </div>

                        <div className="flex gap-3 mt-6">
                            <Button variant="secondary" onClick={() => setShowAddActivity(null)} className="flex-1">
                                Cancel
                            </Button>
                            <Button
                                onClick={handleAddActivity}
                                disabled={!newActivity.activity_name}
                                className="flex-1"
                            >
                                Add Activity
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TripEdit;
