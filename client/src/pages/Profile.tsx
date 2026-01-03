import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI, tripsAPI } from '../services/api';
import Button from '../components/Button';
import FloatingInput from '../components/FloatingInput';
import {
    User,
    Mail,
    Camera,
    MapPin,
    Calendar,
    Save,
    Loader2,
    LogOut,
    Trash2,
    Globe,
} from 'lucide-react';

const Profile = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [name, setName] = useState(user?.name || '');
    const [email] = useState(user?.email || '');
    const [profilePhoto, setProfilePhoto] = useState(user?.profile_photo || '');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Stats
    const [stats, setStats] = useState({
        totalTrips: 0,
        totalDays: 0,
        citiesVisited: 0,
    });
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await tripsAPI.getStats();
                if (res.data.success) {
                    setStats({
                        totalTrips: res.data.data.total_trips || 0,
                        totalDays: res.data.data.total_days || 0,
                        citiesVisited: res.data.data.cities_count || 0,
                    });
                }
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoadingStats(false);
            }
        };

        fetchStats();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await authAPI.updateProfile({
                name,
                profile_photo: profilePhoto || undefined,
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            console.error('Failed to update profile:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm('Are you sure you want to delete your account? This cannot be undone.')) {
            return;
        }
        // For now, just logout
        alert('Account deletion coming soon. For now, please contact support.');
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            {/* Header */}
            <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center overflow-hidden">
                                {profilePhoto ? (
                                    <img src={profilePhoto} alt={name} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-12 h-12 text-white/80" />
                                )}
                            </div>
                            <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                                <Camera className="w-4 h-4 text-slate-600" />
                            </button>
                        </div>

                        {/* Info */}
                        <div className="text-center md:text-left">
                            <h1 className="text-2xl font-bold">{user?.name || 'Traveler'}</h1>
                            <p className="text-primary-200 flex items-center justify-center md:justify-start gap-2 mt-1">
                                <Mail className="w-4 h-4" />
                                {user?.email}
                            </p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-8">
                        {loadingStats ? (
                            <div className="col-span-3 flex justify-center py-4">
                                <Loader2 className="w-6 h-6 animate-spin text-white/50" />
                            </div>
                        ) : (
                            <>
                                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center">
                                    <Calendar className="w-6 h-6 mx-auto mb-2 text-primary-200" />
                                    <p className="text-2xl font-bold">{stats.totalTrips}</p>
                                    <p className="text-xs text-primary-200">Trips</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center">
                                    <Globe className="w-6 h-6 mx-auto mb-2 text-primary-200" />
                                    <p className="text-2xl font-bold">{stats.citiesVisited}</p>
                                    <p className="text-xs text-primary-200">Cities</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center">
                                    <MapPin className="w-6 h-6 mx-auto mb-2 text-primary-200" />
                                    <p className="text-2xl font-bold">{stats.totalDays}</p>
                                    <p className="text-xs text-primary-200">Days Planned</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Profile Settings */}
                    <div className="bg-white rounded-2xl shadow-card p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-6">Profile Settings</h2>

                        <div className="space-y-6">
                            <FloatingInput
                                label="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />

                            <div className="relative z-0 w-full group">
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    disabled
                                    className="block py-2.5 px-0 w-full text-sm text-slate-400 bg-transparent border-0 border-b-2 border-slate-200 appearance-none focus:outline-none focus:ring-0 cursor-not-allowed peer"
                                    placeholder=" "
                                />
                                <label
                                    htmlFor="email"
                                    className="absolute text-sm text-slate-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0]"
                                >
                                    Email (cannot be changed)
                                </label>
                            </div>

                            <FloatingInput
                                label="Profile Photo URL"
                                value={profilePhoto}
                                onChange={(e) => setProfilePhoto(e.target.value)}
                            />

                            <Button
                                onClick={handleSave}
                                loading={saving}
                                icon={saved ? <span>✓</span> : <Save className="w-4 h-4" />}
                                className="w-full"
                            >
                                {saved ? 'Saved!' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>

                    {/* Account Actions */}
                    <div className="space-y-6">
                        {/* Preferences */}
                        <div className="bg-white rounded-2xl shadow-card p-6">
                            <h2 className="text-lg font-semibold text-slate-900 mb-4">Preferences</h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-slate-900">Email Notifications</p>
                                        <p className="text-sm text-slate-500">Get updates about your trips</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" defaultChecked className="sr-only peer" />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:ring-4 peer-focus:ring-primary-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                                    </label>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-slate-900">Public Profile</p>
                                        <p className="text-sm text-slate-500">Show your trips publicly</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:ring-4 peer-focus:ring-primary-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="bg-white rounded-2xl shadow-card p-6 border-2 border-red-100">
                            <h2 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>
                            <div className="space-y-3">
                                <Button
                                    variant="secondary"
                                    onClick={handleLogout}
                                    icon={<LogOut className="w-4 h-4" />}
                                    className="w-full"
                                >
                                    Sign Out
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={handleDeleteAccount}
                                    icon={<Trash2 className="w-4 h-4" />}
                                    className="w-full"
                                >
                                    Delete Account
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
