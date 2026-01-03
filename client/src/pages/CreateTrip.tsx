import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripsAPI } from '../services/api';
import FloatingInput from '../components/FloatingInput';
import FloatingTextarea from '../components/FloatingTextarea';
import Button from '../components/Button';
import UnsavedChangesModal from '../components/UnsavedChangesModal';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';
import { useToast } from '../context/ToastContext';
import {
    ArrowLeft,
    Globe,
    Sparkles,
} from 'lucide-react';

const CreateTrip = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Unsaved changes protection
    const { isDirty, setIsDirty, showModal, confirmNavigation, cancelNavigation, markAsSaved } = useUnsavedChanges();
    const { showToast } = useToast();
    void isDirty;

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        cover_photo: '',
        is_public: false,
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));
        setIsDirty(true);
    };

    const handleCancel = () => {
        markAsSaved();
        navigate(-1);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.title || !formData.start_date || !formData.end_date) {
            setError('Please fill in all required fields');
            return;
        }

        if (new Date(formData.end_date) < new Date(formData.start_date)) {
            setError('End date must be after start date');
            return;
        }

        setLoading(true);

        try {
            const response = await tripsAPI.create(formData);
            if (response.data.success) {
                markAsSaved();
                showToast('success', 'Trip created successfully!');
                navigate(`/trips/${response.data.data.id}`);
            }
        } catch (err: unknown) {
            const errorMessage = 'Failed to create trip. Please try again.';
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosError = err as { response?: { data?: { error?: string } } };
                setError(axiosError.response?.data?.error || errorMessage);
            } else {
                setError(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    // Get today's date for min date attribute
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Unsaved Changes Modal */}
            <UnsavedChangesModal
                isOpen={showModal}
                onStay={cancelNavigation}
                onLeave={confirmNavigation}
            />

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={handleCancel}
                        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center">
                            <Sparkles className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Create New Trip</h1>
                            <p className="text-slate-500">Plan your next adventure</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white rounded-2xl shadow-card p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm animate-fade-in">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Trip Name */}
                        <FloatingInput
                            label="Trip Name *"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />

                        {/* Description */}
                        <FloatingTextarea
                            label="Description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                        />

                        {/* Dates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="relative z-0 w-full group">
                                <input
                                    type="date"
                                    name="start_date"
                                    id="start_date"
                                    value={formData.start_date}
                                    onChange={handleChange}
                                    min={today}
                                    className="block py-2.5 px-0 w-full text-sm text-slate-900 bg-transparent border-0 border-b-2 border-slate-300 appearance-none focus:outline-none focus:ring-0 focus:border-primary-600 peer"
                                    required
                                />
                                <label
                                    htmlFor="start_date"
                                    className="absolute text-sm text-slate-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-primary-600"
                                >
                                    Start Date *
                                </label>
                            </div>

                            <div className="relative z-0 w-full group">
                                <input
                                    type="date"
                                    name="end_date"
                                    id="end_date"
                                    value={formData.end_date}
                                    onChange={handleChange}
                                    min={formData.start_date || today}
                                    className="block py-2.5 px-0 w-full text-sm text-slate-900 bg-transparent border-0 border-b-2 border-slate-300 appearance-none focus:outline-none focus:ring-0 focus:border-primary-600 peer"
                                    required
                                />
                                <label
                                    htmlFor="end_date"
                                    className="absolute text-sm text-slate-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-primary-600"
                                >
                                    End Date *
                                </label>
                            </div>
                        </div>

                        {/* Cover Photo URL */}
                        <FloatingInput
                            label="Cover Photo URL (optional - leave empty for auto-generated image)"
                            name="cover_photo"
                            value={formData.cover_photo}
                            onChange={handleChange}
                        />

                        {/* Public Toggle */}
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                                    <Globe className="w-5 h-5 text-primary-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900">Make trip public</p>
                                    <p className="text-sm text-slate-500">Allow others to view your itinerary</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="is_public"
                                    checked={formData.is_public}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-4 pt-4">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => navigate(-1)}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                loading={loading}
                                className="flex-1"
                            >
                                Create Trip
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateTrip;
