import React from 'react';

interface SkeletonProps {
    className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
    return (
        <div
            className={`animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] rounded ${className}`}
            style={{ animation: 'shimmer 1.5s ease-in-out infinite' }}
        />
    );
};

export const CardSkeleton: React.FC = () => {
    return (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <div className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex justify-between pt-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-16 rounded-lg" />
                </div>
            </div>
        </div>
    );
};

export const TripCardSkeleton: React.FC = () => {
    return (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden p-6">
            <div className="flex items-start gap-4">
                <Skeleton className="w-16 h-16 rounded-xl" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
            </div>
        </div>
    );
};

export const ProfileSkeleton: React.FC = () => {
    return (
        <div className="animate-pulse">
            <div className="flex items-center gap-4 mb-6">
                <Skeleton className="w-16 h-16 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-48" />
                </div>
            </div>
        </div>
    );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
    return (
        <div className="space-y-4">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-xl">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-8 w-20 rounded-lg" />
                </div>
            ))}
        </div>
    );
};

export const DashboardSkeleton: React.FC = () => {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl p-6">
                        <Skeleton className="h-4 w-20 mb-3" />
                        <Skeleton className="h-8 w-16 mb-2" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6">
                    <Skeleton className="h-6 w-40 mb-4" />
                    <Skeleton className="h-64 w-full" />
                </div>
                <div className="bg-white rounded-2xl p-6">
                    <Skeleton className="h-6 w-40 mb-4" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        </div>
    );
};

// Add shimmer animation to index.css
const style = document.createElement('style');
style.textContent = `
    @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
    }
`;
document.head.appendChild(style);

export default Skeleton;
