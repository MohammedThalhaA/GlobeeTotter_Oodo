import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { X, Check, AlertTriangle, XCircle } from 'lucide-react';

type ToastType = 'success' | 'danger' | 'warning';

interface Toast {
    id: string;
    type: ToastType;
    message: string;
}

interface ToastContextType {
    showToast: (type: ToastType, message: string) => void;
    hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

const ToastItem = ({ toast, onClose }: { toast: Toast; onClose: () => void }) => {
    const icons = {
        success: <Check className="w-5 h-5" />,
        danger: <XCircle className="w-5 h-5" />,
        warning: <AlertTriangle className="w-5 h-5" />,
    };

    const colors = {
        success: 'text-emerald-600 bg-emerald-100',
        danger: 'text-red-600 bg-red-100',
        warning: 'text-amber-600 bg-amber-100',
    };

    return (
        <div
            className="flex items-center w-full max-w-sm p-4 text-slate-700 bg-white rounded-xl shadow-lg border border-slate-200 animate-fade-in"
            role="alert"
        >
            <div className={`inline-flex items-center justify-center shrink-0 w-8 h-8 rounded-lg ${colors[toast.type]}`}>
                {icons[toast.type]}
            </div>
            <div className="ms-3 text-sm font-medium">{toast.message}</div>
            <button
                type="button"
                onClick={onClose}
                className="ms-auto flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg h-8 w-8 transition-colors"
                aria-label="Close"
            >
                <X className="w-5 h-5" />
            </button>
        </div>
    );
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((type: ToastType, message: string) => {
        const id = Date.now().toString();
        setToasts((prev) => [...prev, { id, type, message }]);

        // Auto-dismiss after 4 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);

    const hideToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, hideToast }}>
            {children}
            {/* Toast Container - Fixed at top right */}
            <div className="fixed top-24 right-6 z-50 flex flex-col gap-3">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onClose={() => hideToast(toast.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export default ToastProvider;
