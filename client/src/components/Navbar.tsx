import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Globe,
    LayoutDashboard,
    Map,
    PlusCircle,
    LogOut,
    User,
    Menu,
    X,
    Compass,
    BarChart3,
} from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinks = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/trips', label: 'My Trips', icon: Map },
        { path: '/explore', label: 'Explore', icon: Compass },
        { path: '/trips/create', label: 'New Trip', icon: PlusCircle },
        { path: '/admin', label: 'Admin', icon: BarChart3 },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <nav className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:shadow-xl transition-shadow">
                                <Globe className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold gradient-text">GlobeTrotter</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    {isAuthenticated && (
                        <div className="hidden md:flex items-center gap-1">
                            {navLinks.map(({ path, label, icon: Icon }) => (
                                <Link
                                    key={path}
                                    to={path}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isActive(path)
                                        ? 'bg-primary-50 text-primary-600'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {label}
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* User Menu */}
                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <>
                                <div className="hidden md:flex items-center gap-3">
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-sm">
                                            {user?.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-sm font-medium text-slate-700">{user?.name}</span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Logout
                                    </button>
                                </div>

                                {/* Mobile menu button */}
                                <button
                                    className="md:hidden p-2 rounded-lg hover:bg-slate-100"
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                >
                                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    to="/login"
                                    className="px-4 py-2 text-slate-600 hover:text-primary-600 font-medium transition-colors"
                                >
                                    Login
                                </Link>
                                <Link to="/register" className="btn-primary text-sm">
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && isAuthenticated && (
                    <div className="md:hidden py-4 border-t border-slate-200 animate-fade-in">
                        <div className="flex flex-col gap-2">
                            {navLinks.map(({ path, label, icon: Icon }) => (
                                <Link
                                    key={path}
                                    to={path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${isActive(path)
                                        ? 'bg-primary-50 text-primary-600'
                                        : 'text-slate-600 hover:bg-slate-100'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {label}
                                </Link>
                            ))}
                            <hr className="my-2 border-slate-200" />
                            <div className="flex items-center gap-3 px-4 py-2">
                                <User className="w-5 h-5 text-slate-500" />
                                <span className="font-medium text-slate-700">{user?.name}</span>
                            </div>
                            <button
                                onClick={() => {
                                    handleLogout();
                                    setMobileMenuOpen(false);
                                }}
                                className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            >
                                <LogOut className="w-5 h-5" />
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
