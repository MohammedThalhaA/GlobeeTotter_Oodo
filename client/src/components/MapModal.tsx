import { X, MapPin, Navigation } from 'lucide-react';

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
                className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-5xl h-[80vh] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl animate-scale-in border border-slate-700">
                {/* Header */}
                <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-20 bg-gradient-to-b from-slate-900/80 to-transparent">
                    <div>
                        <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                            <Navigation className="w-6 h-6 text-primary-500" />
                            Global Exploration
                        </h2>
                        <p className="text-slate-300 text-sm">Satellite View • Recently Viewed Locations</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Satellite Map Background */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2672&auto=format&fit=crop"
                        alt="Satellite Map"
                        className="w-full h-full object-cover"
                    />
                    {/* Dark overlay for contrast */}
                    <div className="absolute inset-0 bg-indigo-950/30 mix-blend-multiply"></div>
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
                                className="absolute -left-3 -top-3 w-6 h-6 bg-primary-500 rounded-full animate-ping opacity-75"
                                style={{ animationDelay: loc.delay }}
                            ></div>

                            {/* Pin */}
                            <div className="relative z-10 text-primary-500 transform transition-transform hover:-translate-y-2 hover:scale-110">
                                <MapPin className="w-8 h-8 fill-primary-500 stroke-white stroke-2" />
                            </div>

                            {/* Tooltip */}
                            <div className="absolute left-1/2 -translate-x-1/2 -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-slate-900 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-lg pointer-events-none">
                                {loc.label}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white"></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Controls Overlay (Visual Only) */}
                <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-2">
                    <button className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white transition-colors text-xl font-bold">+</button>
                    <button className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white transition-colors text-xl font-bold">-</button>
                </div>
            </div>
        </div>
    );
};

export default MapModal;
