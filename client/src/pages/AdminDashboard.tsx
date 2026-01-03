import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
    Users,
    Map,
    Globe,
    Activity,
    TrendingUp,
    Calendar,
    Eye,
    Lock,
    Loader2,
    ArrowRight,
    BarChart3,
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';

interface AnalyticsData {
    overview: {
        totalUsers: number;
        newUsersThisMonth: number;
        totalTrips: number;
        tripsThisWeek: number;
        totalCities: number;
        totalActivities: number;
    };
    tripStatus: {
        upcoming: number;
        ongoing: number;
        completed: number;
    };
    tripVisibility: {
        public: number;
        private: number;
    };
    popularCities: { id: number; name: string; country: string; image_url?: string; trip_count: number }[];
    recentTrips: { id: number; title: string; user_name: string; start_date: string; end_date: string; created_at: string }[];
    monthlyTrend: { month: string; count: number }[];
}

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ec4899'];

const AdminDashboard = () => {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await api.get('/admin/analytics');
                if (res.data.success) {
                    setData(res.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-500">Failed to load analytics</p>
            </div>
        );
    }

    const statusData = [
        { name: 'Upcoming', value: data.tripStatus.upcoming },
        { name: 'Ongoing', value: data.tripStatus.ongoing },
        { name: 'Completed', value: data.tripStatus.completed },
    ];

    const overviewCards = [
        { label: 'Total Users', value: data.overview.totalUsers, change: `+${data.overview.newUsersThisMonth} this month`, icon: Users, color: 'bg-blue-500' },
        { label: 'Total Trips', value: data.overview.totalTrips, change: `+${data.overview.tripsThisWeek} this week`, icon: Map, color: 'bg-green-500' },
        { label: 'Cities Available', value: data.overview.totalCities, change: 'destinations', icon: Globe, color: 'bg-purple-500' },
        { label: 'Activities', value: data.overview.totalActivities, change: 'experiences', icon: Activity, color: 'bg-orange-500' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            {/* Header */}
            <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center">
                            <BarChart3 className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                            <p className="text-slate-400">Platform analytics & insights</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Overview Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {overviewCards.map(({ label, value, change, icon: Icon, color }) => (
                        <div key={label} className="bg-white rounded-2xl shadow-card p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-slate-500">{label}</p>
                                    <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
                                    <p className="text-xs text-slate-400 mt-1">{change}</p>
                                </div>
                                <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Monthly Trend */}
                    <div className="bg-white rounded-2xl shadow-card p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary-500" />
                            Trip Creation Trend
                        </h2>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.monthlyTrend}>
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                                        }}
                                    />
                                    <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Trip Status Distribution */}
                    <div className="bg-white rounded-2xl shadow-card p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary-500" />
                            Trip Status
                        </h2>
                        <div className="h-64 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name, value }) => `${name}: ${value}`}
                                    >
                                        {statusData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Popular Cities */}
                    <div className="bg-white rounded-2xl shadow-card p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4">Popular Destinations</h2>
                        {data.popularCities.length === 0 ? (
                            <p className="text-slate-400 text-center py-8">No data yet</p>
                        ) : (
                            <div className="space-y-4">
                                {data.popularCities.map((city, idx) => (
                                    <div key={city.id} className="flex items-center gap-3">
                                        <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-xs font-bold flex items-center justify-center">
                                            {idx + 1}
                                        </span>
                                        <div className="flex-1">
                                            <p className="font-medium text-slate-900">{city.name}</p>
                                            <p className="text-xs text-slate-500">{city.country}</p>
                                        </div>
                                        <span className="text-sm text-slate-400">{city.trip_count} trips</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Visibility Breakdown */}
                    <div className="bg-white rounded-2xl shadow-card p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4">Trip Visibility</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Eye className="w-5 h-5 text-green-500" />
                                    <span className="text-slate-600">Public Trips</span>
                                </div>
                                <span className="text-2xl font-bold text-slate-900">{data.tripVisibility.public}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Lock className="w-5 h-5 text-slate-400" />
                                    <span className="text-slate-600">Private Trips</span>
                                </div>
                                <span className="text-2xl font-bold text-slate-900">{data.tripVisibility.private}</span>
                            </div>
                            <div className="mt-4">
                                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-green-500 rounded-full"
                                        style={{
                                            width: `${(data.tripVisibility.public / (data.tripVisibility.public + data.tripVisibility.private)) * 100 || 0}%`,
                                        }}
                                    />
                                </div>
                                <p className="text-xs text-slate-400 mt-2">
                                    {Math.round((data.tripVisibility.public / (data.tripVisibility.public + data.tripVisibility.private)) * 100) || 0}% public
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Recent Trips */}
                    <div className="bg-white rounded-2xl shadow-card p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Trips</h2>
                        {data.recentTrips.length === 0 ? (
                            <p className="text-slate-400 text-center py-8">No trips yet</p>
                        ) : (
                            <div className="space-y-3">
                                {data.recentTrips.slice(0, 5).map((trip) => (
                                    <Link
                                        key={trip.id}
                                        to={`/trips/${trip.id}`}
                                        className="block p-3 rounded-lg hover:bg-slate-50 transition-colors"
                                    >
                                        <p className="font-medium text-slate-900 text-sm truncate">{trip.title}</p>
                                        <p className="text-xs text-slate-500">
                                            by {trip.user_name} • {new Date(trip.created_at).toLocaleDateString()}
                                        </p>
                                    </Link>
                                ))}
                                <Link to="/trips" className="flex items-center gap-1 text-primary-600 text-sm font-medium mt-4">
                                    View all trips <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
