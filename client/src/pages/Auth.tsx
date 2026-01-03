import { useState, useEffect, FormEvent } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FloatingInput from '../components/FloatingInput';
import Button from '../components/Button';
import { Globe } from 'lucide-react';

const Auth = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { login, register } = useAuth();
    const [isSignUp, setIsSignUp] = useState(location.pathname === '/register');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form States
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    const [registerName, setRegisterName] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        setIsSignUp(location.pathname === '/register');
        setError('');
    }, [location.pathname]);

    const handleToggle = () => {
        const target = isSignUp ? '/login' : '/register';
        navigate(target);
    };

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(loginEmail, loginPassword);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        if (registerPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            await register(registerName, registerEmail, registerPassword);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
            {/* Card */}
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl min-h-[600px] overflow-hidden flex">

                {/* Desktop Slider Layout */}
                <div className="hidden lg:block relative w-full h-full min-h-[600px]">

                    {/* Sign Up Form (Left Side - Revealed when Overlay moves Right) */}
                    <div className={`absolute top-0 left-0 w-1/2 h-full flex items-center justify-center p-12 transition-all duration-700 ease-in-out ${isSignUp ? 'opacity-100 z-10 translate-x-0' : 'opacity-0 z-0 -translate-x-full'}`}>
                        <div className="w-full max-w-sm">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white"><Globe className="w-6 h-6" /></div>
                                <span className="text-2xl font-bold text-slate-900">GlobeTrotter</span>
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-2">Create Account</h2>
                            <p className="text-slate-500 mb-8">Use your email for registration</p>

                            <form onSubmit={handleRegister} className="space-y-4">
                                {error && isSignUp && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
                                <FloatingInput label="Name" type="text" value={registerName} onChange={e => setRegisterName(e.target.value)} required />
                                <FloatingInput label="Email" type="email" value={registerEmail} onChange={e => setRegisterEmail(e.target.value)} required />
                                <FloatingInput label="Password" type="password" value={registerPassword} onChange={e => setRegisterPassword(e.target.value)} required />
                                <FloatingInput label="Confirm Password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                                <Button loading={loading} className="w-full mt-4" size="lg">Sign Up</Button>
                                <p className="text-xs text-slate-500 mt-4 text-center">
                                    By creating an account, you agree to our <Link to="/terms" className="text-primary-600 hover:underline">Terms</Link> and <Link to="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>
                                </p>
                            </form>
                        </div>
                    </div>

                    {/* Sign In Form (Right Side - Default Visible) */}
                    <div className={`absolute top-0 right-0 w-1/2 h-full flex items-center justify-center p-12 transition-all duration-700 ease-in-out ${isSignUp ? 'opacity-0 z-0 translate-x-full' : 'opacity-100 z-10 translate-x-0'}`}>
                        <div className="w-full max-w-sm">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white"><Globe className="w-6 h-6" /></div>
                                <span className="text-2xl font-bold text-slate-900">GlobeTrotter</span>
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-2">Sign In</h2>
                            <p className="text-slate-500 mb-8">Welcome back! Please login to your account.</p>

                            <form onSubmit={handleLogin} className="space-y-4">
                                {error && !isSignUp && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
                                <FloatingInput label="Email Address" type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required />
                                <FloatingInput label="Password" type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
                                <div className="flex justify-between items-center text-sm">
                                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="rounded text-primary-600 focus:ring-primary-500" /> <span className="text-slate-600">Remember me</span></label>
                                    <Link to="/forgot-password" className="text-primary-600 hover:underline font-medium">Forgot password?</Link>
                                </div>
                                <Button loading={loading} className="w-full mt-4" size="lg">Sign In</Button>
                            </form>
                        </div>
                    </div>

                    {/* Overlay Container (Sliding Panel) */}
                    <div className={`absolute top-0 left-0 w-1/2 h-full overflow-hidden transition-transform duration-700 ease-in-out z-50 rounded-r-[100px] rounded-l-none ${isSignUp ? 'translate-x-full rounded-l-[100px] rounded-r-none' : 'translate-x-0'}`}>
                        <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white w-full h-full relative flex items-center justify-center">

                            {/* Decorative Background Elements */}
                            <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl opacity-20 animate-pulse" />
                            <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent-500 rounded-full blur-3xl opacity-20 animate-pulse" />

                            {/* Left Content (Shown when Overlay is Left -> Login Mode) */}
                            <div className={`absolute inset-0 flex flex-col items-center justify-center text-center p-12 transition-opacity duration-500 delay-100 ${isSignUp ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                                <h1 className="text-4xl font-bold mb-4">Start Your Journey!</h1>
                                <p className="text-lg text-white/80 mb-8">Enter your personal details and start journey with us</p>
                                <button onClick={handleToggle} className="px-8 py-3 border-2 border-white rounded-full font-bold hover:bg-white hover:text-primary-600 transition-colors uppercase tracking-wider">
                                    Sign Up Free
                                </button>
                            </div>

                            {/* Right Content (Shown when Overlay is Right -> Signup Mode) */}
                            <div className={`absolute inset-0 flex flex-col items-center justify-center text-center p-12 transition-opacity duration-500 delay-100 ${isSignUp ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                                <h1 className="text-4xl font-bold mb-4">Welcome Back!</h1>
                                <p className="text-lg text-white/80 mb-8">To keep connected with us please login with your personal info</p>
                                <button onClick={handleToggle} className="px-8 py-3 border-2 border-white rounded-full font-bold hover:bg-white hover:text-primary-600 transition-colors uppercase tracking-wider">
                                    Sign In
                                </button>
                            </div>

                            <div className="absolute top-0 left-0 w-full h-full bg-white/10 backdrop-blur-3xl -z-10 mix-blend-overlay"></div>
                        </div>
                    </div>

                </div>

                {/* Mobile View (Stacked) */}
                <div className="lg:hidden w-full p-8 flex flex-col items-center justify-center min-h-screen">
                    {isSignUp ? (
                        /* SignUp Mobile */
                        <div className="w-full max-w-md animate-fade-in space-y-6">
                            <div className="flex items-center gap-2 justify-center mb-8">
                                <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center text-white"><Globe className="w-7 h-7" /></div>
                                <span className="text-2xl font-bold gradient-text">GlobeTrotter</span>
                            </div>

                            <div className="bg-white p-8 rounded-2xl shadow-card">
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">Create Account</h2>
                                <p className="text-slate-500 mb-6">Fill in your details to get started</p>
                                <form onSubmit={handleRegister} className="space-y-4">
                                    {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
                                    <FloatingInput label="Name" type="text" value={registerName} onChange={e => setRegisterName(e.target.value)} required />
                                    <FloatingInput label="Email" type="email" value={registerEmail} onChange={e => setRegisterEmail(e.target.value)} required />
                                    <FloatingInput label="Password" type="password" value={registerPassword} onChange={e => setRegisterPassword(e.target.value)} required />
                                    <FloatingInput label="Confirm Password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                                    <Button loading={loading} className="w-full mt-4" size="lg">Create Account</Button>
                                </form>
                                <p className="mt-6 text-center text-slate-600">Already have an account? <button onClick={handleToggle} className="text-primary-600 font-bold hover:underline">Sign In</button></p>
                            </div>
                        </div>
                    ) : (
                        /* SignIn Mobile */
                        <div className="w-full max-w-md animate-fade-in space-y-6">
                            <div className="flex items-center gap-2 justify-center mb-8">
                                <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center text-white"><Globe className="w-7 h-7" /></div>
                                <span className="text-2xl font-bold gradient-text">GlobeTrotter</span>
                            </div>

                            <div className="bg-white p-8 rounded-2xl shadow-card">
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">Sign In</h2>
                                <p className="text-slate-500 mb-6">Welcome back! Please login to your account.</p>
                                <form onSubmit={handleLogin} className="space-y-4">
                                    {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
                                    <FloatingInput label="Email Address" type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required />
                                    <FloatingInput label="Password" type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
                                    <div className="flex justify-between items-center text-sm">
                                        <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="rounded text-primary-600" /> Remember me</label>
                                        <Link to="/forgot-password" className="text-primary-600 hover:underline">Forgot password?</Link>
                                    </div>
                                    <Button loading={loading} className="w-full mt-4" size="lg">Sign In</Button>
                                </form>
                                <p className="mt-6 text-center text-slate-600">Don't have an account? <button onClick={handleToggle} className="text-primary-600 font-bold hover:underline">Sign Up Free</button></p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Auth;
