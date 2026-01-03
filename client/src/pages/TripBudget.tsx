import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { budgetAPI } from '../services/api';
import { formatCurrency } from '../utils/currency';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import {
    ArrowLeft,
    DollarSign,
    PieChart,
    BarChart3,
    MapPin,
    Loader2,
    TrendingUp,
    Home,
    Car,
} from 'lucide-react';
import {
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
} from 'recharts';

interface BudgetData {
    tripId: number;
    tripTitle: string;
    totalDays: number;
    grandTotal: number;
    breakdown: {
        activities: number;
        accommodation: number;
        transport: number;
    };
    categoryBreakdown: { category: string; cost: number }[];
    cityBreakdown: { city: string; days: number; cost: number }[];
    dailyCosts: { date: string; cost: number; activities: string[] }[];
}

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4'];

const TripBudget = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const tripId = Number(id);

    const [budget, setBudget] = useState<BudgetData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBudget = async () => {
            try {
                const res = await budgetAPI.getTripBudget(tripId);
                if (res.data.success) {
                    setBudget(res.data.data);
                }
            } catch (err) {
                console.error('Failed to fetch budget:', err);
                setError('Failed to load budget data');
            } finally {
                setLoading(false);
            }
        };

        fetchBudget();
    }, [tripId]);



    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    if (error || !budget) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error || 'No budget data'}</p>
                    <Button onClick={() => navigate(-1)}>Go Back</Button>
                </div>
            </div>
        );
    }

    const pieData = [
        { name: 'Activities', value: budget.breakdown.activities, icon: TrendingUp },
        { name: 'Accommodation', value: budget.breakdown.accommodation, icon: Home },
        { name: 'Transport', value: budget.breakdown.transport, icon: Car },
    ].filter((d) => d.value > 0);

    const avgDailyCost = Math.round(budget.grandTotal / budget.totalDays);

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            {/* Header */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <p className="text-emerald-100 text-sm">Budget Overview</p>
                            <h1 className="text-2xl font-bold">{budget.tripTitle}</h1>
                        </div>
                    </div>

                    {/* Total Budget Card */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-emerald-100 text-sm mb-1">Estimated Total Budget</p>
                                <p className="text-4xl font-bold">{formatCurrency(budget.grandTotal, user?.preferences?.currency)}</p>
                                <p className="text-emerald-200 text-sm mt-2">
                                    {budget.totalDays} days • ~{formatCurrency(avgDailyCost, user?.preferences?.currency)}/day
                                </p>
                            </div>
                            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center">
                                <DollarSign className="w-10 h-10" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Breakdown Cards */}
                    <div className="space-y-6">
                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-4">
                            {pieData.map((item, idx) => (
                                <div key={item.name} className="bg-white rounded-xl shadow-card p-4 text-center">
                                    <div
                                        className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center"
                                        style={{ backgroundColor: `${COLORS[idx]}20` }}
                                    >
                                        <item.icon className="w-5 h-5" style={{ color: COLORS[idx] }} />
                                    </div>
                                    <p className="text-xs text-slate-500">{item.name}</p>
                                    <p className="font-bold text-slate-900">{formatCurrency(item.value, user?.preferences?.currency)}</p>
                                </div>
                            ))}
                        </div>

                        {/* Pie Chart */}
                        <div className="bg-white rounded-2xl shadow-card p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <PieChart className="w-5 h-5 text-primary-500" />
                                <h2 className="text-lg font-semibold text-slate-900">Cost Distribution</h2>
                            </div>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsPieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={5}
                                            dataKey="value"
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            labelLine={false}
                                        >
                                            {pieData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: number) => formatCurrency(value, user?.preferences?.currency)} />
                                    </RechartsPieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* City Breakdown */}
                        <div className="bg-white rounded-2xl shadow-card p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <MapPin className="w-5 h-5 text-primary-500" />
                                <h2 className="text-lg font-semibold text-slate-900">Cost by City</h2>
                            </div>
                            {budget.cityBreakdown.length === 0 ? (
                                <p className="text-slate-400 text-center py-4">No cities added yet</p>
                            ) : (
                                <div className="space-y-3">
                                    {budget.cityBreakdown.map((city, idx) => (
                                        <div key={city.city} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                                                />
                                                <div>
                                                    <p className="font-medium text-slate-900">{city.city}</p>
                                                    <p className="text-xs text-slate-500">{city.days} days</p>
                                                </div>
                                            </div>
                                            <p className="font-semibold text-slate-900">{formatCurrency(city.cost, user?.preferences?.currency)}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Daily Costs Chart */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-card p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <BarChart3 className="w-5 h-5 text-primary-500" />
                                <h2 className="text-lg font-semibold text-slate-900">Daily Expenses</h2>
                            </div>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={budget.dailyCosts}>
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={formatDate}
                                            tick={{ fontSize: 12 }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            tickFormatter={(v) => formatCurrency(v, user?.preferences?.currency)}
                                            tick={{ fontSize: 12 }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip
                                            formatter={(value: number) => formatCurrency(value, user?.preferences?.currency)}
                                            labelFormatter={formatDate}
                                            contentStyle={{
                                                borderRadius: '12px',
                                                border: 'none',
                                                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                                            }}
                                        />
                                        <Bar dataKey="cost" fill="#6366f1" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Category Breakdown */}
                        {budget.categoryBreakdown.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-card p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <TrendingUp className="w-5 h-5 text-primary-500" />
                                    <h2 className="text-lg font-semibold text-slate-900">Activity Categories</h2>
                                </div>
                                <div className="space-y-3">
                                    {budget.categoryBreakdown.map((cat, idx) => {
                                        const percentage = (cat.cost / budget.breakdown.activities) * 100;
                                        return (
                                            <div key={cat.category}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm text-slate-600 capitalize">{cat.category}</span>
                                                    <span className="text-sm font-medium text-slate-900">
                                                        {formatCurrency(cat.cost, user?.preferences?.currency)}
                                                    </span>
                                                </div>
                                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all"
                                                        style={{
                                                            width: `${percentage}%`,
                                                            backgroundColor: COLORS[idx % COLORS.length],
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Tips */}
                        <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl p-6 border border-primary-100">
                            <h3 className="font-semibold text-primary-900 mb-2">💡 Budget Tips</h3>
                            <ul className="text-sm text-primary-700 space-y-2">
                                <li>• Consider adding a 10-15% buffer for unexpected expenses</li>
                                <li>• Book accommodations early for better rates</li>
                                <li>• Look for city passes that bundle multiple attractions</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex flex-wrap gap-4">
                    <Link to={`/trips/${tripId}/edit`}>
                        <Button variant="secondary">Edit Itinerary</Button>
                    </Link>
                    <Link to={`/trips/${tripId}`}>
                        <Button variant="secondary">View Trip</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default TripBudget;
