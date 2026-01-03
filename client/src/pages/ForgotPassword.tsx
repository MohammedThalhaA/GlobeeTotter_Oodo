import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import FloatingInput from '../components/FloatingInput';
import Button from '../components/Button';
import { Globe, Mail, ArrowLeft, Check } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Simulated API call
        setTimeout(() => {
            setSent(true);
            setLoading(false);
        }, 1500);
    };

    if (sent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-card p-8 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Check Your Email</h2>
                        <p className="text-slate-500 mb-6">
                            We've sent a password reset link to <span className="font-semibold text-slate-700">{email}</span>
                        </p>
                        <p className="text-sm text-slate-400 mb-6">
                            Didn't receive the email? Check your spam folder or try again.
                        </p>
                        <div className="space-y-3">
                            <Button onClick={() => setSent(false)} variant="secondary" className="w-full">
                                Try Different Email
                            </Button>
                            <Link
                                to="/login"
                                className="block w-full py-3 text-center text-primary-600 hover:text-primary-700 font-semibold"
                            >
                                Back to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-card p-8">
                    {/* Header */}
                    <Link to="/login" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Back to login
                    </Link>

                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <Globe className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Forgot Password?</h2>
                        <p className="text-slate-500 mt-2">No worries, we'll send you reset instructions</p>
                    </div>

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

                        <Button
                            type="submit"
                            loading={loading}
                            className="w-full"
                            size="lg"
                            icon={<Mail className="w-4 h-4" />}
                        >
                            Send Reset Link
                        </Button>
                    </form>

                    <p className="mt-8 text-center text-slate-600">
                        Remember your password?{' '}
                        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
