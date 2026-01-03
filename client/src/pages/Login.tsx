import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FloatingInput from '../components/FloatingInput';
import Button from '../components/Button';
import { Globe, MapPin, Plane } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Login failed. Please try again.';
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

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Decorative */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent-500 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 flex flex-col justify-center items-center w-full px-12 text-white">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center">
                            <Globe className="w-10 h-10" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold mb-4 text-center">Welcome Back!</h1>
                    <p className="text-xl text-white/80 text-center max-w-md mb-12">
                        Your next adventure is just a login away. Let's explore the world together.
                    </p>

                    <div className="flex gap-8 text-white/60">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5" />
                            <span>100+ Cities</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Plane className="w-5 h-5" />
                            <span>Easy Planning</span>
                        </div>
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
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Sign In</h2>
                        <p className="text-slate-500 mb-8">Enter your credentials to access your account</p>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm animate-fade-in">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <FloatingInput
                                label="Email Address"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                            <FloatingInput
                                label="Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />

                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
                                    />
                                    <span className="text-sm text-slate-600">Remember me</span>
                                </label>
                                <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                                    Forgot password?
                                </Link>
                            </div>

                            <Button
                                type="submit"
                                loading={loading}
                                className="w-full"
                                size="lg"
                            >
                                Sign In
                            </Button>
                        </form>

                        <p className="mt-8 text-center text-slate-600">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
                                Sign up for free
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
