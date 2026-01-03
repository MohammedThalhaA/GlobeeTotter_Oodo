import { X, MapPin, Navigation, Plus, Minus } from 'lucide-react';

interface MapModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const MapModal = ({ isOpen, onClose }: MapModalProps) => {
    if (!isOpen) return null;

    // Locations from dashboard
    const locations = [
        { x: '20%', y: '30%', label: 'New York', delay: '0s' },
        { x: '45%', y: '25%', label: 'Paris', delay: '0.2s' },
        { x: '75%', y: '40%', label: 'Tokyo', delay: '0.4s' },
        { x: '55%', y: '60%', label: 'Cape Town', delay: '0.6s' },
        { x: '15%', y: '55%', label: 'Rio de Janeiro', delay: '0.8s' },
        { x: '82%', y: '75%', label: 'Sydney', delay: '1.0s' }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-5xl h-[80vh] bg-white rounded-3xl overflow-hidden shadow-2xl animate-scale-in border border-slate-200">
                {/* Header */}
                <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-20 pointer-events-none">
                    <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-slate-200 pointer-events-auto">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Navigation className="w-5 h-5 text-primary-600" />
                            Global Exploration
                        </h2>
                        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Recently Viewed Locations</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-900 rounded-full transition-colors shadow-sm border border-slate-200 pointer-events-auto"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Map Background (Standard Light View) */}
                <div className="absolute inset-0 z-0 bg-[#AAD3DF]">
                    {/* Simplified World Map Vector / Image */}
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/World_map_blank_without_borders.svg/2000px-World_map_blank_without_borders.svg.png"
                        alt="World Map"
                        className="w-full h-full object-cover opacity-80 mix-blend-multiply"
                    />
                </div>

                {/* Pins */}
                <div className="absolute inset-0 z-10">
                    {locations.map((loc, i) => (
                        <div
                            key={i}
                            className="absolute group cursor-pointer"
                            style={{ left: loc.x, top: loc.y }}
                        >
                            {/* Pulse Effect */}
                            <div
                                className="absolute -left-3 -top-3 w-6 h-6 bg-primary-500 rounded-full animate-ping opacity-40"
                                style={{ animationDelay: loc.delay }}
                            ></div>

                            {/* Pin */}
                            <div className="relative z-10 text-primary-600 transform transition-transform hover:-translate-y-2 hover:scale-110">
                                <MapPin className="w-8 h-8 fill-primary-600 stroke-white stroke-2 drop-shadow-md" />
                            </div>

                            {/* Tooltip */}
                            <div className="absolute left-1/2 -translate-x-1/2 -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-slate-900 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-lg pointer-events-none border border-slate-100">
                                {loc.label}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white"></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Controls Overlay */}
                <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-2">
                    <button className="w-10 h-10 bg-white hover:bg-slate-50 rounded-xl flex items-center justify-center text-slate-700 transition-colors shadow-lg border border-slate-100">
                        <Plus className="w-5 h-5" />
                    </button>
                    <button className="w-10 h-10 bg-white hover:bg-slate-50 rounded-xl flex items-center justify-center text-slate-700 transition-colors shadow-lg border border-slate-100">
                        <Minus className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MapModal;
