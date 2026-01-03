import { AlertTriangle, X } from 'lucide-react';
import Button from './Button';

interface UnsavedChangesModalProps {
    isOpen: boolean;
    onStay: () => void;
    onLeave: () => void;
}

const UnsavedChangesModal = ({ isOpen, onStay, onLeave }: UnsavedChangesModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-fade-in">
                <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">Unsaved Changes</h3>
                        <p className="text-slate-600 text-sm">
                            You have unsaved changes. Are you sure you want to leave this page? Your changes will be lost.
                        </p>
                    </div>
                    <button
                        onClick={onStay}
                        className="p-2 hover:bg-slate-100 rounded-lg shrink-0"
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <div className="flex gap-3">
                    <Button variant="secondary" onClick={onStay} className="flex-1">
                        Stay on Page
                    </Button>
                    <Button variant="danger" onClick={onLeave} className="flex-1">
                        Leave Without Saving
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default UnsavedChangesModal;
