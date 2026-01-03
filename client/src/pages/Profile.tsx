import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI, tripsAPI } from '../services/api';
import Button from '../components/Button';
import FloatingInput from '../components/FloatingInput';
import SaveButton from '../components/SaveButton';
import {
    User,
    Shield,
    Settings,
    AlertTriangle,
    Plane,
    MapPin,
    Calendar,
    Loader2,
    ArrowLeft,
    Globe,
    Bell,
    Check,
    Trash2,
} from 'lucide-react';

type TabType = 'profile' | 'security' | 'preferences' | 'danger';

const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
];

const Profile = () => {
    const navigate = useNavigate();
    const { user, logout, updateUser } = useAuth();

    const [activeTab, setActiveTab] = useState<TabType>('profile');
    const [name, setName] = useState(user?.name || '');
    const [profilePhoto, setProfilePhoto] = useState(user?.profile_photo || '');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Security
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');

    // Preferences
    const [currency, setCurrency] = useState('USD');
    const [notifications, setNotifications] = useState(true);
    const [emailUpdates, setEmailUpdates] = useState(true);

    // Stats
    const [stats, setStats] = useState({
        totalTrips: 0,
        totalDays: 0,
        citiesVisited: 0,
    });
    const [loadingStats, setLoadingStats] = useState(true);

    // Member since
    const memberSince = user?.created_at
        ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : 'N/A';

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

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            await authAPI.updateProfile({
                name,
                profile_photo: profilePhoto || undefined,
            });
            updateUser({ name, profile_photo: profilePhoto });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            console.error('Failed to update profile:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        setPasswordError('');
        setPasswordSuccess('');

        if (newPassword !== confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }
        if (newPassword.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            return;
        }
        if (!currentPassword) {
            setPasswordError('Please enter your current password');
            return;
        }

        try {
            const response = await authAPI.changePassword(currentPassword, newPassword);
            if (response.data.success) {
                setPasswordSuccess('Password changed successfully!');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            }
        } catch (err: unknown) {
            const error = err as { response?: { data?: { error?: string } } };
            setPasswordError(error.response?.data?.error || 'Failed to change password');
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone. All your trips, itineraries, and data will be permanently removed.')) {
            return;
        }
        alert('Account deletion request submitted. Contact support for assistance.');
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const tabs = [
        { id: 'profile' as TabType, label: 'Profile', icon: User },
        { id: 'security' as TabType, label: 'Security', icon: Shield },
        { id: 'preferences' as TabType, label: 'Preferences', icon: Settings },
        { id: 'danger' as TabType, label: 'Danger', icon: AlertTriangle, danger: true },
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link to="/dashboard" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                <ArrowLeft className="w-5 h-5 text-slate-600" />
                            </Link>
                            <div className="flex items-center gap-2">
                                <Globe className="w-6 h-6 text-primary-600" />
                                <span className="text-xl font-bold text-primary-600">GlobeTrotter</span>
                            </div>
                        </div>
                        <h1 className="text-lg font-semibold text-slate-900">Profile & Settings</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Panel - User Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-card p-6 text-center">
                            {/* Avatar */}
                            <div className="relative inline-block mb-4">
                                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center mx-auto shadow-lg">
                                    {profilePhoto ? (
                                        <img src={profilePhoto} alt={name} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        <span className="text-4xl font-bold text-white">
                                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <p className="text-slate-500 text-sm mb-6">Member since {memberSince}</p>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-100">
                                {loadingStats ? (
                                    <div className="col-span-3 flex justify-center py-4">
                                        <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                                    </div>
                                ) : (
                                    <>
                                        <div className="text-center">
                                            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                                                <Plane className="w-5 h-5 text-primary-500" />
                                            </div>
                                            <p className="text-xl font-bold text-slate-900">{stats.totalTrips}</p>
                                            <p className="text-xs text-slate-500">Trips</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="w-10 h-10 bg-accent-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                                                <MapPin className="w-5 h-5 text-accent-500" />
                                            </div>
                                            <p className="text-xl font-bold text-slate-900">{stats.citiesVisited}</p>
                                            <p className="text-xs text-slate-500">Cities</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                                                <Calendar className="w-5 h-5 text-green-500" />
                                            </div>
                                            <p className="text-xl font-bold text-slate-900">{stats.totalDays}</p>
                                            <p className="text-xs text-slate-500">Activities</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Tabs */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                            {/* Tab Headers */}
                            <div className="border-b border-slate-200">
                                <div className="flex">
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors border-b-2 -mb-px ${activeTab === tab.id
                                                ? tab.danger
                                                    ? 'text-red-600 border-red-600'
                                                    : 'text-primary-600 border-primary-600'
                                                : 'text-slate-500 border-transparent hover:text-slate-700 hover:border-slate-300'
                                                }`}
                                        >
                                            <tab.icon className="w-4 h-4" />
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Tab Content */}
                            <div className="p-6">
                                {/* Profile Tab */}
                                {activeTab === 'profile' && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                                <User className="w-5 h-5 text-primary-500" />
                                                Profile Information
                                            </h3>
                                            <p className="text-sm text-slate-500 mt-1">Update your personal details</p>
                                        </div>

                                        <div className="space-y-4">
                                            <FloatingInput
                                                label="Full Name"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                            />

                                            <div className="relative z-0 w-full group">
                                                <input
                                                    type="email"
                                                    id="email"
                                                    value={user?.email || ''}
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
                                        </div>

                                        <SaveButton
                                            onClick={handleSaveProfile}
                                            disabled={saving}
                                            label={saved ? 'Saved!' : 'Save Changes'}
                                            className="w-full sm:w-auto"
                                        />
                                    </div>
                                )}

                                {/* Security Tab */}
                                {activeTab === 'security' && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                                <Shield className="w-5 h-5 text-primary-500" />
                                                Security Settings
                                            </h3>
                                            <p className="text-sm text-slate-500 mt-1">Manage your password and account security</p>
                                        </div>

                                        {passwordError && (
                                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                                                {passwordError}
                                            </div>
                                        )}

                                        {passwordSuccess && (
                                            <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm flex items-center gap-2">
                                                <Check className="w-4 h-4" />
                                                {passwordSuccess}
                                            </div>
                                        )}

                                        <form onSubmit={(e) => { e.preventDefault(); handleChangePassword(); }} className="space-y-4">
                                            <FloatingInput
                                                label="Current Password"
                                                type="password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                            />

                                            <FloatingInput
                                                label="New Password"
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                            />

                                            <FloatingInput
                                                label="Confirm New Password"
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                            />

                                            <Button
                                                type="submit"
                                                disabled={!currentPassword || !newPassword || !confirmPassword}
                                                className="w-full sm:w-auto"
                                            >
                                                Update Password
                                            </Button>
                                        </form>
                                    </div>
                                )}

                                {/* Preferences Tab */}
                                {!activeTab || activeTab === 'preferences' && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                                <Settings className="w-5 h-5 text-primary-500" />
                                                Preferences
                                            </h3>
                                            <p className="text-sm text-slate-500 mt-1">Customize your GlobeTrotter experience</p>
                                        </div>

                                        {/* Currency */}
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                                <span className="text-lg font-bold text-slate-900 bg-slate-100 w-8 h-8 rounded-lg flex items-center justify-center">
                                                    {currencies.find(c => c.code === currency)?.symbol}
                                                </span>
                                                Currency
                                            </label>
                                            <select
                                                value={currency}
                                                onChange={(e) => setCurrency(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors"
                                            >
                                                {currencies.map((c) => (
                                                    <option key={c.code} value={c.code}>
                                                        {c.name} ({c.symbol})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Notifications */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                                                        <Bell className="w-5 h-5 text-primary-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900">Trip Reminders</p>
                                                        <p className="text-sm text-slate-500">Receive trip reminders and updates</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setNotifications(!notifications)}
                                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${notifications
                                                        ? 'bg-primary-500 text-white'
                                                        : 'bg-slate-200 text-slate-600'
                                                        }`}
                                                >
                                                    {notifications ? 'Enabled' : 'Disabled'}
                                                </button>
                                            </div>

                                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-accent-100 rounded-xl flex items-center justify-center">
                                                        <Globe className="w-5 h-5 text-accent-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900">Email Updates</p>
                                                        <p className="text-sm text-slate-500">Get newsletters and travel deals</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setEmailUpdates(!emailUpdates)}
                                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${emailUpdates
                                                        ? 'bg-accent-500 text-white'
                                                        : 'bg-slate-200 text-slate-600'
                                                        }`}
                                                >
                                                    {emailUpdates ? 'Enabled' : 'Disabled'}
                                                </button>
                                            </div>
                                        </div>

                                        <SaveButton
                                            onClick={async () => {
                                                setSaving(true);
                                                try {
                                                    await authAPI.updateProfile({
                                                        preferences: {
                                                            currency,
                                                            notifications,
                                                            emailUpdates
                                                        }
                                                    });
                                                    updateUser({ preferences: { currency, notifications, emailUpdates } });
                                                    setSaved(true);
                                                    setTimeout(() => setSaved(false), 2000);
                                                } catch (error) {
                                                    console.error('Failed to update preferences:', error);
                                                } finally {
                                                    setSaving(false);
                                                }
                                            }}
                                            disabled={saving}
                                            label={saved ? 'Saved!' : 'Save Changes'}
                                            className="w-full sm:w-auto"
                                        />
                                    </div>
                                )}

                                {/* Danger Tab */}
                                {activeTab === 'danger' && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div>
                                            <h3 className="text-lg font-semibold text-red-600 flex items-center gap-2">
                                                <AlertTriangle className="w-5 h-5" />
                                                Danger Zone
                                            </h3>
                                            <p className="text-sm text-slate-500 mt-1">Irreversible actions that affect your account</p>
                                        </div>

                                        <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
                                            <h4 className="font-semibold text-red-800 mb-2">Delete Account</h4>
                                            <p className="text-sm text-red-700 mb-4">
                                                Once you delete your account, there is no going back. All your trips, itineraries, and data will be permanently removed.
                                            </p>
                                            <Button
                                                variant="danger"
                                                onClick={handleDeleteAccount}
                                                icon={<Trash2 className="w-4 h-4" />}
                                            >
                                                Delete My Account
                                            </Button>
                                        </div>

                                        <div className="pt-4 border-t border-slate-200">
                                            <Button
                                                variant="secondary"
                                                onClick={handleLogout}
                                                className="w-full"
                                            >
                                                Sign Out
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
