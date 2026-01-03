import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Map,
    Compass,
    LogOut,
    PlusCircle,
    BarChart3,
    Heart
} from 'lucide-react';

const Sidebar = () => {
    const location = useLocation();
    const { user, logout } = useAuth();

    const menuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/trips', label: 'Trip', icon: Map, subItems: ['Recent Trip'] },
        { path: '/favorites', label: 'Wishlist', icon: Heart },
        { path: '/explore', label: 'Explore', icon: Compass },

        ...(user?.is_admin ? [{ path: '/admin', label: 'Admin', icon: BarChart3 }] : []),
    ];

    const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

    return (
        <aside className="w-64 fixed left-0 top-0 h-screen bg-white border-r border-slate-100 flex flex-col z-50">
            {/* Logo */}
            <div className="p-8 pb-4">
                <Link to="/dashboard" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center transform rotate-3">
                        <Compass className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-slate-900 font-display">
                        XploreElite<span className="text-primary-600">™</span>
                    </span>
                </Link>
            </div>

            {/* CTA */}
            <div className="px-6 mb-6">
                <Link
                    to="/trips/create"
                    className="flex items-center justify-center gap-2 w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl transition-all shadow-lg shadow-primary-200"
                >
                    <PlusCircle className="w-5 h-5" />
                    <span className="font-semibold">Create Trip</span>
                </Link>
            </div>

            {/* Menu */}
            <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => (
                    <div key={item.path}>
                        <Link
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive(item.path)
                                ? 'bg-primary-50 text-primary-600 font-semibold'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'text-primary-600' : 'text-slate-400'}`} />
                            <span>{item.label}</span>
                        </Link>

                        {/* Submenu (Visual only for now based on mockup) */}
                        {item.subItems && isActive(item.path) && (
                            <div className="pl-12 mt-1 space-y-1">
                                {item.subItems.map((sub) => (
                                    <div key={sub} className="relative py-1 text-sm text-slate-400 hover:text-primary-600 cursor-pointer transition-colors">
                                        {/* Tree line connector */}
                                        <div className="absolute -left-6 top-1/2 w-4 h-[1px] bg-slate-200"></div>
                                        <div className="absolute -left-6 -top-4 bottom-1/2 w-[1px] bg-slate-200"></div>
                                        {sub}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </nav>

            {/* Logout */}
            <div className="p-6 border-t border-slate-100">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 w-full text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all group"
                >
                    <LogOut className="w-5 h-5 group-hover:text-red-600 transition-colors" />
                    <span className="font-medium">Log Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
