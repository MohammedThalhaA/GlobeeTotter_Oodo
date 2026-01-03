import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FloatingInput from '../components/FloatingInput';
import Button from '../components/Button';
import { Shield, Lock, BarChart3 } from 'lucide-react';

const AdminLogin = () => {
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
            const user = await login(email, password);

            // Check if user is admin
            if (!user?.is_admin) {
                setError('Access denied. Admin privileges required.');
                setLoading(false);
                return;
            }

            navigate('/admin');
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Admin Portal</h2>
                        <p className="text-slate-500 mt-2">Sign in with your admin credentials</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm animate-fade-in flex items-center gap-2">
                            <Lock className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <FloatingInput
                            label="Admin Email"
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

                        <Button
                            type="submit"
                            loading={loading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                            size="lg"
                        >
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Access Admin Dashboard
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-200">
                        <p className="text-center text-slate-500 text-sm">
                            Not an admin?{' '}
                            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
                                Go to user login
                            </Link>
                        </p>
                    </div>

                    {/* Credentials hint for demo */}
                    <div className="mt-6 p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 font-medium mb-2">Demo Credentials:</p>
                        <p className="text-xs text-slate-600">
                            Email: <code className="bg-slate-200 px-1 rounded">admin@globetrotter.com</code>
                        </p>
                        <p className="text-xs text-slate-600">
                            Password: <code className="bg-slate-200 px-1 rounded">admin123</code>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
