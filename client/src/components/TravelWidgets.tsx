import React, { useState, useEffect } from 'react';
import {
    Timer,
    Banknote,
    CloudSun,
    CheckSquare,
    ArrowRightLeft,
    Plane,
    Calendar,
    ThermometerSun,
    Umbrella,
    Wind
} from 'lucide-react';
import { CURRENCIES } from '../utils/currency';
import type { Trip } from '../types';

interface TravelWidgetsProps {
    nextTrip?: Trip | null;
    userCurrency?: string;
}

type TabType = 'countdown' | 'currency' | 'weather' | 'checklist';

const TravelWidgets: React.FC<TravelWidgetsProps> = ({ nextTrip, userCurrency = 'USD' }) => {
    const [activeTab, setActiveTab] = useState<TabType>('countdown');

    // Currency State
    const [amount, setAmount] = useState<string>('100');
    const [fromCurrency, setFromCurrency] = useState<string>(userCurrency);
    const [toCurrency, setToCurrency] = useState<string>('EUR');

    // Checklist State
    const [tasks, setTasks] = useState([
        { id: 1, text: 'Check Passport Expiry', done: false },
        { id: 2, text: 'Web Check-in', done: false },
        { id: 3, text: 'Pack Essentials', done: false },
        { id: 4, text: 'Download Offline Maps', done: false },
    ]);

    // Countdown State
    const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number }>({ days: 0, hours: 0 });

    useEffect(() => {
        if (!nextTrip) return;
        const calculateTimeLeft = () => {
            const difference = +new Date(nextTrip.start_date) - +new Date();
            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                });
            } else {
                setTimeLeft({ days: 0, hours: 0 }); // Trip started or passed
            }
        };
        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 60000); // Update every minute
        return () => clearInterval(timer);
    }, [nextTrip]);

    const toggleTask = (id: number) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
    };

    const convertCurrency = () => {
        const fromRate = CURRENCIES[fromCurrency]?.rate || 1;
        const toRate = CURRENCIES[toCurrency]?.rate || 1;
        const val = parseFloat(amount) || 0;
        // Convert to USD first, then to target
        const inUSD = val / fromRate;
        return (inUSD * toRate).toFixed(2);
    };

    const tabs = [
        { id: 'countdown', icon: Timer, label: 'Timer' },
        { id: 'currency', icon: Banknote, label: 'Forex' },
        { id: 'weather', icon: CloudSun, label: 'Weather' },
        { id: 'checklist', icon: CheckSquare, label: 'Tasks' },
    ];

    return (
        <div className="bg-white rounded-3xl shadow-card h-full flex flex-col overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex border-b border-slate-100 p-2 gap-1">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as TabType)}
                        className={`flex-1 flex flex-col items-center justify-center py-3 rounded-2xl transition-all duration-300 ${activeTab === tab.id
                            ? 'bg-primary-50 text-primary-600 shadow-sm'
                            : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                            }`}
                        title={tab.label}
                    >
                        <tab.icon className={`w-5 h-5 mb-1 ${activeTab === tab.id ? 'stroke-2' : 'stroke-[1.5]'}`} />
                        <span className="text-[10px] font-bold tracking-wide">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 p-5 relative">

                {/* 1. Countdown Tab */}
                {activeTab === 'countdown' && (
                    <div className="h-full flex flex-col items-center justify-center text-center animate-fade-in">
                        {nextTrip ? (
                            <>
                                <div className="mb-4 p-3 bg-indigo-50 text-indigo-600 rounded-full">
                                    <Plane className="w-6 h-6" />
                                </div>
                                <h3 className="text-slate-500 font-medium text-sm mb-4">Next Trip: <span className="text-slate-900 font-bold">{nextTrip.title}</span></h3>
                                <div className="flex gap-4 mb-2">
                                    <div className="flex flex-col items-center">
                                        <span className="text-4xl font-black text-slate-900 leading-none">{timeLeft.days}</span>
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Days</span>
                                    </div>
                                    <span className="text-3xl font-light text-slate-300 -mt-1">:</span>
                                    <div className="flex flex-col items-center">
                                        <span className="text-4xl font-black text-slate-900 leading-none">{timeLeft.hours}</span>
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Hours</span>
                                    </div>
                                </div>
                                <p className="text-xs text-primary-600 font-semibold mt-4 bg-primary-50 px-3 py-1 rounded-full">
                                    To {nextTrip.destination || 'Destination'}
                                </p>
                            </>
                        ) : (
                            <div className="text-slate-400 flex flex-col items-center">
                                <Calendar className="w-10 h-10 mb-2 opacity-50" />
                                <p>No upcoming trips planned.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* 2. Currency Tab */}
                {activeTab === 'currency' && (
                    <div className="h-full flex flex-col justify-center animate-fade-in group">
                        <div className="text-center mb-2">
                            <h3 className="font-bold text-slate-900">Quick Converter</h3>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                            <div className="flex-1">
                                <label className="text-xs font-bold text-slate-500 block mb-1">Amount</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-primary-100"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs font-bold text-slate-500 block mb-1">From</label>
                                <select
                                    value={fromCurrency}
                                    onChange={(e) => setFromCurrency(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-slate-900 font-semibold focus:outline-none"
                                >
                                    {Object.keys(CURRENCIES).map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center justify-center my-1 relative">
                            <div className="h-px bg-slate-100 w-full absolute"></div>
                            <div className="bg-white p-2 rounded-full border border-slate-100 shadow-sm relative z-10">
                                <ArrowRightLeft className="w-4 h-4 text-slate-400" />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mt-1 bg-emerald-50 border border-emerald-100 rounded-2xl p-3">
                            <div className="flex-1">
                                <select
                                    value={toCurrency}
                                    onChange={(e) => setToCurrency(e.target.value)}
                                    className="w-full bg-transparent border-none text-emerald-800 font-bold focus:outline-none cursor-pointer text-sm"
                                >
                                    {Object.keys(CURRENCIES).map(c => <option key={c} value={c}>To {c}</option>)}
                                </select>
                            </div>
                            <div className="text-2xl font-black text-emerald-600">
                                {CURRENCIES[toCurrency].symbol}{convertCurrency()}
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. Weather Tab */}
                {activeTab === 'weather' && (
                    <div className="h-full flex flex-col items-center justify-center text-center animate-fade-in relative z-10">
                        {/* Mock Data for aesthetics */}
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-yellow-100 rounded-full blur-2xl opacity-50"></div>

                        <h3 className="font-bold text-slate-900 mb-1">{nextTrip?.destination || 'Paris, France'}</h3>
                        <p className="text-slate-400 text-xs font-medium mb-6">Tue, 24 Oct</p>

                        <div className="flex items-center justify-center gap-4 mb-6">
                            <div className="relative">
                                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-full flex items-center justify-center shadow-lg shadow-orange-100">
                                    <CloudSun className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <div className="text-left">
                                <span className="text-4xl font-black text-slate-900">22°</span>
                                <p className="text-xs font-bold text-slate-400">Partly Cloudy</p>
                            </div>
                        </div>

                        <div className="flex gap-4 w-full px-4">
                            <div className="flex-1 bg-slate-50 rounded-xl p-2 flex flex-col items-center gap-1">
                                <ThermometerSun className="w-4 h-4 text-orange-500" />
                                <span className="text-xs font-bold text-slate-600">High: 24°</span>
                            </div>
                            <div className="flex-1 bg-slate-50 rounded-xl p-2 flex flex-col items-center gap-1">
                                <Umbrella className="w-4 h-4 text-blue-500" />
                                <span className="text-xs font-bold text-slate-600">10% Rain</span>
                            </div>
                            <div className="flex-1 bg-slate-50 rounded-xl p-2 flex flex-col items-center gap-1">
                                <Wind className="w-4 h-4 text-slate-500" />
                                <span className="text-xs font-bold text-slate-600">12 km/h</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. Checklist Tab */}
                {activeTab === 'checklist' && (
                    <div className="h-full flex flex-col animate-fade-in">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-900">Travel Tasks</h3>
                            <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded-lg">
                                {tasks.filter(t => t.done).length}/{tasks.length}
                            </span>
                        </div>
                        <div className="space-y-2 overflow-y-auto max-h-[220px] custom-scrollbar pr-1">
                            {tasks.map(task => (
                                <div
                                    key={task.id}
                                    onClick={() => toggleTask(task.id)}
                                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${task.done
                                        ? 'bg-slate-50 border-slate-100 opacity-60'
                                        : 'bg-white border-slate-100 hover:border-primary-200 hover:shadow-sm'
                                        }`}
                                >
                                    <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${task.done
                                        ? 'bg-primary-500 border-primary-500'
                                        : 'border-slate-300'
                                        }`}>
                                        {task.done && <CheckSquare className="w-3 h-3 text-white" />}
                                    </div>
                                    <span className={`text-sm font-medium transition-all ${task.done ? 'text-slate-400 line-through' : 'text-slate-700'
                                        }`}>
                                        {task.text}
                                    </span>
                                </div>
                            ))}
                            <button className="w-full py-2 text-xs font-bold text-slate-400 hover:text-primary-600 border-t border-slate-50 mt-2 transition-colors">
                                + Add New Task
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default TravelWidgets;
