import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FloatingInput from '../components/FloatingInput';
import Button from '../components/Button';
import { Globe, MapPin, Calendar, Star } from 'lucide-react';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await register(name, email, password);
            navigate('/dashboard');
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again.';
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

    const features = [
        { icon: MapPin, text: 'Plan multi-city trips' },
        { icon: Calendar, text: 'Smart itinerary builder' },
        { icon: Star, text: 'Curated activities' },
    ];

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Decorative */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-accent-500 via-primary-600 to-primary-700 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-yellow-500 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 flex flex-col justify-center items-center w-full px-12 text-white">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center">
                            <Globe className="w-10 h-10" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold mb-4 text-center">Start Your Journey</h1>
                    <p className="text-xl text-white/80 text-center max-w-md mb-12">
                        Create an account and begin planning unforgettable trips around the world.
                    </p>

                    <div className="space-y-4">
                        {features.map(({ icon: Icon, text }) => (
                            <div key={text} className="flex items-center gap-3 text-white/80">
                                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span>{text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                            <Globe className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-2xl font-bold gradient-text">GlobeTrotter</span>
                    </div>

                    <div className="bg-white rounded-2xl shadow-card p-8">
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Create Account</h2>
                        <p className="text-slate-500 mb-8">Fill in your details to get started</p>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm animate-fade-in">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <FloatingInput
                                label="Full Name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />

                            <FloatingInput
                                label="Email Address"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FloatingInput
                                    label="Password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />

                                <FloatingInput
                                    label="Confirm Password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <p className="text-xs text-slate-500">
                                By creating an account, you agree to our{' '}
                                <Link to="/terms" className="text-primary-600 hover:underline">Terms</Link>{' '}
                                and{' '}
                                <Link to="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>
                            </p>

                            <Button
                                type="submit"
                                loading={loading}
                                className="w-full"
                                size="lg"
                            >
                                Create Account
                            </Button>
                        </form>

                        <p className="mt-8 text-center text-slate-600">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
