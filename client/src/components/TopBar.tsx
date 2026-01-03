import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Bell, Phone, Mail, ChevronDown } from 'lucide-react';

const TopBar = () => {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <header className="h-20 bg-white fixed top-0 right-0 left-64 z-40 px-8 flex items-center justify-between shadow-sm">
            {/* Search */}
            <div className="flex-1 max-w-md">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search here..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-100 transition-all placeholder:text-slate-400"
                    />
                </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-8">
                {/* Contact Info (Hidden on small screens) */}
                <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white">
                            <Phone className="w-4 h-4" />
                        </div>
                        <span>+ 2 025 274 9133</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white">
                            <Mail className="w-4 h-4" />
                        </div>
                        <span className="truncate max-w-[150px]">info@urwebsite.com</span>
                    </div>
                </div>

                {/* Notifications & Profile */}
                <div className="flex items-center gap-4 pl-8 border-l border-slate-200">
                    <button className="relative p-2 hover:bg-slate-50 rounded-full transition-colors">
                        <Bell className="w-5 h-5 text-slate-500" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-primary-500 rounded-full border-2 border-white"></span>
                    </button>

                    <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 pr-2 pl-1 py-1 rounded-full transition-colors">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 p-[2px]">
                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                                {user?.profile_photo ? (
                                    <img src={user.profile_photo} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-primary-600 font-bold text-lg">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="hidden md:block text-left">
                            <p className="text-sm font-bold text-slate-900 leading-none mb-1">{user?.name}</p>
                            <p className="text-xs text-slate-500 leading-none">Traveler</p>
                        </div>
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default TopBar;
